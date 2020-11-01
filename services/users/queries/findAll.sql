SELECT
    users.user_id AS user_id,
    user_roles.role_id AS role_id,
    user_roles.name AS role,
    users.email,
    users.created_at,
    users.updated_at
FROM users
LEFT OUTER JOIN user_roles
ON users.role_id = user_roles.role_id