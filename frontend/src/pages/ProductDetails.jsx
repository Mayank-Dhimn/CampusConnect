import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Heart, Flag, ImageOff } from 'lucide-react';
import api, { errMsg, imageUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ProductDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [inWishlist, setInWishlist] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch((err) => setError(errMsg(err, 'Product not found')))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (user && user.role === 'student') {
      api
        .get('/wishlist')
        .then((res) => setInWishlist(res.data.some((w) => String(w.product_id) === String(id))))
        .catch(() => {});
    }
  }, [user, id]);

  const flash = (type, text) => setFeedback({ type, text });

  const sendEnquiry = async (e) => {
    e.preventDefault();
    try {
      await api.post('/enquiries', { product_id: product.product_id, message });
      setMessage('');
      flash('success', 'Enquiry sent! The seller will see it in their Enquiries page.');
    } catch (err) {
      flash('danger', errMsg(err));
    }
  };

  const toggleWishlist = async () => {
    try {
      if (inWishlist) {
        await api.delete(`/wishlist/${product.product_id}`);
        setInWishlist(false);
      } else {
        await api.post('/wishlist', { product_id: product.product_id });
        setInWishlist(true);
      }
    } catch (err) {
      flash('danger', errMsg(err));
    }
  };

  const reportProduct = async () => {
    const reason = window.prompt('Why are you reporting this listing?');
    if (!reason) return;
    try {
      await api.post(`/products/${product.product_id}/report`, { reason });
      flash('success', 'Report submitted. Our admin will review it.');
    } catch (err) {
      flash('danger', errMsg(err));
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary" /></div>;
  if (error) return <div className="container py-5"><div className="alert alert-danger">{error}</div></div>;

  const img = imageUrl(product.image);
  const isOwner = Boolean(user) && user.user_id === product.seller_id;
  const isStudent = user && user.role === 'student';

  return (
    <div className="container py-4">
      <button className="btn btn-link px-0 mb-3" onClick={() => navigate(-1)}>← Back</button>

      <div className="row g-4">
        <div className="col-md-6">
          {img ? (
            <img src={img} alt={product.title} className="product-detail-img shadow-sm" />
          ) : (
            <div className="img-placeholder rounded" style={{ height: 320 }}><ImageOff size={48} /></div>
          )}
        </div>

        <div className="col-md-6">
          <div className="d-flex gap-2 mb-2">
            <span className="badge bg-primary">{product.category_name}</span>
            <span className="badge bg-secondary">{product.product_condition}</span>
            <span className={`badge ${product.status === 'Available' ? 'bg-success' : product.status === 'Sold' ? 'bg-dark' : 'bg-warning text-dark'}`}>
              {product.status}
            </span>
          </div>
          <h2>{product.title}</h2>
          <h3 className="text-primary mb-3">₹{Number(product.price).toLocaleString('en-IN')}</h3>
          <p style={{ whiteSpace: 'pre-line' }}>{product.description || 'No description provided.'}</p>

          <div className="card border-0 bg-white shadow-sm mb-3">
            <div className="card-body">
              <h6 className="mb-1">Seller</h6>
              <div className="fw-semibold">{product.seller_name}</div>
              <small className="text-muted">
                {product.seller_department || 'Department not set'}
                {product.seller_semester ? ` • Semester ${product.seller_semester}` : ''}
              </small>
            </div>
          </div>

          {feedback.text && <div className={`alert alert-${feedback.type} py-2`}>{feedback.text}</div>}

          {isStudent && !isOwner && (
            <div className="d-flex gap-2 mb-3">
              <button className={`btn ${inWishlist ? 'btn-danger' : 'btn-outline-danger'} d-flex align-items-center gap-1`} onClick={toggleWishlist}>
                <Heart size={16} fill={inWishlist ? '#fff' : 'none'} /> {inWishlist ? 'In wishlist' : 'Add to wishlist'}
              </button>
              <button className="btn btn-outline-secondary d-flex align-items-center gap-1" onClick={reportProduct}>
                <Flag size={16} /> Report
              </button>
            </div>
          )}

          {isStudent && !isOwner && product.status === 'Available' && (
            <form onSubmit={sendEnquiry} className="card border-0 shadow-sm">
              <div className="card-body">
                <h6>Contact seller</h6>
                <textarea className="form-control mb-2" rows="3" required placeholder="Hi, is this still available?"
                  value={message} onChange={(e) => setMessage(e.target.value)} />
                <button className="btn btn-primary">Send enquiry</button>
              </div>
            </form>
          )}

          {!user && (
            <div className="alert alert-info">
              <Link to="/login">Log in</Link> to contact the seller or save this item.
            </div>
          )}
          {isOwner && (
            <Link to={`/edit-product/${product.product_id}`} className="btn btn-outline-primary">Edit this listing</Link>
          )}
        </div>
      </div>
    </div>
  );
}
