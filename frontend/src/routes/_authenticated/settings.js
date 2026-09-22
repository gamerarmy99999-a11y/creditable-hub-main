import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import { passwordChangeSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck } from "lucide-react";
export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Aradhna Small Finance" },
      { name: "description", content: "Update admin name, email and password." },
      { property: "og:title", content: "Settings — Aradhna Small Finance" },
      { property: "og:description", content: "Manage the admin account." },
    ],
  }),
  component: SettingsPage,
});
function SettingsPage() {
  const admin = useAdmin();
  const queryClient = useQueryClient();
  const securityLogs = useQuery({
    queryKey: ["security-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("security_logs")
        .select("id, action, table_name, record_id, created_at")
        .order("created_at", { ascending: false })
        .limit(25);
      if (error) throw error;
      return data ?? [];
    },
  });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  useEffect(() => {
    if (admin.data) {
      setName(admin.data.name);
      setEmail(admin.data.email);
    }
  }, [admin.data]);
  if (admin.isLoading) return _jsx(Skeleton, { className: "h-96 w-full max-w-2xl" });
  const saveProfile = async (e) => {
    e.preventDefault();
    if (!admin.data) return;
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      toast.error("Name is required");
      return;
    }
    setSavingProfile(true);
    const { error } = await supabase
      .from("admin_profiles")
      .upsert({ id: admin.data.id, name: trimmed, email: admin.data.email });
    setSavingProfile(false);
    if (error) {
      toast.error("Could not save your name");
      return;
    }
    toast.success("Profile updated");
    void queryClient.invalidateQueries({ queryKey: ["admin-profile"] });
  };
  const saveEmail = async (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Enter a valid email address");
      return;
    }
    setSavingProfile(true);
    const { error } = await supabase.auth.updateUser({ email: trimmed });
    setSavingProfile(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Confirmation link sent to the new email address");
  };
  const savePassword = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const parsed = passwordChangeSchema.safeParse({
      current_password: form.get("current_password"),
      new_password: form.get("new_password"),
      confirm_password: form.get("confirm_password"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check the password fields");
      return;
    }
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({
      password: parsed.data.new_password,
      current_password: parsed.data.current_password,
    });
    setSavingPassword(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    e.target.reset?.();
    toast.success("Password changed");
  };
  return _jsxs("div", {
    className: "mx-auto max-w-2xl space-y-6",
    children: [
      _jsxs("div", {
        children: [
          _jsx("h1", { className: "text-2xl font-semibold", children: "Settings" }),
          _jsx("p", {
            className: "text-sm text-muted-foreground",
            children: "Manage the admin account for Aradhna Small Finance.",
          }),
        ],
      }),
      _jsxs(Card, {
        children: [
          _jsxs(CardHeader, {
            children: [
              _jsx(CardTitle, { children: "Profile" }),
              _jsx(CardDescription, { children: "Your display name appears in the top bar." }),
            ],
          }),
          _jsx(CardContent, {
            children: _jsxs("form", {
              onSubmit: saveProfile,
              className: "flex items-end gap-3",
              children: [
                _jsxs("div", {
                  className: "flex-1 space-y-1.5",
                  children: [
                    _jsx(Label, { htmlFor: "name", children: "Name" }),
                    _jsx(Input, {
                      id: "name",
                      value: name,
                      onChange: (e) => setName(e.target.value),
                      maxLength: 100,
                    }),
                  ],
                }),
                _jsx(Button, {
                  type: "submit",
                  disabled: savingProfile,
                  children: savingProfile ? "Saving…" : "Save",
                }),
              ],
            }),
          }),
        ],
      }),
      _jsxs(Card, {
        children: [
          _jsxs(CardHeader, {
            children: [
              _jsx(CardTitle, { children: "Sign-in email" }),
              _jsx(CardDescription, {
                children: "Changing your email requires confirming a link sent to the new address.",
              }),
            ],
          }),
          _jsx(CardContent, {
            children: _jsxs("form", {
              onSubmit: saveEmail,
              className: "flex items-end gap-3",
              children: [
                _jsxs("div", {
                  className: "flex-1 space-y-1.5",
                  children: [
                    _jsx(Label, { htmlFor: "email", children: "Email" }),
                    _jsx(Input, {
                      id: "email",
                      type: "email",
                      value: email,
                      onChange: (e) => setEmail(e.target.value),
                    }),
                  ],
                }),
                _jsx(Button, {
                  type: "submit",
                  disabled: savingProfile,
                  children: savingProfile ? "Saving…" : "Update email",
                }),
              ],
            }),
          }),
        ],
      }),
      _jsxs(Card, {
        children: [
          _jsxs(CardHeader, {
            children: [
              _jsx(CardTitle, { children: "Change password" }),
              _jsx(CardDescription, {
                children: "Use at least 8 characters with a mix of letters, numbers and symbols.",
              }),
            ],
          }),
          _jsx(CardContent, {
            children: _jsxs("form", {
              onSubmit: savePassword,
              className: "space-y-4",
              children: [
                _jsxs("div", {
                  className: "space-y-1.5",
                  children: [
                    _jsx(Label, { htmlFor: "current_password", children: "Current password" }),
                    _jsx(Input, {
                      id: "current_password",
                      name: "current_password",
                      type: "password",
                      autoComplete: "current-password",
                      required: true,
                    }),
                  ],
                }),
                _jsxs("div", {
                  className: "space-y-1.5",
                  children: [
                    _jsx(Label, { htmlFor: "new_password", children: "New password" }),
                    _jsx(Input, {
                      id: "new_password",
                      name: "new_password",
                      type: "password",
                      autoComplete: "new-password",
                      required: true,
                    }),
                  ],
                }),
                _jsxs("div", {
                  className: "space-y-1.5",
                  children: [
                    _jsx(Label, { htmlFor: "confirm_password", children: "Confirm new password" }),
                    _jsx(Input, {
                      id: "confirm_password",
                      name: "confirm_password",
                      type: "password",
                      autoComplete: "new-password",
                      required: true,
                    }),
                  ],
                }),
                _jsx(Button, {
                  type: "submit",
                  disabled: savingPassword,
                  children: savingPassword ? "Changing…" : "Change password",
                }),
              ],
            }),
          }),
        ],
      }),
      _jsxs(Card, {
        children: [
          _jsxs(CardHeader, {
            children: [
              _jsxs(CardTitle, {
                className: "flex items-center gap-2",
                children: [
                  _jsx(ShieldCheck, { className: "h-5 w-5 text-primary" }),
                  " Security logs",
                ],
              }),
              _jsx(CardDescription, {
                children:
                  "Recent data changes are recorded for security review and automatically deleted after three months.",
              }),
            ],
          }),
          _jsx(CardContent, {
            children: securityLogs.isLoading
              ? _jsx(Skeleton, { className: "h-24 w-full" })
              : securityLogs.data?.length
                ? _jsx("div", {
                    className: "divide-y divide-border rounded-lg border border-border",
                    children: securityLogs.data.map((log) =>
                      _jsxs(
                        "div",
                        {
                          className: "flex items-center justify-between gap-3 px-3 py-2.5 text-sm",
                          children: [
                            _jsxs("div", {
                              className: "min-w-0",
                              children: [
                                _jsxs("p", {
                                  className: "font-medium",
                                  children: [log.action, " ", log.table_name],
                                }),
                                _jsx("p", {
                                  className: "truncate text-xs text-muted-foreground",
                                  children: log.record_id ?? "System event",
                                }),
                              ],
                            }),
                            _jsx("time", {
                              className: "shrink-0 text-xs text-muted-foreground",
                              dateTime: log.created_at,
                              children: new Date(log.created_at).toLocaleString(),
                            }),
                          ],
                        },
                        log.id,
                      ),
                    ),
                  })
                : _jsx("p", {
                    className: "text-sm text-muted-foreground",
                    children: "No security events recorded yet.",
                  }),
          }),
        ],
      }),
    ],
  });
}
