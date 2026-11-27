import { useCallback, useEffect, useState } from 'react';
import { api, errMsg } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { toast } from '../../components/Toast';
import { STATUS_TRANSITIONS, nextStatus, canCancel } from '../../constants';
import { formatMoney, prettyDate, qtyLabel } from '../../constants';

const STATUSES = ['pending', 'confirmed', 'received', 'washing', 'ready', 'delivered', 'claimed', 'cancelled'];

export default function AdminBookings() {
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');

  const load = useCallback(() => {
    const params = {};
    if (status) params.status = status;
    if (date) params.date = date;
    api
      .get('/admin/bookings', { params })
      .then((res) => setBookings(res.data.bookings))
      .catch((e) => setError(errMsg(e)));
  }, [status, date]);

  useEffect(load, [load]);

  const advance = async (booking) => {
    const next = nextStatus(booking.status);
    if (!next) return;
    try {
      await api.patch(`/bookings/${booking.id}/status`, { status: next });
      toast(`Booking #${booking.id} marked as ${next}.`, 'success');
      load();
    } catch (e) {
      toast(errMsg(e), 'error');
    }
  };

  const cancel = async (booking) => {
    if (!window.confirm(`Cancel booking #${booking.id}?`)) return;
    try {
      await api.patch(`/bookings/${booking.id}/status`, { status: 'cancelled' });
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
          <h1>All Bookings</h1>
          <p>Confirm bookings and advance them through the washing flow.</p>
        </div>
      </div>

      <div className="card filter-bar">
        <div className="form-row">
          <div>
            <label htmlFor="status">Filter: status</label>
            <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="date">Filter: delivery date</label>
            <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          {(status || date) && (
            <button
              className="btn btn-secondary btn-sm clear-btn"
              onClick={() => {
                setStatus('');
                setDate('');
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {!bookings && !error && <p className="muted">Loading bookings…</p>}
      {bookings && bookings.length === 0 && (
        <div className="empty-state">No bookings match these filters.</div>
      )}

      {bookings && bookings.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Customer</th>
                <th>Service</th>
                <th>Drop-off</th>
                <th>Status</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => {
                const next = nextStatus(b.status);
                return (
                  <tr key={b.id}>
                    <td>{b.id}</td>
                    <td>
                      {b.customer ? b.customer.full_name : '—'}
                      <div className="muted small">{b.customer ? b.customer.email : ''}</div>
                    </td>
                    <td>
                      {b.service ? b.service.name : '—'}
                      <div className="muted small">
                        {b.quantity} {qtyLabel(b.service?.unit)}
                      </div>
                    </td>
                    <td>
                      {prettyDate(b.delivery_date)}
                      <div className="muted small">{b.time_slot}</div>
                    </td>
                    <td>
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="price">{formatMoney(b.total_amount)}</td>
                    <td>
                      <StatusBadge status={b.payment ? b.payment.status : 'unpaid'} />
                    </td>
                    <td>
                      <div className="btn-row nowrap">
                        {next && (
                          <button className="btn btn-primary btn-sm" onClick={() => advance(b)}>
                            → {next}
                          </button>
                        )}
                        {canCancel(b.status) && (
                          <button className="btn btn-danger btn-sm" onClick={() => cancel(b)}>
                            Cancel
                          </button>
                        )}
                        {!next && !canCancel(b.status) && <span className="muted small">—</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="muted small">
        Status flow: pending → confirmed → received → washing → ready → delivered/claimed. Transitions
        are validated server-side ({Object.keys(STATUS_TRANSITIONS).length} states).
      </p>
    </>
  );
}
