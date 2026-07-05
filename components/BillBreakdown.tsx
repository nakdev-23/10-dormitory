import type { Bill } from "@/lib/types";
import { formatTHB, formatNumber } from "@/lib/utils";

function Line({
  label,
  sub,
  value,
}: {
  label: string;
  sub?: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="text-subtle">
        {label}
        {sub && <span className="ml-1.5 text-xs text-faint">{sub}</span>}
      </span>
      <span className="tnum font-medium text-ink">{value}</span>
    </div>
  );
}

export function BillBreakdown({ bill }: { bill: Bill }) {
  return (
    <div className="divide-y divide-border">
      <Line label="ค่าเช่าห้อง" value={formatTHB(bill.rent)} />
      <Line
        label="ค่าน้ำ"
        sub={`${formatNumber(bill.waterUnits)} หน่วย × ${bill.waterRate}`}
        value={formatTHB(bill.waterUnits * bill.waterRate)}
      />
      <Line
        label="ค่าไฟฟ้า"
        sub={`${formatNumber(bill.electricUnits)} หน่วย × ${bill.electricRate}`}
        value={formatTHB(bill.electricUnits * bill.electricRate)}
      />
      {bill.otherFees > 0 && (
        <Line label={bill.otherLabel ?? "ค่าใช้จ่ายอื่น"} value={formatTHB(bill.otherFees)} />
      )}
      <div className="flex items-center justify-between pt-3">
        <span className="font-semibold text-ink">ยอดรวมทั้งสิ้น</span>
        <span className="tnum text-xl font-semibold text-primary">
          {formatTHB(bill.total)}
        </span>
      </div>
    </div>
  );
}
