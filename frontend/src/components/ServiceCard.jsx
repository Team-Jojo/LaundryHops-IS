import { formatMoney, unitLabel, serviceIcon } from '../constants';

export default function ServiceCard({ service, onBook }) {
  return (
    <div className={`card service-card${service.is_available ? '' : ' unavailable'}`}>
      <div className="service-head">
        <span className="material-symbols-rounded service-icon">
          {serviceIcon(service.unit)}
        </span>
        <h3>{service.name}</h3>
      </div>
      <p className="muted service-desc">{service.description}</p>
      <div className="service-price">
        <span className="price price-big">{formatMoney(service.price)}</span>
        <span className="muted">{unitLabel(service.unit)}</span>
      </div>
      <button
        className="btn btn-primary"
        disabled={!service.is_available}
        onClick={onBook}
      >
        {service.is_available ? 'Book now' : 'Unavailable'}
      </button>
    </div>
  );
}
