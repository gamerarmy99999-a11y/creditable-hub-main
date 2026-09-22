export function formatINR(value) {
  const n = Number(value ?? 0);
  return `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(n)}`;
}
export function formatDate(value) {
  if (!value) return "—";
  const d =
    typeof value === "string" ? new Date(value.length <= 10 ? `${value}T00:00:00` : value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
}
export function formatTime(value) {
  if (!value) return "—";
  const [h, m] = value.split(":");
  const hour = Number(h);
  const suffix = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${m} ${suffix}`;
}
export function maskAadhar(value) {
  if (!value) return "—";
  const last = value.slice(-4);
  return `XXXX XXXX ${last}`;
}
export function maskPan(value) {
  if (!value) return "—";
  return `XXXXX${value.slice(-5)}`;
}
export function maskPhone(value) {
  if (!value) return "—";
  return value;
}
export function todayISO() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
export function nowTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}
