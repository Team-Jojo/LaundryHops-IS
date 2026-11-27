import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../services/api';

const empty = {
  full_name: '',
  email: '',
  phone: '',
  address: '',
  password: '',
  confirm: '',
};

export default function Register() {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      await register({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        password: form.password,
      });
      navigate('/');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <form className="card auth-card" onSubmit={submit}>
        <span className="material-symbols-rounded big-icon">person_add</span>
        <h1>Create your account</h1>
        <p className="muted">Register to start booking laundry services.</p>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="form">
          <div>
            <label htmlFor="full_name">Full name</label>
            <input
              id="full_name"
              required
              value={form.full_name}
              onChange={set('full_name')}
              placeholder="Juan Dela Cruz"
            />
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={set('email')}
              placeholder="you@example.com"
            />
          </div>
          <div className="form-row">
            <div>
              <label htmlFor="phone">Phone (optional)</label>
              <input
                id="phone"
                value={form.phone}
                onChange={set('phone')}
                placeholder="0917 000 0000"
              />
            </div>
            <div>
              <label htmlFor="address">Address (optional)</label>
              <input
                id="address"
                value={form.address}
                onChange={set('address')}
                placeholder="Street, City"
              />
            </div>
          </div>
          <div className="form-row">
            <div>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={form.password}
                onChange={set('password')}
                placeholder="At least 6 characters"
              />
            </div>
            <div>
              <label htmlFor="confirm">Confirm password</label>
              <input
                id="confirm"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={form.confirm}
                onChange={set('confirm')}
                placeholder="Repeat password"
              />
            </div>
          </div>
          <button className="btn btn-primary" disabled={busy}>
            {busy ? 'Creating account…' : 'Register'}
          </button>
        </div>

        <p className="muted auth-alt">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </form>
    </div>
  );
}
