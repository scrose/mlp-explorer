UPDATE users
SET
email = $2::text,
encrypted_password = $3::varchar,
role = $4::integer,
updated_at = NOW()::timestamp
WHERE id = $1::integer
RETURNING *