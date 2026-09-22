
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO service_role;

DROP POLICY "Admins manage customers" ON public.customers;
CREATE POLICY "Admins manage customers" ON public.customers FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY "Admins manage payments" ON public.payments;
CREATE POLICY "Admins manage payments" ON public.payments FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY "Admins read consent forms" ON storage.objects;
CREATE POLICY "Admins read consent forms" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'consent-forms' AND private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY "Admins upload consent forms" ON storage.objects;
CREATE POLICY "Admins upload consent forms" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'consent-forms' AND private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY "Admins update consent forms" ON storage.objects;
CREATE POLICY "Admins update consent forms" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'consent-forms' AND private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY "Admins delete consent forms" ON storage.objects;
CREATE POLICY "Admins delete consent forms" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'consent-forms' AND private.has_role(auth.uid(), 'admin'::public.app_role));

DROP FUNCTION public.has_role(uuid, public.app_role);
