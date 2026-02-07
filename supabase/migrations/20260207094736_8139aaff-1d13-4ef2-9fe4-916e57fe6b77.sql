
-- Drop the foreign key constraint on posts table to allow demo data
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_user_id_fkey;

-- Insert sample posts from the demo users
INSERT INTO public.posts (user_id, content, hashtags) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Just completed my first React project! Feeling proud 🚀', ARRAY['react', 'webdev', 'coding']),
  ('22222222-2222-2222-2222-222222222222', 'Campus placement season is here! Any tips for interviews?', ARRAY['placements', 'career', 'tips']),
  ('33333333-3333-3333-3333-333333333333', 'Looking for study group for upcoming DSA exam. DM if interested!', ARRAY['dsa', 'studygroup', 'exams']),
  ('44444444-4444-4444-4444-444444444444', 'Reminder: AI/ML workshop submissions due by Friday. Don''t miss out!', ARRAY['aiml', 'workshop', 'deadline']),
  ('55555555-5555-5555-5555-555555555555', 'Great session on database normalization today. Keep practicing!', ARRAY['database', 'dbms', 'learning']);
