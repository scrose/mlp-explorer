-- Initialize Users Table

-- drop old users table
DROP TABLE IF EXISTS users;

-- drop old user roles table
DROP TABLE IF EXISTS user_roles;

-- create user roles table
CREATE TABLE IF NOT EXISTS user_roles (
id serial PRIMARY KEY,
role_id SMALLINT UNIQUE NOT NULL,
name VARCHAR (255) UNIQUE NOT NULL
);

 INSERT INTO user_roles (role_id, name) VALUES (1, 'Registered');
 INSERT INTO user_roles (role_id, name) VALUES (2, 'Editor');
 INSERT INTO user_roles (role_id, name) VALUES (3, 'Contributor');
 INSERT INTO user_roles (role_id, name) VALUES (4, 'Administrator');
 INSERT INTO user_roles (role_id, name) VALUES (5, 'Super-Administrator');

SELECT * FROM user_roles;


-- create new users table
CREATE TABLE IF NOT EXISTS users (
   id serial PRIMARY KEY,
   user_id VARCHAR (255) UNIQUE NOT NULL,
   role_id SMALLINT NOT NULL DEFAULT 1,
   email VARCHAR (255) UNIQUE NOT NULL,
   password VARCHAR (512) NOT NULL,
   salt_token VARCHAR (255) NOT NULL,
   reset_password_token VARCHAR (255),
   reset_password_expires TIMESTAMP,
   last_sign_in_at TIMESTAMP,
   last_sign_in_ip VARCHAR (255),
   created_at TIMESTAMP,
   updated_at TIMESTAMP,
   FOREIGN KEY (role_id) REFERENCES user_roles(role_id),
   CHECK (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,63}$'),
--   CHECK (user_id ~* '^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$'),
   CHECK (password ~* '^[a-fA-F0-9]+$'),
   CHECK (salt_token ~* '^[a-fA-F0-9]+$')
);

SELECT * FROM users;

-- add super-administrator
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
    'ITtqyWEPAEgQZEOwTUgOkyNuJ2bRvkUMiuLW1fOQ3FqNBzvS',
    'support@goruntime.ca',
    '901bf786cae896f5c1956bbd73e65819884d60e1a50a86eeea348019b715957e268f9fe35a45ec526a380c9958ef6c6be6d88d2bd7765b9bdaa7c94bd7839e8c',
    '7e80089dd09fad39ee935cd550109ceb',
    5,
    NOW()::timestamp,
    NOW()::timestamp
)
RETURNING *;

