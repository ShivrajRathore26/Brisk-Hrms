import { useEffect, useState } from "react";
import { getMyBalanceApi } from "../../api/leave.api";
import Card from "../common/Card";
import StatTile from "../common/StatTile";

export default function LeaveBalanceWidget() {
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    getMyBalanceApi().then((data) => setBalance(data.balance));
  }, []);

  return (
    <Card title="Leave Balance">
      <div className="grid grid-cols-3 gap-3">
        <StatTile value={balance ? balance.available : "—"} label="Available" />
        <StatTile value={balance ? balance.accrued : "—"} label="Accrued" />
        <StatTile value={balance ? balance.used : "—"} label="Used" />
      </div>
    </Card>
  );
}
