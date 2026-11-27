import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, errMsg } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import { toast } from '../components/Toast';
import { STATUS_STEPS, formatMoney, prettyDate, prettyDateTime, qtyLabel } from '../constants';

export default function Tracking() {
  const { id } = useParams();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    api
      .get(`/bookings/${id}`)
      .then((res) => setBooking(res.data.booking))
      .catch((e) => setError(errMsg(e)));
  }, [id]);

  const cancel = async () => {
    if (!window.confirm(`Cancel booking #${booking.id}? This cannot be undone.`)) return;
    try {
      await api.patch(`/bookings/${booking.id}/cancel`);
      const res = await api.get(`/bookings/${id}`);
      setBooking(res.data.booking);
      toast('Booking cancelled.', 'success');
    } catch (e) {
      toast(errMsg(e), 'error');
    }
  };

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!booking) return <p className="muted">Loading booking…</p>;

  const { service, payment, customer } = booking;
  const currentIdx = STATUS_STEPS.indexOf(booking.status);
  const isTerminalDone = ['delivered', 'claimed'].includes(booking.status);
  const isCancelled = booking.status === 'cancelled';
  const isOwner = user && customer && user.id === customer.id;

  return (
    <>
      <div className="page-header">
        <div>
          <h1>
            Booking #{booking.id} <StatusBadge status={booking.status} />
          </h1>
          <p>{service ? service.name : 'Service'} · placed {prettyDateTime(booking.created_at)}</p>
        </div>
        <Link to="/my-bookings" className="btn btn-secondary btn-sm">
          ← All my bookings
        </Link>
      </div>

      {isCancelled && (
        <div className="alert alert-error">
          This booking was cancelled. Place a new booking from the services page if needed.
        </div>
      )}

      {!isCancelled && (
        <div className="card">
          <h2>Progress</h2>
          <ol className="timeline">
            {STATUS_STEPS.map((step, i) => (
              <li
                key={step}
                className={
                  isTerminalDone || i < currentIdx
                    ? 'done'
                    : i === currentIdx
                      ? 'current'
                      : 'todo'
                }
              >
                <span className="timeline-dot" />
                <span className="timeline-label">{step}</span>
              </li>
            ))}
            {isTerminalDone && (
              <li className="done terminal">
                <span className="timeline-dot" />
                <span className="timeline-label">{booking.status} 🎉</span>
              </li>
            )}
          </ol>
        </div>
      )}

      <div className="card">
        <h2>Drop-off schedule</h2>
        <div className="booking-meta">
          <div>
            <span className="meta-label">Date</span>
            <span>{prettyDate(booking.delivery_date)}</span>
          </div>
          <div>
            <span className="meta-label">Time slot</span>
            <span>{booking.time_slot}</span>
          </div>
          <div>
            <span className="meta-label">Quantity</span>
            <span>
              {booking.quantity} {qtyLabel(service?.unit)}
            </span>
          </div>
          <div>
            <span className="meta-label">Total</span>
            <span className="price">{formatMoney(booking.total_amount)}</span>
          </div>
        </div>
        <p className="muted">
          Bring your laundry to the LaundryHops shop site during your slot. Payment is recorded
          as cash on claim.
        </p>
      </div>

      <div className="card">
        <h2>Payment</h2>
        <div className="booking-meta">
          <div>
            <span className="meta-label">Amount</span>
            <span className="price">{formatMoney(payment ? payment.amount : booking.total_amount)}</span>
          </div>
          <div>
            <span className="meta-label">Method</span>
            <span>Cash on claim</span>
          </div>
          <div>
            <span className="meta-label">Status</span>
            <StatusBadge status={payment ? payment.status : 'unpaid'} />
          </div>
          <div>
            <span className="meta-label">Paid at</span>
            <span>{payment && payment.paid_at ? prettyDateTime(payment.paid_at) : '—'}</span>
          </div>
        </div>
      </div>

      {booking.notes && (
        <div className="card">
          <h2>Your notes</h2>
          <p className="muted">{booking.notes}</p>
        </div>
      )}

      {isOwner && booking.status === 'pending' && (
        <div className="btn-row">
          <button className="btn btn-danger" onClick={cancel}>
            Cancel this booking
          </button>
        </div>
      )}
    </>
  );
}
