
-- Create resources table
CREATE TABLE public.resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  department TEXT,
  subject TEXT,
  year TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'other',
  file_size BIGINT NOT NULL DEFAULT 0,
  download_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Resources are viewable by all authenticated users"
ON public.resources FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Authenticated users can upload resources"
ON public.resources FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resources"
ON public.resources FOR UPDATE TO authenticated
USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users can delete own resources or admins"
ON public.resources FOR DELETE TO authenticated
USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- Updated_at trigger
CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON public.resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('resources', 'resources', true);

-- Storage RLS policies
CREATE POLICY "Authenticated users can upload resources"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'resources' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view resources"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'resources');

CREATE POLICY "Users can delete own resources or admins"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'resources' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin(auth.uid())));
