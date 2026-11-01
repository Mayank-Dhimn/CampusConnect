import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { errMsg, imageUrl } from '../services/api';

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];

// Used for both "Add product" and "Edit product" (when :id is present)
export default function AddProduct() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category_id: '',
    product_condition: 'Good',
  });
  const [file, setFile] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!editing) return;
    api
      .get(`/products/${id}`)
      .then((res) => {
        const p = res.data;
        setForm({
          title: p.title,
          description: p.description || '',
          price: p.price,
          category_id: p.category_id,
          product_condition: p.product_condition,
        });
        setExistingImage(p.image);
      })
      .catch((err) => setError(errMsg(err, 'Could not load product')));
  }, [editing, id]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onFile = (e) => {
    const f = e.target.files[0];
    if (!f) return setFile(null);
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
      setError('Only JPG, PNG or WEBP images are allowed');
      e.target.value = '';
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      setError('Image must be smaller than 2 MB');
      e.target.value = '';
      return;
    }
    setError('');
    setFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (file) data.append('image', file);

      if (editing) {
        await api.put(`/products/${id}`, data);
      } else {
        await api.post('/products', data);
      }
      navigate('/my-listings');
    } catch (err) {
      setError(errMsg(err, 'Could not save product'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: 720 }}>
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <h3 className="mb-1">{editing ? 'Edit listing' : 'Sell a product'}</h3>
          {!editing && <p className="text-muted">Your listing will appear in the marketplace after admin approval.</p>}
          {error && <div className="alert alert-danger py-2">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Title</label>
              <input className="form-control" required maxLength={150} value={form.title} onChange={set('title')} />
            </div>
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows="4" value={form.description} onChange={set('description')} />
            </div>
            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label">Price (₹)</label>
                <input type="number" min="0" step="0.01" className="form-control" required value={form.price} onChange={set('price')} />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Category</label>
                <select className="form-select" required value={form.category_id} onChange={set('category_id')}>
                  <option value="">Select...</option>
                  {categories.map((c) => (
                    <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Condition</label>
                <select className="form-select" value={form.product_condition} onChange={set('product_condition')}>
                  {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="form-label">Product image (JPG/PNG/WEBP, max 2 MB)</label>
              <input type="file" className="form-control" accept="image/jpeg,image/png,image/webp" onChange={onFile} />
              {editing && existingImage && !file && (
                <img src={imageUrl(existingImage)} alt="current" className="mt-2 rounded" style={{ height: 100 }} />
              )}
              {file && <img src={URL.createObjectURL(file)} alt="preview" className="mt-2 rounded" style={{ height: 100 }} />}
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving...' : editing ? 'Save changes' : 'Submit listing'}</button>
              <button type="button" className="btn btn-outline-secondary" onClick={() => navigate(-1)}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
