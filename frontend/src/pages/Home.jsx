import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Laptop, PenTool, Armchair, Dumbbell, Package } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';

const ICONS = {
  Books: BookOpen,
  Electronics: Laptop,
  Stationery: PenTool,
  Furniture: Armchair,
  'Sports Equipment': Dumbbell,
};

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/products').then((res) => setProducts(res.data.slice(0, 8))).catch(() => {});
    api.get('/categories').then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  const goSearch = () => navigate(`/marketplace?search=${encodeURIComponent(search)}`);

  return (
    <div className="container py-4">
      <div className="hero p-5 mb-5 text-center">
        <h1 className="fw-bold">Buy. Sell. Exchange – right on campus.</h1>
        <p className="lead mb-4">
          CampusConnect is the student marketplace for textbooks, laptops, stationery and more.
        </p>
        <div className="mx-auto" style={{ maxWidth: 560 }}>
          <SearchBar value={search} onChange={setSearch} onSubmit={goSearch} placeholder="Search for a laptop, book, calculator..." />
        </div>
      </div>

      <h4 className="mb-3">Browse by category</h4>
      <div className="row g-3 mb-5">
        {categories.map((c) => {
          const Icon = ICONS[c.category_name] || Package;
          return (
            <div className="col-6 col-md-4 col-lg-2" key={c.category_id}>
              <Link to={`/marketplace?category=${c.category_id}`} className="text-decoration-none">
                <div className="card text-center border-0 shadow-sm h-100 py-3">
                  <Icon size={28} className="text-primary mx-auto mb-2" />
                  <small className="text-dark fw-semibold">{c.category_name}</small>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Latest listings</h4>
        <Link to="/marketplace">View all</Link>
      </div>
      {products.length === 0 ? (
        <div className="alert alert-info">No products listed yet. Be the first to sell something!</div>
      ) : (
        <div className="row g-4">
          {products.map((p) => (
            <div className="col-6 col-md-4 col-lg-3" key={p.product_id}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
