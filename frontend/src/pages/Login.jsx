import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../services/api';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'admin' ? '/admin' : '/my-bookings');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <form className="card auth-card" onSubmit={submit}>
        <span className="material-symbols-rounded big-icon">lock_open</span>
        <h1>Welcome back</h1>
        <p className="muted">Log in to book and track your laundry.</p>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="form">
          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••"
            />
          </div>
          <button className="btn btn-primary" disabled={busy}>
            {busy ? 'Logging in…' : 'Login'}
          </button>
        </div>

        <p className="muted auth-alt">
          No account yet? <Link to="/register">Register here</Link>
        </p>

        <div className="login-hint">
          <strong>Demo accounts</strong>
          <span>admin@laundryhops.com · admin123</span>
          <span>juan@example.com · juan123</span>
        </div>
      </form>
    </div>
  );
}
