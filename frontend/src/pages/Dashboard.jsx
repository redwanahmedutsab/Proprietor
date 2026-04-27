import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {getMyProperties, getWishlist, deleteProperty} from '../api/propertyAPI';
import useAuth from '../hooks/useAuth';
import PropertyCard from '../components/PropertyCard';

const STATUS_COLORS = {
    pending: {bg: 'rgba(245,158,11,.15)', color: '#f59e0b', label: '⏳ Pending'},
    approved: {bg: 'rgba(16,185,129,.15)', color: '#10b981', label: '✅ Approved'},
    rejected: {bg: 'rgba(244,63,94,.15)', color: '#f43f5e', label: '❌ Rejected'},
    sold: {bg: 'rgba(139,92,246,.15)', color: '#8b5cf6', label: '🏷 Sold'},
};

const Dashboard = () => {
    const {user, logout} = useAuth();
    const navigate = useNavigate();
    const [tab, setTab] = useState('listings');
    const [listings, setListings] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(null);

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            const [listRes, wishRes] = await Promise.allSettled([
                getMyProperties(),
                getWishlist(),
            ]);
            if (listRes.status === 'fulfilled')
                setListings(listRes.value.data?.results || listRes.value.data || []);
            if (wishRes.status === 'fulfilled')
                setWishlist(wishRes.value.data?.results || wishRes.value.data || []);
            setLoading(false);
        };
        fetchAll();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this property listing?')) return;
        setDeleting(id);
        try {
            await deleteProperty(id);
            setListings((prev) => prev.filter((p) => p.id !== id));
        } catch (_) {
            alert('Could not delete.');
        }
        setDeleting(null);
    };

    const formatPrice = (p) =>
        new Intl.NumberFormat('en-BD', {
            style: 'currency', currency: 'BDT', maximumFractionDigits: 0,
        }).format(p);

    return (
        <div className="dashboard-page">
            <div className="container">

                <div className="dash-header">
                    <div className="dash-avatar">
                        {user?.profile_picture
                            ? <img src={user.profile_picture} alt=""/>
                            : <span>{user?.first_name?.[0]}{user?.last_name?.[0]}</span>
                        }
                    </div>
                    <div className="dash-user-info">
                        <h2 className="dash-name">{user?.full_name || user?.username}</h2>
                        <div className="dash-email">{user?.email}</div>
                        <div className="dash-role">{user?.role}</div>
                    </div>
                    <div className="dash-actions">
                        <button className="btn-secondary"
                                onClick={() => navigate('/post-property')}>
                            + Post Property
                        </button>
                        <button className="btn-outline-red" onClick={logout}>
                            Logout
                        </button>
                    </div>
                </div>

                <div className="dash-stats">
                    <div className="dash-stat">
                        <div className="ds-value">{listings.length}</div>
                        <div className="ds-label">My Listings</div>
                    </div>
                    <div className="dash-stat">
                        <div className="ds-value">
                            {listings.filter(p => p.status === 'approved').length}
                        </div>
                        <div className="ds-label">Approved</div>
                    </div>
                    <div className="dash-stat">
                        <div className="ds-value">
                            {listings.filter(p => p.status === 'pending').length}
                        </div>
                        <div className="ds-label">Pending</div>
                    </div>
                    <div className="dash-stat">
                        <div className="ds-value">{wishlist.length}</div>
                        <div className="ds-label">Saved</div>
                    </div>
                </div>

                <div className="dash-tabs">
                    <button className={`dash-tab ${tab === 'listings' ? 'active' : ''}`}
                            onClick={() => setTab('listings')}>
                        My Listings ({listings.length})
                    </button>
                    <button className={`dash-tab ${tab === 'wishlist' ? 'active' : ''}`}
                            onClick={() => setTab('wishlist')}>
                        Saved ({wishlist.length})
                    </button>
                </div>

                {loading ? (
                    <div className="prop-grid">
                        {[1, 2, 3].map(i => <div key={i} className="skeleton-card"/>)}
                    </div>
                ) : tab === 'listings' ? (
                    listings.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">🏘</div>
                            <h3>No listings yet</h3>
                            <p>Post your first property to get started.</p>
                            <button className="btn-primary" onClick={() => navigate('/post-property')}>
                                Post Property
                            </button>
                        </div>
                    ) : (
                        <div className="dash-listing-list">
                            {listings.map((p) => {
                                const s = STATUS_COLORS[p.status] || STATUS_COLORS.pending;
                                return (
                                    <div className="dash-listing-row" key={p.id}>
                                        <div className="dlr-image">
                                            {p.primary_image
                                                ? <img src={p.primary_image} alt={p.title}/>
                                                : <div className="dlr-img-placeholder">🏢</div>
                                            }
                                        </div>
                                        <div className="dlr-info">
                                            <div className="dlr-title"
                                                 onClick={() => navigate(`/properties/${p.id}`)}>
                                                {p.title}
                                            </div>
                                            <div className="dlr-meta">
                                                {p.city} · {formatPrice(p.price)} · {p.bedrooms}bd
                                            </div>
                                            <span className="status-badge"
                                                  style={{background: s.bg, color: s.color}}>
                        {s.label}
                      </span>
                                        </div>
                                        <div className="dlr-actions">
                                            <button className="dlr-btn"
                                                    onClick={() => navigate(`/edit-property/${p.id}`)}>
                                                Edit
                                            </button>
                                            <button className="dlr-btn danger"
                                                    disabled={deleting === p.id}
                                                    onClick={() => handleDelete(p.id)}>
                                                {deleting === p.id ? '...' : 'Delete'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )
                ) : (
                    wishlist.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">❤️</div>
                            <h3>No saved properties</h3>
                            <p>Heart properties you like to save them here.</p>
                            <button className="btn-primary" onClick={() => navigate('/properties')}>
                                Browse Properties
                            </button>
                        </div>
                    ) : (
                        <div className="prop-grid">
                            {wishlist.map((w) => (
                                <PropertyCard
                                    key={w.id}
                                    property={{...w.property, is_wishlisted: true}}
                                    onWishlistChange={(pid, saved) => {
                                        if (!saved) setWishlist((prev) => prev.filter(x => x.property.id !== pid));
                                    }}
                                />
                            ))}
                        </div>
                    )
                )}

            </div>
        </div>
    );
};

export default Dashboard;
