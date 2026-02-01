-- Get the best review snippet for a dish
-- Priority: Highest-rated (9+) reviews first, then most recent
-- Used to show a preview on dish cards

CREATE OR REPLACE FUNCTION get_smart_snippet(p_dish_id UUID)
RETURNS TABLE (
  review_text TEXT,
  rating_10 DECIMAL,
  display_name TEXT,
  user_id UUID,
  review_created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.review_text,
    v.rating_10,
    p.display_name,
    v.user_id,
    v.review_created_at
  FROM votes v
  INNER JOIN profiles p ON v.user_id = p.id
  WHERE v.dish_id = p_dish_id
    AND v.review_text IS NOT NULL
    AND v.review_text != ''
  ORDER BY
    -- High ratings (9+) come first
    CASE WHEN v.rating_10 >= 9 THEN 0 ELSE 1 END,
    -- Then by rating descending
    v.rating_10 DESC NULLS LAST,
    -- Then by most recent
    v.review_created_at DESC NULLS LAST
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Grant access to authenticated users and anon (for public read)
GRANT EXECUTE ON FUNCTION get_smart_snippet(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_smart_snippet(UUID) TO anon;
