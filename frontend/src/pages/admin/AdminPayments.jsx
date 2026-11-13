import { useCallback, useEffect, useState } from 'react';
import { api, errMsg } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { toast } from '../../components/Toast';
import { formatMoney, prettyDateTime } from '../../constants';

export default function AdminPayments() {
  const [payments, setPayments] = useState(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const load = useCallback(() => {
    const params = {};
    if (status) params.status = status;
    api
      .get('/payments', { params })
      .then((res) => setPayments(res.data.payments))
      .catch((e) => setError(errMsg(e)));
  }, [status]);

  useEffect(load, [load]);

  const markPaid = async (payment) => {
    try {
      await api.patch(`/payments/${payment.id}`);
      toast(`Payment #${payment.id} recorded as paid (₱${payment.amount}).`, 'success');
      load();
    } catch (e) {
      toast(errMsg(e), 'error');
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Payments</h1>
          <p>Record cash payments when customers claim their laundry.</p>
        </div>
      </div>

      <div className="card filter-bar">
        <div>
          <label htmlFor="pay-status">Filter: payment status</label>
          <select id="pay-status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            <option value="unpaid">unpaid</option>
            <option value="paid">paid</option>
          </select>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {!payments && !error && <p className="muted">Loading payments…</p>}
      {payments && payments.length === 0 && (
        <div className="empty-state">No payment records{status ? ` with status "${status}"` : ''}.</div>
      )}

      {payments && payments.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Booking</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Paid at</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => {
                const booking = p.booking;
                return (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>
                      {booking ? `#${booking.id}` : '—'}
                      <div className="muted small">
                        {booking && booking.service ? booking.service.name : ''}
                      </div>
                    </td>
                    <td>{booking && booking.customer ? booking.customer.full_name : '—'}</td>
                    <td className="price">{formatMoney(p.amount)}</td>
                    <td>Cash</td>
                    <td>
                      <StatusBadge status={p.status} />
                    </td>
                    <td>{p.paid_at ? prettyDateTime(p.paid_at) : '—'}</td>
                    <td>
                      {p.status === 'unpaid' ? (
                        <button className="btn btn-success btn-sm" onClick={() => markPaid(p)}>
                          Mark as paid
                        </button>
                      ) : (
                        <span className="muted small">settled</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="muted small">
        Payments can only be recorded once the booking is ready, delivered or claimed.
      </p>
    </>
  );
}
