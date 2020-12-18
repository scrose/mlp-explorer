-- =========================================================
-- Schema Migration: Users
-- =========================================================

drop table if exists users CASCADE;
drop table if exists user_roles CASCADE;
drop table if exists user_permissions CASCADE;

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

--    Create permissions table
CREATE TABLE IF NOT EXISTS user_permissions
(
    id         serial PRIMARY KEY,
    model      VARCHAR(40),
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
VALUES (null, 'list', 'visitor', now(), now()),
       (null, 'list', 'registered', now(), now()),
       (null, 'list', 'contributor', now(), now()),
       (null, 'list', 'editor', now(), now()),
       (null, 'list', 'administrator', now(), now()),
       (null, 'list', 'super_administrator', now(), now()),
       (null, 'show', 'visitor', now(), now()),
       (null, 'show', 'registered', now(), now()),
       (null, 'show', 'contributor', now(), now()),
       (null, 'show', 'editor', now(), now()),
       (null, 'show', 'administrator', now(), now()),
       (null, 'show', 'super_administrator', now(), now()),
       (null, 'edit', 'contributor', now(), now()),
       (null, 'edit', 'editor', now(), now()),
       (null, 'edit', 'administrator', now(), now()),
       (null, 'edit', 'super_administrator', now(), now()),
       (null, 'create', 'editor', now(), now()),
       (null, 'create', 'administrator', now(), now()),
       (null, 'create', 'super_administrator', now(), now()),
       (null, 'remove', 'editor', now(), now()),
       (null, 'remove', 'administrator', now(), now()),
       (null, 'remove', 'super_administrator', now(), now()),
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