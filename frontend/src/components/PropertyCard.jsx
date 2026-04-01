// src/components/PropertyCard.jsx
// Reusable card shown in property listings

import { Link } from 'react-router-dom';
import { useState } from 'react';
import { toggleWishlist } from '../api/propertyAPI';
import useAuth from '../hooks/useAuth';

const PropertyCard = ({ property, onWishlistChange }) => {
  const { isAuthenticated } = useAuth();
  const [wishlisted, setWishlisted] = useState(property.is_wishlisted || false);
  const [toggling,   setToggling]   = useState(false);

  const handleWishlist = async (e) => {
    e.preventDefault();          // don't navigate
    if (!isAuthenticated) return;
    setToggling(true);
    try {
      const { data } = await toggleWishlist(property.id);
      setWishlisted(data.wishlisted);
      if (onWishlistChange) onWishlistChange(property.id, data.wishlisted);
    } catch (_) { /* silent */ }
    setToggling(false);
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-BD', {
      style: 'currency', currency: 'BDT', maximumFractionDigits: 0,
    }).format(price);

  const typeBadge = {
    rent: { label: 'For Rent',  color: '#10b981' },
    buy:  { label: 'For Sale',  color: '#3b82f6' },
    both: { label: 'Rent/Sale', color: '#8b5cf6' },
  }[property.property_type] || { label: property.property_type, color: '#64748b' };

  return (
    <Link to={`/properties/${property.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="property-card">

        {/* Image */}
        <div className="card-image-wrap">
          {property.primary_image ? (
            <img src={property.primary_image} alt={property.title} className="card-image" />
          ) : (
            <div className="card-image-placeholder">🏢</div>
          )}

          {/* Type badge */}
          <span className="type-badge" style={{ background: typeBadge.color }}>
            {typeBadge.label}
          </span>

          {/* Wishlist button */}
          {isAuthenticated && (
            <button className={`wishlist-btn ${wishlisted ? 'active' : ''}`}
                    onClick={handleWishlist} disabled={toggling}>
              {wishlisted ? '❤️' : '🤍'}
            </button>
          )}

          {property.is_featured && (
            <span className="featured-badge">⭐ Featured</span>
          )}
        </div>

        {/* Info */}
        <div className="card-body">
          <div className="card-price">{formatPrice(property.price)}</div>
          <div className="card-title">{property.title}</div>
          <div className="card-location">📍 {property.area ? `${property.area}, ` : ''}{property.city}</div>

          <div className="card-specs">
            {property.bedrooms  > 0 && <span>🛏 {property.bedrooms} bed</span>}
            {property.bathrooms > 0 && <span>🚿 {property.bathrooms} bath</span>}
            {property.area_sqft      && <span>📐 {property.area_sqft} sqft</span>}
          </div>
        </div>

      </div>
    </Link>
  );
};

export default PropertyCard;
