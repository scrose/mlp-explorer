-- =========================================================
-- Schema Migration script: Users
-- =========================================================
-- Restore database to original:
-- db reset >>> psql -U boutrous mlp2 < path/to/original/meat.sql
-- db reset >>> psql -U boutrous mlp2 < /Users/boutrous/Workspace/NodeJS/db/meat.sql
-- db reset >>> psql -U boutrous mlp2 < /Users/boutrous/Workspace/NodeJS/mlp-db/meat.sql


drop table if exists users CASCADE;
drop table if exists user_roles CASCADE;


-- -------------------------------------------------------------
-- User Roles Table
-- -------------------------------------------------------------

CREATE TABLE IF NOT EXISTS user_roles
(
    id    serial PRIMARY KEY,
    name  VARCHAR(40) UNIQUE  NOT NULL,
    label VARCHAR(255) UNIQUE NOT NULL
);


-- -------------------------------------------------------------
--    Users
-- -------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users
(
    id                     serial PRIMARY KEY,
    user_id                VARCHAR(255) UNIQUE NOT NULL,
    role                   VARCHAR(40)         NOT NULL DEFAULT 'visitor',
    email                  VARCHAR(255) UNIQUE NOT NULL,
    password               VARCHAR(512)        NOT NULL,
    salt_token             VARCHAR(255)        NOT NULL,
    reset_password_token   VARCHAR(255),
    reset_password_expires TIMESTAMP,
    last_sign_in_at        TIMESTAMP,
    last_sign_in_ip        VARCHAR(255),
    created_at             TIMESTAMP,
    updated_at             TIMESTAMP,
    FOREIGN KEY (role) REFERENCES user_roles (name),
    CHECK (email ~* '^[a-zA-Z0-9_+&-]+(?:.[a-zA-Z0-9_+&-]+)*@(?:[a-zA-Z0-9-]+.)+[a-zA-Z]{2,7}$'),
    CHECK (password ~* '^[a-fA-F0-9]+$'),
    CHECK (salt_token ~* '^[a-fA-F0-9]+$')
);

-- -------------------------------------------------------------
--    Trigger to ensure single super-administrator
-- -------------------------------------------------------------

CREATE OR REPLACE FUNCTION restrict_registrations()
    RETURNS TRIGGER
    LANGUAGE PLPGSQL
AS
$$
DECLARE
    super_admin RECORD;
BEGIN
    SELECT *
    FROM users
    WHERE role = 'super_administrator'
    INTO super_admin;

    IF super_admin IS NOT NULL THEN
        RAISE EXCEPTION 'Super administrator already exists in users.';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER user_inserts
    BEFORE INSERT
    ON users
    FOR EACH ROW
    WHEN (NEW.role = 'super_administrator')
EXECUTE PROCEDURE restrict_registrations();



-- -------------------------------------------------------------
--    Initialize user roles
-- -------------------------------------------------------------

INSERT INTO user_roles (name, label)
VALUES ('visitor', 'Visitor'),
       ('registered', 'Registered'),
       ('editor', 'Editor'),
       ('contributor', 'Contributor'),
       ('administrator', 'Administrator'),
       ('super_administrator', 'Super-Administrator');


-- -------------------------------------------------------------
--    Permissions
-- -------------------------------------------------------------

--    Initialize view types
CREATE TYPE views AS ENUM ('list', 'show', 'edit', 'create', 'remove', 'login', 'logout', 'register');

--    Create permissions table
CREATE TABLE IF NOT EXISTS user_permissions
(
    id         serial PRIMARY KEY,
    model      VARCHAR(40)  NOT NULL,
    view       views,
    role       VARCHAR(512) NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE (model, view, role),
    FOREIGN KEY (model) REFERENCES node_types (name),
    FOREIGN KEY (role) REFERENCES user_roles (name)
);


-- -------------------------------------------------------------
--    Initialize permissions
-- -------------------------------------------------------------

INSERT INTO user_permissions (model, view, role, created_at, updated_at)
VALUES ('default', 'list', 'visitor', now(), now()),
       ('default', 'list', 'registered', now(), now()),
       ('default', 'list', 'contributor', now(), now()),
       ('default', 'list', 'editor', now(), now()),
       ('default', 'list', 'administrator', now(), now()),
       ('default', 'list', 'super_administrator', now(), now()),
       ('default', 'show', 'visitor', now(), now()),
       ('default', 'show', 'registered', now(), now()),
       ('default', 'show', 'contributor', now(), now()),
       ('default', 'show', 'editor', now(), now()),
       ('default', 'show', 'administrator', now(), now()),
       ('default', 'show', 'super_administrator', now(), now()),
       ('default', 'edit', 'contributor', now(), now()),
       ('default', 'edit', 'editor', now(), now()),
       ('default', 'edit', 'administrator', now(), now()),
       ('default', 'edit', 'super_administrator', now(), now()),
       ('default', 'create', 'editor', now(), now()),
       ('default', 'create', 'administrator', now(), now()),
       ('default', 'create', 'super_administrator', now(), now()),
       ('default', 'remove', 'editor', now(), now()),
       ('default', 'remove', 'administrator', now(), now()),
       ('default', 'remove', 'super_administrator', now(), now()),
       ('users', 'list', 'administrator', now(), now()),
       ('users', 'list', 'super_administrator', now(), now()),
       ('users', 'show', 'administrator', now(), now()),
       ('users', 'show', 'super_administrator', now(), now()),
       ('users', 'create', 'administrator', now(), now()),
       ('users', 'create', 'super_administrator', now(), now()),
       ('users', 'edit', 'administrator', now(), now()),
       ('users', 'edit', 'super_administrator', now(), now()),
       ('users', 'remove', 'administrator', now(), now()),
       ('users', 'remove', 'super_administrator', now(), now()),
       ('users', 'register', 'administrator', now(), now()),
       ('users', 'register', 'super_administrator', now(), now()),
       ('users', 'login', 'visitor', now(), now()),
       ('users', 'login', 'super_administrator', now(), now()),
       ('users', 'logout', 'registered', now(), now()),
       ('users', 'logout', 'contributor', now(), now()),
       ('users', 'logout', 'editor', now(), now()),
       ('users', 'logout', 'administrator', now(), now()),
       ('users', 'logout', 'super_administrator', now(), now())


-- -------------------------------------------------------------
--    Initialize Super-Administrator user
-- -------------------------------------------------------------

-- INSERT INTO users(user_id,
--                   email,
--                   password,
--                   salt_token,
--                   role,
--                   created_at,
--                   updated_at)
-- VALUES ($1::varchar,
--         $2::varchar,
--         $3::varchar,
--         $4::varchar,
--         'superadmin',
--         NOW()::timestamp,
--         NOW()::timestamp);