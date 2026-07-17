import {useEffect, useState} from 'react';
import {getPriceMetadata, predictSalePrice, predictRentPrice} from '../api/priceEstimateAPI';

const EMPTY_FORM = {
    area_sqft: '',
    bedrooms: '',
    bathrooms: '',
    building_type: '',
    division: '',
    city: '',
    locality: '',
    total_amenities: '',
};

const money = (n) => new Intl.NumberFormat('en-BD').format(Math.round(n));

const PriceEstimator = () => {
    const [purpose, setPurpose] = useState(null);   // null | 'sale' | 'rent'
    const [meta, setMeta] = useState(null);
    const [metaError, setMetaError] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        getPriceMetadata()
            .then(({data}) => setMeta(data))
            .catch(() =>
                setMetaError(
                    "Couldn't reach the price-suggestion service. Make sure the " +
                    "ml_service container is running (docker compose up)."
                )
            );
    }, []);

    const handleChange = (e) =>
        setForm((p) => ({...p, [e.target.name]: e.target.value}));

    const currentMeta = purpose && meta ? meta[purpose] : null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setResult(null);
        setLoading(true);
        try {
            const payload = {
                area_sqft: Number(form.area_sqft),
                bedrooms: Number(form.bedrooms),
                bathrooms: Number(form.bathrooms),
                building_type: form.building_type,
                division: form.division,
                city: form.city,
                locality: form.locality,
            };
            if (purpose === 'sale') {
                payload.total_amenities = form.total_amenities === '' ? null : Number(form.total_amenities);
            }
            const {data} = purpose === 'sale'
                ? await predictSalePrice(payload)
                : await predictRentPrice(payload);
            setResult(data);
        } catch (err) {
            setError(err.response?.data?.detail?.[0]?.msg || err.response?.data?.detail || 'Could not get a price suggestion. Please check the fields and try again.');
        } finally {
            setLoading(false);
        }
    };

    const resetAll = () => {
        setPurpose(null);
        setForm(EMPTY_FORM);
        setResult(null);
        setError(null);
    };

    return (
        <div style={{maxWidth: 720, margin: '0 auto', padding: '2rem 1rem'}}>
            <h2>🤖 AI Price Suggestion</h2>
            <p style={{color: '#64748b', marginBottom: '1.5rem'}}>
                Trained on real Bangladesh property listings. Sellers get a fair asking
                price; buyers get a sanity check on whether a listing is priced well.
            </p>

            {metaError && (
                <div className="field-error" style={{marginBottom: '1rem'}}>{metaError}</div>
            )}

            {/* Step 1: purpose */}
            {!purpose && (
                <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
                    <button
                        type="button"
                        className="btn-primary"
                        disabled={!meta}
                        onClick={() => setPurpose('sale')}
                        style={{flex: '1 1 220px', padding: '1.25rem'}}
                    >
                        🏠 I want a Selling Price
                        <div style={{fontWeight: 400, fontSize: '0.85rem', marginTop: 4}}>
                            For sellers listing a property, or buyers checking a Sale price
                        </div>
                    </button>
                    <button
                        type="button"
                        className="btn-secondary"
                        disabled={!meta}
                        onClick={() => setPurpose('rent')}
                        style={{flex: '1 1 220px', padding: '1.25rem'}}
                    >
                        🔑 I want a Rental Price
                        <div style={{fontWeight: 400, fontSize: '0.85rem', marginTop: 4}}>
                            For landlords, or tenants checking a monthly rent
                        </div>
                    </button>
                </div>
            )}

            {/* Step 2: details form */}
            {purpose && !result && (
                <form onSubmit={handleSubmit} style={{marginTop: '1rem'}}>
                    <button type="button" onClick={resetAll}
                            style={{background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', marginBottom: '1rem'}}>
                        ← change purpose ({purpose === 'sale' ? 'Selling' : 'Rental'})
                    </button>

                    <div className="field">
                        <label>Area (sqft)</label>
                        <input type="number" name="area_sqft" min="100" required
                               value={form.area_sqft} onChange={handleChange}/>
                    </div>

                    <div style={{display: 'flex', gap: '1rem'}}>
                        <div className="field" style={{flex: 1}}>
                            <label>Bedrooms</label>
                            <input type="number" name="bedrooms" min="0" max="10" required
                                   value={form.bedrooms} onChange={handleChange}/>
                        </div>
                        <div className="field" style={{flex: 1}}>
                            <label>Bathrooms</label>
                            <input type="number" name="bathrooms" min="0" max="10" required
                                   value={form.bathrooms} onChange={handleChange}/>
                        </div>
                    </div>

                    <div className="field">
                        <label>Property Type</label>
                        <select name="building_type" required value={form.building_type} onChange={handleChange}>
                            <option value="">Select...</option>
                            {currentMeta?.building_type.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{display: 'flex', gap: '1rem'}}>
                        <div className="field" style={{flex: 1}}>
                            <label>Division</label>
                            <select name="division" required value={form.division} onChange={handleChange}>
                                <option value="">Select...</option>
                                {currentMeta?.division.map((d) => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field" style={{flex: 1}}>
                            <label>City</label>
                            <input list="city-options" name="city" required
                                   value={form.city} onChange={handleChange}/>
                            <datalist id="city-options">
                                {currentMeta?.city.map((c) => <option key={c} value={c}/>)}
                            </datalist>
                        </div>
                    </div>

                    <div className="field">
                        <label>Area / Locality (e.g. Gulshan, Bashundhara R-A, Mirpur)</label>
                        <input list="locality-options" name="locality" required
                               value={form.locality} onChange={handleChange}/>
                        <datalist id="locality-options">
                            {currentMeta?.locality.map((l) => <option key={l} value={l}/>)}
                        </datalist>
                    </div>

                    {purpose === 'sale' && (
                        <div className="field">
                            <label>Total amenities (optional — lift, gym, security, etc.)</label>
                            <input type="number" name="total_amenities" min="0"
                                   value={form.total_amenities} onChange={handleChange}
                                   placeholder="Leave blank if unsure"/>
                        </div>
                    )}

                    {error && <div className="field-error" style={{marginBottom: '1rem'}}>{String(error)}</div>}

                    <button type="submit" className="btn-primary" disabled={loading} style={{width: '100%'}}>
                        {loading ? 'Calculating...' : 'Get Price Suggestion'}
                    </button>
                </form>
            )}

            {/* Step 3: result */}
            {result && (
                <div className="auth-card" style={{marginTop: '1rem'}}>
                    <h3>{purpose === 'sale' ? 'Suggested Selling Price' : 'Suggested Monthly Rent'}</h3>
                    <p style={{fontSize: '2rem', fontWeight: 700, margin: '0.5rem 0'}}>
                        ৳{money(result.suggested_price)}
                        {result.unit === 'per month' && <span style={{fontSize: '1rem', fontWeight: 400}}> / month</span>}
                    </p>
                    <p style={{color: '#64748b'}}>
                        Realistic range: ৳{money(result.price_low)} – ৳{money(result.price_high)}
                    </p>
                    <p style={{color: '#64748b'}}>
                        ≈ ৳{money(result.price_per_sqft)} per sqft
                    </p>
                    <p style={{fontSize: '0.85rem', color: '#94a3b8', marginTop: '1rem'}}>
                        {result.note}
                    </p>
                    <button type="button" className="btn-secondary" onClick={resetAll} style={{marginTop: '1rem'}}>
                        Estimate another property
                    </button>
                </div>
            )}
        </div>
    );
};

export default PriceEstimator;
