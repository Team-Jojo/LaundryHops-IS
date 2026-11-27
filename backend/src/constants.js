// Shared business rules for LaundryHops.
// This file is the single source of truth for slots, statuses and transitions.

const TIME_SLOTS = ['09:00-11:00', '13:00-15:00', '16:00-18:00'];

// Max accepted bookings per date + slot (validated server-side, stretch goal).
const SLOT_CAPACITY = 5;

const BOOKING_STATUSES = [
  'pending',
  'confirmed',
  'received',
  'washing',
  'ready',
  'delivered',
  'claimed',
  'cancelled',
];

// Allowed admin status transitions (step-by-step flow).
const STATUS_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['received', 'cancelled'],
  received: ['washing'],
  washing: ['ready'],
  ready: ['delivered', 'claimed'],
  delivered: [],
  claimed: [],
  cancelled: [],
};

// Payment may only be recorded once the laundry is ready / delivered / claimed.
const PAYABLE_STATUSES = ['ready', 'delivered', 'claimed'];

module.exports = {
  TIME_SLOTS,
  SLOT_CAPACITY,
  BOOKING_STATUSES,
  STATUS_TRANSITIONS,
  PAYABLE_STATUSES,
};
