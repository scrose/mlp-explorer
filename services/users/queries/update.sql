UPDATE users
SET
email = $2::text,
password = $3::varchar,
salt_token = $4::varchar,
role_id = $5::integer,
updated_at = NOW()::timestamp
WHERE
user_id = $1::varchar
AND
role_id != 5
RETURNING *