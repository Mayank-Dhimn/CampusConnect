import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg, imageUrl } from '../services/api';

const STATUS_CLASS = {
  Pending: 'bg-warning text-dark',
  Available: 'bg-success',
  Sold: 'bg-dark',
  Rejected: 'bg-danger',
};

export default function MyListings() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    api
      .get('/products/my-listings')
      .then((res) => setItems(res.data))
      .catch((err) => setError(errMsg(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const remove = async (id) => {
    if (!window.confirm('Delete this listing permanently?')) return;
    try {
      await api.delete(`/products/${id}`);
      setItems(items.filter((p) => p.product_id !== id));
    } catch (err) {
      alert(errMsg(err));
    }
  };

  const toggleSold = async (p) => {
    const status = p.status === 'Sold' ? 'Available' : 'Sold';
    try {
      const data = new FormData();
      data.append('status', status);
      await api.put(`/products/${p.product_id}`, data);
      load();
    } catch (err) {
      alert(errMsg(err));
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">My listings</h3>
        <Link to="/add-product" className="btn btn-primary">+ Add product</Link>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
      ) : items.length === 0 ? (
        <div className="alert alert-info">You haven't listed anything yet.</div>
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.product_id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        {p.image && <img src={imageUrl(p.image)} alt="" width="48" height="48" className="rounded" style={{ objectFit: 'cover' }} />}
                        <Link to={`/products/${p.product_id}`} className="text-decoration-none">{p.title}</Link>
                      </div>
                    </td>
                    <td>{p.category_name}</td>
                    <td>₹{Number(p.price).toLocaleString('en-IN')}</td>
                    <td><span className={`badge ${STATUS_CLASS[p.status]}`}>{p.status}</span></td>
                    <td className="text-end">
                      {(p.status === 'Available' || p.status === 'Sold') && (
                        <button className="btn btn-sm btn-outline-success me-1" onClick={() => toggleSold(p)}>
                          {p.status === 'Sold' ? 'Mark available' : 'Mark sold'}
                        </button>
                      )}
                      <Link to={`/edit-product/${p.product_id}`} className="btn btn-sm btn-outline-primary me-1">Edit</Link>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => remove(p.product_id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
