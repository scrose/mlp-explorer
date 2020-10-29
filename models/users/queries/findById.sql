SELECT
    users.user_id AS user_id,
    user_roles.role_id AS role_id,
    user_roles.name AS role,
    users.email,
    users.password,
    users.reset_password_token,
    users.reset_password_sent_at,
    remember_created_at,
    users.sign_in_count,
    users.current_sign_in_at,
    users.last_sign_in_at,
    users.current_sign_in_ip,
    users.last_sign_in_ip,
    users.created_at,
    users.updated_at
FROM users
LEFT OUTER JOIN user_roles
ON users.role_id = user_roles.role_id
WHERE users.user_id=$1::integer