import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "@/lib/utils";
export function StatusBadge({ status }) {
  const closed = status === "Closed";
  return _jsx("span", {
    className: cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
      closed ? "bg-success/15 text-success" : "bg-warning/20 text-warning-foreground",
    ),
    children: status,
  });
}
