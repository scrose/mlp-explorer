UPDATE users
SET
email = $2::text,
role_id = $3::integer,
updated_at = NOW()::timestamp
WHERE
user_id = $1::varchar
AND
role_id != 5
RETURNING *