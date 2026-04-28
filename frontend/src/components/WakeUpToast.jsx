import { useEffect, useState, useRef } from 'react';
import './WakeUpToast.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
// A lightweight health endpoint — falls back to the root if /health/ doesn't exist
const HEALTH_URL = `${API_URL}/health/`;
const POLL_INTERVAL_MS = 5000;   // check every 5 s while sleeping
const TIMEOUT_MS       = 4000;   // each ping times out after 4 s

/**
 * Fires a single ping to the backend health endpoint.
 * Returns true if the server responded with any 2xx/3xx status.
 */
async function pingBackend() {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
        const res = await fetch(HEALTH_URL, { signal: controller.signal });
        return res.ok || (res.status >= 300 && res.status < 500);
    } catch {
        return false;
    } finally {
        clearTimeout(id);
    }
}

export default function WakeUpToast() {
    // 'checking' | 'sleeping' | 'awake' | 'hidden'
    const [status, setStatus] = useState('checking');
    const intervalRef = useRef(null);
    const hasMounted = useRef(false);

    useEffect(() => {
        // Only run once per page load
        if (hasMounted.current) return;
        hasMounted.current = true;

        async function initialCheck() {
            const alive = await pingBackend();
            if (alive) {
                // Backend is already up — no need to bother the user
                setStatus('hidden');
            } else {
                // Backend is sleeping — show the toast and start polling
                setStatus('sleeping');
                startPolling();
            }
        }

        function startPolling() {
            intervalRef.current = setInterval(async () => {
                const alive = await pingBackend();
                if (alive) {
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
                        <strong>Checking server…</strong>
                        <p>Connecting to the backend.</p>
                    </>
                )}
                {status === 'sleeping' && (
                    <>
                        <strong>Backend is waking up</strong>
                        <p>
                            The server runs on Render's free tier and sleeps after
                            inactivity. It usually takes <em>~1 minute</em> to wake up.
                            You can browse the site, but sign-in &amp; sign-up will be
                            ready once the server is awake.
                        </p>
                        <div className="wakeup-toast__spinner" aria-hidden="true">
                            <span /><span /><span />
                        </div>
                    </>
                )}
                {status === 'awake' && (
                    <>
                        <strong>Server is ready!</strong>
                        <p>You can now sign in, sign up, and use all features.</p>
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
