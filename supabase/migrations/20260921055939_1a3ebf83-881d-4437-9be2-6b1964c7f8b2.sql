ALTER TABLE public.customers ALTER COLUMN lender SET DEFAULT 'Aradhna Small Finance';
UPDATE public.customers SET lender = 'Aradhna Small Finance' WHERE lender = 'Shri Balaji Enterprises';