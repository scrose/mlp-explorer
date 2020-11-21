INSERT INTO sessions(
    session_id,
    expire,
    session_data
)
VALUES(
    $1::varchar,
    TO_TIMESTAMP($2),
    $3::json
)
ON CONFLICT (session_id) DO UPDATE
SET
session_id = $1::varchar,
expire = TO_TIMESTAMP($2),
session_data = $3::json
RETURNING *