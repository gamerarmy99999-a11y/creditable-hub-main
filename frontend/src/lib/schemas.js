import { z } from "zod";
export const PAYMENT_METHODS = ["Cash", "UPI", "Bank Transfer", "Cheque"];
export const customerSchema = z
  .object({
    name: z.string().trim().min(2, "Name is required").max(100),
    phone: z
      .string()
      .trim()
      .regex(/^\d{10}$/, "Phone must be exactly 10 digits"),
    address: z.string().trim().min(2, "Address is required").max(200),
    account_no: z
      .string()
      .trim()
      .regex(/^\d{6,20}$/, "Account number must be numeric"),
    aadhar_no: z
      .string()
      .trim()
      .regex(/^\d{12}$/, "Aadhaar must be exactly 12 digits"),
    pan_no: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, "PAN must look like ABCDE1234F"),
    loan_amount: z.coerce.number().positive("Loan amount must be greater than 0"),
    repayable_amount: z.coerce.number().positive("Repayable amount must be greater than 0"),
    loan_date: z.string().min(1, "Loan date is required"),
    witness_name: z.string().trim().min(2, "Witness name is required").max(100),
    witness_phone: z
      .string()
      .trim()
      .regex(/^\d{10}$/, "Witness phone must be 10 digits"),
    witness_aadhar: z
      .string()
      .trim()
      .regex(/^\d{12}$/, "Witness Aadhaar must be 12 digits"),
    witness_address: z.string().trim().min(2, "Witness address is required").max(200),
  })
  .refine((v) => v.repayable_amount >= v.loan_amount, {
    message: "Repayable amount cannot be less than the loan amount",
    path: ["repayable_amount"],
  });
export const paymentSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  payment_method: z.enum(PAYMENT_METHODS),
  paid_date: z.string().min(1, "Date is required"),
  paid_time: z.string().min(1, "Time is required"),
  note: z.string().trim().max(300).optional().or(z.literal("")),
});
export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
});
export const passwordChangeSchema = z
  .object({
    current_password: z.string().min(1, "Enter your current password"),
    new_password: z.string().min(8, "New password must be at least 8 characters").max(72),
    confirm_password: z.string(),
  })
  .refine((v) => v.new_password === v.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });
