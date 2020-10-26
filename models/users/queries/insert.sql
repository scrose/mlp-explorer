INSERT INTO users(
    email,
    role,
    encrypted_password,
    created_at,
    updated_at
)
VALUES(
    $1::text,
    $2::integer,
    $3::varchar,
    NOW()::timestamp,
    NOW()::timestamp
)
RETURNING *