import { supabase } from "@/integrations/supabase/client";
export const CONSENT_BUCKET = "consent-forms";
export async function uploadConsent(customerId, file) {
  const path = `${customerId}/${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
  const { error } = await supabase.storage.from(CONSENT_BUCKET).upload(path, file, {
    contentType: "application/pdf",
    upsert: true,
  });
  if (error) throw error;
  return path;
}
export async function getConsentUrl(path) {
  const { data } = await supabase.storage.from(CONSENT_BUCKET).createSignedUrl(path, 300);
  return data?.signedUrl ?? null;
}
