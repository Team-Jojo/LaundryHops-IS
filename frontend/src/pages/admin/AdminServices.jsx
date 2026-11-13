import { useCallback, useEffect, useState } from 'react';
import { api, errMsg } from '../../services/api';
import { toast } from '../../components/Toast';
import { formatMoney, unitLabel } from '../../constants';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  unit: 'per_kg',
  is_available: true,
};

export default function AdminServices() {
  const [services, setServices] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api
      .get('/services')
      .then((res) => setServices(res.data.services))
      .catch((e) => setError(errMsg(e)));
  }, []);

  useEffect(load, [load]);

  const set = (key) => (e) =>
    setForm({
      ...form,
      [key]: key === 'is_available' ? e.target.checked : e.target.value,
    });

  const startCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const startEdit = (service) => {
    setEditingId(service.id);
    setForm({
      name: service.name,
      description: service.description || '',
      price: service.price,
      unit: service.unit,
      is_available: service.is_available,
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        unit: form.unit,
        is_available: form.is_available,
      };
      if (editingId) {
        await api.put(`/services/${editingId}`, payload);
        toast(`Service "${form.name}" updated.`, 'success');
      } else {
        await api.post('/services', payload);
        toast(`Service "${form.name}" created.`, 'success');
      }
      setEditingId(null);
      setForm(emptyForm);
      load();
    } catch (err) {
      toast(errMsg(err), 'error');
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (service) => {
    try {
      await api.put(`/services/${service.id}`, { is_available: !service.is_available });
      toast(`"${service.name}" is now ${!service.is_available ? 'available' : 'unavailable'}.`, 'success');
      load();
    } catch (e) {
      toast(errMsg(e), 'error');
    }
  };

  const remove = async (service) => {
    if (!window.confirm(`Delete service "${service.name}"?`)) return;
    try {
      await api.delete(`/services/${service.id}`);
      toast(`Service "${service.name}" deleted.`, 'success');
      load();
    } catch (e) {
      toast(errMsg(e), 'error');
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Manage Services</h1>
          <p>Control the catalog and pricing customers see.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form className="card" onSubmit={submit}>
        <h2>{editingId ? `Edit service #${editingId}` : 'Add a new service'}</h2>
        <div className="form">
          <div className="form-row">
            <div>
              <label htmlFor="name">Name</label>
              <input id="name" required value={form.name} onChange={set('name')} placeholder="Wash & Fold" />
            </div>
            <div>
              <label htmlFor="price">Price (₱)</label>
              <input
                id="price"
                type="number"
                required
                min={0}
                step={0.01}
                value={form.price}
                onChange={set('price')}
                placeholder="60.00"
              />
            </div>
            <div>
              <label htmlFor="unit">Unit</label>
              <select id="unit" value={form.unit} onChange={set('unit')}>
                <option value="per_kg">per kg</option>
                <option value="per_item">per item</option>
                <option value="fixed">fixed price</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={form.description}
              onChange={set('description')}
              placeholder="What does this service include?"
            />
          </div>
          <label className="checkbox-row">
            <input type="checkbox" checked={form.is_available} onChange={set('is_available')} />
            Available for booking
          </label>
          <div className="btn-row">
            <button className="btn btn-primary" disabled={busy}>
              {busy ? 'Saving…' : editingId ? 'Save changes' : 'Create service'}
            </button>
            {editingId && (
              <button type="button" className="btn btn-secondary" onClick={startCreate}>
                Cancel edit
              </button>
            )}
          </div>
        </div>
      </form>

      {!services && !error && <p className="muted">Loading services…</p>}

      {services && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Unit</th>
                <th>Available</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id}>
                  <td>
                    {s.name}
                    <div className="muted small">{s.description}</div>
                  </td>
                  <td className="price">{formatMoney(s.price)}</td>
                  <td>{unitLabel(s.unit)}</td>
                  <td>
                    {s.is_available ? (
                      <span className="badge badge-green">yes</span>
                    ) : (
                      <span className="badge badge-yellow">no</span>
                    )}
                  </td>
                  <td>
                    <div className="btn-row nowrap">
                      <button className="btn btn-secondary btn-sm" onClick={() => startEdit(s)}>
                        Edit
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => toggle(s)}>
                        {s.is_available ? 'Disable' : 'Enable'}
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => remove(s)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
