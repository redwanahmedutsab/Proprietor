import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {createProperty} from '../api/propertyAPI';

const INITIAL = {
    title: '',
    description: '',
    price: '',
    property_type: 'rent',
    category: 'apartment',
    address: '',
    city: '',
    area: '',
    bedrooms: '',
    bathrooms: '',
    area_sqft: '',
    floor: '',
    tour_url: '',
};

const PostProperty = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState(INITIAL);
    const [images, setImages] = useState([]);  // File[]
    const [previews, setPreviews] = useState([]);  // blob URLs
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) =>
        setForm((p) => ({...p, [e.target.name]: e.target.value}));

    const handleImages = (e) => {
        const files = Array.from(e.target.files);
        setImages(files);
        setPreviews(files.map((f) => URL.createObjectURL(f)));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setSubmitting(true);

        const fd = new FormData();
        Object.entries(form).forEach(([key, val]) => {
            if (val !== '') fd.append(key, val);
        });
        images.forEach((img) => fd.append('uploaded_images', img));

        try {
            const {data} = await createProperty(fd);
            setSuccess(true);
            setTimeout(() => navigate(`/properties/${data.id}`), 1500);
        } catch (err) {
            setErrors(err.response?.data || {error: 'Submission failed.'});
        } finally {
            setSubmitting(false);
        }
    };

    const fieldErr = (name) =>
        errors[name] ? <span className="field-error">{errors[name]}</span> : null;

    if (success) {
        return (
            <div className="auth-page">
                <div className="auth-card">
                    <h2>✅ Property Submitted!</h2>
                    <p>Your listing is pending admin approval. Redirecting...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{maxWidth: 720, margin: '0 auto', padding: '2rem 1rem'}}>
            <h2>Post a Property</h2>
            <p style={{color: '#64748b', marginBottom: '1.5rem'}}>
                Your listing will be reviewed by admin before going live.
            </p>

            <form onSubmit={handleSubmit}>

                <div className="field">
                    <label>Title *</label>
                    <input name="title" value={form.title} onChange={handleChange} required/>
                    {fieldErr('title')}
                </div>

                <div className="field">
                    <label>Description *</label>
                    <textarea name="description" value={form.description}
                              onChange={handleChange} rows={4} required/>
                    {fieldErr('description')}
                </div>

                <div className="field-row">
                    <div className="field">
                        <label>Price (BDT) *</label>
                        <input type="number" name="price" value={form.price}
                               onChange={handleChange} required/>
                        {fieldErr('price')}
                    </div>
                    <div className="field">
                        <label>Listing Type</label>
                        <select name="property_type" value={form.property_type} onChange={handleChange}>
                            <option value="rent">For Rent</option>
                            <option value="buy">For Sale</option>
                            <option value="both">Rent & Sale</option>
                        </select>
                    </div>
                    <div className="field">
                        <label>Category</label>
                        <select name="category" value={form.category} onChange={handleChange}>
                            <option value="apartment">Apartment</option>
                            <option value="house">House</option>
                            <option value="office">Office</option>
                            <option value="shop">Shop / Commercial</option>
                            <option value="land">Land</option>
                        </select>
                    </div>
                </div>

                <div className="field">
                    <label>Full Address *</label>
                    <input name="address" value={form.address} onChange={handleChange} required/>
                </div>
                <div className="field-row">
                    <div className="field">
                        <label>City *</label>
                        <input name="city" value={form.city} onChange={handleChange} required/>
                    </div>
                    <div className="field">
                        <label>Area / Neighbourhood</label>
                        <input name="area" value={form.area}
                               placeholder="e.g. Gulshan, Dhanmondi"
                               onChange={handleChange}/>
                    </div>
                </div>

                <div className="field-row">
                    <div className="field">
                        <label>Bedrooms</label>
                        <input type="number" name="bedrooms" value={form.bedrooms}
                               min="0" onChange={handleChange}/>
                    </div>
                    <div className="field">
                        <label>Bathrooms</label>
                        <input type="number" name="bathrooms" value={form.bathrooms}
                               min="0" onChange={handleChange}/>
                    </div>
                    <div className="field">
                        <label>Area (sqft)</label>
                        <input type="number" name="area_sqft" value={form.area_sqft}
                               onChange={handleChange}/>
                    </div>
                    <div className="field">
                        <label>Floor</label>
                        <input type="number" name="floor" value={form.floor}
                               onChange={handleChange}/>
                    </div>
                </div>

                <div className="field">
                    <label>3D Tour / Virtual Tour Link (optional)</label>
                    <input type="url" name="tour_url" value={form.tour_url}
                           placeholder="https://matterport.com/... or YouTube URL"
                           onChange={handleChange}/>
                </div>

                <div className="field">
                    <label>Property Images (first image = cover)</label>
                    <input type="file" accept="image/*" multiple onChange={handleImages}/>
                    {previews.length > 0 && (
                        <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem'}}>
                            {previews.map((src, i) => (
                                <img key={i} src={src} alt=""
                                     style={{width: 80, height: 80, objectFit: 'cover', borderRadius: 4}}/>
                            ))}
                        </div>
                    )}
                </div>

                <button type="submit" disabled={submitting} className="btn-primary">
                    {submitting ? 'Submitting...' : 'Submit Listing'}
                </button>

            </form>
        </div>
    );
};

export default PostProperty;
