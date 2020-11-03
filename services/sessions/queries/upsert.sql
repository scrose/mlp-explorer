INSERT INTO sessions(
    user_id,
    session_id,
    session_data,
    created_at,
    updated_at
)
VALUES(
    $1::varchar,
    $2::varchar,
    $3::json,
    NOW()::timestamp,
    NOW()::timestamp
)
ON CONFLICT (user_id) DO UPDATE
SET
session_id = $2::varchar,
updated_at = NOW()::timestamp
RETURNING *