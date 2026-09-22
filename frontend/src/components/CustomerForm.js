import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from "react";
import { FileText, Loader2, Upload, X } from "lucide-react";
import { customerSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
const empty = {
  name: "",
  phone: "",
  address: "",
  account_no: "",
  aadhar_no: "",
  pan_no: "",
  loan_amount: 0,
  repayable_amount: 0,
  loan_date: new Date().toISOString().slice(0, 10),
  witness_name: "",
  witness_phone: "",
  witness_aadhar: "",
  witness_address: "",
};
export function CustomerForm({ defaultValues, existingConsentName, submitLabel, onSubmit }) {
  const [values, setValues] = useState({ ...empty, ...defaultValues });
  const [errors, setErrors] = useState({});
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);
  function set(key, value) {
    setValues((v) => ({ ...v, [key]: value }));
  }
  function pickFile(f) {
    setFileError("");
    if (!f) return;
    if (f.type !== "application/pdf") {
      setFileError("Only PDF files are allowed.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setFileError("File must be 5 MB or smaller.");
      return;
    }
    setFile(f);
  }
  async function handleSubmit(e) {
    e.preventDefault();
    const parsed = customerSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors = {};
      for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      await onSubmit(parsed.data, file);
    } finally {
      setSaving(false);
    }
  }
  const field = (key, label, props = {}) =>
    _jsxs("div", {
      className: "space-y-2",
      children: [
        _jsx(Label, { htmlFor: key, children: label }),
        _jsx(Input, {
          id: key,
          value: String(values[key] ?? ""),
          onChange: (e) =>
            set(key, props.type === "number" ? Number(e.target.value) : e.target.value),
          ...props,
        }),
        errors[key] && _jsx("p", { className: "text-sm text-destructive", children: errors[key] }),
      ],
    });
  return _jsxs("form", {
    onSubmit: handleSubmit,
    className: "space-y-6",
    noValidate: true,
    children: [
      _jsxs(Card, {
        children: [
          _jsx(CardHeader, { children: _jsx(CardTitle, { children: "Customer details" }) }),
          _jsxs(CardContent, {
            className: "grid gap-4 sm:grid-cols-2",
            children: [
              field("name", "Full name", { placeholder: "Mahendra Kumar" }),
              field("phone", "Phone number", {
                placeholder: "10 digits",
                inputMode: "numeric",
                maxLength: 10,
              }),
              field("account_no", "Account number", {
                placeholder: "5641000013214",
                inputMode: "numeric",
              }),
              field("aadhar_no", "Aadhaar number", {
                placeholder: "12 digits",
                inputMode: "numeric",
                maxLength: 12,
              }),
              field("pan_no", "PAN number", { placeholder: "ABCDE1234F", maxLength: 10 }),
              field("address", "Address", { placeholder: "Rampur" }),
            ],
          }),
        ],
      }),
      _jsxs(Card, {
        children: [
          _jsx(CardHeader, { children: _jsx(CardTitle, { children: "Loan details" }) }),
          _jsxs(CardContent, {
            className: "grid gap-4 sm:grid-cols-3",
            children: [
              field("loan_amount", "Loan amount (₹)", { type: "number", min: 1 }),
              field("repayable_amount", "Repayable amount (₹)", { type: "number", min: 1 }),
              field("loan_date", "Loan date", { type: "date" }),
            ],
          }),
        ],
      }),
      _jsxs(Card, {
        children: [
          _jsx(CardHeader, { children: _jsx(CardTitle, { children: "Witness details" }) }),
          _jsxs(CardContent, {
            className: "grid gap-4 sm:grid-cols-2",
            children: [
              field("witness_name", "Witness name", { placeholder: "Vishal" }),
              field("witness_phone", "Witness phone", { inputMode: "numeric", maxLength: 10 }),
              field("witness_aadhar", "Witness Aadhaar", { inputMode: "numeric", maxLength: 12 }),
              field("witness_address", "Witness address", { placeholder: "Rampur" }),
            ],
          }),
        ],
      }),
      _jsxs(Card, {
        children: [
          _jsxs(CardHeader, {
            children: [
              _jsx(CardTitle, { children: "Consent form" }),
              _jsx(CardDescription, { children: "PDF only, maximum 5 MB." }),
            ],
          }),
          _jsxs(CardContent, {
            className: "space-y-3",
            children: [
              _jsxs("div", {
                role: "button",
                tabIndex: 0,
                onClick: () => inputRef.current?.click(),
                onKeyDown: (e) => e.key === "Enter" && inputRef.current?.click(),
                onDragOver: (e) => {
                  e.preventDefault();
                  setDragging(true);
                },
                onDragLeave: () => setDragging(false),
                onDrop: (e) => {
                  e.preventDefault();
                  setDragging(false);
                  pickFile(e.dataTransfer.files[0] ?? null);
                },
                className: cn(
                  "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors",
                  dragging ? "border-primary bg-primary/5" : "border-input hover:bg-muted/50",
                ),
                children: [
                  _jsx(Upload, { className: "mb-2 h-6 w-6 text-muted-foreground" }),
                  _jsx("p", {
                    className: "text-sm font-medium",
                    children: "Drag and drop the signed consent PDF here",
                  }),
                  _jsx("p", {
                    className: "text-xs text-muted-foreground",
                    children: "or click to choose a file",
                  }),
                  _jsx("input", {
                    ref: inputRef,
                    type: "file",
                    accept: "application/pdf",
                    className: "hidden",
                    onChange: (e) => pickFile(e.target.files?.[0] ?? null),
                  }),
                ],
              }),
              fileError &&
                _jsx("p", { className: "text-sm text-destructive", children: fileError }),
              file
                ? _jsxs("div", {
                    className:
                      "flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2",
                    children: [
                      _jsxs("div", {
                        className: "flex min-w-0 items-center gap-2",
                        children: [
                          _jsx(FileText, { className: "h-4 w-4 shrink-0 text-muted-foreground" }),
                          _jsx("span", { className: "truncate text-sm", children: file.name }),
                          _jsxs("span", {
                            className: "shrink-0 text-xs text-muted-foreground",
                            children: [(file.size / 1024).toFixed(0), " KB"],
                          }),
                        ],
                      }),
                      _jsxs("div", {
                        className: "flex items-center gap-1",
                        children: [
                          _jsx(Button, {
                            type: "button",
                            variant: "ghost",
                            size: "sm",
                            onClick: () =>
                              window.open(
                                URL.createObjectURL(file),
                                "_blank",
                                "noopener,noreferrer",
                              ),
                            children: "Preview",
                          }),
                          _jsx(Button, {
                            type: "button",
                            variant: "ghost",
                            size: "icon",
                            onClick: () => setFile(null),
                            children: _jsx(X, { className: "h-4 w-4" }),
                          }),
                        ],
                      }),
                    ],
                  })
                : existingConsentName
                  ? _jsxs("p", {
                      className: "text-sm text-muted-foreground",
                      children: [
                        "Current file: ",
                        existingConsentName,
                        ". Upload a new PDF to replace it.",
                      ],
                    })
                  : null,
            ],
          }),
        ],
      }),
      _jsx("div", {
        className: "flex justify-end",
        children: _jsxs(Button, {
          type: "submit",
          disabled: saving,
          children: [
            saving && _jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
            submitLabel,
          ],
        }),
      }),
    ],
  });
}
