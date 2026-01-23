-- =============================================
-- NOTIFICATIONS TABLE
-- =============================================

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'follow', 'badge', etc.
  data JSONB DEFAULT '{}', -- Flexible data storage
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only update (mark as read) their own notifications
DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Only system can insert (via trigger or service role)
DROP POLICY IF EXISTS "notifications_insert_system" ON notifications;
CREATE POLICY "notifications_insert_system" ON notifications
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- =============================================
-- TRIGGER: Create notification on new follow
-- =============================================

CREATE OR REPLACE FUNCTION notify_on_follow()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  follower_name TEXT;
BEGIN
  -- Get follower's display name
  SELECT display_name INTO follower_name
  FROM profiles
  WHERE id = NEW.follower_id;

  -- Insert notification for the followed user
  INSERT INTO notifications (user_id, type, data)
  VALUES (
    NEW.followed_id,
    'follow',
    jsonb_build_object(
      'follower_id', NEW.follower_id,
      'follower_name', COALESCE(follower_name, 'Someone')
    )
  );

  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_notify_on_follow ON follows;
CREATE TRIGGER trigger_notify_on_follow
  AFTER INSERT ON follows
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_follow();

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT CASE
    WHEN auth.role() = 'service_role' OR auth.uid() = p_user_id THEN
      (
        SELECT COUNT(*)::INTEGER
        FROM notifications
        WHERE user_id = p_user_id AND read = FALSE
      )
    ELSE
      0
  END;
$$;

-- Mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS VOID
LANGUAGE SQL
SECURITY DEFINER
AS $$
  UPDATE notifications
  SET read = TRUE
  WHERE user_id = p_user_id
    AND read = FALSE
    AND (auth.role() = 'service_role' OR auth.uid() = p_user_id);
$$;
