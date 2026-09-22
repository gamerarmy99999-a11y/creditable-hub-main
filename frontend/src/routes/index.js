import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

function HomeRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/dashboard", replace: true });
  }, [navigate]);

  return _jsx("main", {
    className: "flex min-h-screen items-center justify-center bg-background text-foreground",
    children: _jsx("p", {
      className: "text-sm text-muted-foreground",
      children: "Loading...",
    }),
  });
}

export const Route = createFileRoute("/")({
  component: HomeRedirect,
});
