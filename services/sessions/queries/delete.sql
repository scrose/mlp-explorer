DELETE FROM sessions
WHERE
session_id = $1::varchar
RETURNING *