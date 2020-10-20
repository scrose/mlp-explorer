INSERT INTO users(
    email,
    encrypted_password,
    sign_in_count,
    current_sign_in_at,
    last_sign_in_at,
    current_sign_in_ip,
    last_sign_in_ip,
    created_at,
    updated_at,
    role
)
VALUES(
    $1::varchar,
    $2::varchar,
    $3::integer,
    $4::timestamp,
    $5::timestamp,
    $6::varchar,
    $7::varchar,
    $8::timestamp,
    $9::timestamp,
    $10::integer
)
RETURNING *