import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Search, UserPlus, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PAYMENT_METHODS, paymentSchema } from "@/lib/schemas";
import { formatINR, formatDate, todayISO, nowTime } from "@/lib/format";
import { downloadReceipt } from "@/lib/receipt";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
export const Route = createFileRoute("/_authenticated/payments/new")({
  head: () => ({
    meta: [
      { title: "Add Payment — Aradhna Small Finance" },
      { name: "description", content: "Record a customer loan repayment and download a receipt." },
      { property: "og:title", content: "Add Payment — Aradhna Small Finance" },
      { property: "og:description", content: "Record a loan repayment for Aradhna Small Finance." },
    ],
  }),
  component: AddPaymentPage,
});
function AddPaymentPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [matches, setMatches] = useState([]);
  const [selected, setSelected] = useState(null);
  const [saved, setSaved] = useState(null);
  const search = async (e) => {
    e.preventDefault();
    if (!name.trim() && !phone.trim()) {
      toast.error("Enter a name or phone number to search");
      return;
    }
    setSearching(true);
    setSelected(null);
    setSaved(null);
    let q = supabase
      .from("customers")
      .select("id, name, phone, account_no, status, repayable_amount, pending_amount");
    if (name.trim()) q = q.ilike("name", `%${name.trim()}%`);
    if (phone.trim()) q = q.ilike("phone", `%${phone.trim()}%`);
    const { data, error } = await q.order("name").limit(20);
    setSearching(false);
    setSearched(true);
    if (error) {
      toast.error("Search failed");
      return;
    }
    setMatches(data ?? []);
  };
  const refreshSelected = async (id) => {
    const { data } = await supabase
      .from("customers")
      .select("id, name, phone, account_no, status, repayable_amount, pending_amount")
      .eq("id", id)
      .single();
    if (data) setSelected(data);
  };
  const submitPayment = async (e) => {
    e.preventDefault();
    if (!selected) return;
    const form = new FormData(e.currentTarget);
    const parsed = paymentSchema.safeParse({
      amount: form.get("amount"),
      payment_method: form.get("payment_method"),
      paid_date: form.get("paid_date"),
      paid_time: form.get("paid_time"),
      note: form.get("note") ?? "",
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check the payment details");
      return;
    }
    const pending = Number(selected.pending_amount);
    if (parsed.data.amount > pending) {
      toast.error(`Amount cannot be more than the pending balance (${formatINR(pending)})`);
      return;
    }
    if (selected.status === "Closed") {
      toast.error("This loan is already closed");
      return;
    }
    const { data, error } = await supabase
      .from("payments")
      .insert({
        customer_id: selected.id,
        amount: parsed.data.amount,
        paid_date: parsed.data.paid_date,
        paid_time: parsed.data.paid_time,
        payment_method: parsed.data.payment_method,
        note: parsed.data.note || null,
      })
      .select("id")
      .single();
    if (error || !data) {
      toast.error("Could not save this payment");
      return;
    }
    toast.success("Payment recorded");
    void queryClient.invalidateQueries({ queryKey: ["customers"] });
    void queryClient.invalidateQueries({ queryKey: ["payments"] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    setSaved({
      paymentId: data.id,
      values: parsed.data,
      remaining: Math.max(0, pending - parsed.data.amount),
    });
    await refreshSelected(selected.id);
  };
  const reset = () => {
    setName("");
    setPhone("");
    setMatches([]);
    setSearched(false);
    setSelected(null);
    setSaved(null);
  };
  return _jsxs("div", {
    className: "mx-auto max-w-3xl space-y-6",
    children: [
      _jsxs("div", {
        children: [
          _jsx("h1", { className: "text-2xl font-semibold", children: "Add payment" }),
          _jsx("p", {
            className: "text-sm text-muted-foreground",
            children: "Find the customer by name and phone number, then record the payment.",
          }),
        ],
      }),
      _jsxs(Card, {
        children: [
          _jsx(CardHeader, { children: _jsx(CardTitle, { children: "Find customer" }) }),
          _jsx(CardContent, {
            children: _jsxs("form", {
              onSubmit: search,
              className: "flex flex-wrap items-end gap-3",
              children: [
                _jsxs("div", {
                  className: "min-w-48 flex-1 space-y-1.5",
                  children: [
                    _jsx(Label, { htmlFor: "s-name", children: "Customer name" }),
                    _jsx(Input, {
                      id: "s-name",
                      value: name,
                      onChange: (e) => setName(e.target.value),
                      placeholder: "e.g. Mahendra Kumar",
                    }),
                  ],
                }),
                _jsxs("div", {
                  className: "min-w-40 flex-1 space-y-1.5",
                  children: [
                    _jsx(Label, { htmlFor: "s-phone", children: "Phone number" }),
                    _jsx(Input, {
                      id: "s-phone",
                      value: phone,
                      onChange: (e) => setPhone(e.target.value),
                      placeholder: "e.g. 9259737824",
                      inputMode: "numeric",
                    }),
                  ],
                }),
                _jsxs(Button, {
                  type: "submit",
                  disabled: searching,
                  children: [
                    _jsx(Search, { className: "mr-2 h-4 w-4" }),
                    " ",
                    searching ? "Searching…" : "Search",
                  ],
                }),
              ],
            }),
          }),
        ],
      }),
      searched &&
        !selected &&
        matches.length === 0 &&
        _jsx(Card, {
          children: _jsxs(CardContent, {
            className: "flex flex-col items-center gap-3 py-10 text-center",
            children: [
              _jsx("p", { className: "font-medium", children: "Customer not found" }),
              _jsx("p", {
                className: "text-sm text-muted-foreground",
                children: "No customer matches this name and phone number.",
              }),
              _jsx(Button, {
                asChild: true,
                children: _jsxs(Link, {
                  to: "/customers/new",
                  children: [_jsx(UserPlus, { className: "mr-2 h-4 w-4" }), " Add New Customer"],
                }),
              }),
            ],
          }),
        }),
      !selected &&
        matches.length > 0 &&
        _jsxs(Card, {
          children: [
            _jsx(CardHeader, {
              children: _jsx(CardTitle, {
                children:
                  matches.length === 1
                    ? "Customer found"
                    : `${matches.length} customers found — select one`,
              }),
            }),
            _jsx(CardContent, {
              className: "space-y-2",
              children: matches.map((m) =>
                _jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: () => setSelected(m),
                    className:
                      "flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent",
                    children: [
                      _jsxs("div", {
                        children: [
                          _jsx("p", { className: "font-medium", children: m.name }),
                          _jsxs("p", {
                            className: "text-sm text-muted-foreground",
                            children: [m.phone, " \u00B7 A/c ", m.account_no],
                          }),
                        ],
                      }),
                      _jsxs("div", {
                        className: "flex items-center gap-3",
                        children: [
                          _jsxs("span", {
                            className: "text-sm font-medium",
                            children: ["Pending ", formatINR(m.pending_amount)],
                          }),
                          _jsx(StatusBadge, { status: m.status }),
                        ],
                      }),
                    ],
                  },
                  m.id,
                ),
              ),
            }),
          ],
        }),
      selected &&
        _jsxs(Card, {
          children: [
            _jsxs(CardHeader, {
              className: "flex-row items-center justify-between space-y-0",
              children: [
                _jsx(CardTitle, { children: "Customer" }),
                _jsx(Button, {
                  variant: "ghost",
                  size: "sm",
                  onClick: () => {
                    setSelected(null);
                    setSaved(null);
                  },
                  children: "Change",
                }),
              ],
            }),
            _jsxs(CardContent, {
              className: "grid grid-cols-2 gap-4 sm:grid-cols-4",
              children: [
                _jsxs("div", {
                  children: [
                    _jsx("p", {
                      className: "text-xs uppercase text-muted-foreground",
                      children: "Name",
                    }),
                    _jsx("p", { className: "text-sm font-medium", children: selected.name }),
                  ],
                }),
                _jsxs("div", {
                  children: [
                    _jsx("p", {
                      className: "text-xs uppercase text-muted-foreground",
                      children: "Phone",
                    }),
                    _jsx("p", { className: "text-sm font-medium", children: selected.phone }),
                  ],
                }),
                _jsxs("div", {
                  children: [
                    _jsx("p", {
                      className: "text-xs uppercase text-muted-foreground",
                      children: "Repayable",
                    }),
                    _jsx("p", {
                      className: "text-sm font-medium",
                      children: formatINR(selected.repayable_amount),
                    }),
                  ],
                }),
                _jsxs("div", {
                  children: [
                    _jsx("p", {
                      className: "text-xs uppercase text-muted-foreground",
                      children: "Pending",
                    }),
                    _jsx("p", {
                      className: "text-sm font-medium",
                      children: formatINR(selected.pending_amount),
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      selected &&
        !saved &&
        selected.status !== "Closed" &&
        _jsxs(Card, {
          children: [
            _jsx(CardHeader, { children: _jsx(CardTitle, { children: "Payment details" }) }),
            _jsx(CardContent, {
              children: _jsxs("form", {
                onSubmit: submitPayment,
                className: "grid gap-4 sm:grid-cols-2",
                children: [
                  _jsxs("div", {
                    className: "space-y-1.5",
                    children: [
                      _jsx(Label, { htmlFor: "amount", children: "Amount (\u20B9)" }),
                      _jsx(Input, {
                        id: "amount",
                        name: "amount",
                        type: "number",
                        min: "1",
                        step: "any",
                        required: true,
                        placeholder: "0",
                      }),
                    ],
                  }),
                  _jsxs("div", {
                    className: "space-y-1.5",
                    children: [
                      _jsx(Label, { htmlFor: "payment_method", children: "Payment method" }),
                      _jsxs(Select, {
                        name: "payment_method",
                        defaultValue: "Cash",
                        children: [
                          _jsx(SelectTrigger, {
                            id: "payment_method",
                            children: _jsx(SelectValue, {}),
                          }),
                          _jsx(SelectContent, {
                            children: PAYMENT_METHODS.map((m) =>
                              _jsx(SelectItem, { value: m, children: m }, m),
                            ),
                          }),
                        ],
                      }),
                    ],
                  }),
                  _jsxs("div", {
                    className: "space-y-1.5",
                    children: [
                      _jsx(Label, { htmlFor: "paid_date", children: "Date" }),
                      _jsx(Input, {
                        id: "paid_date",
                        name: "paid_date",
                        type: "date",
                        defaultValue: todayISO(),
                        required: true,
                      }),
                    ],
                  }),
                  _jsxs("div", {
                    className: "space-y-1.5",
                    children: [
                      _jsx(Label, { htmlFor: "paid_time", children: "Time" }),
                      _jsx(Input, {
                        id: "paid_time",
                        name: "paid_time",
                        type: "time",
                        defaultValue: nowTime(),
                        required: true,
                      }),
                    ],
                  }),
                  _jsxs("div", {
                    className: "space-y-1.5 sm:col-span-2",
                    children: [
                      _jsx(Label, { htmlFor: "note", children: "Note (optional)" }),
                      _jsx(Input, {
                        id: "note",
                        name: "note",
                        maxLength: 300,
                        placeholder: "e.g. Instalment 3",
                      }),
                    ],
                  }),
                  _jsx("div", {
                    className: "sm:col-span-2",
                    children: _jsx(Button, {
                      type: "submit",
                      className: "w-full sm:w-auto",
                      children: "Save payment",
                    }),
                  }),
                ],
              }),
            }),
          ],
        }),
      selected?.status === "Closed" &&
        !saved &&
        _jsx(Card, {
          children: _jsx(CardContent, {
            className: "py-6 text-center text-sm text-muted-foreground",
            children: "This loan is fully repaid and closed. No further payments are needed.",
          }),
        }),
      saved &&
        selected &&
        _jsx(Card, {
          children: _jsxs(CardContent, {
            className: "flex flex-col items-center gap-3 py-8 text-center",
            children: [
              _jsxs("p", {
                className: "font-medium",
                children: ["Payment of ", formatINR(saved.values.amount), " saved"],
              }),
              _jsxs("p", {
                className: "text-sm text-muted-foreground",
                children: [
                  "Remaining balance: ",
                  formatINR(selected.pending_amount),
                  selected.status === "Closed" && " — loan closed",
                ],
              }),
              _jsxs("div", {
                className: "flex flex-wrap justify-center gap-2",
                children: [
                  _jsxs(Button, {
                    variant: "outline",
                    onClick: () =>
                      downloadReceipt({
                        receiptNo: saved.paymentId.slice(0, 8).toUpperCase(),
                        customerName: selected.name,
                        phone: selected.phone,
                        amount: saved.values.amount,
                        paidDate: saved.values.paid_date,
                        paidTime: saved.values.paid_time,
                        method: saved.values.payment_method,
                        note: saved.values.note ?? null,
                        remaining: saved.remaining,
                        repayable: Number(selected.repayable_amount),
                      }),
                    children: [_jsx(Download, { className: "mr-2 h-4 w-4" }), " Download Receipt"],
                  }),
                  _jsx(Button, { onClick: reset, children: "Add another payment" }),
                ],
              }),
            ],
          }),
        }),
    ],
  });
}
void formatDate;
