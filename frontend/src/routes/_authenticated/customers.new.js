import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { uploadConsent } from "@/lib/consent";
import { CustomerForm } from "@/components/CustomerForm";
import {
  createCustomer,
  findDuplicateCustomer,
  updateCustomerConsent,
} from "@/services/customer-service";
export const Route = createFileRoute("/_authenticated/customers/new")({
  head: () => ({
    meta: [
      { title: "Add Customer — Aradhna Small Finance" },
      {
        name: "description",
        content: "Register a new loan customer with witness details and consent form.",
      },
      { property: "og:title", content: "Add Customer — Aradhna Small Finance" },
      {
        property: "og:description",
        content: "Register a new loan customer for Aradhna Small Finance.",
      },
    ],
  }),
  component: AddCustomerPage,
});
function AddCustomerPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return _jsxs("div", {
    className: "mx-auto max-w-4xl space-y-6",
    children: [
      _jsxs("div", {
        children: [
          _jsx("h1", { className: "text-2xl font-semibold", children: "Add customer" }),
          _jsx("p", {
            className: "text-sm text-muted-foreground",
            children: "Record a new loan under Aradhna Small Finance.",
          }),
        ],
      }),
      _jsx(CustomerForm, {
        submitLabel: "Save customer",
        onSubmit: async (values, file) => {
          const { data: dupe } = await findDuplicateCustomer(values.phone, values.aadhar_no);
          if (dupe) {
            toast.error("A customer with this phone number or Aadhaar already exists.");
            return;
          }
          const { data, error } = await createCustomer(values);
          if (error || !data) {
            toast.error(error?.message ?? "Could not save this customer");
            return;
          }
          if (file) {
            try {
              const path = await uploadConsent(data.id, file);
              await updateCustomerConsent(data.id, path);
            } catch {
              toast.warning("Customer saved, but the consent form could not be uploaded.");
            }
          }
          toast.success("Customer added successfully");
          void queryClient.invalidateQueries({ queryKey: ["customers"] });
          void queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
          void navigate({ to: "/customers/$id", params: { id: data.id } });
        },
      }),
    ],
  });
}
