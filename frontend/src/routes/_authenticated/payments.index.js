import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PAYMENT_METHODS } from "@/lib/schemas";
import { formatINR, formatDate, formatTime } from "@/lib/format";
import { downloadReceipt } from "@/lib/receipt";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
export const Route = createFileRoute("/_authenticated/payments/")({
  head: () => ({
    meta: [
      { title: "Payments — Aradhna Small Finance" },
      { name: "description", content: "Full payment history with filters and receipts." },
      { property: "og:title", content: "Payments — Aradhna Small Finance" },
      { property: "og:description", content: "Payment history for Aradhna Small Finance." },
    ],
  }),
  component: PaymentsPage,
});
function PaymentsPage() {
  const [search, setSearch] = useState("");
  const [method, setMethod] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const payments = useQuery({
    queryKey: ["payments", "all", { search, method, from, to }],
    queryFn: async () => {
      let q = supabase
        .from("payments")
        .select(
          "id, amount, paid_date, paid_time, payment_method, note, customer:customers(id, name, phone, repayable_amount, pending_amount)",
        )
        .order("paid_date", { ascending: false })
        .order("paid_time", { ascending: false })
        .limit(500);
      if (method !== "all") q = q.eq("payment_method", method);
      if (from) q = q.gte("paid_date", from);
      if (to) q = q.lte("paid_date", to);
      const { data, error } = await q;
      if (error) throw error;
      let rows = data ?? [];
      const s = search.trim().toLowerCase();
      if (s)
        rows = rows.filter(
          (r) => r.customer?.name.toLowerCase().includes(s) || r.customer?.phone.includes(s),
        );
      return rows;
    },
  });
  return _jsxs("div", {
    className: "space-y-6",
    children: [
      _jsxs("div", {
        className: "flex flex-wrap items-center justify-between gap-3",
        children: [
          _jsxs("div", {
            children: [
              _jsx("h1", { className: "text-2xl font-semibold", children: "Payments" }),
              _jsx("p", {
                className: "text-sm text-muted-foreground",
                children: "Every repayment recorded, with receipts.",
              }),
            ],
          }),
          _jsx(Button, {
            asChild: true,
            children: _jsx(Link, { to: "/payments/new", children: "Add Payment" }),
          }),
        ],
      }),
      _jsxs(Card, {
        children: [
          _jsx(CardHeader, { children: _jsx(CardTitle, { children: "Filters" }) }),
          _jsxs(CardContent, {
            className: "flex flex-wrap items-end gap-3",
            children: [
              _jsxs("div", {
                className: "min-w-48 flex-1 space-y-1.5",
                children: [
                  _jsx(Label, { htmlFor: "f-search", children: "Customer name or phone" }),
                  _jsx(Input, {
                    id: "f-search",
                    value: search,
                    onChange: (e) => setSearch(e.target.value),
                    placeholder: "Search\u2026",
                  }),
                ],
              }),
              _jsxs("div", {
                className: "w-44 space-y-1.5",
                children: [
                  _jsx(Label, { children: "Method" }),
                  _jsxs(Select, {
                    value: method,
                    onValueChange: (v) => setMethod(v),
                    children: [
                      _jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }),
                      _jsxs(SelectContent, {
                        children: [
                          _jsx(SelectItem, { value: "all", children: "All methods" }),
                          PAYMENT_METHODS.map((m) =>
                            _jsx(SelectItem, { value: m, children: m }, m),
                          ),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              _jsxs("div", {
                className: "space-y-1.5",
                children: [
                  _jsx(Label, { htmlFor: "f-from", children: "From" }),
                  _jsx(Input, {
                    id: "f-from",
                    type: "date",
                    value: from,
                    onChange: (e) => setFrom(e.target.value),
                  }),
                ],
              }),
              _jsxs("div", {
                className: "space-y-1.5",
                children: [
                  _jsx(Label, { htmlFor: "f-to", children: "To" }),
                  _jsx(Input, {
                    id: "f-to",
                    type: "date",
                    value: to,
                    onChange: (e) => setTo(e.target.value),
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      _jsx(Card, {
        children: _jsx(CardContent, {
          className: "pt-6",
          children: payments.isLoading
            ? _jsx(Skeleton, { className: "h-48 w-full" })
            : !payments.data?.length
              ? _jsx("p", {
                  className: "py-8 text-center text-sm text-muted-foreground",
                  children: "No payments match these filters.",
                })
              : _jsxs(Table, {
                  children: [
                    _jsx(TableHeader, {
                      children: _jsxs(TableRow, {
                        children: [
                          _jsx(TableHead, { children: "Customer" }),
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
                              _jsxs(TableCell, {
                                children: [
                                  p.customer
                                    ? _jsx(Link, {
                                        to: "/customers/$id",
                                        params: { id: p.customer.id },
                                        className: "font-medium hover:underline",
                                        children: p.customer.name,
                                      })
                                    : "—",
                                  _jsx("span", {
                                    className: "block text-xs text-muted-foreground",
                                    children: p.customer?.phone,
                                  }),
                                ],
                              }),
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
                                    p.customer &&
                                    downloadReceipt({
                                      receiptNo: p.id.slice(0, 8).toUpperCase(),
                                      customerName: p.customer.name,
                                      phone: p.customer.phone,
                                      amount: Number(p.amount),
                                      paidDate: p.paid_date,
                                      paidTime: p.paid_time,
                                      method: p.payment_method,
                                      note: p.note,
                                      remaining: Number(p.customer.pending_amount),
                                      repayable: Number(p.customer.repayable_amount),
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
      }),
    ],
  });
}
