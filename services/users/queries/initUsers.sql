/*
--Users Table
--
--To resolve seeded auto-increment: set the id_seq sequence value to the
--MAX(id) of your existing users. For example:
--SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE(MAX(id) + 1, 1), false);
--SELECT pg_catalog.setval(pg_get_serial_sequence('users', 'id'), MAX(id)) FROM users;
--SELECT setval('users_id_seq', coalesce(max(id),0) + 1, false) FROM users;
--
---- Get next autoincrement value:
--SELECT nextval(pg_get_serial_sequence('users', 'id'));
---- Set to new value
--SELECT setval('users_id_seq', COALESCE((SELECT MAX(id)+1 FROM users), 1), false);
*/

--SELECT setval('users_id_seq', COALESCE((SELECT MAX(id)+1 FROM users), 1), false);
---- change user id to md5 value
--ALTER TABLE users ALTER COLUMN id TYPE VARCHAR;
--ALTER TABLE users ALTER COLUMN id DROP DEFAULT;
--ALTER TABLE users ALTER COLUMN id SET NOT NULL;
--
---- add unique user id
--ALTER TABLE users ADD COLUMN IF NOT EXISTS user_id VARCHAR;
--ALTER TABLE users ALTER COLUMN user_id SET NOT NULL;
--ALTER TABLE users ALTER COLUMN user_id SET UNIQUE;
--
--ALTER TABLE users ADD PRIMARY KEY (id);

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
   password VARCHAR (255) NOT NULL,
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
    '0d658f82d0651c19872d331401842823',
    'support@goruntime.ca',
'50945a1451c94825fda78d52e2e2e6d770cf79a0da2a98a2abe1d2e9c8639a9afd5d32fbaf14cdb1acb9817cb9fe8ca639ac051510437daea24d3c688253096c',
    'aa6f3e5aca77997c534d78df126e291d',
    5,
    NOW()::timestamp,
    NOW()::timestamp
)
RETURNING *

