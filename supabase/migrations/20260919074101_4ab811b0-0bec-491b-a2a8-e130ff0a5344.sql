CREATE TYPE public.app_role AS ENUM ('admin');
CREATE TYPE public.loan_status AS ENUM ('Active', 'Closed');
CREATE TYPE public.payment_method AS ENUM ('Cash', 'UPI', 'Bank Transfer', 'Cheque');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "Users can read their own roles" ON public.user_roles
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.admin_profiles (
  id uuid PRIMARY KEY,
  name text NOT NULL DEFAULT 'Admin',
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.admin_profiles TO authenticated;
GRANT ALL ON public.admin_profiles TO service_role;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage own profile" ON public.admin_profiles
FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL DEFAULT '',
  account_no text NOT NULL DEFAULT '',
  aadhar_no text NOT NULL,
  pan_no text NOT NULL DEFAULT '',
  loan_amount numeric(12,2) NOT NULL DEFAULT 0,
  repayable_amount numeric(12,2) NOT NULL DEFAULT 0,
  loan_date date NOT NULL DEFAULT current_date,
  status public.loan_status NOT NULL DEFAULT 'Active',
  witness_name text NOT NULL DEFAULT '',
  witness_phone text NOT NULL DEFAULT '',
  witness_aadhar text NOT NULL DEFAULT '',
  witness_address text NOT NULL DEFAULT '',
  consent_form_path text,
  lender text NOT NULL DEFAULT 'Shri Balaji Enterprises',
  total_paid numeric(12,2) NOT NULL DEFAULT 0,
  pending_amount numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (phone),
  UNIQUE (aadhar_no)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage customers" ON public.customers
FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  paid_date date NOT NULL DEFAULT current_date,
  paid_time time NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Kolkata')::time,
  payment_method public.payment_method NOT NULL DEFAULT 'Cash',
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX payments_customer_idx ON public.payments(customer_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage payments" ON public.payments
FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER customers_updated_at BEFORE UPDATE ON public.customers
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER admin_profiles_updated_at BEFORE UPDATE ON public.admin_profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.recalc_customer_totals()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE cid uuid; paid numeric(12,2);
BEGIN
  cid := COALESCE(NEW.customer_id, OLD.customer_id);
  SELECT COALESCE(SUM(amount), 0) INTO paid FROM public.payments WHERE customer_id = cid;
  UPDATE public.customers
    SET total_paid = paid,
        pending_amount = GREATEST(repayable_amount - paid, 0),
        status = CASE WHEN repayable_amount - paid <= 0 THEN 'Closed'::public.loan_status ELSE 'Active'::public.loan_status END
  WHERE id = cid;
  RETURN NULL;
END; $$;

CREATE TRIGGER payments_recalc AFTER INSERT OR UPDATE OR DELETE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.recalc_customer_totals();

CREATE OR REPLACE FUNCTION public.sync_customer_pending()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.pending_amount := GREATEST(NEW.repayable_amount - NEW.total_paid, 0);
  NEW.status := CASE WHEN NEW.repayable_amount - NEW.total_paid <= 0 THEN 'Closed'::public.loan_status ELSE 'Active'::public.loan_status END;
  RETURN NEW;
END; $$;

CREATE TRIGGER customers_sync_pending BEFORE INSERT OR UPDATE OF repayable_amount, total_paid ON public.customers
FOR EACH ROW EXECUTE FUNCTION public.sync_customer_pending();

INSERT INTO public.customers (id, name, phone, address, account_no, aadhar_no, pan_no, loan_amount, repayable_amount, loan_date, witness_name, witness_phone, witness_aadhar, witness_address) VALUES
('11111111-1111-4111-8111-111111111111','Mahendra Kumar','9259737824','Rampur','5641000013214','274309439450','TQEPS4200R',10000,11000,'2025-01-15','Vishal','9528673750','950451222895','Rampur'),
('22222222-2222-4222-8222-222222222222','Sunita Devi','9812345670','Sector 12, Noida','5641000013215','483920114567','AKQPS1122L',25000,28000,'2025-02-02','Ramesh Yadav','9811223344','562310998877','Sector 12, Noida'),
('33333333-3333-4333-8333-333333333333','Rajesh Sharma','9871122334','Ghaziabad','5641000013216','771029384756','BQRPS7788M',50000,57500,'2025-02-20','Anita Sharma','9899887766','665544332211','Ghaziabad'),
('44444444-4444-4444-8444-444444444444','Imran Khan','9990011223','Sector 62, Noida','5641000013217','990011223344','CDEPK9900N',15000,17000,'2025-03-05','Salim Khan','9990022113','112233445566','Sector 62, Noida'),
('55555555-5555-4555-8555-555555555555','Pooja Verma','9765432109','Greater Noida','5641000013218','334455667788','DEFPV3344Q',8000,9000,'2025-03-18','Kiran Verma','9765001122','223344556677','Greater Noida'),
('66666666-6666-4666-8666-666666666666','Ankit Gupta','9123456780','Indirapuram','5641000013219','556677889900','EFGPG5566R',30000,34500,'2025-04-01','Deepak Gupta','9123400990','778899001122','Indirapuram');

INSERT INTO public.payments (customer_id, amount, paid_date, paid_time, payment_method, note) VALUES
('11111111-1111-4111-8111-111111111111',2000,'2025-02-15','10:30:00','Cash','First installment'),
('11111111-1111-4111-8111-111111111111',3000,'2025-03-15','11:00:00','UPI',NULL),
('22222222-2222-4222-8222-222222222222',8000,'2025-03-02','09:45:00','Bank Transfer',NULL),
('22222222-2222-4222-8222-222222222222',5000,'2025-04-02','16:20:00','Cash',NULL),
('33333333-3333-4333-8333-333333333333',20000,'2025-03-20','12:10:00','Cheque','Cheque no 445566'),
('44444444-4444-4444-8444-444444444444',17000,'2025-04-05','14:00:00','UPI','Full and final'),
('55555555-5555-4555-8555-555555555555',3000,'2025-04-18','17:30:00','Cash',NULL),
('66666666-6666-4666-8666-666666666666',10000,'2025-05-01','10:00:00','UPI',NULL),
('66666666-6666-4666-8666-666666666666',5000,'2025-06-01','10:05:00','UPI',NULL);