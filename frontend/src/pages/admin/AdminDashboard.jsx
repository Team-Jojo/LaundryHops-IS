import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, errMsg } from '../../services/api';
import { formatMoney, prettyDateTime } from '../../constants';

const STAT_CARDS = [
  { key: 'revenue', label: 'Revenue (paid)', icon: 'payments', color: 'green' },
  { key: 'pendingPayments', label: 'Awaiting payment', icon: 'schedule', color: 'yellow' },
  { key: 'bookings', label: 'Total bookings', icon: 'receipt_long', color: 'blue' },
  { key: 'todayBookings', label: 'Drop-offs today', icon: 'event', color: 'cyan' },
  { key: 'customers', label: 'Customers', icon: 'group', color: 'violet' },
  { key: 'services', label: 'Services', icon: 'local_laundry_service', color: 'magenta' },
];

const STATUS_ORDER = [
  'pending',
  'confirmed',
  'received',
  'washing',
  'ready',
  'delivered',
  'claimed',
  'cancelled',
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/admin/stats')
      .then((res) => setStats(res.data))
      .catch((e) => setError(errMsg(e)));
  }, []);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!stats) return <p className="muted">Loading dashboard…</p>;

  const maxCount = Math.max(1, ...Object.values(stats.byStatus));

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Live overview of LaundryHops operations.</p>
        </div>
        <div className="btn-row">
          <Link to="/admin/bookings" className="btn btn-primary btn-sm">
            Manage bookings
          </Link>
          <Link to="/admin/services" className="btn btn-secondary btn-sm">
            Manage services
          </Link>
          <Link to="/admin/payments" className="btn btn-secondary btn-sm">
            Payments
          </Link>
        </div>
      </div>

      <div className="grid grid-stats">
        {STAT_CARDS.map((c) => (
          <div key={c.key} className="card stat-card">
            <span className={`material-symbols-rounded stat-icon stat-${c.color}`}>{c.icon}</span>
            <div>
              <div className={`stat-value stat-text-${c.color}`}>
                {c.key === 'revenue' || c.key === 'pendingPayments'
                  ? formatMoney(stats.totals[c.key])
                  : stats.totals[c.key]}
              </div>
              <div className="stat-label">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2>Bookings by status</h2>
        <div className="bar-chart">
          {STATUS_ORDER.map((s) => (
            <div key={s} className="bar-row">
              <span className="bar-label">{s}</span>
              <div className="bar-track">
                <div className={`bar-fill bar-${s}`} style={{ width: `${(stats.byStatus[s] / maxCount) * 100}%` }} />
              </div>
              <span className="bar-count">{stats.byStatus[s]}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="muted">Snapshot as of {prettyDateTime(new Date().toISOString())}</p>
    </>
  );
}
