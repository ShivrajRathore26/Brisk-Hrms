// Monthly leave accrual: an employee is credited `accrualPerMonth` leave(s) for their
// joining month and every calendar month since, with no cap — unused credits roll forward.
function monthsElapsed(joiningDate, asOf = new Date()) {
  const join = new Date(joiningDate);
  const months = (asOf.getFullYear() - join.getFullYear()) * 12 + (asOf.getMonth() - join.getMonth()) + 1;
  return Math.max(0, months);
}

function computeAccrued(joiningDate, accrualPerMonth, asOf = new Date()) {
  return monthsElapsed(joiningDate, asOf) * accrualPerMonth;
}

module.exports = { computeAccrued };
