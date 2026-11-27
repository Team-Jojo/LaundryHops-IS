import { useCallback, useEffect, useState } from 'react';
import { api, errMsg } from '../services/api';
import BookingCard from '../components/BookingCard';
import { toast } from '../components/Toast';

export default function MyBookings() {
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api
      .get('/bookings')
      .then((res) => setBookings(res.data.bookings))
      .catch((e) => setError(errMsg(e)));
  }, []);

  useEffect(load, [load]);

  const cancel = async (booking) => {
    if (!window.confirm(`Cancel booking #${booking.id}? This cannot be undone.`)) return;
    try {
      await api.patch(`/bookings/${booking.id}/cancel`);
      toast(`Booking #${booking.id} cancelled.`, 'success');
      load();
    } catch (e) {
      toast(errMsg(e), 'error');
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>My Bookings</h1>
          <p>Track your laundry and manage pending drop-offs.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {!bookings && !error && <p className="muted">Loading your bookings…</p>}

      {bookings && bookings.length === 0 && (
        <div className="empty-state">
          No bookings yet. Head to the <a href="/">services page</a> to place your first one!
        </div>
      )}

      <div className="stack">
        {(bookings || []).map((b) => (
          <BookingCard key={b.id} booking={b} onCancel={cancel} />
        ))}
      </div>
    </>
  );
}
