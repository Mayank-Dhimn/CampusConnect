import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api, { errMsg } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];

export default function Marketplace() {
  const [params] = useSearchParams();
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [wishIds, setWishIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: params.get('search') || '',
    category: params.get('category') || '',
    minPrice: '',
    maxPrice: '',
    condition: '',
  });

  const fetchProducts = useCallback(
    async (f) => {
      setLoading(true);
      setError('');
      try {
        const query = {};
        Object.entries(f).forEach(([k, v]) => {
          if (v !== '') query[k] = v;
        });
        const res = await api.get('/products', { params: query });
        setProducts(res.data);
      } catch (err) {
        setError(errMsg(err, 'Could not load products'));
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data)).catch(() => {});
    fetchProducts(filters);
    if (user && user.role === 'student') {
      api.get('/wishlist').then((res) => setWishIds(res.data.map((w) => w.product_id))).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const update = (k, v) => {
    const next = { ...filters, [k]: v };
    setFilters(next);
    if (k !== 'search' && k !== 'minPrice' && k !== 'maxPrice') fetchProducts(next);
  };

  const applyFilters = () => fetchProducts(filters);

  const reset = () => {
    const empty = { search: '', category: '', minPrice: '', maxPrice: '', condition: '' };
    setFilters(empty);
    fetchProducts(empty);
  };

  const toggleWishlist = async (productId) => {
    if (!user) return alert('Please log in to use the wishlist');
    try {
      if (wishIds.includes(productId)) {
        await api.delete(`/wishlist/${productId}`);
        setWishIds(wishIds.filter((id) => id !== productId));
      } else {
        await api.post('/wishlist', { product_id: productId });
        setWishIds([...wishIds, productId]);
      }
    } catch (err) {
      alert(errMsg(err));
    }
  };

  return (
    <div className="container py-4">
      <div className="row g-4">
        <aside className="col-lg-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="mb-3">Filters</h6>
              <div className="mb-3">
                <label className="form-label small">Category</label>
                <select className="form-select" value={filters.category} onChange={(e) => update('category', e.target.value)}>
                  <option value="">All categories</option>
                  {categories.map((c) => (
                    <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label small">Condition</label>
                <select className="form-select" value={filters.condition} onChange={(e) => update('condition', e.target.value)}>
                  <option value="">Any condition</option>
                  {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label small">Price range (₹)</label>
                <div className="d-flex gap-2">
                  <input type="number" min="0" className="form-control" placeholder="Min" value={filters.minPrice}
                    onChange={(e) => update('minPrice', e.target.value)} />
                  <input type="number" min="0" className="form-control" placeholder="Max" value={filters.maxPrice}
                    onChange={(e) => update('maxPrice', e.target.value)} />
                </div>
              </div>
              <div className="d-grid gap-2">
                <button className="btn btn-primary btn-sm" onClick={applyFilters}>Apply</button>
                <button className="btn btn-outline-secondary btn-sm" onClick={reset}>Reset</button>
              </div>
            </div>
          </div>
        </aside>

        <section className="col-lg-9">
          <div className="mb-4">
            <SearchBar value={filters.search} onChange={(v) => update('search', v)} onSubmit={applyFilters} />
          </div>

          {error && <div className="alert alert-danger">{error}</div>}
          {loading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
          ) : products.length === 0 ? (
            <div className="alert alert-info">No products match your search.</div>
          ) : (
            <>
              <p className="text-muted small">{products.length} product(s) found</p>
              <div className="row g-4">
                {products.map((p) => (
                  <div className="col-6 col-xl-4" key={p.product_id}>
                    <ProductCard
                      product={p}
                      wished={wishIds.includes(p.product_id)}
                      onToggleWishlist={user && user.role === 'student' ? toggleWishlist : null}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
