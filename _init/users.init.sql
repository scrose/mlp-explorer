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
    view       views,
    role       VARCHAR(512) NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    UNIQUE (view, role),
    FOREIGN KEY (role) REFERENCES user_roles (name)
);


-- -------------------------------------------------------------
--    Initialize permissions
-- -------------------------------------------------------------

INSERT INTO user_permissions (view, role, created_at, updated_at)
VALUES  ('list', 'visitor', now(), now()),
        ('list', 'registered', now(), now()),
        ('list', 'editor', now(), now()),
        ('list', 'administrator', now(), now()),
        ('list', 'super_administrator', now(), now()),
        ('show', 'visitor', now(), now()),
        ('show', 'registered', now(), now()),
        ('show', 'contributor', now(), now()),
        ('show', 'editor', now(), now()),
        ('show', 'administrator', now(), now()),
        ('show', 'super_administrator', now(), now()),
        ('edit', 'contributor', now(), now()),
        ('edit', 'editor', now(), now()),
        ('edit', 'administrator', now(), now()),
        ('edit', 'super_administrator', now(), now()),
        ('create', 'editor', now(), now()),
        ('create', 'administrator', now(), now()),
        ('create', 'super_administrator', now(), now()),
        ('remove', 'editor', now(), now()),
        ('remove', 'administrator', now(), now()),
        ('remove', 'super_administrator', now(), now()),
        ('login', 'visitor', now(), now()),
        ('auth', 'visitor', now(), now()),
        ('refresh', 'visitor', now(), now()),
        ('logout', 'visitor', now(), now()),
        ('download', 'contributor', now(), now()),
        ('download', 'editor', now(), now()),
        ('download', 'administrator', now(), now()),
        ('download', 'super_administrator', now(), now()),
        ('master', 'administrator', now(), now()),
        ('master', 'super_administrator', now(), now()),
        ('import', 'editor', now(), now()),
        ('import', 'administrator', now(), now()),
        ('import', 'super_administrator', now(), now()),
        ('export', 'visitor', now(), now()),
        ('export', 'contributor', now(), now()),
        ('export', 'editor', now(), now()),
        ('export', 'administrator', now(), now()),
        ('export', 'super_administrator', now(), now()),
        ('upload', 'editor', now(), now()),
        ('upload', 'administrator', now(), now()),
        ('upload', 'super_administrator', now(), now());

-- -------------------------------------------------------------
--    End
-- -------------------------------------------------------------