UPDATE users
SET
sign_in_count = 0,
session_token = NULL
WHERE
email = $1::varchar
AND
user_id = $2::varchar
RETURNING *