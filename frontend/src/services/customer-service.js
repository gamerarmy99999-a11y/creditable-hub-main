import { supabase } from "@/integrations/supabase/client";

const CUSTOMER_SUMMARY =
  "id, name, phone, account_no, status, repayable_amount, pending_amount";

export async function getCustomerById(id) {
  const { data, error } = await supabase.from("customers").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function getCustomerPayments(id) {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("customer_id", id)
    .order("paid_date", { ascending: false })
    .order("paid_time", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function deleteCustomer(id) {
  return supabase.from("customers").delete().eq("id", id);
}

export async function searchCustomers({ name, phone }) {
  let query = supabase.from("customers").select(CUSTOMER_SUMMARY);
  if (name?.trim()) query = query.ilike("name", `%${name.trim()}%`);
  if (phone?.trim()) query = query.ilike("phone", `%${phone.trim()}%`);
  return query.order("name").limit(20);
}

export async function getCustomerSummary(id) {
  return supabase.from("customers").select(CUSTOMER_SUMMARY).eq("id", id).single();
}

export async function createCustomer(values) {
  return supabase
    .from("customers")
    .insert({ ...values, pending_amount: values.repayable_amount })
    .select("id")
    .single();
}

export async function findDuplicateCustomer(phone, aadharNo) {
  return supabase
    .from("customers")
    .select("id, phone, aadhar_no")
    .or(`phone.eq.${phone},aadhar_no.eq.${aadharNo}`)
    .maybeSingle();
}

export async function updateCustomerConsent(id, path) {
  return supabase.from("customers").update({ consent_form_path: path }).eq("id", id);
}
