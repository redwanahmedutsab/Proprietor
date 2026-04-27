import {useState, useEffect} from 'react';
import {useParams, useSearchParams, useNavigate} from 'react-router-dom';
import {getPropertyById} from '../api/propertyAPI';
import {createBooking, initiatePayment} from '../api/bookingAPI';

const BookingPage = () => {
    const {propertyId} = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const defaultType = searchParams.get('type') || 'rent';

    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const [form, setForm] = useState({
        booking_type: defaultType,
        payment_method: 'online',
        start_date: '',
        end_date: '',
        notes: '',
    });

    useEffect(() => {
        getPropertyById(propertyId)
            .then(({data}) => setProperty(data))
            .catch(() => navigate('/properties'))
            .finally(() => setLoading(false));
    }, [propertyId, navigate]);

    const handleChange = (e) =>
        setForm((p) => ({...p, [e.target.name]: e.target.value}));

    const formatPrice = (p) =>
        new Intl.NumberFormat('en-BD', {
            style: 'currency', currency: 'BDT', maximumFractionDigits: 0,
        }).format(p);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setSubmitting(true);

        try {
            const {data: booking} = await createBooking({
                property: parseInt(propertyId),
                booking_type: form.booking_type,
                payment_method: form.payment_method,
                start_date: form.start_date || undefined,
                end_date: form.end_date || undefined,
                notes: form.notes,
            });

            if (form.payment_method === 'online') {
                const {data: payData} = await initiatePayment(booking.id);
                window.location.href = payData.payment_url;
            } else {
                navigate(`/booking-confirmation/${booking.id}?method=meet_pay`);
            }

        } catch (err) {
            setErrors(err.response?.data || {error: 'Booking failed. Please try again.'});
            setSubmitting(false);
        }
    };

    const fieldErr = (name) =>
        errors[name]
            ? <span className="field-error">{Array.isArray(errors[name]) ? errors[name][0] : errors[name]}</span>
            : null;

    if (loading) return <div className="page-loading">
        <div className="spinner"/>
    </div>;
    if (!property) return null;

    const isRent = form.booking_type === 'rent';

    return (
        <div className="booking-page">
            <div className="container">
                <div className="booking-layout">

                    <div className="booking-form-wrap">
                        <h1 className="booking-title">Complete Your Booking</h1>
                        <p className="booking-sub">Review details and choose your payment method.</p>

                        {errors.error && <div className="error-box">{errors.error}</div>}
                        {errors.non_field_errors && <div className="error-box">{errors.non_field_errors}</div>}

                        <form onSubmit={handleSubmit}>

                            {property.property_type === 'both' && (
                                <div className="field">
                                    <label>Booking Type</label>
                                    <div className="toggle-group">
                                        <button type="button"
                                                className={`toggle-btn ${form.booking_type === 'rent' ? 'active' : ''}`}
                                                onClick={() => setForm(p => ({...p, booking_type: 'rent'}))}>
                                            🏠 Rent
                                        </button>
                                        <button type="button"
                                                className={`toggle-btn ${form.booking_type === 'buy' ? 'active' : ''}`}
                                                onClick={() => setForm(p => ({...p, booking_type: 'buy'}))}>
                                            💰 Buy
                                        </button>
                                    </div>
                                </div>
                            )}

                            {isRent && (
                                <div className="field-row">
                                    <div className="field">
                                        <label>Move-in Date *</label>
                                        <input
                                            type="date" name="start_date"
                                            value={form.start_date} onChange={handleChange}
                                            min={new Date().toISOString().split('T')[0]}
                                            required
                                        />
                                        {fieldErr('start_date')}
                                    </div>
                                    <div className="field">
                                        <label>Move-out Date *</label>
                                        <input
                                            type="date" name="end_date"
                                            value={form.end_date} onChange={handleChange}
                                            min={form.start_date || new Date().toISOString().split('T')[0]}
                                            required
                                        />
                                        {fieldErr('end_date')}
                                    </div>
                                </div>
                            )}

                            <div className="field">
                                <label>Message to Owner (optional)</label>
                                <textarea
                                    name="notes" value={form.notes} onChange={handleChange}
                                    rows={3} placeholder="Any questions or special requests..."
                                />
                            </div>

                            <div className="field">
                                <label>Payment Method</label>
                                <div className="payment-methods">

                                    <label
                                        className={`pay-option ${form.payment_method === 'online' ? 'selected' : ''}`}>
                                        <input
                                            type="radio" name="payment_method" value="online"
                                            checked={form.payment_method === 'online'}
                                            onChange={handleChange}
                                        />
                                        <div className="pay-option-content">
                                            <div className="pay-option-title">💳 Pay Online Now</div>
                                            <div className="pay-option-desc">
                                                Secure payment via SSLCommerz — bKash, Nagad, Rocket, cards
                                            </div>
                                        </div>
                                    </label>

                                    <label
                                        className={`pay-option ${form.payment_method === 'meet_pay' ? 'selected' : ''}`}>
                                        <input
                                            type="radio" name="payment_method" value="meet_pay"
                                            checked={form.payment_method === 'meet_pay'}
                                            onChange={handleChange}
                                        />
                                        <div className="pay-option-content">
                                            <div className="pay-option-title">🤝 Meet & Pay Later</div>
                                            <div className="pay-option-desc">
                                                Visit the property first, pay in person when you're ready
                                            </div>
                                        </div>
                                    </label>

                                </div>
                            </div>

                            <button
                                type="submit"
                                className={`btn-primary booking-submit ${submitting ? 'loading' : ''}`}
                                disabled={submitting}
                            >
                                {submitting
                                    ? '⏳ Processing...'
                                    : form.payment_method === 'online'
                                        ? '💳 Proceed to Payment'
                                        : '✅ Confirm Booking'}
                            </button>

                        </form>
                    </div>

                    <aside className="booking-summary">
                        <div className="summary-card">
                            <h3 className="summary-title">Booking Summary</h3>

                            {property.images?.[0] && (
                                <img
                                    src={property.images[0].image}
                                    alt={property.title}
                                    className="summary-img"
                                />
                            )}

                            <div className="summary-prop-title">{property.title}</div>
                            <div className="summary-location">
                                📍 {property.area ? `${property.area}, ` : ''}{property.city}
                            </div>

                            <div className="summary-divider"/>

                            <div className="summary-row">
                                <span>Type</span>
                                <span className="summary-val">
                  {form.booking_type === 'rent' ? '🏠 Rent' : '💰 Buy'}
                </span>
                            </div>

                            {isRent && form.start_date && form.end_date && (
                                <div className="summary-row">
                                    <span>Period</span>
                                    <span className="summary-val">
                    {form.start_date} → {form.end_date}
                  </span>
                                </div>
                            )}

                            <div className="summary-row">
                                <span>Payment</span>
                                <span className="summary-val">
                  {form.payment_method === 'online' ? '💳 Online' : '🤝 Meet & Pay'}
                </span>
                            </div>

                            <div className="summary-divider"/>

                            <div className="summary-total">
                                <span>Total</span>
                                <span className="summary-total-val">{formatPrice(property.price)}</span>
                            </div>

                            {form.payment_method === 'online' && (
                                <div className="summary-note">
                                    🔒 Secured by SSLCommerz. Supports bKash, Nagad, Rocket, Visa, Mastercard.
                                </div>
                            )}
                        </div>
                    </aside>

                </div>
            </div>
        </div>
    );
};

export default BookingPage;
