import { supabase } from "@/integrations/supabase/client";

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  return { user: data?.user ?? null, error };
}

export async function signInWithEmailPassword(email, password) {
  return supabase.auth.signInWithPassword({ email, password });
}
