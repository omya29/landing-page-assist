
-- Remove foreign key constraint on profiles to allow demo data
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
