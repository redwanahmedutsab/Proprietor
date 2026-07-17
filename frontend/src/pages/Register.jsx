import {useState, useEffect, useRef} from 'react';
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

const RESEND_SECONDS = 60;

const Register = () => {
    const {register, sendOtp, verifyOtp} = useAuth();
    const navigate = useNavigate();

    // 'form' -> filling out signup details
    // 'otp'  -> code sent, waiting for the user to enter + verify it
    const [step, setStep] = useState('form');

    const [form, setForm] = useState(INITIAL);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const [otp, setOtp] = useState('');
    const [otpError, setOtpError] = useState('');
    const [otpNotice, setOtpNotice] = useState('');
    const [cooldown, setCooldown] = useState(0);

    const timerRef = useRef(null);

    useEffect(() => {
        return () => clearInterval(timerRef.current);
    }, []);

    const startCooldown = (seconds = RESEND_SECONDS) => {
        clearInterval(timerRef.current);
        setCooldown(seconds);
        timerRef.current = setInterval(() => {
            setCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleChange = (e) => {
        setForm((prev) => ({...prev, [e.target.name]: e.target.value}));
        if (errors[e.target.name]) {
            setErrors((prev) => ({...prev, [e.target.name]: null}));
        }
    };

    // Step 1: validate the form server-side by asking it to send an OTP.
    // If the email is invalid/taken, that error surfaces here before we
    // ever bother the user with a code.
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setErrors({});
        setSubmitting(true);

        const result = await sendOtp(form.email);

        if (result.success) {
            setStep('otp');
            setOtp('');
            setOtpError('');
            setOtpNotice(`A verification code has been sent to ${form.email}.`);
            startCooldown(result.retryAfter || RESEND_SECONDS);
        } else {
            setErrors({email: result.error});
            if (result.retryAfter) startCooldown(result.retryAfter);
        }
        setSubmitting(false);
    };

    const handleResendOtp = async () => {
        if (cooldown > 0) return;
        setOtpError('');
        setOtpNotice('');
        const result = await sendOtp(form.email);
        if (result.success) {
            setOtpNotice('A new code has been sent.');
            startCooldown(result.retryAfter || RESEND_SECONDS);
        } else {
            setOtpError(result.error);
            if (result.retryAfter) startCooldown(result.retryAfter);
        }
    };

    // Step 2: verify the code, then — only on success — actually create
    // the account with the details collected in step 1.
    const handleVerifyAndSignUp = async (e) => {
        e.preventDefault();
        setOtpError('');
        setSubmitting(true);

        const verifyResult = await verifyOtp(form.email, otp);
        if (!verifyResult.success) {
            setOtpError(verifyResult.error);
            setSubmitting(false);
            return;
        }

        const result = await register(form);
        if (result.success) {
            navigate('/dashboard');
        } else {
            // Something about the saved form data was rejected at account
            // creation — bounce back to the form step so they can fix it.
            setErrors(result.errors || {});
            setStep('form');
        }
        setSubmitting(false);
    };

    const fieldError = (name) =>
        errors[name] ? (
            <span className="field-error">
        {Array.isArray(errors[name]) ? errors[name][0] : errors[name]}
      </span>
        ) : null;

    if (step === 'otp') {
        return (
            <div className="auth-page">
                <div className="auth-card">
                    <h2>Verify Your Email</h2>
                    <p className="subtitle">
                        Enter the 6-digit code sent to <strong>{form.email}</strong>
                    </p>

                    {otpNotice && <div className="notice-box">{otpNotice}</div>}
                    {otpError && <div className="error-box">{otpError}</div>}

                    <form onSubmit={handleVerifyAndSignUp}>
                        <div className="field">
                            <label>Verification Code</label>
                            <input
                                name="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                maxLength={6}
                                placeholder="123456"
                                required
                                autoFocus
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting || otp.length !== 6}
                            className="btn-primary"
                        >
                            {submitting ? 'Verifying...' : 'Verify & Create Account'}
                        </button>
                    </form>

                    <div className="otp-resend-row">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={handleResendOtp}
                            disabled={cooldown > 0}
                        >
                            {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
                        </button>
                    </div>

                    <p className="switch-link">
                        Wrong email?{' '}
                        <button type="button" className="link-btn" onClick={() => setStep('form')}>
                            Go back
                        </button>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-card wide">
                <h2>Create Account</h2>
                <p className="subtitle">Join our real estate platform</p>

                {errors.non_field_errors && (
                    <div className="error-box">{errors.non_field_errors}</div>
                )}

                <form onSubmit={handleSendOtp}>
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
                        {submitting ? 'Sending code...' : 'Send OTP'}
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
