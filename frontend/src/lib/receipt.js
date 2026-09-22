import { jsPDF } from "jspdf";
import { formatDate, formatTime } from "./format";
const rupees = (n) =>
  `Rs. ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(n)}`;
export function downloadReceipt(data) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const left = 56;
  let y = 64;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Aradhna Small Finance", left, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  y += 16;
  doc.text("D-365, C Block, Sector 10, Noida, Uttar Pradesh 201301", left, y);
  y += 28;
  doc.setDrawColor(200);
  doc.line(left, y, 540, y);
  y += 28;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Payment Receipt", left, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Receipt No: ${data.receiptNo}`, 400, y);
  const rows = [
    ["Customer Name", data.customerName],
    ["Phone", data.phone],
    ["Amount Paid", rupees(data.amount)],
    ["Payment Date", formatDate(data.paidDate)],
    ["Payment Time", formatTime(data.paidTime)],
    ["Payment Method", data.method],
    ["Note", data.note?.trim() ? data.note : "-"],
    ["Total Repayable", rupees(data.repayable)],
    ["Remaining Balance", rupees(data.remaining)],
  ];
  y += 26;
  doc.setFontSize(11);
  for (const [label, value] of rows) {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, left, y);
    doc.setFont("helvetica", "normal");
    doc.text(String(value), left + 150, y);
    y += 22;
  }
  y += 18;
  doc.setDrawColor(200);
  doc.line(left, y, 540, y);
  y += 22;
  doc.setFontSize(9);
  doc.text("This is a computer generated receipt and does not require a signature.", left, y);
  doc.save(`receipt-${data.receiptNo}.pdf`);
}
