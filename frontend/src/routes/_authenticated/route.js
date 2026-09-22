import { jsx as _jsx } from "react/jsx-runtime";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { getAdminRole, getCurrentUser } from "@/services/auth-service";
export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { user, error } = await getCurrentUser();
    if (error || !user) {
      console.error("[Auth] Session check failed:", error);
      throw redirect({ to: "/auth" });
    }
    const { role, error: roleError } = await getAdminRole(user.id);
    if (roleError || !role) {
      console.error("[Auth] Admin role check failed:", roleError ?? "Admin role missing");
      throw redirect({ to: "/auth" });
    }
    return { user };
  },
  component: () => _jsx(AppLayout, { children: _jsx(Outlet, {}) }),
});
