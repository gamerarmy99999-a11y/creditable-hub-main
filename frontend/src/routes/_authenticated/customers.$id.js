import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, FileText, Download, ArrowLeft } from "lucide-react";
import { deleteCustomer, getCustomerById, getCustomerPayments } from "@/services/customer-service";
import { formatINR, formatDate, formatTime } from "@/lib/format";
import { getConsentUrl } from "@/lib/consent";
import { downloadReceipt } from "@/lib/receipt";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
export const Route = createFileRoute("/_authenticated/customers/$id")({
  head: () => ({
    meta: [
      { title: "Customer Details — Aradhna Small Finance" },
      { name: "description", content: "View customer, loan, witness and payment history." },
      { property: "og:title", content: "Customer Details — Aradhna Small Finance" },
      { property: "og:description", content: "View customer loan and payment history." },
    ],
  }),
  component: CustomerDetailPage,
});
function Field({ label, value }) {
  return _jsxs("div", {
    children: [
      _jsx("p", {
        className: "text-xs uppercase tracking-wide text-muted-foreground",
        children: label,
      }),
      _jsx("p", { className: "mt-0.5 text-sm font-medium", children: value || "—" }),
    ],
  });
}
function CustomerDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleting, setDeleting] = useState(false);
  const customer = useQuery({
    queryKey: ["customer", id],
    queryFn: () => getCustomerById(id),
  });
  const payments = useQuery({
    queryKey: ["payments", id],
    queryFn: () => getCustomerPayments(id),
  });
  if (customer.isLoading) return _jsx(Skeleton, { className: "h-96 w-full" });
  if (!customer.data)
    return _jsx("p", {
      className: "text-sm text-muted-foreground",
      children: "Customer not found.",
    });
  const c = customer.data;
  const viewConsent = async () => {
    if (!c.consent_form_path) return;
    const url = await getConsentUrl(c.consent_form_path);
    if (url) window.open(url, "_blank", "noopener");
    else toast.error("Could not open the consent form");
  };
  const onDelete = async () => {
    setDeleting(true);
    const { error } = await deleteCustomer(id);
    if (error) {
      toast.error("Could not delete this customer");
      return;
    }
    toast.success("Customer deleted");
    void queryClient.invalidateQueries({ queryKey: ["customers"] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    void navigate({ to: "/customers", search: { q: "", status: "all", page: 1 } });
  };
  return _jsxs("div", {
    className: "space-y-6",
    children: [
      _jsxs("div", {
        className: "flex flex-wrap items-center justify-between gap-3",
        children: [
          _jsxs("div", {
            className: "flex items-center gap-3",
            children: [
              _jsx(Button, {
                variant: "ghost",
                size: "icon",
                asChild: true,
                children: _jsx(Link, {
                  to: "/customers",
                  search: { q: "", status: "all", page: 1 },
                  "aria-label": "Back to customers",
                  children: _jsx(ArrowLeft, { className: "h-4 w-4" }),
                }),
              }),
              _jsxs("div", {
                children: [
                  _jsx("h1", { className: "text-2xl font-semibold", children: c.name }),
                  _jsx("p", { className: "text-sm text-muted-foreground", children: c.phone }),
                ],
              }),
              _jsx(StatusBadge, { status: c.status }),
            ],
          }),
          _jsxs("div", {
            className: "flex gap-2",
            children: [
              _jsx(Button, {
                variant: "outline",
                asChild: true,
                children: _jsxs(Link, {
                  to: "/customers/$id/edit",
                  params: { id },
                  children: [_jsx(Pencil, { className: "mr-2 h-4 w-4" }), " Edit"],
                }),
              }),
              _jsxs(AlertDialog, {
                children: [
                  _jsx(AlertDialogTrigger, {
                    asChild: true,
                    children: _jsxs(Button, {
                      variant: "destructive",
                      children: [_jsx(Trash2, { className: "mr-2 h-4 w-4" }), " Delete"],
                    }),
                  }),
                  _jsxs(AlertDialogContent, {
                    children: [
                      _jsxs(AlertDialogHeader, {
                        children: [
                          _jsxs(AlertDialogTitle, { children: ["Delete ", c.name, "?"] }),
                          _jsx(AlertDialogDescription, {
                            children:
                              "This permanently removes the customer and all their payment records. This cannot be undone.",
                          }),
                        ],
                      }),
                      _jsxs(AlertDialogFooter, {
                        children: [
                          _jsx(AlertDialogCancel, { children: "Cancel" }),
                          _jsx(AlertDialogAction, {
                            onClick: onDelete,
                            disabled: deleting,
                            children: deleting ? "Deleting…" : "Delete",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      _jsxs("div", {
        className: "grid gap-4 sm:grid-cols-3",
        children: [
          _jsx(Card, {
            children: _jsxs(CardContent, {
              className: "pt-6",
              children: [
                _jsx("p", {
                  className: "text-xs uppercase tracking-wide text-muted-foreground",
                  children: "Loan Amount",
                }),
                _jsx("p", {
                  className: "mt-1 text-xl font-semibold",
                  children: formatINR(c.loan_amount),
                }),
              ],
            }),
          }),
          _jsx(Card, {
            children: _jsxs(CardContent, {
              className: "pt-6",
              children: [
                _jsx("p", {
                  className: "text-xs uppercase tracking-wide text-muted-foreground",
                  children: "Total Paid",
                }),
                _jsx("p", {
                  className: "mt-1 text-xl font-semibold",
                  children: formatINR(c.total_paid),
                }),
              ],
            }),
          }),
          _jsx(Card, {
            children: _jsxs(CardContent, {
              className: "pt-6",
              children: [
                _jsx("p", {
                  className: "text-xs uppercase tracking-wide text-muted-foreground",
                  children: "Pending Amount",
                }),
                _jsx("p", {
                  className: "mt-1 text-xl font-semibold",
                  children: formatINR(c.pending_amount),
                }),
              ],
            }),
          }),
        ],
      }),
      _jsxs("div", {
        className: "grid gap-4 lg:grid-cols-2",
        children: [
          _jsxs(Card, {
            children: [
              _jsx(CardHeader, {
                children: _jsx(CardTitle, { children: "Customer & loan details" }),
              }),
              _jsxs(CardContent, {
                className: "grid grid-cols-2 gap-4",
                children: [
                  _jsx(Field, { label: "Address", value: c.address }),
                  _jsx(Field, { label: "Account No.", value: c.account_no }),
                  _jsx(Field, { label: "Aadhaar No.", value: c.aadhar_no }),
                  _jsx(Field, { label: "PAN No.", value: c.pan_no }),
                  _jsx(Field, { label: "Loan Amount", value: formatINR(c.loan_amount) }),
                  _jsx(Field, { label: "Repayable Amount", value: formatINR(c.repayable_amount) }),
                  _jsx(Field, { label: "Loan Date", value: formatDate(c.loan_date) }),
                  _jsx(Field, { label: "Lender", value: c.lender ?? "Aradhna Small Finance" }),
                  _jsx("div", {
                    className: "col-span-2",
                    children: _jsxs(Button, {
                      variant: "outline",
                      size: "sm",
                      onClick: viewConsent,
                      disabled: !c.consent_form_path,
                      children: [
                        _jsx(FileText, { className: "mr-2 h-4 w-4" }),
                        c.consent_form_path ? "View consent form" : "No consent form uploaded",
                      ],
                    }),
                  }),
                ],
              }),
            ],
          }),
          _jsxs(Card, {
            children: [
              _jsx(CardHeader, { children: _jsx(CardTitle, { children: "Witness details" }) }),
              _jsxs(CardContent, {
                className: "grid grid-cols-2 gap-4",
                children: [
                  _jsx(Field, { label: "Name", value: c.witness_name }),
                  _jsx(Field, { label: "Phone", value: c.witness_phone }),
                  _jsx(Field, { label: "Aadhaar No.", value: c.witness_aadhar }),
                  _jsx(Field, { label: "Address", value: c.witness_address }),
                ],
              }),
            ],
          }),
        ],
      }),
      _jsxs(Card, {
        children: [
          _jsx(CardHeader, { children: _jsx(CardTitle, { children: "Payment history" }) }),
          _jsx(CardContent, {
            children: payments.isLoading
              ? _jsx(Skeleton, { className: "h-32 w-full" })
              : !payments.data?.length
                ? _jsx("p", {
                    className: "py-6 text-center text-sm text-muted-foreground",
                    children: "No payments recorded yet.",
                  })
                : _jsxs(Table, {
                    children: [
                      _jsx(TableHeader, {
                        children: _jsxs(TableRow, {
                          children: [
                            _jsx(TableHead, { children: "Date" }),
                            _jsx(TableHead, { children: "Time" }),
                            _jsx(TableHead, { children: "Amount" }),
                            _jsx(TableHead, { children: "Method" }),
                            _jsx(TableHead, { children: "Note" }),
                            _jsx(TableHead, { className: "text-right", children: "Receipt" }),
                          ],
                        }),
                      }),
                      _jsx(TableBody, {
                        children: payments.data.map((p) =>
                          _jsxs(
                            TableRow,
                            {
                              children: [
                                _jsx(TableCell, { children: formatDate(p.paid_date) }),
                                _jsx(TableCell, { children: formatTime(p.paid_time) }),
                                _jsx(TableCell, {
                                  className: "font-medium",
                                  children: formatINR(p.amount),
                                }),
                                _jsx(TableCell, { children: p.payment_method }),
                                _jsx(TableCell, {
                                  className: "max-w-40 truncate",
                                  children: p.note || "—",
                                }),
                                _jsx(TableCell, {
                                  className: "text-right",
                                  children: _jsx(Button, {
                                    variant: "ghost",
                                    size: "icon",
                                    "aria-label": "Download receipt",
                                    onClick: () =>
                                      downloadReceipt({
                                        receiptNo: p.id.slice(0, 8).toUpperCase(),
                                        customerName: c.name,
                                        phone: c.phone,
                                        amount: Number(p.amount),
                                        paidDate: p.paid_date,
                                        paidTime: p.paid_time,
                                        method: p.payment_method,
                                        note: p.note,
                                        remaining: Number(c.pending_amount),
                                        repayable: Number(c.repayable_amount),
                                      }),
                                    children: _jsx(Download, { className: "h-4 w-4" }),
                                  }),
                                }),
                              ],
                            },
                            p.id,
                          ),
                        ),
                      }),
                    ],
                  }),
          }),
        ],
      }),
    ],
  });
}
