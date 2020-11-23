INSERT INTO user_roles(
name
)
VALUES(
$1::varchar
)
RETURNING *