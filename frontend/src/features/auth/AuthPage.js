import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { loginSchema } from "@/lib/schemas";
import { getCurrentUser, signInWithEmailPassword } from "@/services/auth-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrandMark } from "@/components/BrandMark";

export function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void getCurrentUser().then(({ user }) => {
      if (user) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const fieldErrors = {};
      for (const issue of parsed.error.issues) {
        fieldErrors[String(issue.path[0])] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    const { error } = await signInWithEmailPassword(parsed.data.email, parsed.data.password);
    setLoading(false);

    if (error) {
      console.error("[Auth] Sign-in failed:", error);
      if (error.code === "email_not_confirmed") {
        setFormError("Confirm your email address before signing in.");
      } else if (error.code === "invalid_credentials") {
        setFormError("Invalid email or password. Check both values and try again.");
      } else {
        setFormError(error.message || "Unable to sign in. Please try again.");
      }
      return;
    }

    toast.success("Welcome back");
    await navigate({ to: "/dashboard", replace: true });
  }

  return _jsx("div", {
    className:
      "flex min-h-screen items-center justify-center bg-background px-4 py-8 sm:px-6 lg:px-8",
    children: _jsxs("div", {
      className: "w-full max-w-md",
      children: [
        _jsxs("div", {
          className: "mb-8 flex flex-col items-center text-center",
          children: [
            _jsx("div", {
              className:
                "mb-5 flex h-32 w-32 items-center justify-center rounded-full border border-primary/40 bg-white shadow-[0_0_24px_rgba(236,72,153,0.18)]",
              children: _jsx(BrandMark, { className: "h-28 w-28" }),
            }),
            _jsx("h1", {
              className:
                "font-display text-2xl font-semibold tracking-[-0.05em] text-foreground sm:text-3xl",
              children: "Aradhna Small Finance",
            }),
            _jsx("p", {
              className: "mt-2 text-sm text-muted-foreground",
              children: "D-365, C Block, Sector 10, Noida, UP 201301",
            }),
          ],
        }),
        _jsxs(Card, {
          className:
            "border-border bg-white/90 shadow-[0_18px_60px_rgba(190,24,93,0.12)] backdrop-blur-sm",
          children: [
            _jsxs(CardHeader, {
              className: "pb-4",
              children: [
                _jsx(CardTitle, {
                  className: "text-xl text-foreground",
                  children: "Admin sign in",
                }),
                _jsx(CardDescription, {
                  className: "text-sm text-muted-foreground",
                  children: "Only authorised administrators can access this console.",
                }),
              ],
            }),
            _jsx(CardContent, {
              children: _jsxs("form", {
                onSubmit: handleSubmit,
                className: "space-y-4",
                noValidate: true,
                children: [
                  _jsxs("div", {
                    className: "space-y-2",
                    children: [
                      _jsx(Label, {
                        htmlFor: "email",
                        className: "text-sm text-foreground/90",
                        children: "Email",
                      }),
                      _jsx(Input, {
                        id: "email",
                        type: "email",
                        autoComplete: "email",
                        value: email,
                        onChange: (e) => setEmail(e.target.value),
                        placeholder: "admin@smallfinance.com",
                        className:
                          "h-11 border-input bg-white/80 text-base text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/60",
                      }),
                      errors["email"] &&
                        _jsx("p", {
                          className: "text-sm text-destructive",
                          children: errors["email"],
                        }),
                    ],
                  }),
                  _jsxs("div", {
                    className: "space-y-2",
                    children: [
                      _jsx(Label, {
                        htmlFor: "password",
                        className: "text-sm text-foreground/90",
                        children: "Password",
                      }),
                      _jsx(Input, {
                        id: "password",
                        type: "password",
                        autoComplete: "current-password",
                        value: password,
                        onChange: (e) => setPassword(e.target.value),
                        placeholder: "••••••••",
                        className:
                          "h-11 border-input bg-white/80 text-base text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/60",
                      }),
                      errors["password"] &&
                        _jsx("p", {
                          className: "text-sm text-destructive",
                          children: errors["password"],
                        }),
                    ],
                  }),
                  formError &&
                    _jsx("p", {
                      className:
                        "rounded-xl border border-pink-500/30 bg-pink-500/10 px-3 py-2 text-sm text-pink-200",
                      children: formError,
                    }),
                  _jsxs(Button, {
                    type: "submit",
                    className:
                      "h-11 w-full rounded-xl bg-gradient-to-r from-pink-600 via-fuchsia-500 to-rose-400 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(255,102,180,0.4)] transition hover:brightness-110",
                    disabled: loading,
                    children: [
                      loading && _jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
                      "Sign in",
                    ],
                  }),
                ],
              }),
            }),
          ],
        }),
      ],
    }),
  });
}
