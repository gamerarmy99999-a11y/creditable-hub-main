CREATE TABLE public.security_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  table_name text NOT NULL,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX security_logs_created_at_idx ON public.security_logs(created_at DESC);
CREATE INDEX security_logs_actor_id_idx ON public.security_logs(actor_id);

GRANT SELECT ON public.security_logs TO authenticated;
GRANT ALL ON public.security_logs TO service_role;
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read security logs" ON public.security_logs
FOR SELECT TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE OR REPLACE FUNCTION public.log_security_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.security_logs (actor_id, action, table_name, record_id, old_data, new_data)
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

REVOKE ALL ON FUNCTION public.log_security_event() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.log_security_event() TO authenticated, service_role;

CREATE TRIGGER customers_security_log
AFTER INSERT OR UPDATE OR DELETE ON public.customers
FOR EACH ROW EXECUTE FUNCTION public.log_security_event();

CREATE TRIGGER payments_security_log
AFTER INSERT OR UPDATE OR DELETE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.log_security_event();

CREATE TRIGGER admin_profiles_security_log
AFTER INSERT OR UPDATE OR DELETE ON public.admin_profiles
FOR EACH ROW EXECUTE FUNCTION public.log_security_event();

CREATE OR REPLACE FUNCTION public.delete_expired_security_logs()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.security_logs
  WHERE created_at < now() - INTERVAL '3 months';
$$;

REVOKE ALL ON FUNCTION public.delete_expired_security_logs() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_expired_security_logs() TO service_role;

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
SELECT cron.schedule(
  'delete-expired-security-logs',
  '0 3 * * *',
  $$SELECT public.delete_expired_security_logs()$$
)
WHERE NOT EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'delete-expired-security-logs'
);