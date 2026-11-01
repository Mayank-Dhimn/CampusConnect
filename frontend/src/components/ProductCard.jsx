import { Link } from 'react-router-dom';
import { Heart, ImageOff } from 'lucide-react';
import { imageUrl } from '../services/api';

export default function ProductCard({ product, onToggleWishlist, wished }) {
  const img = imageUrl(product.image);

  return (
    <div className="card product-card h-100 shadow-sm position-relative">
      {onToggleWishlist && (
        <button
          className="wishlist-heart"
          title={wished ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={() => onToggleWishlist(product.product_id)}
        >
          <Heart size={18} color="#e11d48" fill={wished ? '#e11d48' : 'none'} />
        </button>
      )}

      {img ? (
        <img src={img} className="card-img-top" alt={product.title} />
      ) : (
        <div className="img-placeholder"><ImageOff size={36} /></div>
      )}

      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-1">
          <span className="badge bg-primary-subtle text-primary-emphasis">{product.category_name}</span>
          <span className="badge bg-secondary-subtle text-secondary-emphasis">{product.product_condition}</span>
        </div>
        <h6 className="card-title mt-2 mb-1">{product.title}</h6>
        <p className="fw-bold text-primary fs-5 mb-1">₹{Number(product.price).toLocaleString('en-IN')}</p>
        {product.seller_name && <small className="text-muted mb-3">Sold by {product.seller_name}</small>}
        <Link to={`/products/${product.product_id}`} className="btn btn-outline-primary btn-sm mt-auto">
          View details
        </Link>
      </div>
    </div>
  );
}
