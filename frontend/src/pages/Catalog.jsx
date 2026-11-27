import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, errMsg } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ServiceCard from '../components/ServiceCard';

export default function Catalog() {
  const [services, setServices] = useState(null);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setError('');
    api
      .get('/services')
      .then((res) => setServices(res.data.services))
      .catch((e) => setError(errMsg(e)));
  }, []);

  const book = (id) => navigate(user ? `/services/${id}/book` : '/login');

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Our Services</h1>
          <p>Pick a service, then choose a drop-off date and time slot at the shop site.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {!services && !error && <p className="muted">Loading services…</p>}

      {services && services.length === 0 && (
        <div className="empty-state">No services are published yet. Check back soon!</div>
      )}

      <div className="grid grid-services">
        {(services || []).map((s) => (
          <ServiceCard key={s.id} service={s} onBook={() => book(s.id)} />
        ))}
      </div>
    </>
  );
}
