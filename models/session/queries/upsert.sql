INSERT INTO sessions(
    user_id,
    session_id,
    expires,
    created_at
)
VALUES(
    $1::varchar,
    $2::varchar,
    NOW()::timestamp,
    NOW()::timestamp,
)
ON CONFLICT (user_id)
DO
   UPDATE SET session_id = $2::varchar WHERE user_id = $1::varchar
RETURNING *