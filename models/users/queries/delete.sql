DELETE FROM users
WHERE id = $1::integer
RETURNING *