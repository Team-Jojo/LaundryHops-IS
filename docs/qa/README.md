# QA — LaundryHops (Cipreano Mellomida)

**Owner:** Cipreano Mellomida — QA Tester

## Contents

| File | Purpose |
|---|---|
| `test-cases.md` | Manual test cases for API + UI, per module |
| `bug-report-template.md` | Standard bug report format |
| `regression-checklist.md` | Regression checks before each phase sign-off |

## Related QA assets

| Asset | Location |
|---|---|
| Postman collection (API contract + automated tests) | `docs/postman/LaundryHops.postman_collection.json` |
| Postman environment | `docs/postman/LaundryHops.postman_environment.json` |
| Automated API smoke suite | `backend/scripts/smoke-test.js` |

## How to run the automated checks

```bash
# 1. Start the API (backend must be running)
cd backend
npm run dev

# 2. In another terminal, run the smoke suite (30 assertions)
npm run smoke-test
```

For the Postman suite:

1. Import `docs/postman/LaundryHops.postman_collection.json`
2. Import `docs/postman/LaundryHops.postman_environment.json`
3. Select the **LaundryHops Local** environment
4. Run the collection top-to-bottom (Collection Runner) — token capture is automatic

## Seed accounts used by tests

| Role | Email | Password |
|---|---|---|
| Admin | `admin@laundryhops.com` | `admin123` |
| Customer | `juan@example.com` | `juan123` |
