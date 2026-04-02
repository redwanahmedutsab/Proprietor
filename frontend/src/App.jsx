// src/App.jsx — FINAL VERSION (All 5 Phases)
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import {AuthProvider} from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PostProperty from './pages/PostProperty';
import BookingPage from './pages/BookingPage';
import BookingConfirmation from './pages/BookingConfirmation';
import PaymentResult from './pages/PaymentResult';

import './styles/global.css';
import './styles/booking.css';
import './styles/polish.css';
import Developers from "./pages/Developers";

function App() {
    return (
        <AuthProvider>
            <Router>
                <Navbar/>

                <Routes>
                    {/* ── Public ─────────────────────────── */}
                    <Route path="/" element={<Home/>}/>
                    <Route path="/properties" element={<Properties/>}/>
                    <Route path="/properties/:id" element={<PropertyDetail/>}/>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/register" element={<Register/>}/>
                    <Route path="/developers" element={<Developers/>}/>

                    {/* ── SSLCommerz redirects back here ── */}
                    <Route path="/payment/success" element={<PaymentResult result="success"/>}/>
                    <Route path="/payment/fail" element={<PaymentResult result="fail"/>}/>
                    <Route path="/payment/cancel" element={<PaymentResult result="cancel"/>}/>

                    {/* ── Protected ──────────────────────── */}
                    <Route element={<ProtectedRoute/>}>
                        <Route path="/dashboard" element={<Dashboard/>}/>
                        <Route path="/post-property" element={<PostProperty/>}/>
                        <Route path="/book/:propertyId" element={<BookingPage/>}/>
                        <Route path="/booking-confirmation/:bookingId" element={<BookingConfirmation/>}/>
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace/>}/>
                </Routes>

                <Footer/>
            </Router>
        </AuthProvider>
    );
}

export default App;
