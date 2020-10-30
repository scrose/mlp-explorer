SELECT
    sessions.user_id AS user_id,
    sessions.session_id AS role_id,
FROM sessions
WHERE sessions.session_id=$1::varchar