import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { uploadConsent } from "@/lib/consent";
import { CustomerForm } from "@/components/CustomerForm";
import { Skeleton } from "@/components/ui/skeleton";
import { getCustomerById, updateCustomer } from "@/services/customer-service";
export const Route = createFileRoute("/_authenticated/customers/$id/edit")({
  head: () => ({
    meta: [
      { title: "Edit Customer — Aradhna Small Finance" },
      { name: "description", content: "Update customer, loan, witness and consent form details." },
      { property: "og:title", content: "Edit Customer — Aradhna Small Finance" },
      { property: "og:description", content: "Update customer and loan details." },
    ],
  }),
  component: EditCustomerPage,
});
function EditCustomerPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const customer = useQuery({
    queryKey: ["customer", id],
    queryFn: () => getCustomerById(id),
  });
  if (customer.isLoading) return _jsx(Skeleton, { className: "h-96 w-full max-w-4xl" });
  if (!customer.data)
    return _jsx("p", {
      className: "text-sm text-muted-foreground",
      children: "Customer not found.",
    });
  const c = customer.data;
  return _jsxs("div", {
    className: "mx-auto max-w-4xl space-y-6",
    children: [
      _jsxs("div", {
        children: [
          _jsx("h1", { className: "text-2xl font-semibold", children: "Edit customer" }),
          _jsx("p", { className: "text-sm text-muted-foreground", children: c.name }),
        ],
      }),
      _jsx(CustomerForm, {
        submitLabel: "Save changes",
        existingConsentName: c.consent_form_path
          ? (c.consent_form_path.split("/").pop() ?? null)
          : null,
        defaultValues: {
          name: c.name,
          phone: c.phone,
          address: c.address,
          account_no: c.account_no,
          aadhar_no: c.aadhar_no,
          pan_no: c.pan_no,
          loan_amount: Number(c.loan_amount),
          repayable_amount: Number(c.repayable_amount),
          loan_date: c.loan_date,
          witness_name: c.witness_name,
          witness_phone: c.witness_phone,
          witness_aadhar: c.witness_aadhar,
          witness_address: c.witness_address,
        },
        onSubmit: async (values, file) => {
          const totalPaid = Number(c.total_paid ?? 0);
          if (values.repayable_amount < totalPaid) {
            toast.error(`Repayable amount cannot be less than total paid (${totalPaid}).`);
            return;
          }
          let consentPath = c.consent_form_path;
          if (file) {
            try {
              consentPath = await uploadConsent(id, file);
            } catch {
              toast.warning("The consent form could not be uploaded.");
            }
          }
          const { error } = await updateCustomer(id, values, consentPath);
          if (error) {
            toast.error(
              error.code === "23505"
                ? "Another customer already uses this phone number or Aadhaar."
                : "Could not save changes",
            );
            return;
          }
          toast.success("Customer updated");
          void queryClient.invalidateQueries({ queryKey: ["customer", id] });
          void queryClient.invalidateQueries({ queryKey: ["customers"] });
          void navigate({ to: "/customers/$id", params: { id } });
        },
      }),
    ],
  });
}
