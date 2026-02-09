
-- Add community_id to posts to enable Reddit-style community posts
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS community_id uuid REFERENCES public.communities(id) ON DELETE SET NULL;

-- Create index for faster community post queries
CREATE INDEX IF NOT EXISTS idx_posts_community_id ON public.posts(community_id);

-- Add some demo posts to communities
UPDATE posts SET community_id = '7bdf8672-9e48-4e48-bd1c-f5668ffe2173' WHERE user_id = 'd7bfe021-695e-491c-b315-7d2079c3f6a0';
UPDATE posts SET community_id = '7bdf8672-9e48-4e48-bd1c-f5668ffe2173' WHERE user_id = '9297cfbb-4694-48aa-ad18-2e7bafaa4bc3';
UPDATE posts SET community_id = 'f314d1f2-e5b6-4837-a190-1bcf5f143b68' WHERE user_id = '9dde9a37-c534-4c6d-9ac6-f1964dd0806e';
