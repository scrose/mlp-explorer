UPDATE users
SET
session_token = $3,
sign_in_count = sign_in_count + 1,
current_sign_in_at = NOW()::timestamp,
last_sign_in_at = NOW()::timestamp
WHERE
email = $1::varchar
AND
user_id = $2::varchar
RETURNING *