import {useState} from 'react';
import {useNavigate, Link} from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const INITIAL = {
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    role: 'buyer',
    password: '',
    password2: '',
};

const Register = () => {
    const {register} = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState(INITIAL);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        setForm((prev) => ({...prev, [e.target.name]: e.target.value}));
        if (errors[e.target.name]) {
            setErrors((prev) => ({...prev, [e.target.name]: null}));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setSubmitting(true);

        const result = await register(form);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setErrors(result.errors || {});
        }
        setSubmitting(false);
    };

    const fieldError = (name) =>
        errors[name] ? (
            <span className="field-error">
        {Array.isArray(errors[name]) ? errors[name][0] : errors[name]}
      </span>
        ) : null;

    return (
        <div className="auth-page">
            <div className="auth-card wide">
                <h2>Create Account</h2>
                <p className="subtitle">Join our real estate platform</p>

                {errors.non_field_errors && (
                    <div className="error-box">{errors.non_field_errors}</div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="field-row">
                        <div className="field">
                            <label>First Name *</label>
                            <input name="first_name" value={form.first_name}
                                   onChange={handleChange} required/>
                            {fieldError('first_name')}
                        </div>
                        <div className="field">
                            <label>Last Name *</label>
                            <input name="last_name" value={form.last_name}
                                   onChange={handleChange} required/>
                            {fieldError('last_name')}
                        </div>
                    </div>

                    <div className="field">
                        <label>Username * (min 6 characters)</label>
                        <input name="username" value={form.username}
                               onChange={handleChange} required/>
                        {fieldError('username')}
                    </div>

                    <div className="field">
                        <label>Email *</label>
                        <input type="email" name="email" value={form.email}
                               onChange={handleChange} required/>
                        {fieldError('email')}
                    </div>

                    <div className="field">
                        <label>Phone (Bangladesh format)</label>
                        <input name="phone" value={form.phone}
                               placeholder="01712345678"
                               onChange={handleChange}/>
                        {fieldError('phone')}
                    </div>

                    <div className="field">
                        <label>Address</label>
                        <textarea name="address" value={form.address}
                                  onChange={handleChange} rows={2}/>
                        {fieldError('address')}
                    </div>

                    <div className="field">
                        <label>I am a</label>
                        <select name="role" value={form.role} onChange={handleChange}>
                            <option value="buyer">Buyer / Renter</option>
                            <option value="seller">Seller / Landlord</option>
                        </select>
                    </div>

                    <div className="field-row">
                        <div className="field">
                            <label>Password *</label>
                            <input type="password" name="password" value={form.password}
                                   onChange={handleChange} required/>
                            {fieldError('password')}
                        </div>
                        <div className="field">
                            <label>Confirm Password *</label>
                            <input type="password" name="password2" value={form.password2}
                                   onChange={handleChange} required/>
                            {fieldError('password2')}
                        </div>
                    </div>

                    <button type="submit" disabled={submitting} className="btn-primary">
                        {submitting ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <p className="switch-link">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
