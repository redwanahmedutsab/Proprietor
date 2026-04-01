// src/pages/PaymentResult.jsx
// Shown after returning from SSLCommerz gateway

import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { getPaymentStatus } from '../api/bookingAPI';

const PaymentResult = ({ result }) => {
  // result = 'success' | 'fail' | 'cancel'
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const bookingId      = searchParams.get('booking');
  const [status, setStatus] = useState(null);
  const [polling, setPolling] = useState(result === 'success');

  useEffect(() => {
    if (result !== 'success' || !bookingId) {
      setPolling(false);
      return;
    }

    // Poll backend until payment is confirmed (max 10 tries × 2s = 20s)
    let tries = 0;
    const interval = setInterval(async () => {
      tries++;
      try {
        const { data } = await getPaymentStatus(bookingId);
        if (data.is_paid) {
          setStatus(data);
          setPolling(false);
          clearInterval(interval);
        }
      } catch (_) {}
      if (tries >= 10) {
        setPolling(false);
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [result, bookingId]);

  const configs = {
    success: {
      icon:  '🎉',
      color: '#057a55',
      bg:    '#f0fdf4',
      border:'#bbf7d0',
      title: 'Payment Successful!',
      sub:   'Your booking is confirmed. The owner will contact you shortly.',
      btn:   'View My Bookings',
      action: () => navigate('/dashboard'),
    },
    fail: {
      icon:  '❌',
      color: '#e02424',
      bg:    '#fef2f2',
      border:'#fecaca',
      title: 'Payment Failed',
      sub:   'Your payment could not be processed. No charge was made.',
      btn:   'Try Again',
      action: () => navigate(-1),
    },
    cancel: {
      icon:  '↩️',
      color: '#9f580a',
      bg:    '#fffbeb',
      border:'#fde68a',
      title: 'Payment Cancelled',
      sub:   'You cancelled the payment. Your booking has not been confirmed.',
      btn:   'Go Back',
      action: () => navigate('/properties'),
    },
  };

  const cfg = configs[result] || configs.fail;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', background: '#f8fafc', padding: '2rem' }}>
      <div style={{
        background: cfg.bg,
        border: `2px solid ${cfg.border}`,
        borderRadius: 16,
        padding: '3rem 2.5rem',
        textAlign: 'center',
        maxWidth: 460,
        width: '100%',
        boxShadow: '0 4px 20px rgba(0,0,0,.07)',
      }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>{cfg.icon}</div>

        {polling ? (
          <>
            <h2 style={{ color: cfg.color, marginBottom: '.5rem' }}>Verifying Payment...</h2>
            <p style={{ color: '#475569', marginBottom: '1.5rem' }}>
              Please wait while we confirm your payment.
            </p>
            <div className="spinner" style={{ margin: '0 auto' }} />
          </>
        ) : (
          <>
            <h2 style={{ color: cfg.color, fontSize: '1.5rem',
                         fontWeight: 800, marginBottom: '.5rem' }}>
              {cfg.title}
            </h2>
            <p style={{ color: '#475569', marginBottom: '1.5rem', lineHeight: 1.7 }}>
              {cfg.sub}
            </p>

            {result === 'success' && status && (
              <div style={{
                background: '#fff', borderRadius: 8,
                padding: '.9rem', marginBottom: '1.5rem',
                border: '1px solid #bbf7d0', textAlign: 'left',
              }}>
                <div style={{ fontSize: '.8rem', color: '#6b7280', marginBottom: '.3rem' }}>
                  Transaction ID
                </div>
                <div style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '.9rem' }}>
                  {status.tran_id}
                </div>
              </div>
            )}

            <button
              onClick={cfg.action}
              style={{
                background: cfg.color, color: '#fff',
                border: 'none', borderRadius: 8,
                padding: '.75rem 1.8rem', fontWeight: 700,
                fontSize: '.95rem', cursor: 'pointer', width: '100%',
              }}
            >
              {cfg.btn}
            </button>

            {result !== 'success' && (
              <button
                onClick={() => navigate('/')}
                style={{
                  background: 'none', border: 'none',
                  color: '#475569', marginTop: '.75rem',
                  cursor: 'pointer', fontSize: '.88rem',
                  textDecoration: 'underline',
                }}
              >
                Go to Homepage
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentResult;
