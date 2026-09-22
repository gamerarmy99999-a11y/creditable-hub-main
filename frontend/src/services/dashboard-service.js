import { supabase } from "@/integrations/supabase/client";

export async function getDashboardStats() {
  const [{ data: customers }, { data: payments }] = await Promise.all([
    supabase
      .from("customers")
      .select("id, loan_amount, repayable_amount, total_paid, pending_amount"),
    supabase
      .from("payments")
      .select("id, amount, paid_date, paid_time, payment_method, customer_id, customers(name)")
      .order("paid_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const list = customers ?? [];

  return {
    totalCustomers: list.length,
    totalLent: list.reduce((sum, customer) => sum + Number(customer.loan_amount), 0),
    totalRecovered: list.reduce((sum, customer) => sum + Number(customer.total_paid), 0),
    totalPending: list.reduce((sum, customer) => sum + Number(customer.pending_amount), 0),
    recent: payments ?? [],
  };
}
