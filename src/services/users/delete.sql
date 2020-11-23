DELETE FROM users
WHERE
user_id = $1::varchar
AND
role_id != 5
RETURNING *