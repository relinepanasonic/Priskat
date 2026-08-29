-- Create a function to get mutual friends
CREATE OR REPLACE FUNCTION public.get_mutual_friends(p_user_id UUID)
RETURNS TABLE (
    mutual_user_id UUID,
    mutual_count BIGINT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
WITH my_friends AS (
    SELECT
        CASE
            WHEN requester_id = p_user_id THEN receiver_id
            ELSE requester_id
        END AS friend_id
    FROM public.friendships
    WHERE (requester_id = p_user_id OR receiver_id = p_user_id)
      AND status = 'accepted'
),
fof_pairs AS (
    SELECT
        CASE
            WHEN requester_id IN (SELECT friend_id FROM my_friends) THEN receiver_id
            ELSE requester_id
        END AS fof_id
    FROM public.friendships
    WHERE status = 'accepted'
      AND (
        (requester_id IN (SELECT friend_id FROM my_friends) AND receiver_id NOT IN (SELECT friend_id FROM my_friends))
        OR
        (receiver_id IN (SELECT friend_id FROM my_friends) AND requester_id NOT IN (SELECT friend_id FROM my_friends))
      )
)
SELECT fof_id AS mutual_user_id, COUNT(*) AS mutual_count
FROM fof_pairs
WHERE fof_id != p_user_id
GROUP BY fof_id
ORDER BY mutual_count DESC;
$$;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';

