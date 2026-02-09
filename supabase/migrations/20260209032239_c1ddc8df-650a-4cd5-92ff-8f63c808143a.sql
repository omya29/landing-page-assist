
-- Remove foreign key constraint on community_members to allow demo data
ALTER TABLE public.community_members DROP CONSTRAINT IF EXISTS community_members_user_id_fkey;
