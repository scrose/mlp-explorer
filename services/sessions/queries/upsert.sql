INSERT INTO sessions(
    session_id,
    expires,
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
    expires = TO_TIMESTAMP($2),
    session_data = $3::json
RETURNING *