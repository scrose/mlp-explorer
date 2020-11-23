INSERT INTO users(
    user_id,
    email,
    password,
    salt_token,
    role_id,
    created_at,
    updated_at
)
VALUES(
    $1::varchar,
    $2::varchar,
    $3::varchar,
    $4::varchar,
    $5::integer,
    NOW()::timestamp,
    NOW()::timestamp
)
RETURNING user_id