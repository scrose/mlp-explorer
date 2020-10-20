/*
Users Table

To resolve seeded auto-increment: set the id_seq sequence value to the
MAX(id) of your existing users. For example:
SELECT setval(pg_get_serial_sequence('users', 'id'), coalesce(max(id)+1, 1), false)
*/

SELECT setval(pg_get_serial_sequence('users', 'id'), coalesce(max(id)+1, 1), false);

/* add user roles */
ALTER TABLE users ADD COLUMN IF NOT EXISTS role INT DEFAULT 1;

/* add roles table */
DROP TABLE IF EXISTS user_roles;

CREATE TABLE IF NOT EXISTS user_roles (
id serial PRIMARY KEY,
name VARCHAR (255) UNIQUE NOT NULL
);

-- INSERT INTO user_roles (name) VALUES ('Registered');
-- INSERT INTO user_roles (name) VALUES ('Editor');
-- INSERT INTO user_roles (name) VALUES ('Contributor');
-- INSERT INTO user_roles (name) VALUES ('Administrator');

SELECT * FROM user_roles;

/* add foreign key constraint on users table */
-- ALTER TABLE users
-- ADD CONSTRAINT fk_user_role
-- FOREIGN KEY (role) REFERENCES user_roles(id);

/* add constraints */
ALTER TABLE users
ADD CONSTRAINT valid_email
CHECK (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,63}$');

-- ALTER TABLE users
-- ADD CONSTRAINT valid_password
-- CHECK (password ~* '^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,10}$');
