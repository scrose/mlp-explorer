UDATE sessions
SET
updated_at = NOW()::timestamp
WHERE session_id = $1::varchar
RETURNING *