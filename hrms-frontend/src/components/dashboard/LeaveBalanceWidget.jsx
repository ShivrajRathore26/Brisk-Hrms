import { useEffect, useState } from "react";
import { getMyBalanceApi } from "../../api/leave.api";
import Card from "../common/Card";

const labels = { sick: "Sick", casual: "Casual", earned: "Earned" };

export default function LeaveBalanceWidget() {
  const [balances, setBalances] = useState([]);

  useEffect(() => {
    getMyBalanceApi().then((data) => setBalances(data.balances));
  }, []);

  return (
    <Card title="Leave Balance">
      <div className="grid grid-cols-3 gap-3 text-center">
        {["sick", "casual", "earned"].map((type) => {
          const b = balances.find((x) => x.leaveType === type);
          const remaining = b ? b.total - b.used : "—";
          return (
            <div key={type} className="rounded-lg bg-slate-50 py-3">
              <p className="text-lg font-semibold text-slate-800">{remaining}</p>
              <p className="text-xs text-slate-400">{labels[type]}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
