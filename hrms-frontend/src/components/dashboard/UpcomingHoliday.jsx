import { useEffect, useState } from "react";
import { getUpcomingHolidaysApi } from "../../api/holiday.api";
import { formatDate } from "../../utils/formatters";
import Card from "../common/Card";

export default function UpcomingHoliday() {
  const [holidays, setHolidays] = useState([]);

  useEffect(() => {
    getUpcomingHolidaysApi().then((data) => setHolidays(data.holidays));
  }, []);

  return (
    <Card title="Upcoming Holidays">
      {holidays.length === 0 ? (
        <p className="text-sm text-slate-400">No upcoming holidays</p>
      ) : (
        <ul className="space-y-2">
          {holidays.map((h) => (
            <li key={h._id} className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{h.name}</span>
              <span className="text-slate-400">
                {formatDate(h.date, { month: "short", day: "numeric" })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
