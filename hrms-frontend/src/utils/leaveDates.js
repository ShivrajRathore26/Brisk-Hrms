// Holiday dates come from the backend as UTC midnight timestamps; dates picked in the calendar
// are local. Comparing them via each Date's own "intended" calendar day (UTC getters for
// holidays, local getters for picker dates) avoids off-by-one shifts across timezones.
export function dateKey(date, utc = false) {
  const y = utc ? date.getUTCFullYear() : date.getFullYear();
  const m = (utc ? date.getUTCMonth() : date.getMonth()) + 1;
  const d = utc ? date.getUTCDate() : date.getDate();
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function buildHolidaySet(holidays) {
  return new Set(holidays.map((h) => dateKey(new Date(h.date), true)));
}

export function makeLeaveDateFilter(holidaySet) {
  return (date) => !isWeekend(date) && !holidaySet.has(dateKey(date));
}
