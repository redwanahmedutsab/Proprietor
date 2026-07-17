import { useEffect, useState, useRef } from 'react';
import './WakeUpToast.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
const ML_API_URL = process.env.REACT_APP_ML_API_URL || 'http://localhost:8001';

// Both services live on Render's free tier and sleep independently after
// inactivity, so we wake + poll them together and surface ONE toast instead
// of stacking two.
const SERVICES = [
    { key: 'backend', label: 'Main server', url: `${API_URL}/health/` },
    { key: 'ml', label: 'Price prediction server', url: `${ML_API_URL}/health` },
];

const POLL_INTERVAL_MS = 5000;   // check every 5 s while sleeping
const TIMEOUT_MS       = 4000;   // each ping times out after 4 s

/**
 * Fires a single ping to a health endpoint.
 * Returns true if the server responded with any 2xx/3xx/4xx status
 * (i.e. it's awake, even if the route itself 404s).
 */
async function ping(url) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
        const res = await fetch(url, { signal: controller.signal });
        return res.ok || (res.status >= 300 && res.status < 500);
    } catch {
        return false;
    } finally {
        clearTimeout(id);
    }
}

/** Pings every service in parallel, returns { backend: bool, ml: bool } */
async function pingAll() {
    const results = await Promise.all(SERVICES.map((s) => ping(s.url)));
    return SERVICES.reduce((acc, s, i) => {
        acc[s.key] = results[i];
        return acc;
    }, {});
}

export default function WakeUpToast() {
    // 'checking' | 'sleeping' | 'awake' | 'hidden'
    const [status, setStatus] = useState('checking');
    // Per-service up/down, so the toast can show progressive ticks
    const [serviceStatus, setServiceStatus] = useState({ backend: false, ml: false });
    const intervalRef = useRef(null);
    const hasMounted = useRef(false);

    useEffect(() => {
        // Only run once per page load
        if (hasMounted.current) return;
        hasMounted.current = true;

        async function initialCheck() {
            const result = await pingAll();
            setServiceStatus(result);

            const allUp = Object.values(result).every(Boolean);
            if (allUp) {
                // Both are already up — no need to bother the user
                setStatus('hidden');
            } else {
                // At least one is sleeping — show the toast and start polling
                setStatus('sleeping');
                startPolling();
            }
        }

        function startPolling() {
            intervalRef.current = setInterval(async () => {
                const result = await pingAll();
                setServiceStatus(result);

                const allUp = Object.values(result).every(Boolean);
                if (allUp) {
                    clearInterval(intervalRef.current);
                    setStatus('awake');
                    // Auto-dismiss after 4 s
                    setTimeout(() => setStatus('hidden'), 4000);
                }
            }, POLL_INTERVAL_MS);
        }

        initialCheck();

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    if (status === 'hidden') return null;

    return (
        <div className={`wakeup-toast wakeup-toast--${status}`} role="status" aria-live="polite">
            <span className="wakeup-toast__icon">
                {status === 'checking' && '⏳'}
                {status === 'sleeping' && '😴'}
                {status === 'awake'    && '✅'}
            </span>

            <div className="wakeup-toast__body">
                {status === 'checking' && (
                    <>
                        <strong>Checking servers…</strong>
                        <p>Connecting to the backend.</p>
                    </>
                )}
                {status === 'sleeping' && (
                    <>
                        <strong>Servers are waking up</strong>
                        <p>
                            Our backend and price-prediction service run on Render's
                            free tier and sleep after inactivity. It usually takes{' '}
                            <em>~1 minute</em> to wake up. You can keep browsing —
                            sign-in, sign-up &amp; AI price predictions will be ready
                            once both are awake.
                        </p>
                        <ul className="wakeup-toast__services">
                            {SERVICES.map((s) => (
                                <li key={s.key} className={serviceStatus[s.key] ? 'is-up' : 'is-down'}>
                                    <span className="wakeup-toast__dot" aria-hidden="true" />
                                    {s.label} {serviceStatus[s.key] ? '— ready' : '— waking up…'}
                                </li>
                            ))}
                        </ul>
                        <div className="wakeup-toast__spinner" aria-hidden="true">
                            <span /><span /><span />
                        </div>
                    </>
                )}
                {status === 'awake' && (
                    <>
                        <strong>Connected — ready to go!</strong>
                        <p>You can now sign in, sign up, and get AI price predictions.</p>
                    </>
                )}
            </div>

            {/* Only allow manual dismissal while sleeping so the user can hide it */}
            {status === 'sleeping' && (
                <button
                    className="wakeup-toast__close"
                    onClick={() => setStatus('hidden')}
                    aria-label="Dismiss"
                >
                    ✕
                </button>
            )}
        </div>
    );
}
