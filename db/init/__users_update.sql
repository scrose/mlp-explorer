/*
Users Table

To resolve seeded auto-increment: set the id_seq sequence value to the
MAX(id) of your existing users. For example:
SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE(MAX(id) + 1, 1), false);
SELECT pg_catalog.setval(pg_get_serial_sequence('users', 'id'), MAX(id)) FROM users;
SELECT setval('users_id_seq', coalesce(max(id),0) + 1, false) FROM users;

-- Get next autoincrement value:
SELECT nextval(pg_get_serial_sequence('users', 'id'));
-- Set to new value
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id)+1 FROM users), 1), false);
*/

SELECT setval('users_id_seq', COALESCE((SELECT MAX(id)+1 FROM users), 1), false);

/* add user roles column */
ALTER TABLE users ADD COLUMN IF NOT EXISTS role INT DEFAULT 1;

/* ensure roles have default value and not null */
ALTER TABLE users ALTER COLUMN role SET DEFAULT 1;
ALTER TABLE users ALTER COLUMN role SET NOT NULL;

/* add roles table */
DROP TABLE IF EXISTS user_roles;

CREATE TABLE IF NOT EXISTS user_roles (
id serial PRIMARY KEY,
name VARCHAR (255) UNIQUE NOT NULL
);

 INSERT INTO user_roles (name) VALUES ('Registered');
 INSERT INTO user_roles (name) VALUES ('Editor');
 INSERT INTO user_roles (name) VALUES ('Contributor');
 INSERT INTO user_roles (name) VALUES ('Administrator');

SELECT * FROM user_roles;

/* add foreign key constraint on users table */
 ALTER TABLE users
 ADD CONSTRAINT fk_user_role
 FOREIGN KEY (role) REFERENCES user_roles(id);

/* add constraints */
ALTER TABLE users
ADD CONSTRAINT valid_email
CHECK (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,63}$');

-- ALTER TABLE users
 ADD CONSTRAINT valid_password
 CHECK (password ~* '^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,10}$');
