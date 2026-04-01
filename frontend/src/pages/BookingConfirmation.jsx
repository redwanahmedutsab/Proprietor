// src/pages/BookingConfirmation.jsx
// Shown after a "Meet & Pay" booking is created (no online payment)

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBookingById } from '../api/bookingAPI';

const BookingConfirmation = () => {
  const { bookingId } = useParams();
  const navigate      = useNavigate();
  const [booking,  setBooking]  = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    getBookingById(bookingId)
      .then(({ data }) => setBooking(data))
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false));
  }, [bookingId, navigate]);

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (!booking) return null;

  const formatPrice = (p) =>
    new Intl.NumberFormat('en-BD', {
      style: 'currency', currency: 'BDT', maximumFractionDigits: 0,
    }).format(p);

  return (
    <div style={{ minHeight:'80vh', display:'flex', alignItems:'center',
                  justifyContent:'center', padding:'2rem', background:'#f8fafc' }}>
      <div style={{
        background:'#fff', borderRadius:16, padding:'2.5rem 2rem',
        maxWidth:500, width:'100%', boxShadow:'0 4px 20px rgba(0,0,0,.07)',
        border:'1px solid #e2e8f0',
      }}>
        <div style={{ fontSize:'3rem', marginBottom:'1rem', textAlign:'center' }}>🤝</div>
        <h2 style={{ textAlign:'center', marginBottom:'.4rem' }}>Booking Confirmed!</h2>
        <p style={{ textAlign:'center', color:'#475569', marginBottom:'1.5rem', fontSize:'.9rem' }}>
          Your meet &amp; pay booking has been submitted. The owner will contact you to arrange a visit.
        </p>

        <div style={{
          background:'#f8fafc', borderRadius:10, padding:'1rem',
          border:'1px solid #e2e8f0', marginBottom:'1.5rem',
        }}>
          {[
            ['Property',  booking.property_title],
            ['Type',      booking.booking_type === 'rent' ? '🏠 Rent' : '💰 Buy'],
            ['Status',    '⏳ Pending Confirmation'],
            ['Payment',   '🤝 Meet & Pay'],
            ['Amount',    formatPrice(booking.total_price)],
            booking.start_date && ['From', booking.start_date],
            booking.end_date   && ['To',   booking.end_date],
          ].filter(Boolean).map(([label, val]) => (
            <div key={label} style={{
              display:'flex', justifyContent:'space-between',
              padding:'.4rem 0', borderBottom:'1px solid #e2e8f0',
              fontSize:'.85rem',
            }}>
              <span style={{ color:'#64748b' }}>{label}</span>
              <span style={{ fontWeight:600 }}>{val}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background:'#1a56db', color:'#fff', border:'none',
            borderRadius:8, padding:'.75rem', fontWeight:700,
            fontSize:'.95rem', cursor:'pointer', width:'100%',
            marginBottom:'.6rem',
          }}
        >
          View My Bookings
        </button>

        <button
          onClick={() => navigate('/properties')}
          style={{
            background:'#e2e8f0', color:'#0f172a', border:'none',
            borderRadius:8, padding:'.75rem', fontWeight:600,
            fontSize:'.88rem', cursor:'pointer', width:'100%',
          }}
        >
          Browse More Properties
        </button>
      </div>
    </div>
  );
};

export default BookingConfirmation;
