UDATE sessions
SET
session_id = $2::varchar,
updated_at = NOW()::timestamp
WHERE user_id = $1::varchar
RETURNING *