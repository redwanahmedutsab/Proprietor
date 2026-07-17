import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {getFeatured} from '../api/propertyAPI';
import PropertyCard from '../components/PropertyCard';
import CountUp from '../components/CountUp';
import useInView from '../hooks/useInView';

const RenderToast = () => {
    // null = initial check in progress, true = server down, false = server up
    const [serverDown, setServerDown] = useState(null);
    const [justRecovered, setJustRecovered] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

        const checkServer = async () => {
            try {
                const res = await fetch(`${BASE_URL}/properties/featured/`, {
                    method: 'GET',
                    signal: AbortSignal.timeout(5000),
                });
                // Any real HTTP response (even 401/403) means the server is alive
                if (res.status < 500) {
                    setServerDown(prev => {
                        if (prev === true) setJustRecovered(true);
                        return false;
                    });
                } else {
                    setServerDown(true);
                }
            } catch {
                setServerDown(true);
            }
        };

        checkServer();
        const interval = setInterval(checkServer, 5000);
        return () => clearInterval(interval);
    }, []);

    // Auto-hide the "server is ready" success banner after 3 seconds
    useEffect(() => {
        if (justRecovered) {
            const t = setTimeout(() => setJustRecovered(false), 3000);
            return () => clearTimeout(t);
        }
    }, [justRecovered]);

    if (serverDown === null) return null;
    if (serverDown === false && !justRecovered) return null;
    if (dismissed) return null;

    const isUp = !serverDown && justRecovered;

    return (
        <div className="render-toast-overlay">
            <div className={`render-toast ${isUp ? 'render-toast--up' : ''}`}>
                <div className="render-toast-icon">
                    {isUp ? (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="#057a55" strokeWidth="2"/>
                            <path d="M8 12l3 3 5-5" stroke="#057a55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    ) : (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="#f59e0b" strokeWidth="2"/>
                            <path d="M12 7v5l3 3" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    )}
                </div>
                <div className="render-toast-body">
                    {isUp ? (
                        <>
                            <div className="render-toast-title render-toast-title--up">Backend is ready!</div>
                            <div className="render-toast-msg render-toast-msg--up">
                                The server has started. You can now <strong>login</strong> and <strong>sign up</strong> normally.
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="render-toast-title">Backend is waking up…</div>
                            <div className="render-toast-msg">
                                This app is hosted on <strong>Render's free tier</strong>, which spins down after inactivity.
                                Please wait — checking every 5 seconds until the server is ready.
                            </div>
                            <div className="render-toast-pulse-row">
                                <span className="render-toast-pulse"/>
                                <span className="render-toast-pulse-label">Connecting to server…</span>
                            </div>
                        </>
                    )}
                </div>
                <button className="render-toast-close" onClick={() => setDismissed(true)} aria-label="Dismiss">
                    ×
                </button>
            </div>
        </div>
    );
};

// Signature element: a low-rise Dhaka skyline silhouette with amber
// "lit window" rectangles that twinkle at random, anchoring the hero
// to the idea that a home is a lit window somewhere in the city.
const HeroSkyline = () => {
    // Deterministic pseudo-random so markup is stable across renders.
    const seeded = (i) => ((i * 9301 + 49297) % 233280) / 233280;

    const buildings = [
        {x: 0, w: 70, h: 90}, {x: 68, w: 46, h: 130}, {x: 112, w: 60, h: 70},
        {x: 170, w: 40, h: 150}, {x: 208, w: 80, h: 100}, {x: 286, w: 50, h: 175},
        {x: 334, w: 66, h: 85}, {x: 398, w: 44, h: 140}, {x: 440, w: 90, h: 110},
        {x: 528, w: 56, h: 160}, {x: 582, w: 70, h: 90}, {x: 650, w: 48, h: 130},
        {x: 696, w: 64, h: 75}, {x: 758, w: 40, h: 150}, {x: 796, w: 84, h: 100},
        {x: 878, w: 50, h: 175}, {x: 926, w: 66, h: 85}, {x: 990, w: 44, h: 140},
        {x: 1032, w: 90, h: 110}, {x: 1120, w: 56, h: 160}, {x: 1174, w: 66, h: 90},
    ];

    let windowIndex = 0;

    return (
        <div className="hero-skyline" aria-hidden="true">
            <svg viewBox="0 0 1240 200" preserveAspectRatio="none">
                {buildings.map((b, bi) => {
                    const cols = Math.max(2, Math.floor(b.w / 16));
                    const rows = Math.max(2, Math.floor(b.h / 20));
                    const windows = [];
                    for (let r = 0; r < rows; r++) {
                        for (let c = 0; c < cols; c++) {
                            windowIndex++;
                            const lit = seeded(windowIndex) > 0.45;
                            if (!lit) continue;
                            const wx = b.x + 6 + c * (b.w - 12) / cols;
                            const wy = (200 - b.h) + 10 + r * (b.h - 20) / rows;
                            const delay = (seeded(windowIndex * 7) * 6).toFixed(2);
                            windows.push(
                                <rect
                                    key={`${bi}-${r}-${c}`}
                                    className="window"
                                    x={wx} y={wy} width="4" height="6"
                                    fill="#F0A93B"
                                    style={{animationDelay: `${delay}s`}}
                                />
                            );
                        }
                    }
                    return (
                        <g key={bi}>
                            <rect x={b.x} y={200 - b.h} width={b.w} height={b.h} fill="#0A0D1C"/>
                            {windows}
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

const Home = () => {
    const navigate = useNavigate();
    const [featured, setFeatured] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [type, setType] = useState('');

    const [catRef, catVisible] = useInView();
    const [featRef, featVisible] = useInView();
    const [ctaRef, ctaVisible] = useInView();

    useEffect(() => {
        getFeatured()
            .then(({data}) => setFeatured(Array.isArray(data) ? data : data.results || []))
            .catch(() => {
            })
            .finally(() => setLoading(false));
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (type) params.set('property_type', type);
        navigate(`/properties?${params.toString()}`);
    };

    const stats = [
        {value: '2,400+', label: 'Properties Listed'},
        {value: '1,800+', label: 'Happy Clients'},
        {value: '64', label: 'Cities Covered'},
        {value: '98%', label: 'Satisfaction Rate'},
    ];

    const categories = [
        {icon: '🏢', label: 'Apartment', value: 'apartment'},
        {icon: '🏠', label: 'House', value: 'house'},
        {icon: '🏬', label: 'Office', value: 'office'},
        {icon: '🛒', label: 'Shop', value: 'shop'},
        {icon: '🌿', label: 'Land', value: 'land'},
    ];

    return (
        <div className="home">
            <RenderToast/>

            <section className="hero">
                <div className="hero-bg"/>
                <div className="hero-content">
                    <div className="hero-eyebrow">Bangladesh's #1 Real Estate Platform</div>
                    <h1 className="hero-title">
                        Find Your <span className="hero-accent">Perfect</span><br/>
                        Property Today
                    </h1>
                    <p className="hero-sub">
                        Browse thousands of apartments, houses, offices &amp; land across Bangladesh.
                    </p>

                    <form className="search-bar" onSubmit={handleSearch}>
                        <div className="search-type">
                            <button
                                type="button"
                                className={`type-btn ${type === '' ? 'active' : ''}`}
                                onClick={() => setType('')}
                            >All
                            </button>
                            <button
                                type="button"
                                className={`type-btn ${type === 'rent' ? 'active' : ''}`}
                                onClick={() => setType('rent')}
                            >Rent
                            </button>
                            <button
                                type="button"
                                className={`type-btn ${type === 'buy' ? 'active' : ''}`}
                                onClick={() => setType('buy')}
                            >Buy
                            </button>
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
                <HeroSkyline/>
            </section>

            <section className="stats-bar">
                {stats.map((s) => (
                    <div className="stat-item" key={s.label}>
                        <div className="stat-value"><CountUp value={s.value}/></div>
                        <div className="stat-label">{s.label}</div>
                    </div>
                ))}
            </section>

            <section className="section" ref={catRef}>
                <div className="container">
                    <div className={`section-header reveal ${catVisible ? 'is-visible' : ''}`}>
                        <h2 className="section-title">Browse by Category</h2>
                    </div>
                    <div className={`category-grid reveal-stagger ${catVisible ? 'is-visible' : ''}`}>
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

            <section className="section section-dark" ref={featRef}>
                <div className="container">
                    <div className={`section-header reveal ${featVisible ? 'is-visible' : ''}`}>
                        <h2 className="section-title">Featured Properties</h2>
                        <button className="link-btn" onClick={() => navigate('/properties')}>
                            View all →
                        </button>
                    </div>
                    {loading ? (
                        <div className="loading-grid">
                            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton-card"/>)}
                        </div>
                    ) : featured.length === 0 ? (
                        <p className="empty-msg">No featured properties yet.</p>
                    ) : (
                        <div className={`prop-grid reveal-stagger ${featVisible ? 'is-visible' : ''}`}>
                            {featured.map(p => <PropertyCard key={p.id} property={p}/>)}
                        </div>
                    )}
                </div>
            </section>

            <section className="cta-section" ref={ctaRef}>
                <div className="container">
                    <div className={`cta-box reveal ${ctaVisible ? 'is-visible' : ''}`}>
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
