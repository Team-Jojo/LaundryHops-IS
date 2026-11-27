'use strict';

/** Create an Error carrying an HTTP status code. */
exports.createError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

/** Today's date as 'YYYY-MM-DD' (local time). */
exports.todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
};

/** Strict 'YYYY-MM-DD' string check. */
exports.isDateStr = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);

/** Real, existing calendar date (e.g. rejects 2026-02-31). */
exports.isValidDate = (v) =>
  exports.isDateStr(v) && !Number.isNaN(new Date(`${v}T00:00:00`).getTime());
