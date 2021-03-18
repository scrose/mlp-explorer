-- =========================================================
-- Schema Migration script
-- =========================================================
-- Restore database to original:
-- db reset >>> psql -U boutrous mlp2 < path/to/original/meat.sql
-- db reset >>> psql -U boutrous mlp2 < /Users/boutrous/Workspace/NodeJS/db/meat.sql
-- db reset >>> psql -U boutrous mlp2 < /Users/boutrous/Workspace/NodeJS/mlp-db/meat.sql

begin;

-- -------------------------------------------------------------
-- Rename old tables
-- -------------------------------------------------------------

DO
$$
    BEGIN
        alter table if exists projects
            rename to "old_projects";
        alter table if exists surveyors
            rename to "old_surveyors";
        alter table if exists surveys
            rename to "old_surveys";
        alter table if exists survey_seasons
            rename to "old_survey_seasons";
        alter table if exists stations
            rename to "old_stations";
        alter table if exists historic_visits
            rename to "old_historic_visits";
        alter table if exists visits
            rename to "old_visits";
        alter table if exists locations
            rename to "old_locations";
        alter table if exists historic_captures
            rename to "old_historic_captures";
        alter table if exists captures
            rename to "old_captures";
        alter table if exists capture_images
            rename to "old_capture_images";
        alter table if exists images
            rename to "old_images";
        alter table if exists metadata_files
            rename to "old_metadata_files";
        alter table if exists field_notes
            rename to "old_field_notes";
        alter table if exists glass_plate_listings
            rename to "old_glass_plate_listings";
        alter table if exists maps
            rename to "old_maps";
        alter table if exists fn_authors_visits
            rename to "old_fn_authors_visits";
        alter table if exists photographers_visits
            rename to "old_photographers_visits";
        alter table if exists hiking_parties
            rename to "old_hiking_parties";
    EXCEPTION
        WHEN duplicate_table THEN null;
    END
$$;


-- -------------------------------------------------------------
-- Views
-- -------------------------------------------------------------

DO
$$
    BEGIN
        CREATE TYPE views
        AS ENUM (
            'list',
            'show',
            'edit',
            'create',
            'remove',
            'login',
            'auth',
            'refresh',
            'logout',
            'register',
            'download',
            'upload',
            'import',
            'export',
            'master'
            );
    EXCEPTION
        WHEN duplicate_object THEN null;
    END
$$;

-- -------------------------------------------------------------
--    Options table
-- -------------------------------------------------------------

CREATE TABLE IF NOT EXISTS options
(
    id    serial PRIMARY KEY,
    name  VARCHAR(40) UNIQUE NOT NULL,
    label VARCHAR(40) UNIQUE NOT NULL,
    value VARCHAR(255),
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


-- -------------------------------------------------------------
--    Initialize options
-- -------------------------------------------------------------

INSERT INTO options (name, label, value, created_at, updated_at)
VALUES ('library_root_dir', 'MLP Library Root Directory', '/Volumes/mlp/MLPLibraryNew', now(), now());

commit;


