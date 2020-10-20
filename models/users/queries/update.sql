UPDATE users
SET
email = $2::text,
role = $3::integer,
updated_at = NOW()::timestamp
WHERE id = $1::integer
RETURNING *