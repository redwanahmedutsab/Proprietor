import {useState, useEffect} from 'react';
import API from '../api/axiosInstance';
import useAuth from '../hooks/useAuth';

const StarRating = ({value, onChange, readonly = false}) => {
    const [hovered, setHovered] = useState(0);
    const display = hovered || value;

    return (
        <div className="star-row">
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    className={`star ${display >= star ? 'filled' : 'empty'} ${readonly ? '' : 'clickable'}`}
                    onClick={() => !readonly && onChange && onChange(star)}
                    onMouseEnter={() => !readonly && setHovered(star)}
                    onMouseLeave={() => !readonly && setHovered(0)}
                >
          ★
        </span>
            ))}
            {!readonly && value > 0 && (
                <span className="star-label">{['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][value]}</span>
            )}
        </div>
    );
};

const ReviewSection = ({propertyId}) => {
    const {isAuthenticated, user} = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [avgRating, setAvgRating] = useState(0);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [form, setForm] = useState({rating: 0, comment: ''});

    const fetchReviews = () => {
        API.get(`/properties/${propertyId}/reviews/`)
            .then(({data}) => {
                const list = data.results || data;
                setReviews(list);
                if (list.length > 0) {
                    const avg = list.reduce((s, r) => s + r.rating, 0) / list.length;
                    setAvgRating(Math.round(avg * 10) / 10);
                }
            })
            .catch(() => {
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchReviews();
    }, [propertyId]);

    const alreadyReviewed = reviews.some(r => r.author_name === user?.full_name);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        if (form.rating === 0) {
            setFormError('Please select a star rating.');
            return;
        }
        if (!form.comment.trim()) {
            setFormError('Please write a comment.');
            return;
        }

        setSubmitting(true);
        try {
            const {data} = await API.post(`/properties/${propertyId}/reviews/`, form);
            setReviews(prev => [data.review, ...prev]);
            setAvgRating(data.new_average_rating);
            setForm({rating: 0, comment: ''});
            setShowForm(false);
        } catch (err) {
            setFormError(err.response?.data?.error || 'Could not submit review.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (reviewId) => {
        if (!window.confirm('Delete your review?')) return;
        try {
            await API.delete(`/reviews/${reviewId}/`);
            setReviews(prev => prev.filter(r => r.id !== reviewId));
        } catch (_) {
        }
    };

    return (
        <div className="review-section">

            <div className="review-header">
                <div className="review-title-row">
                    <h3 className="review-title">Reviews</h3>
                    {reviews.length > 0 && (
                        <div className="avg-rating">
                            <StarRating value={Math.round(avgRating)} readonly/>
                            <span className="avg-num">{avgRating} / 5</span>
                            <span className="review-count">({reviews.length})</span>
                        </div>
                    )}
                </div>

                {isAuthenticated && !alreadyReviewed && (
                    <button
                        className="btn-add-review"
                        onClick={() => setShowForm(p => !p)}
                    >
                        {showForm ? '✕ Cancel' : '✏️ Write a Review'}
                    </button>
                )}
            </div>

            {showForm && (
                <div className="review-form-wrap">
                    <form onSubmit={handleSubmit} className="review-form">
                        <div className="field">
                            <label>Your Rating</label>
                            <StarRating
                                value={form.rating}
                                onChange={(v) => setForm(p => ({...p, rating: v}))}
                            />
                        </div>
                        <div className="field">
                            <label>Your Review</label>
                            <textarea
                                value={form.comment}
                                onChange={(e) => setForm(p => ({...p, comment: e.target.value}))}
                                rows={3}
                                placeholder="Share your experience with this property..."
                                maxLength={1000}
                            />
                            <span style={{fontSize: '.72rem', color: '#94a3b8'}}>
                {form.comment.length}/1000
              </span>
                        </div>
                        {formError && <div className="error-box">{formError}</div>}
                        <button type="submit" className="btn-primary" disabled={submitting}
                                style={{marginTop: '.5rem'}}>
                            {submitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </form>
                </div>
            )}

            {loading ? (
                <div style={{color: '#64748b', fontSize: '.85rem', padding: '1rem 0'}}>
                    Loading reviews...
                </div>
            ) : reviews.length === 0 ? (
                <div className="no-reviews">
                    <span>💬</span>
                    <p>No reviews yet. {isAuthenticated ? 'Be the first to review!' : 'Login to leave a review.'}</p>
                </div>
            ) : (
                <div className="review-list">
                    {reviews.map((review) => (
                        <div key={review.id} className="review-card">
                            <div className="review-card-header">
                                <div className="reviewer-avatar">
                                    {review.author_avatar
                                        ? <img src={review.author_avatar} alt=""/>
                                        : <span>{review.author_name?.[0]}</span>
                                    }
                                </div>
                                <div className="reviewer-info">
                                    <div className="reviewer-name">{review.author_name}</div>
                                    <StarRating value={review.rating} readonly/>
                                </div>
                                <div className="review-meta">
                  <span className="review-date">
                    {new Date(review.created_at).toLocaleDateString('en-BD')}
                  </span>
                                    {review.author_name === user?.full_name && (
                                        <button className="btn-del-review"
                                                onClick={() => handleDelete(review.id)}>
                                            🗑
                                        </button>
                                    )}
                                </div>
                            </div>
                            <p className="review-comment">{review.comment}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReviewSection;
