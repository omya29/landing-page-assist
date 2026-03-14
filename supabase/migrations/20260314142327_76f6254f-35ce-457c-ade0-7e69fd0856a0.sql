
-- Add image_url to posts
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS image_url text;

-- Add image_url to messages
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS image_url text;

-- Create storage bucket for post images
INSERT INTO storage.buckets (id, name, public) VALUES ('post-images', 'post-images', true) ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for message images
INSERT INTO storage.buckets (id, name, public) VALUES ('message-images', 'message-images', true) ON CONFLICT (id) DO NOTHING;

-- RLS policies for post-images bucket
CREATE POLICY "Anyone can view post images" ON storage.objects FOR SELECT USING (bucket_id = 'post-images');
CREATE POLICY "Authenticated users can upload post images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'post-images');
CREATE POLICY "Users can delete own post images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'post-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS policies for message-images bucket
CREATE POLICY "Anyone can view message images" ON storage.objects FOR SELECT USING (bucket_id = 'message-images');
CREATE POLICY "Authenticated users can upload message images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'message-images');

-- RLS policies for avatars bucket (ensure upload works)
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can update own avatars" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete own avatars" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
