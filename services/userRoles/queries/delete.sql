DELETE FROM user_roles
WHERE role_id = $1::varchar
RETURNING *