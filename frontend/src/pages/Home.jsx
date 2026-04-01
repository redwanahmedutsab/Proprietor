// src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFeatured } from '../api/propertyAPI';
import PropertyCard from '../components/PropertyCard';

const Home = () => {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [type,     setType]     = useState('');

  useEffect(() => {
    getFeatured()
      .then(({ data }) => setFeatured(Array.isArray(data) ? data : data.results || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (type)   params.set('property_type', type);
    navigate(`/properties?${params.toString()}`);
  };

  const stats = [
    { value: '2,400+', label: 'Properties Listed' },
    { value: '1,800+', label: 'Happy Clients' },
    { value: '64',     label: 'Cities Covered' },
    { value: '98%',    label: 'Satisfaction Rate' },
  ];

  const categories = [
    { icon: '🏢', label: 'Apartment', value: 'apartment' },
    { icon: '🏠', label: 'House',     value: 'house'     },
    { icon: '🏬', label: 'Office',    value: 'office'    },
    { icon: '🛒', label: 'Shop',      value: 'shop'      },
    { icon: '🌿', label: 'Land',      value: 'land'      },
  ];

  return (
    <div className="home">

      {/* ── Hero ──────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-content">
          <div className="hero-eyebrow">Bangladesh's #1 Real Estate Platform</div>
          <h1 className="hero-title">
            Find Your <span className="hero-accent">Perfect</span><br />
            Property Today
          </h1>
          <p className="hero-sub">
            Browse thousands of apartments, houses, offices & land across Bangladesh.
          </p>

          {/* Search bar */}
          <form className="search-bar" onSubmit={handleSearch}>
            <div className="search-type">
              <button
                type="button"
                className={`type-btn ${type === '' ? 'active' : ''}`}
                onClick={() => setType('')}
              >All</button>
              <button
                type="button"
                className={`type-btn ${type === 'rent' ? 'active' : ''}`}
                onClick={() => setType('rent')}
              >Rent</button>
              <button
                type="button"
                className={`type-btn ${type === 'buy' ? 'active' : ''}`}
                onClick={() => setType('buy')}
              >Buy</button>
            </div>
            <div className="search-input-row">
              <input
                className="search-input"
                placeholder="Search by city, area, or keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="search-btn">Search</button>
            </div>
          </form>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────── */}
      <section className="stats-bar">
        {stats.map((s) => (
          <div className="stat-item" key={s.label}>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </section>

      {/* ── Categories ────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Browse by Category</h2>
          </div>
          <div className="category-grid">
            {categories.map((c) => (
              <button
                key={c.value}
                className="category-card"
                onClick={() => navigate(`/properties?category=${c.value}`)}
              >
                <span className="cat-icon">{c.icon}</span>
                <span className="cat-label">{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured ──────────────────────────────── */}
      <section className="section section-dark">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Properties</h2>
            <button className="link-btn" onClick={() => navigate('/properties')}>
              View all →
            </button>
          </div>
          {loading ? (
            <div className="loading-grid">
              {[1,2,3,4].map(i => <div key={i} className="skeleton-card" />)}
            </div>
          ) : featured.length === 0 ? (
            <p className="empty-msg">No featured properties yet.</p>
          ) : (
            <div className="prop-grid">
              {featured.map(p => <PropertyCard key={p.id} property={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────── */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-box">
            <div className="cta-text">
              <h2>Have a property to sell or rent?</h2>
              <p>List it for free. Reach thousands of buyers across Bangladesh.</p>
            </div>
            <button className="cta-btn"
                    onClick={() => navigate('/post-property')}>
              Post Your Property
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
