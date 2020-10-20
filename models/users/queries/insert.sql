INSERT INTO users(
    email,
    role,
    created_at,
    updated_at
)
VALUES(
    $1::text,
    $2::integer,
    NOW()::timestamp,
    NOW()::timestamp
)
RETURNING *