// Every date/time display in the app goes through here, locked to Indian locale/timezone/12-hour
// clock — so it's consistent regardless of what locale or timezone the viewer's browser is set to.

const LOCALE = "en-IN";
const TIME_ZONE = "Asia/Kolkata";

export function formatDate(date, opts = { day: "numeric", month: "short", year: "numeric" }) {
  return new Date(date).toLocaleDateString(LOCALE, { timeZone: TIME_ZONE, ...opts });
}

export function formatTime(date) {
  return new Date(date).toLocaleTimeString(LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: TIME_ZONE,
  });
}

export function formatDateTime(date) {
  return new Date(date).toLocaleString(LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: TIME_ZONE,
  });
}

// For building "January", "February", ... option lists — pass a 0-based month index.
export function formatMonthName(monthIndex) {
  return new Date(2000, monthIndex, 1).toLocaleString(LOCALE, { month: "long", timeZone: TIME_ZONE });
}

// Not used anywhere yet (no payroll/currency values in the app currently) — ready for whenever
// a monetary figure needs to be displayed.
export function formatCurrency(amount) {
  return new Intl.NumberFormat(LOCALE, { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    amount
  );
}
