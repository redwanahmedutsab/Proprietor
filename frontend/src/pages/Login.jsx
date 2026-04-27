import {useState} from 'react';
import {useNavigate, Link} from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Login = () => {
    const {login, error} = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({email: '', password: ''});
    const [submitting, setSubmitting] = useState(false);
    const [localError, setLocalError] = useState('');

    const handleChange = (e) =>
        setForm((prev) => ({...prev, [e.target.name]: e.target.value}));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');
        setSubmitting(true);

        const result = await login(form.email, form.password);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setLocalError(result.error);
        }
        setSubmitting(false);
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2>Welcome Back</h2>
                <p className="subtitle">Sign in to your account</p>

                {(localError || error) && (
                    <div className="error-box">{localError || error}</div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="field">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div className="field">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button type="submit" disabled={submitting} className="btn-primary">
                        {submitting ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p className="switch-link">
                    Don't have an account? <Link to="/register">Register</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
