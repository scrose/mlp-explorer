-- =========================================================
-- Schema Migration script
-- =========================================================
-- Restore database to original:
-- db reset >>> psql -U boutrous mlp2 < path/to/original/meat.sql
-- db reset >>> psql -U boutrous mlp2 < /Users/boutrous/Workspace/NodeJS/db/meat.sql
-- db reset >>> psql -U boutrous mlp2 < /Users/boutrous/Workspace/NodeJS/mlp-db/meat.sql

begin;

-- -------------------------------------------------------------
-- Enumerate types
-- -------------------------------------------------------------

--    Image states

DO
$$
    BEGIN
        CREATE TYPE image_states
            AS ENUM ('raw', 'interim', 'master', 'misc', 'gridded');
    EXCEPTION
        WHEN duplicate_object THEN null;
    END
$$;

--    Supplemental image types

DO
$$
    BEGIN
        CREATE TYPE image_types
            AS ENUM ('scenic', 'location');
    EXCEPTION
        WHEN duplicate_object THEN null;
    END
$$;


-- Image dimensions

DO
$$
    BEGIN
        CREATE TYPE dims AS
        (
            "x" integer,
            "y" integer,
            "bit_depth" integer
        );
    EXCEPTION
        WHEN duplicate_object THEN null;
    END
$$;

-- Image coordinates

DO
$$
    BEGIN
        CREATE TYPE coordinate AS
        (
            lat  double precision,
            long double precision,
            elev double precision,
            azim double precision
        );
    EXCEPTION
        WHEN duplicate_object THEN null;
    END
$$;

-- Camera settings

DO
$$
    BEGIN
        CREATE TYPE camera_settings AS
        (
            "f_stop"        double precision,
            "shutter_speed" double precision,
            "iso"           integer,
            "focal_length"  integer
        );
    EXCEPTION
        WHEN duplicate_object THEN null;
    END
$$;

--    Metadata types

DO
$$
    BEGIN
        CREATE TYPE metadata_types
            AS ENUM ('field_notes', 'ancillary');
    EXCEPTION
        WHEN duplicate_object THEN null;
    END
$$;

--    Participant group types

DO
$$
    BEGIN
        CREATE TYPE participant_group_types
            AS ENUM ('hiking_party', 'field_notes_authors', 'photographers');
    EXCEPTION
        WHEN duplicate_object THEN null;
    END
$$;

--    Model views

DO
$$
    BEGIN
        CREATE TYPE views
            AS ENUM ('list', 'show', 'edit', 'create', 'remove', 'login', 'logout', 'register');
    EXCEPTION
        WHEN duplicate_object THEN null;
    END
$$;


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
    EXCEPTION
        WHEN duplicate_table THEN null;
    END
$$;

-- -------------------------------------------------------------
-- Function: Rename Column
-- -------------------------------------------------------------

create or replace function rename_column(_tbl varchar(40),
                                         _col varchar(40),
                                         _colnew varchar(40)) RETURNS void
    LANGUAGE plpgsql as
$$
DECLARE
    _res RECORD;
begin
    execute 'SELECT column_name
                FROM information_schema.columns
                WHERE table_name=$1 and column_name=$2;' using _tbl, _col INTO _res;
    RAISE NOTICE '%', _res;
    IF _res IS NOT NULL
    THEN
        EXECUTE format('ALTER TABLE %s RENAME COLUMN %s TO %s;', _tbl, _col, _colnew);
    END IF;
END
$$;



-- -------------------------------------------------------------
-- Function: Convert text column to boolean type
-- -------------------------------------------------------------

create or replace function convert_boolean(_tbl varchar(40), _col varchar(40)) RETURNS void
    LANGUAGE plpgsql as
$$
begin
    execute format(E'alter table if exists %I alter COLUMN %s drop DEFAULT', _tbl, _col);
    execute format(E'alter table if exists %I alter %s TYPE bool
            USING CASE WHEN %s = \'t\' THEN TRUE ELSE FALSE END', _tbl, _col, _col);
    execute format(E'alter table if exists %I alter COLUMN %s SET DEFAULT FALSE;', _tbl, _col);
END
$$;



-- -------------------------------------------------------------
-- Function: Rename owner types to corresponding table names
-- -------------------------------------------------------------

create or replace function rename_owner_types(_tbl varchar(40)) RETURNS void
    LANGUAGE plpgsql as
$$
DECLARE
    r         RECORD;
    node_type RECORD;
begin
    for r in EXECUTE format('SELECT id, owner_type FROM %I', _tbl)
        loop
            -- look up node type name
            select * from node_types where label = r.owner_type INTO node_type;
            -- only proceed if update already done previously
            IF node_type.name is NOT NULL
            THEN
                RAISE NOTICE 'Converted Node Type: %', node_type;
                EXECUTE format(E'UPDATE %I SET owner_type = \'%s\' WHERE id=%s', _tbl, node_type.name, r.id);
            END IF;
        END LOOP;
END
$$;


-- -------------------------------------------------------------
-- Function: Insert node into nodes table
-- -------------------------------------------------------------

CREATE OR REPLACE FUNCTION add_node()
    RETURNS TRIGGER
    LANGUAGE PLPGSQL
AS
$$
DECLARE
    r RECORD;
BEGIN

    RAISE NOTICE 'Arguments: %s', TG_ARGV;
    -- Insert new record into nodes table
    execute 'insert into nodes (node_id, type, owner_type)
                VALUES ($1::integer, $2:varchar, $3:varchar) returning *;'
        using _tbl, _owner into r;

    RETURN r;
END;
$$;

-- -------------------------------------------------------------
-- Function: Update node in nodes table
-- -------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_node()
    RETURNS TRIGGER
    LANGUAGE PLPGSQL
AS
$$
DECLARE
    r RECORD;
BEGIN

    -- Update node record
    RAISE NOTICE 'Arguments: %s', TG_ARGV;
    execute 'update nodes set type=$2:varchar, owner_type=$3:varchar;' ||
            'where node_id=$1::integer returning *;'
        using NEW.id, _tbl, _owner into r;

    RETURN r;
END;
$$;

-- -------------------------------------------------------------
-- Function: Delete node in nodes table
-- -------------------------------------------------------------

CREATE OR REPLACE FUNCTION delete_node()
    RETURNS TRIGGER
    LANGUAGE PLPGSQL
AS
$$
BEGIN
    -- Delete node record
    RAISE NOTICE 'Arguments: %s', TG_ARGV;
    execute 'delete from nodes where id=$1::integer;'
        using _id;

    return _id;
END;
$$;



commit;


