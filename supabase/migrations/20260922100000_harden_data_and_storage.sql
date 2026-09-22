ALTER TABLE public.customers
  ADD CONSTRAINT customers_phone_format CHECK (phone ~ '^\d{10}$'),
  ADD CONSTRAINT customers_aadhar_format CHECK (aadhar_no ~ '^\d{12}$'),
  ADD CONSTRAINT customers_pan_format CHECK (pan_no ~ '^[A-Z]{5}[0-9]{4}[A-Z]$'),
  ADD CONSTRAINT customers_amounts_valid CHECK (
    loan_amount > 0 AND repayable_amount > 0 AND repayable_amount >= loan_amount
  ),
  ADD CONSTRAINT customers_totals_valid CHECK (
    total_paid >= 0 AND pending_amount >= 0 AND total_paid <= repayable_amount
  );

ALTER TABLE public.payments
  ADD CONSTRAINT payments_amount_valid CHECK (amount > 0);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('consent-forms', 'consent-forms', false, 5242880, ARRAY['application/pdf']::text[])
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['application/pdf']::text[];

CREATE POLICY "Admins can upload consent forms" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'consent-forms' AND private.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can read consent forms" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'consent-forms' AND private.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can replace consent forms" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'consent-forms' AND private.has_role(auth.uid(), 'admin'::public.app_role)
)
WITH CHECK (
  bucket_id = 'consent-forms' AND private.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can delete consent forms" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'consent-forms' AND private.has_role(auth.uid(), 'admin'::public.app_role)
);