import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ToastHost from './components/Toast';
import { useAuth } from './context/AuthContext';

import Catalog from './pages/Catalog';
import Login from './pages/Login';
import Register from './pages/Register';
import Booking from './pages/Booking';
import MyBookings from './pages/MyBookings';
import Tracking from './pages/Tracking';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBookings from './pages/admin/AdminBookings';
import AdminServices from './pages/admin/AdminServices';
import AdminPayments from './pages/admin/AdminPayments';

function Protected({ children, adminOnly = false }) {
  const { user, ready } = useAuth();
  if (!ready) return <div className="empty-state">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Catalog />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/services/:id/book"
            element={
              <Protected>
                <Booking />
              </Protected>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <Protected>
                <MyBookings />
              </Protected>
            }
          />
          <Route
            path="/bookings/:id"
            element={
              <Protected>
                <Tracking />
              </Protected>
            }
          />
          <Route
            path="/admin"
            element={
              <Protected adminOnly>
                <AdminDashboard />
              </Protected>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <Protected adminOnly>
                <AdminBookings />
              </Protected>
            }
          />
          <Route
            path="/admin/services"
            element={
              <Protected adminOnly>
                <AdminServices />
              </Protected>
            }
          />
          <Route
            path="/admin/payments"
            element={
              <Protected adminOnly>
                <AdminPayments />
              </Protected>
            }
          />
          <Route path="*" element={<div className="empty-state">Page not found.</div>} />
        </Routes>
      </main>
      <footer className="footer">
        LaundryHops · Team Jojo · School Capstone Project 2026
      </footer>
      <ToastHost />
    </div>
  );
}
