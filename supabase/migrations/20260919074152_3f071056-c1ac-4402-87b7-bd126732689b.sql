CREATE POLICY "Admins read consent forms" ON storage.objects
FOR SELECT TO authenticated USING (bucket_id = 'consent-forms' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins upload consent forms" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'consent-forms' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update consent forms" ON storage.objects
FOR UPDATE TO authenticated USING (bucket_id = 'consent-forms' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete consent forms" ON storage.objects
FOR DELETE TO authenticated USING (bucket_id = 'consent-forms' AND public.has_role(auth.uid(), 'admin'));