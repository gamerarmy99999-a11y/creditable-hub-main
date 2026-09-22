import { supabase } from "@/integrations/supabase/client";

export async function createPayment(customerId, values) {
  return supabase
    .from("payments")
    .insert({
      customer_id: customerId,
      amount: values.amount,
      paid_date: values.paid_date,
      paid_time: values.paid_time,
      payment_method: values.payment_method,
      note: values.note || null,
    })
    .select("id")
    .single();
}

export async function getPayments({ search, method, from, to }) {
  let query = supabase
    .from("payments")
    .select(
      "id, amount, paid_date, paid_time, payment_method, note, customer:customers(id, name, phone, repayable_amount, pending_amount)",
    )
    .order("paid_date", { ascending: false })
    .order("paid_time", { ascending: false })
    .limit(500);
  if (method !== "all") query = query.eq("payment_method", method);
  if (from) query = query.gte("paid_date", from);
  if (to) query = query.lte("paid_date", to);
  const { data, error } = await query;
  if (error) throw error;
  const term = search.trim().toLowerCase();
  return (data ?? []).filter(
    (payment) =>
      !term ||
      payment.customer?.name.toLowerCase().includes(term) ||
      payment.customer?.phone.includes(term),
  );
}
