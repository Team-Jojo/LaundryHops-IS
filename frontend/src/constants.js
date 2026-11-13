// Shared frontend constants — mirrors backend/src/constants.js (backend is the
// source of truth; these copies power UI badges, timelines and action buttons).

export const STATUS_STEPS = ['pending', 'confirmed', 'received', 'washing', 'ready'];

export const STATUS_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['received', 'cancelled'],
  received: ['washing'],
  washing: ['ready'],
  ready: ['delivered', 'claimed'],
  delivered: [],
  claimed: [],
  cancelled: [],
};

export const nextStatus = (status) =>
  (STATUS_TRANSITIONS[status] || []).find((s) => s !== 'cancelled') || null;

export const canCancel = (status) =>
  (STATUS_TRANSITIONS[status] || []).includes('cancelled');

export const unitLabel = (unit) =>
  ({ per_kg: 'per kg', per_item: 'per item', fixed: 'fixed price' }[unit] || unit);

export const qtyLabel = (unit) =>
  ({ per_kg: 'kg', per_item: 'item(s)' }[unit] || '');

export const formatMoney = (v) =>
  `₱${Number(v || 0).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
};

export const prettyDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-PH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const prettyDateTime = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const serviceIcon = (unit) =>
  ({ per_kg: 'scale', per_item: 'checkroom', fixed: 'local_laundry_service' }[unit] ||
    'local_laundry_service');
