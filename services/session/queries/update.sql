UPDATE sessions
SET
session_data = $2::varchar,
updated_at = NOW()::timestamp
WHERE session_id = $1::varchar
RETURNING *