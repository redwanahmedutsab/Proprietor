// src/pages/PropertyDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPropertyById, toggleWishlist } from '../api/propertyAPI';
import useAuth from '../hooks/useAuth';

const PropertyDetail = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [property,    setProperty]    = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [activeImg,   setActiveImg]   = useState(0);
  const [wishlisted,  setWishlisted]  = useState(false);
  const [showTour,    setShowTour]    = useState(false);

  useEffect(() => {
    getPropertyById(id)
      .then(({ data }) => {
        setProperty(data);
        setWishlisted(data.is_wishlisted || false);
      })
      .catch(() => setError('Property not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleWishlist = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    const { data } = await toggleWishlist(id);
    setWishlisted(data.wishlisted);
  };

  const formatPrice = (p) =>
    new Intl.NumberFormat('en-BD', {
      style: 'currency', currency: 'BDT', maximumFractionDigits: 0,
    }).format(p);

  // Convert a YouTube watch URL to embed URL
  const getEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch')) {
      const vid = new URL(url).searchParams.get('v');
      return `https://www.youtube.com/embed/${vid}`;
    }
    if (url.includes('youtu.be/')) {
      const vid = url.split('youtu.be/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${vid}`;
    }
    return url; // Matterport & others embed as-is
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (error)   return <div className="container"><div className="error-msg">{error}</div></div>;
  if (!property) return null;

  const images   = property.images || [];
  const embedUrl = getEmbedUrl(property.tour_url);
  const isOwner  = user?.id === property.owner_id;

  return (
    <div className="detail-page">
      <div className="container">

        {/* Breadcrumb */}
        <div className="breadcrumb">
          <span onClick={() => navigate('/')} className="bc-link">Home</span>
          <span className="bc-sep">›</span>
          <span onClick={() => navigate('/properties')} className="bc-link">Properties</span>
          <span className="bc-sep">›</span>
          <span className="bc-current">{property.title}</span>
        </div>

        <div className="detail-layout">

          {/* ── Left: Media + Info ── */}
          <div className="detail-main">

            {/* Image Gallery */}
            <div className="gallery">
              <div className="gallery-main">
                {images.length > 0 ? (
                  <img
                    src={images[activeImg]?.image}
                    alt={property.title}
                    className="gallery-main-img"
                  />
                ) : (
                  <div className="gallery-placeholder">🏢 No images</div>
                )}

                {/* Tour button overlay */}
                {embedUrl && (
                  <button className="tour-overlay-btn"
                          onClick={() => setShowTour(true)}>
                    🎥 View 3D / Virtual Tour
                  </button>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="gallery-thumbs">
                  {images.map((img, i) => (
                    <img
                      key={img.id}
                      src={img.image}
                      alt=""
                      className={`thumb ${activeImg === i ? 'active' : ''}`}
                      onClick={() => setActiveImg(i)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* 3D Tour iframe */}
            {showTour && embedUrl && (
              <div className="tour-container">
                <div className="tour-header">
                  <span>🎥 Virtual Tour</span>
                  <button onClick={() => setShowTour(false)} className="tour-close">✕ Close</button>
                </div>
                <iframe
                  src={embedUrl}
                  title="Virtual Tour"
                  className="tour-iframe"
                  allowFullScreen
                />
              </div>
            )}

            {/* Property Info */}
            <div className="prop-info-block">
              <div className="prop-info-header">
                <div>
                  <h1 className="prop-title">{property.title}</h1>
                  <div className="prop-location">📍 {property.address}, {property.city}</div>
                </div>
                <button
                  className={`wishlist-large ${wishlisted ? 'active' : ''}`}
                  onClick={handleWishlist}
                >
                  {wishlisted ? '❤️ Saved' : '🤍 Save'}
                </button>
              </div>

              {/* Specs row */}
              <div className="specs-row">
                {property.bedrooms  > 0 && <div className="spec-chip">🛏 {property.bedrooms} Bedrooms</div>}
                {property.bathrooms > 0 && <div className="spec-chip">🚿 {property.bathrooms} Bathrooms</div>}
                {property.area_sqft      && <div className="spec-chip">📐 {property.area_sqft} sqft</div>}
                {property.floor          && <div className="spec-chip">🏗 Floor {property.floor}</div>}
                <div className="spec-chip">🏷 {property.category}</div>
              </div>

              {/* Description */}
              <div className="prop-section">
                <h3 className="prop-section-title">Description</h3>
                <p className="prop-description">{property.description}</p>
              </div>

              {/* Map placeholder */}
              {property.latitude && property.longitude && (
                <div className="prop-section">
                  <h3 className="prop-section-title">Location</h3>
                  <div className="map-placeholder">
                    {/* Phase 5: replace with Google Maps component */}
                    <div className="map-mock">
                      <span>📍 {property.area ? `${property.area}, ` : ''}{property.city}</span>
                      <br/>
                      <small>Map integration — Phase 5</small>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Price + Contact sidebar ── */}
          <aside className="detail-sidebar">

            <div className="price-card">
              <div className="price-main">{formatPrice(property.price)}</div>
              <div className="price-type">
                {property.property_type === 'rent' ? '/ month' :
                 property.property_type === 'buy'  ? '(full price)' : 'rent or buy'}
              </div>

              <div className="price-divider" />

              {/* Booking buttons */}
              {!isOwner && (
                <>
                  {(property.property_type === 'rent' || property.property_type === 'both') && (
                    <button
                      className="book-btn book-rent"
                      onClick={() => navigate(
                        isAuthenticated
                          ? `/book/${property.id}?type=rent`
                          : '/login'
                      )}
                    >
                      🏠 Book for Rent
                    </button>
                  )}
                  {(property.property_type === 'buy' || property.property_type === 'both') && (
                    <button
                      className="book-btn book-buy"
                      onClick={() => navigate(
                        isAuthenticated
                          ? `/book/${property.id}?type=buy`
                          : '/login'
                      )}
                    >
                      💰 Buy This Property
                    </button>
                  )}
                </>
              )}

              {isOwner && (
                <button
                  className="book-btn book-edit"
                  onClick={() => navigate(`/edit-property/${property.id}`)}
                >
                  ✏️ Edit Listing
                </button>
              )}
            </div>

            {/* Owner / Agent card */}
            <div className="agent-card">
              <h4 className="agent-title">Listed By</h4>
              <div className="agent-name">{property.owner_name}</div>
              {property.owner_phone && (
                <a href={`tel:${property.owner_phone}`} className="agent-contact">
                  📞 {property.owner_phone}
                </a>
              )}
              {property.owner_email && (
                <a href={`mailto:${property.owner_email}`} className="agent-contact">
                  ✉️ {property.owner_email}
                </a>
              )}
            </div>

            {/* Stats */}
            <div className="stats-mini">
              <span>👁 {property.views_count} views</span>
              <span>📅 {new Date(property.created_at).toLocaleDateString('en-BD')}</span>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
