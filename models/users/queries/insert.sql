INSERT INTO users(
    email,
    encrypted_password,
    role,
    created_at,
    updated_at
)
VALUES(
    $1::varchar,
    $2::varchar,
    $3::integer,
    NOW()::timestamp,
    NOW()::timestamp
)
RETURNING *