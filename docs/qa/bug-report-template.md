# Bug Report Template — LaundryHops

**Reporter:** _name (role)_ · **Date:** _YYYY-MM-DD_ · **Bug ID:** _BUG-###_

---

## Summary

_One-line description of the problem._

## Severity / Priority

| Field | Value |
|---|---|
| Severity | ☐ Critical (system unusable) ☐ Major (feature broken) ☐ Minor (annoyance) ☐ Cosmetic |
| Priority | ☐ High ☐ Medium ☐ Low |

## Environment

| Field | Value |
|---|---|
| App version / commit | _e.g. `main @ a1b2c3d`_ |
| Component | ☐ Backend API ☐ Frontend UI ☐ Database ☐ Postman collection |
| Browser / client | _e.g. Chrome 131, Postman 11.19_ |
| OS | _e.g. Windows 11_ |
| Endpoint (if API) | _e.g. `POST /api/bookings`_ |

## Steps to Reproduce

1. _Step one_
2. _Step two_
3. _Step three_

## Expected Result

_What should happen._

## Actual Result

_What actually happens (paste error message, status code, or screenshot)._

## Evidence

- Screenshot / screen recording: _link or attachment_
- Response body (API): _paste JSON_
- Console / server log: _paste relevant lines_

## Additional Notes

_Links to related test case (`TC-…`), suspected cause, workarounds._

## Fix Verification

| Field | Value |
|---|---|
| Fixed in commit | _hash / branch_ |
| Verified by | _QA name + date_ |
| Regression test added | ☐ Yes — `TC-…` ☐ No |

---

### Example (filled in)

| Field | Value |
|---|---|
| Bug ID | BUG-001 |
| Summary | Booking accepts a past delivery date |
| Severity | Major |
| Steps | 1. Login as customer. 2. POST `/api/bookings` with `delivery_date` = yesterday. |
| Expected | `400` "Delivery date cannot be in the past." |
| Actual | `201` — booking created for a past date |
| Evidence | Response body attached; endpoint `POST /api/bookings` |
| Priority | High |
