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
    name  VARCHAR(40) UNIQUE  NOT NULL CHECK (name ~ '^[\w]+$'),
    label VARCHAR(255) UNIQUE NOT NULL
);

-- -------------------------------------------------------------
--    Initialize user roles
-- -------------------------------------------------------------

INSERT INTO user_roles (name, label)
VALUES ('visitor', 'Visitor'),
       ('registered', 'Registered'),
       ('editor', 'Editor'),
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
    role       VARCHAR(40),
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    UNIQUE (view, role),
    FOREIGN KEY (role) REFERENCES user_roles (name)
);


-- -------------------------------------------------------------
--    Initialize permissions
-- -------------------------------------------------------------

INSERT INTO user_permissions (view, role, created_at, updated_at)
VALUES  ('show', 'visitor', now(), now()),
        ('show', 'registered', now(), now()),
        ('show', 'editor', now(), now()),
        ('show', 'administrator', now(), now()),
        ('show', 'super_administrator', now(), now()),

        ('edit', 'editor', now(), now()),
        ('edit', 'administrator', now(), now()),
        ('edit', 'super_administrator', now(), now()),

        ('move', 'editor', now(), now()),
        ('move', 'administrator', now(), now()),
        ('move', 'super_administrator', now(), now()),

        ('create', 'editor', now(), now()),
        ('create', 'administrator', now(), now()),
        ('create', 'super_administrator', now(), now()),

        ('remove', 'administrator', now(), now()),
        ('remove', 'super_administrator', now(), now()),

        ('options', 'visitor', now(), now()),
        ('options', 'registered', now(), now()),
        ('options', 'editor', now(), now()),
        ('options', 'administrator', now(), now()),
        ('options', 'super_administrator', now(), now()),

        ('settings', 'administrator', now(), now()),
        ('settings', 'super_administrator', now(), now()),

        ('login', 'visitor', now(), now()),
        ('auth', 'visitor', now(), now()),
        ('refresh', 'visitor', now(), now()),
        ('logout', 'visitor', now(), now()),

        ('filter', 'visitor', now(), now()),
        ('filter', 'registered', now(), now()),
        ('filter', 'editor', now(), now()),
        ('filter', 'administrator', now(), now()),
        ('filter', 'super_administrator', now(), now()),

        ('search', 'visitor', now(), now()),
        ('search', 'registered', now(), now()),
        ('search', 'editor', now(), now()),
        ('search', 'administrator', now(), now()),
        ('search', 'super_administrator', now(), now()),

        ('tree', 'visitor', now(), now()),
        ('tree', 'registered', now(), now()),
        ('tree', 'editor', now(), now()),
        ('tree', 'administrator', now(), now()),
        ('tree', 'super_administrator', now(), now()),

        ('map', 'visitor', now(), now()),
        ('map', 'registered', now(), now()),
        ('map', 'editor', now(), now()),
        ('map', 'administrator', now(), now()),
        ('map', 'super_administrator', now(), now()),

        ('download', 'visitor', now(), now()),
        ('download', 'editor', now(), now()),
        ('download', 'administrator', now(), now()),
        ('download', 'super_administrator', now(), now()),

        ('raw', 'editor', now(), now()),
        ('raw', 'administrator', now(), now()),
        ('raw', 'super_administrator', now(), now()),

        ('compare', 'editor', now(), now()),
        ('compare', 'administrator', now(), now()),
        ('compare', 'super_administrator', now(), now()),

        ('master', 'administrator', now(), now()),
        ('master', 'super_administrator', now(), now()),

        ('import', 'administrator', now(), now()),
        ('import', 'super_administrator', now(), now()),

        ('export', 'visitor', now(), now()),
        ('export', 'registered', now(), now()),
        ('export', 'editor', now(), now()),
        ('export', 'administrator', now(), now()),
        ('export', 'super_administrator', now(), now()),

        ('upload', 'administrator', now(), now()),
        ('upload', 'super_administrator', now(), now());

-- -------------------------------------------------------------
--    End
-- -------------------------------------------------------------