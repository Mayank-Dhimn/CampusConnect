import { useEffect, useState } from 'react';
import api, { errMsg } from '../services/api';
import ProductCard from '../components/ProductCard';

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/wishlist')
      .then((res) => setItems(res.data))
      .catch((err) => setError(errMsg(err)))
      .finally(() => setLoading(false));
  }, []);

  const remove = async (productId) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      setItems(items.filter((p) => p.product_id !== productId));
    } catch (err) {
      alert(errMsg(err));
    }
  };

  return (
    <div className="container py-4">
      <h3 className="mb-3">My wishlist</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
      ) : items.length === 0 ? (
        <div className="alert alert-info">Your wishlist is empty. Tap the heart on a product to save it.</div>
      ) : (
        <div className="row g-4">
          {items.map((p) => (
            <div className="col-6 col-md-4 col-lg-3" key={p.product_id}>
              <ProductCard product={p} wished onToggleWishlist={remove} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
