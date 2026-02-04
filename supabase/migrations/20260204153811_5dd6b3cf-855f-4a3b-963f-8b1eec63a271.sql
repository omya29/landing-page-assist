-- Drop the permissive notification insert policy
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

-- Create a more restrictive policy: users can only create notifications for themselves or admins can create for anyone
CREATE POLICY "Users can create notifications for themselves" ON public.notifications
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = user_id OR public.is_admin(auth.uid()));