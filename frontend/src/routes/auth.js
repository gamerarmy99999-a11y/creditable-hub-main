import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "@/features/auth/AuthPage";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin Sign In — Aradhna Small Finance" },
      {
        name: "description",
        content: "Sign in to Aradhna Small Finance to manage customers, loans and repayments.",
      },
      { property: "og:title", content: "Admin Sign In — Aradhna Small Finance" },
      {
        property: "og:description",
        content: "Secure admin access to the Aradhna Small Finance lending book.",
      },
    ],
  }),
  component: AuthPage,
});
