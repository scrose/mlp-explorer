UPDATE users
SET
last_sign_in_at = NOW()::timestamp
WHERE
email = $1::varchar
AND
encrypted_password = $2::varchar
RETURNING *