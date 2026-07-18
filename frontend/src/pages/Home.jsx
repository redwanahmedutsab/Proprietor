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

const Home = () => {
    const navigate = useNavigate();
    const [featured, setFeatured] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [type, setType] = useState('');

    const [catRef, catVisible] = useInView();
    const [featRef, featVisible] = useInView();
    const [testiRef, testiVisible] = useInView();
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
        {icon: '🏢', label: 'Apartment', value: 'apartment', photo: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=500&q=70'},
        {icon: '🏠', label: 'House', value: 'house', photo: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=500&q=70'},
        {icon: '🏬', label: 'Office', value: 'office', photo: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=500&q=70'},
        {icon: '🛒', label: 'Shop', value: 'shop', photo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=500&q=70'},
        {icon: '🌿', label: 'Land', value: 'land', photo: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=500&q=70'},
    ];

    const cities = [
        'Dhaka', 'Chattogram', 'Sylhet', 'Khulna', 'Rajshahi',
        'Barishal', 'Rangpur', 'Gazipur', 'Cumilla', 'Narayanganj',
    ];

    const testimonials = [
        {
            text: 'Found our new apartment in Gulshan within two weeks. The filters and map view made shortlisting so much easier than the usual listing sites.',
            name: 'Farhana Rahman',
            role: 'Renter, Dhaka',
        },
        {
            text: 'Listed my family land in Sylhet for sale and had serious inquiries within days. The whole process felt transparent from start to finish.',
            name: 'Kamrul Hasan',
            role: 'Property Owner, Sylhet',
        },
        {
            text: 'The price estimator gave me a realistic number before I even listed. Booking a viewing was as easy as picking a time slot.',
            name: 'Nusrat Jahan',
            role: 'Buyer, Chattogram',
        },
    ];

    return (
        <div className="home">
            <RenderToast/>

            <section className="hero-v2">
                <div className="hero-media" aria-hidden="true">
                    <img
                        className="hero-photo"
                        src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1800&q=80"
                        alt=""
                    />
                    <div className="hero-scrim"/>
                </div>

                <div className="hero-inner">
                    <div className="hero-eyebrow">Bangladesh's #1 Real Estate Platform</div>
                    <h1 className="hero-title">
                        Find Your <span className="hero-accent">Perfect</span><br/>
                        Property Today
                    </h1>
                    <p className="hero-sub">
                        Browse thousands of apartments, houses, offices &amp; land across Bangladesh.
                    </p>
                </div>

                <form className="hero-search-card" onSubmit={handleSearch}>
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
            </section>

            <section className="trust-strip" aria-hidden="true">
                <div className="trust-track">
                    {[...cities, ...cities].map((city, i) => (
                        <span key={i}>{city}</span>
                    ))}
                </div>
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
                                style={{backgroundImage: `linear-gradient(180deg, rgba(10,13,28,.15), rgba(10,13,28,.72)), url(${c.photo})`}}
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

            <section className="section" ref={testiRef}>
                <div className="container">
                    <div className={`section-header reveal ${testiVisible ? 'is-visible' : ''}`}>
                        <h2 className="section-title">What our clients say</h2>
                    </div>
                    <div className={`testimonial-grid reveal-stagger ${testiVisible ? 'is-visible' : ''}`}>
                        {testimonials.map((t) => (
                            <div className="testimonial-card" key={t.name}>
                                <div className="testimonial-quote-mark">&ldquo;</div>
                                <p className="testimonial-text">{t.text}</p>
                                <div className="testimonial-person">
                                    <div className="testimonial-avatar">
                                        {t.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <div className="testimonial-name">{t.name}</div>
                                        <div className="testimonial-role">{t.role}</div>
                                        <div className="testimonial-stars">★★★★★</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
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
