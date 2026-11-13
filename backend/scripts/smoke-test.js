/**
 * LaundryHops API smoke test — exercises the full happy path + key negative cases.
 *
 * Usage:
 *   1. Start the API:      npm run dev          (in backend/)
 *   2. Run this script:    npm run smoke-test
 *
 * Requires seeded demo accounts: admin@laundryhops.com/admin123, juan@example.com/juan123
 */

const BASE = process.argv[2] || process.env.API_URL || 'http://localhost:5000';
const API = `${BASE}/api`;

let passed = 0;
let failed = 0;

function ok(name, cond, extra = '') {
  if (cond) {
    passed += 1;
    console.log(`  PASS  ${name}`);
  } else {
    failed += 1;
    console.log(`  FAIL  ${name} ${extra}`);
  }
}

async function req(method, path, { body, token } = {}) {
  const res = await fetch(API + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    /* non-JSON response */
  }
  return { status: res.status, json };
}

(async () => {
  console.log(`\nLaundryHops API smoke test — ${BASE}\n`);
  const stamp = Date.now();

  // ---- Health ----
  let r = await req('GET', '/health');
  ok('health check', r.status === 200 && r.json.status === 'ok');

  // ---- Auth ----
  r = await req('POST', '/auth/register', {
    body: {
      full_name: `Smoke Tester ${stamp}`,
      email: `smoke${stamp}@example.com`,
      password: 'test123',
      phone: '0917 000 1234',
      address: 'Smoke Test St.',
    },
  });
  ok('register customer (201)', r.status === 201 && !!r.json.token, JSON.stringify(r.json));
  const customerToken = r.json.token;

  r = await req('POST', '/auth/login', {
    body: { email: 'juan@example.com', password: 'juan123' },
  });
  ok('login seeded customer', r.status === 200 && !!r.json.token, JSON.stringify(r.json));
  const juanToken = r.json.token;

  r = await req('POST', '/auth/login', {
    body: { email: 'juan@example.com', password: 'wrong-password' },
  });
  ok('login rejects wrong password (401)', r.status === 401);

  r = await req('GET', '/auth/me', { token: customerToken });
  ok('GET /auth/me', r.status === 200 && r.json.user.role === 'customer');

  r = await req('POST', '/auth/login', {
    body: { email: 'admin@laundryhops.com', password: 'admin123' },
  });
  ok('login seeded admin', r.status === 200 && r.json.user.role === 'admin');
  const adminToken = r.json.token;

  // ---- Services ----
  r = await req('GET', '/services');
  ok('list services', r.status === 200 && r.json.services.length >= 5, JSON.stringify(r.json));
  const svc = r.json.services[0];

  r = await req('GET', `/services/${svc.id}`);
  ok('service detail', r.status === 200 && r.json.service.id === svc.id);

  r = await req('POST', '/services', {
    token: customerToken,
    body: { name: 'Should Fail', price: 10 },
  });
  ok('create service blocked for customer (403)', r.status === 403);

  // ---- Bookings ----
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  r = await req('GET', `/bookings/slots?date=${tomorrow}`, { token: customerToken });
  ok('available slots (3 slots)', r.status === 200 && r.json.slots.length === 3);

  r = await req('POST', '/bookings', {
    token: customerToken,
    body: {
      service_id: svc.id,
      quantity: 3,
      delivery_date: tomorrow,
      time_slot: '13:00-15:00',
      notes: 'smoke test booking',
    },
  });
  ok('create booking (201)', r.status === 201 && r.json.booking.status === 'pending', JSON.stringify(r.json));
  const bookingId = r.json.booking && r.json.booking.id;

  r = await req('GET', '/bookings', { token: customerToken });
  ok('my bookings contains new booking', r.status === 200 && r.json.bookings.some((b) => b.id === bookingId));

  r = await req('GET', `/bookings/${bookingId}`, { token: customerToken });
  ok('booking detail w/ unpaid payment', r.status === 200 && r.json.booking.payment.status === 'unpaid');
  const paymentId = r.json.booking && r.json.booking.payment && r.json.booking.payment.id;

  r = await req('GET', `/bookings/${bookingId}`, { token: adminToken });
  ok('admin can view any booking', r.status === 200);

  r = await req('PATCH', `/bookings/${bookingId}/status`, {
    token: adminToken,
    body: { status: 'washing' },
  });
  ok('invalid status transition rejected (400)', r.status === 400);

  // ---- Cancel flow (second booking by juan) ----
  r = await req('POST', '/bookings', {
    token: juanToken,
    body: { service_id: svc.id, quantity: 2, delivery_date: tomorrow, time_slot: '16:00-18:00' },
  });
  const cancelId = r.json.booking && r.json.booking.id;
  ok('create booking #2', r.status === 201);

  r = await req('PATCH', `/bookings/${cancelId}/cancel`, { token: juanToken });
  ok('cancel own pending booking', r.status === 200 && r.json.booking.status === 'cancelled');

  r = await req('PATCH', `/bookings/${cancelId}/cancel`, { token: juanToken });
  ok('cancelling twice rejected (409)', r.status === 409);

  // ---- Admin status flow ----
  for (const status of ['confirmed', 'received', 'washing', 'ready', 'delivered']) {
    r = await req('PATCH', `/bookings/${bookingId}/status`, {
      token: adminToken,
      body: { status },
    });
    ok(`advance status → ${status}`, r.status === 200 && r.json.booking.status === status, JSON.stringify(r.json));
  }

  // ---- Payments ----
  r = await req('PATCH', `/payments/${paymentId}`, { token: adminToken });
  ok('mark payment paid', r.status === 200 && r.json.payment.status === 'paid', JSON.stringify(r.json));

  r = await req('PATCH', `/payments/${paymentId}`, { token: adminToken });
  ok('mark paid twice rejected (409)', r.status === 409);

  r = await req('GET', '/payments', { token: adminToken });
  ok('payments list (admin)', r.status === 200);

  r = await req('GET', '/payments', { token: customerToken });
  ok('payments blocked for customer (403)', r.status === 403);

  // ---- Admin stats & users ----
  r = await req('GET', '/admin/stats', { token: adminToken });
  ok('dashboard stats w/ revenue > 0', r.status === 200 && r.json.totals.revenue > 0, JSON.stringify(r.json));

  r = await req('GET', '/users', { token: adminToken });
  ok('customer list (admin)', r.status === 200 && r.json.users.length >= 2);

  r = await req('GET', '/users', { token: customerToken });
  ok('customer list blocked for customer (403)', r.status === 403);

  console.log(`\nResult: ${passed} passed, ${failed} failed\n`);
  process.exit(failed ? 1 : 0);
})().catch((e) => {
  console.error('Smoke test crashed:', e);
  process.exit(1);
});
