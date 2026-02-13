-- Fix conversation_participants INSERT to be permissive
DROP POLICY IF EXISTS "Users can add participants" ON public.conversation_participants;
CREATE POLICY "Users can add participants"
  ON public.conversation_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.uid() = user_id) OR is_conversation_participant(conversation_id, auth.uid())
  );