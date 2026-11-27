import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, errMsg } from '../services/api';
import { formatMoney, unitLabel, qtyLabel, todayStr, prettyDate } from '../constants';

export default function Booking() {
  const { id } = useParams();

  const [service, setService] = useState(null);
  const [date, setDate] = useState(todayStr());
  const [slots, setSlots] = useState(null);
  const [slot, setSlot] = useState('');
  const [quantity, setQuantity] = useState(3);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [slotError, setSlotError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);

  useEffect(() => {
    setError('');
    api
      .get(`/services/${id}`)
      .then((res) => {
        setService(res.data.service);
        setQuantity(res.data.service.unit === 'per_kg' ? 3 : 1);
      })
      .catch((e) => setError(errMsg(e)));
  }, [id]);

  useEffect(() => {
    if (!date) return;
    setSlotError('');
    setSlots(null);
    setSlot('');
    api
      .get('/bookings/slots', { params: { date } })
      .then((res) => setSlots(res.data.slots))
      .catch((e) => setSlotError(errMsg(e)));
  }, [date]);

  const total = useMemo(
    () => (service ? (Number(service.price) * Number(quantity || 0)).toFixed(2) : '0.00'),
    [service, quantity]
  );

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!slot) {
      setError('Please choose a time slot.');
      return;
    }
    setBusy(true);
    try {
      const res = await api.post('/bookings', {
        service_id: service.id,
        quantity: Number(quantity),
        delivery_date: date,
        time_slot: slot,
        notes,
      });
      setDone(res.data.booking);
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="card confirm-card">
        <span className="material-symbols-rounded big-icon">event_available</span>
        <h1>Booking placed!</h1>
        <p className="muted">
          Please deliver your laundry to the LaundryHops shop site on your scheduled slot:
        </p>
        <div className="confirm-box">
          <h2>{prettyDate(done.delivery_date)}</h2>
          <div className="price price-big">{done.time_slot}</div>
          <p className="muted">
            {done.service?.name} · {done.quantity} {qtyLabel(done.service?.unit)} ·{' '}
            {formatMoney(done.total_amount)}
          </p>
        </div>
        <p className="muted">
          Your booking is <strong>pending</strong> — the shop will confirm it soon. Payment is
          recorded as cash when you claim your laundry.
        </p>
        <div className="btn-row center">
          <Link className="btn btn-primary" to={`/bookings/${done.id}`}>
            Track this booking
          </Link>
          <Link className="btn btn-secondary" to="/my-bookings">
            My bookings
          </Link>
        </div>
      </div>
    );
  }

  if (!service && !error) return <p className="muted">Loading service…</p>;

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Book: {service?.name}</h1>
          <p>
            {formatMoney(service?.price)} {unitLabel(service?.unit)}
          </p>
        </div>
        <Link to="/" className="btn btn-secondary btn-sm">
          ← Back to services
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {slotError && <div className="alert alert-error">{slotError}</div>}

      <form className="card" onSubmit={submit}>
        <div className="form">
          <div className="form-row">
            <div>
              <label htmlFor="quantity">
                Quantity ({unitLabel(service.unit).replace('per ', '')})
              </label>
              <input
                id="quantity"
                type="number"
                required
                min={service.unit === 'per_kg' ? 0.5 : 1}
                step={service.unit === 'per_kg' ? 0.5 : 1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="date">Delivery date</label>
              <input
                id="date"
                type="date"
                required
                min={todayStr()}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label>Time slot</label>
            {!slots && <p className="muted">Checking availability…</p>}
            {slots && slots.length === 0 && <p className="muted">No slots for this date.</p>}
            <div className="slot-grid">
              {(slots || []).map((s) => (
                <label
                  key={s.slot}
                  className={`slot-option${slot === s.slot ? ' selected' : ''}${
                    s.available ? '' : ' full'
                  }`}
                >
                  <span className="slot-radio">
                    <input
                      type="radio"
                      name="slot"
                      value={s.slot}
                      disabled={!s.available}
                      checked={slot === s.slot}
                      onChange={() => setSlot(s.slot)}
                    />
                    <span className="slot-time">{s.slot}</span>
                  </span>
                  <span className={`slot-cap${s.available ? '' : ' full'}`}>
                    {s.available ? `${s.booked}/${s.capacity} booked` : 'Full'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="notes">Notes for the shop (optional)</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. separate whites from colors, fabric softener please"
            />
          </div>

          <div className="total-row">
            <span>Total</span>
            <span className="price price-big">{formatMoney(total)}</span>
          </div>

          <button className="btn btn-primary" disabled={busy || !slot}>
            {busy ? 'Placing booking…' : 'Place booking'}
          </button>
        </div>
      </form>
    </>
  );
}
