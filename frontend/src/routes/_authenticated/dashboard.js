import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/features/dashboard/DashboardPage";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Aradhna Small Finance" },
      {
        name: "description",
        content: "Loan book overview: customers, amount lent, recovered and pending.",
      },
      { property: "og:title", content: "Dashboard — Aradhna Small Finance" },
      { property: "og:description", content: "Loan book overview for Aradhna Small Finance." },
    ],
  }),
  component: DashboardPage,
});
