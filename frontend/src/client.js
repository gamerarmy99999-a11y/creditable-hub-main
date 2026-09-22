import { jsx as _jsx } from "react/jsx-runtime";
import { StrictMode, startTransition } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { StartClient } from "@tanstack/react-start/client";
import { getRouter } from "./router";

const hasStartBootstrap = typeof window !== "undefined" && Boolean(window.$_TSR);

startTransition(() => {
  const app = _jsx(StrictMode, {
    children: hasStartBootstrap
      ? _jsx(StartClient, {})
      : _jsx(RouterProvider, { router: getRouter() }),
  });
  if (hasStartBootstrap) hydrateRoot(document, app);
  else createRoot(document).render(app);
});
