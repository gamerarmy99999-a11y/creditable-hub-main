import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Pencil, Trash2, Search, Plus, Loader2, Download } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatINR, maskAadhar } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
const PAGE_SIZE = 10;
const EXPORT_COLUMNS = [
  ["name", "Name"],
  ["phone", "Phone"],
  ["address", "Address"],
  ["account_no", "Account number"],
  ["aadhar_no", "Aadhaar"],
  ["pan_no", "PAN"],
  ["loan_amount", "Loan amount"],
  ["repayable_amount", "Repayable amount"],
  ["total_paid", "Total paid"],
  ["pending_amount", "Pending amount"],
  ["loan_date", "Loan date"],
  ["status", "Status"],
  ["created_at", "Created at"],
];
export const Route = createFileRoute("/_authenticated/customers/")({
  validateSearch: (search) => ({
    q: typeof search["q"] === "string" ? search["q"] : "",
    status:
      search["status"] === "Active" || search["status"] === "Closed" ? search["status"] : "all",
    page: Number(search["page"]) > 0 ? Number(search["page"]) : 1,
  }),
  head: () => ({
    meta: [
      { title: "Customers — Aradhna Small Finance" },
      { name: "description", content: "Search, filter and manage all loan customers." },
      { property: "og:title", content: "Customers — Aradhna Small Finance" },
      { property: "og:description", content: "Search, filter and manage all loan customers." },
    ],
  }),
  component: CustomersPage,
});
function CustomersPage() {
  const { q, status, page } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [term, setTerm] = useState(q);
  const [debounced, setDebounced] = useState(q);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  useEffect(() => setTerm(q), [q]);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(term.trim()), 350);
    return () => clearTimeout(t);
  }, [term]);
  useEffect(() => {
    if (debounced !== q) {
      void navigate({ to: "/customers", search: { q: debounced, status, page: 1 } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);
  const list = useQuery({
    queryKey: ["customers", debounced, status, page],
    queryFn: async () => {
      let query = supabase
        .from("customers")
        .select(
          "id, name, phone, account_no, aadhar_no, loan_amount, repayable_amount, total_paid, pending_amount, status",
          { count: "exact" },
        )
        .order("created_at", { ascending: false });
      if (debounced) {
        const esc = debounced.replace(/[%,]/g, "");
        query = query.or(
          `name.ilike.%${esc}%,phone.ilike.%${esc}%,account_no.ilike.%${esc}%,aadhar_no.ilike.%${esc}%`,
        );
      }
      if (status !== "all") query = query.eq("status", status);
      const from = (page - 1) * PAGE_SIZE;
      const { data, count, error } = await query.range(from, from + PAGE_SIZE - 1);
      if (error) throw error;
      return { rows: data ?? [], count: count ?? 0 };
    },
  });
  const totalPages = Math.max(1, Math.ceil((list.data?.count ?? 0) / PAGE_SIZE));
  async function exportCustomers() {
    setExporting(true);
    let query = supabase.from("customers").select(EXPORT_COLUMNS.map(([key]) => key).join(","));
    if (debounced) {
      const esc = debounced.replace(/[%,]/g, "");
      query = query.or(
        `name.ilike.%${esc}%,phone.ilike.%${esc}%,account_no.ilike.%${esc}%,aadhar_no.ilike.%${esc}%`,
      );
    }
    if (status !== "all") query = query.eq("status", status);
    const { data, error } = await query.order("created_at", { ascending: false });
    setExporting(false);
    if (error) {
      toast.error("Could not export customers");
      return;
    }
    const csvValue = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const csv = [
      EXPORT_COLUMNS.map(([, label]) => csvValue(label)).join(","),
      ...(data ?? []).map((customer) =>
        EXPORT_COLUMNS.map(([key]) => csvValue(customer[key])).join(","),
      ),
    ].join("\r\n");
    const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `customers-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`${data?.length ?? 0} customers exported`);
  }
  async function confirmDelete() {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await supabase.from("customers").delete().eq("id", deleteId);
    setDeleting(false);
    setDeleteId(null);
    if (error) {
      toast.error("Could not delete this customer");
      return;
    }
    toast.success("Customer deleted");
    void queryClient.invalidateQueries({ queryKey: ["customers"] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
  }
  return _jsxs("div", {
    className: "space-y-6",
    children: [
      _jsxs("div", {
        className: "flex flex-wrap items-center justify-between gap-3",
        children: [
          _jsxs("div", {
            children: [
              _jsx("h1", { className: "text-2xl font-semibold", children: "Customers" }),
              _jsxs("p", {
                className: "text-sm text-muted-foreground",
                children: [list.data?.count ?? 0, " records"],
              }),
            ],
          }),
          _jsxs("div", {
            className: "flex flex-wrap gap-2",
            children: [
              _jsxs(Button, {
                variant: "outline",
                onClick: exportCustomers,
                disabled: exporting,
                children: [
                  _jsx(Download, { className: "mr-2 h-4 w-4" }),
                  exporting ? "Exporting…" : "Export Excel",
                ],
              }),
              _jsx(Button, {
                asChild: true,
                children: _jsxs(Link, {
                  to: "/customers/new",
                  children: [_jsx(Plus, { className: "mr-2 h-4 w-4" }), " Add Customer"],
                }),
              }),
            ],
          }),
        ],
      }),
      _jsx(Card, {
        children: _jsxs(CardContent, {
          className: "space-y-4 pt-6",
          children: [
            _jsxs("div", {
              className: "flex flex-col gap-3 sm:flex-row",
              children: [
                _jsxs("div", {
                  className: "relative flex-1",
                  children: [
                    _jsx(Search, {
                      className:
                        "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground",
                    }),
                    _jsx(Input, {
                      value: term,
                      onChange: (e) => setTerm(e.target.value),
                      placeholder: "Search by name, phone, account no. or Aadhaar",
                      className: "pl-9",
                    }),
                  ],
                }),
                _jsxs(Select, {
                  value: status,
                  onValueChange: (v) =>
                    navigate({
                      to: "/customers",
                      search: { q: debounced, status: v, page: 1 },
                    }),
                  children: [
                    _jsx(SelectTrigger, {
                      className: "sm:w-44",
                      children: _jsx(SelectValue, { placeholder: "Status" }),
                    }),
                    _jsxs(SelectContent, {
                      children: [
                        _jsx(SelectItem, { value: "all", children: "All statuses" }),
                        _jsx(SelectItem, { value: "Active", children: "Active" }),
                        _jsx(SelectItem, { value: "Closed", children: "Closed" }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            list.isLoading
              ? _jsx("div", {
                  className: "space-y-2",
                  children: [...Array(5)].map((_, i) =>
                    _jsx(Skeleton, { className: "h-12 w-full" }, i),
                  ),
                })
              : (list.data?.rows.length ?? 0) === 0
                ? _jsxs("div", {
                    className: "py-12 text-center",
                    children: [
                      _jsx("p", {
                        className: "text-sm text-muted-foreground",
                        children: "No customers match your search.",
                      }),
                      _jsx(Button, {
                        asChild: true,
                        variant: "outline",
                        className: "mt-4",
                        children: _jsx(Link, { to: "/customers/new", children: "Add a customer" }),
                      }),
                    ],
                  })
                : _jsx("div", {
                    className: "overflow-x-auto",
                    children: _jsxs(Table, {
                      children: [
                        _jsx(TableHeader, {
                          children: _jsxs(TableRow, {
                            children: [
                              _jsx(TableHead, { children: "Name" }),
                              _jsx(TableHead, { children: "Phone" }),
                              _jsx(TableHead, { children: "Aadhaar" }),
                              _jsx(TableHead, { children: "Loan" }),
                              _jsx(TableHead, { children: "Repayable" }),
                              _jsx(TableHead, { children: "Paid" }),
                              _jsx(TableHead, { children: "Pending" }),
                              _jsx(TableHead, { children: "Status" }),
                              _jsx(TableHead, { className: "text-right", children: "Actions" }),
                            ],
                          }),
                        }),
                        _jsx(TableBody, {
                          children: list.data?.rows.map((c) =>
                            _jsxs(
                              TableRow,
                              {
                                children: [
                                  _jsx(TableCell, { className: "font-medium", children: c.name }),
                                  _jsx(TableCell, { children: c.phone }),
                                  _jsx(TableCell, {
                                    className: "whitespace-nowrap",
                                    children: maskAadhar(c.aadhar_no),
                                  }),
                                  _jsx(TableCell, { children: formatINR(c.loan_amount) }),
                                  _jsx(TableCell, { children: formatINR(c.repayable_amount) }),
                                  _jsx(TableCell, { children: formatINR(c.total_paid) }),
                                  _jsx(TableCell, {
                                    className: "font-medium",
                                    children: formatINR(c.pending_amount),
                                  }),
                                  _jsx(TableCell, {
                                    children: _jsx(StatusBadge, { status: c.status }),
                                  }),
                                  _jsx(TableCell, {
                                    children: _jsxs("div", {
                                      className: "flex justify-end gap-1",
                                      children: [
                                        _jsx(Button, {
                                          asChild: true,
                                          variant: "ghost",
                                          size: "icon",
                                          "aria-label": "View",
                                          children: _jsx(Link, {
                                            to: "/customers/$id",
                                            params: { id: c.id },
                                            children: _jsx(Eye, { className: "h-4 w-4" }),
                                          }),
                                        }),
                                        _jsx(Button, {
                                          asChild: true,
                                          variant: "ghost",
                                          size: "icon",
                                          "aria-label": "Edit",
                                          children: _jsx(Link, {
                                            to: "/customers/$id/edit",
                                            params: { id: c.id },
                                            children: _jsx(Pencil, { className: "h-4 w-4" }),
                                          }),
                                        }),
                                        _jsx(Button, {
                                          variant: "ghost",
                                          size: "icon",
                                          "aria-label": "Delete",
                                          onClick: () => setDeleteId(c.id),
                                          children: _jsx(Trash2, {
                                            className: "h-4 w-4 text-destructive",
                                          }),
                                        }),
                                      ],
                                    }),
                                  }),
                                ],
                              },
                              c.id,
                            ),
                          ),
                        }),
                      ],
                    }),
                  }),
            totalPages > 1 &&
              _jsxs("div", {
                className: "flex items-center justify-between pt-2",
                children: [
                  _jsxs("p", {
                    className: "text-sm text-muted-foreground",
                    children: ["Page ", page, " of ", totalPages],
                  }),
                  _jsxs("div", {
                    className: "flex gap-2",
                    children: [
                      _jsx(Button, {
                        variant: "outline",
                        size: "sm",
                        disabled: page <= 1,
                        onClick: () =>
                          navigate({
                            to: "/customers",
                            search: { q: debounced, status, page: page - 1 },
                          }),
                        children: "Previous",
                      }),
                      _jsx(Button, {
                        variant: "outline",
                        size: "sm",
                        disabled: page >= totalPages,
                        onClick: () =>
                          navigate({
                            to: "/customers",
                            search: { q: debounced, status, page: page + 1 },
                          }),
                        children: "Next",
                      }),
                    ],
                  }),
                ],
              }),
          ],
        }),
      }),
      _jsx(AlertDialog, {
        open: !!deleteId,
        onOpenChange: (open) => !open && setDeleteId(null),
        children: _jsxs(AlertDialogContent, {
          children: [
            _jsxs(AlertDialogHeader, {
              children: [
                _jsx(AlertDialogTitle, { children: "Delete this customer?" }),
                _jsx(AlertDialogDescription, {
                  children:
                    "This permanently removes the customer and their entire payment history. This cannot be undone.",
                }),
              ],
            }),
            _jsxs(AlertDialogFooter, {
              children: [
                _jsx(AlertDialogCancel, { children: "Cancel" }),
                _jsxs(AlertDialogAction, {
                  onClick: confirmDelete,
                  disabled: deleting,
                  children: [
                    deleting && _jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
                    "Delete",
                  ],
                }),
              ],
            }),
          ],
        }),
      }),
    ],
  });
}
