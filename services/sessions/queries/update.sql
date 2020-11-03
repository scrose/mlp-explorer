UPDATE sessions
SET
session_data = $3::json,
updated_at = NOW()::timestamp
WHERE
user_id = $1::varchar
AND
session_id = $2::varchar
RETURNING *