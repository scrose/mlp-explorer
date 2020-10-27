UPDATE users
SET
sign_in_count = sign_in_count + 1,
current_sign_in_at = NOW()::timestamp,
session_token =
WHERE
email = $1::varchar
AND
encrypted_password = $2::varchar
RETURNING *