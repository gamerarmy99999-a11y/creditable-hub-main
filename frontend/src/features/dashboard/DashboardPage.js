import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Users, TrendingUp, Wallet, Clock, Plus, IndianRupee } from "lucide-react";
import { formatDate, formatINR, formatTime } from "@/lib/format";
import { getDashboardStats } from "@/services/dashboard-service";
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

export function DashboardPage() {
  const stats = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
  });

  const cards = [
    {
      label: "Total Customers",
      value: stats.data?.totalCustomers ?? 0,
      icon: Users,
      isMoney: false,
    },
    {
      label: "Total Amount Lent",
      value: stats.data?.totalLent ?? 0,
      icon: TrendingUp,
      isMoney: true,
    },
    {
      label: "Total Recovered",
      value: stats.data?.totalRecovered ?? 0,
      icon: Wallet,
      isMoney: true,
    },
    { label: "Total Pending", value: stats.data?.totalPending ?? 0, icon: Clock, isMoney: true },
  ];

  return _jsxs("div", {
    className: "space-y-6",
    children: [
      _jsxs("div", {
        className: "flex flex-wrap items-center justify-between gap-3",
        children: [
          _jsxs("div", {
            children: [
              _jsx("h1", { className: "text-2xl font-semibold", children: "Dashboard" }),
              _jsx("p", {
                className: "text-sm text-muted-foreground",
                children: "Overview of your lending book",
              }),
            ],
          }),
          _jsxs("div", {
            className: "flex gap-2",
            children: [
              _jsx(Button, {
                asChild: true,
                variant: "outline",
                children: _jsxs(Link, {
                  to: "/customers/new",
                  children: [_jsx(Plus, { className: "mr-2 h-4 w-4" }), " Add Customer"],
                }),
              }),
              _jsx(Button, {
                asChild: true,
                children: _jsxs(Link, {
                  to: "/payments/new",
                  children: [_jsx(IndianRupee, { className: "mr-2 h-4 w-4" }), " Add Payment"],
                }),
              }),
            ],
          }),
        ],
      }),
      _jsx("div", {
        className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
        children: cards.map(({ label, value, icon: Icon, isMoney }) =>
          _jsxs(
            Card,
            {
              className: "border-primary/15",
              children: [
                _jsxs(CardHeader, {
                  className: "flex flex-row items-center justify-between space-y-0 pb-2",
                  children: [
                    _jsx(CardTitle, {
                      className: "text-sm font-medium text-muted-foreground",
                      children: label,
                    }),
                    _jsx(Icon, { className: "h-4 w-4 text-primary" }),
                  ],
                }),
                _jsx(CardContent, {
                  children: stats.isLoading
                    ? _jsx(Skeleton, { className: "h-8 w-28" })
                    : _jsx("p", {
                        className: "font-display text-2xl font-semibold",
                        children: isMoney ? formatINR(value) : value,
                      }),
                }),
              ],
            },
            label,
          ),
        ),
      }),
      _jsxs(Card, {
        children: [
          _jsx(CardHeader, { children: _jsx(CardTitle, { children: "Recent payments" }) }),
          _jsx(CardContent, {
            children: stats.isLoading
              ? _jsx("div", {
                  className: "space-y-2",
                  children: [...Array(3)].map((_, index) =>
                    _jsx(Skeleton, { className: "h-10 w-full" }, index),
                  ),
                })
              : (stats.data?.recent.length ?? 0) === 0
                ? _jsx("p", {
                    className: "py-8 text-center text-sm text-muted-foreground",
                    children: "No payments recorded yet.",
                  })
                : _jsx("div", {
                    className: "overflow-x-auto",
                    children: _jsxs(Table, {
                      children: [
                        _jsx(TableHeader, {
                          children: _jsxs(TableRow, {
                            children: [
                              _jsx(TableHead, { children: "Customer" }),
                              _jsx(TableHead, { children: "Amount" }),
                              _jsx(TableHead, { children: "Date" }),
                              _jsx(TableHead, { children: "Time" }),
                              _jsx(TableHead, { children: "Method" }),
                            ],
                          }),
                        }),
                        _jsx(TableBody, {
                          children: stats.data?.recent.map((payment) =>
                            _jsxs(
                              TableRow,
                              {
                                children: [
                                  _jsx(TableCell, {
                                    className: "font-medium",
                                    children: _jsx(Link, {
                                      to: "/customers/$id",
                                      params: { id: payment.customer_id },
                                      className: "hover:underline",
                                      children: payment.customers?.name ?? "—",
                                    }),
                                  }),
                                  _jsx(TableCell, { children: formatINR(payment.amount) }),
                                  _jsx(TableCell, { children: formatDate(payment.paid_date) }),
                                  _jsx(TableCell, { children: formatTime(payment.paid_time) }),
                                  _jsx(TableCell, { children: payment.payment_method }),
                                ],
                              },
                              payment.id,
                            ),
                          ),
                        }),
                      ],
                    }),
                  }),
          }),
        ],
      }),
    ],
  });
}
