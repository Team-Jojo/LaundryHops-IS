import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { formatMoney, prettyDate, qtyLabel } from '../constants';

export default function BookingCard({ booking, onCancel }) {
  const service = booking.service || {};

  return (
    <div className="card booking-card">
      <div className="booking-head">
        <div>
          <h3>{service.name || 'Service'}</h3>
          <p className="muted">
            Booking #{booking.id} · {prettyDate(booking.delivery_date)}
          </p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="booking-meta">
        <div>
          <span className="meta-label">Drop-off slot</span>
          <span>{booking.time_slot}</span>
        </div>
        <div>
          <span className="meta-label">Quantity</span>
          <span>
            {booking.quantity} {qtyLabel(service.unit)}
          </span>
        </div>
        <div>
          <span className="meta-label">Total</span>
          <span className="price">{formatMoney(booking.total_amount)}</span>
        </div>
        <div>
          <span className="meta-label">Payment</span>
          <StatusBadge status={booking.payment ? booking.payment.status : 'unpaid'} />
        </div>
      </div>

      <div className="btn-row">
        <Link className="btn btn-secondary btn-sm" to={`/bookings/${booking.id}`}>
          Track
        </Link>
        {booking.status === 'pending' && onCancel && (
          <button className="btn btn-danger btn-sm" onClick={() => onCancel(booking)}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
