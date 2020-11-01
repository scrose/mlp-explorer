UPDATE user_roles
SET name = $2::varchar
WHERE role_id = $1::varchar
RETURNING *