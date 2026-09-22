import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  IndianRupee,
  Receipt,
  Settings,
  LogOut,
  Menu,
  Search,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/BrandMark";
const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/customers/new", label: "Add Customer", icon: UserPlus },
  { to: "/payments/new", label: "Add Payment", icon: IndianRupee },
  { to: "/payments", label: "Payments", icon: Receipt },
  { to: "/settings", label: "Settings", icon: Settings },
];
function NavLinks({ onNavigate }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return _jsx("nav", {
    className: "flex flex-col gap-2 p-3",
    children: NAV.map(({ to, label, icon: Icon }) => {
      const active = pathname === to || (to !== "/dashboard" && pathname === to);
      return _jsxs(
        Link,
        {
          to: to,
          onClick: onNavigate,
          className: cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-all duration-200 hover:bg-secondary hover:text-secondary-foreground",
            active &&
              "bg-gradient-to-r from-primary/18 via-primary/10 to-accent/12 text-sidebar-accent-foreground shadow-[0_0_20px_rgba(255,96,170,0.18)] ring-1 ring-primary/30",
          ),
          children: [_jsx(Icon, { className: "h-4 w-4 shrink-0" }), label],
        },
        to,
      );
    }),
  });
}
function Brand() {
  return _jsxs("div", {
    className: "flex items-center gap-3 border-b border-sidebar-border px-4 py-5",
    children: [
      _jsx("div", {
        className:
          "flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-primary/40 bg-white shadow-[0_0_16px_rgba(236,72,153,0.18)]",
        children: _jsx(BrandMark, { className: "h-11 w-11" }),
      }),
      _jsxs("div", {
        className: "leading-tight",
        children: [
          _jsx("p", {
            className: "font-display text-base font-semibold tracking-[-0.04em] text-foreground",
            children: "Aradhna",
          }),
          _jsx("p", {
            className: "text-[10px] font-semibold uppercase tracking-[0.2em] text-primary",
            children: "Small Finance",
          }),
        ],
      }),
    ],
  });
}
export function AppLayout({ children }) {
  const { data: admin } = useAdmin();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [term, setTerm] = useState("");
  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }
  function handleSearch(e) {
    e.preventDefault();
    navigate({ to: "/customers", search: { q: term, status: "all", page: 1 } });
  }
  return _jsxs("div", {
    className: "min-h-screen bg-background text-foreground",
    children: [
      _jsxs("aside", {
        className:
          "fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-sidebar-border bg-sidebar/90 shadow-[0_0_40px_rgba(255,80,170,0.08)] backdrop-blur-xl lg:flex",
        children: [_jsx(Brand, {}), _jsx(NavLinks, {})],
      }),
      _jsxs("div", {
        className: "lg:pl-72",
        children: [
          _jsxs("header", {
            className:
              "sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-sidebar-border bg-card/80 px-3 backdrop-blur-xl sm:px-5",
            children: [
              _jsxs(Sheet, {
                open: mobileOpen,
                onOpenChange: setMobileOpen,
                children: [
                  _jsx(SheetTrigger, {
                    asChild: true,
                    children: _jsx(Button, {
                      variant: "ghost",
                      size: "icon",
                      className: "lg:hidden",
                      "aria-label": "Open menu",
                      children: _jsx(Menu, { className: "h-5 w-5" }),
                    }),
                  }),
                  _jsxs(SheetContent, {
                    side: "left",
                    className: "w-72 border-r border-sidebar-border bg-sidebar p-0",
                    children: [
                      _jsx(SheetTitle, { className: "sr-only", children: "Navigation" }),
                      _jsx(Brand, {}),
                      _jsx(NavLinks, { onNavigate: () => setMobileOpen(false) }),
                    ],
                  }),
                ],
              }),
              _jsxs("form", {
                onSubmit: handleSearch,
                className: "relative hidden max-w-md flex-1 sm:block",
                children: [
                  _jsx(Search, {
                    className:
                      "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary",
                  }),
                  _jsx(Input, {
                    value: term,
                    onChange: (e) => setTerm(e.target.value),
                    placeholder: "Search name, phone, account no. or Aadhaar",
                    className:
                      "h-10 border-input bg-white/80 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/60",
                  }),
                ],
              }),
              _jsxs("div", {
                className: "ml-auto flex items-center gap-3",
                children: [
                  _jsxs("div", {
                    className: "hidden text-right sm:block",
                    children: [
                      _jsx("p", {
                        className: "text-sm font-medium leading-tight text-foreground",
                        children: admin?.name ?? "Admin",
                      }),
                      _jsx("p", {
                        className: "text-[11px] text-muted-foreground",
                        children: admin?.email,
                      }),
                    ],
                  }),
                  _jsxs(Button, {
                    variant: "outline",
                    size: "sm",
                    onClick: handleSignOut,
                    className:
                      "border-primary/40 bg-primary/10 text-foreground hover:bg-primary/20",
                    children: [_jsx(LogOut, { className: "mr-2 h-4 w-4" }), "Logout"],
                  }),
                ],
              }),
            ],
          }),
          _jsx("main", {
            className: "p-3 sm:p-5 lg:p-7 xl:p-8",
            children: _jsx("div", {
              className: "mx-auto w-full max-w-[1600px]",
              children: children,
            }),
          }),
        ],
      }),
    ],
  });
}
