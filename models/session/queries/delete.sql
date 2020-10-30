DELETE FROM sessions
WHERE
sessions.session_id = $1::varchar
RETURNING *