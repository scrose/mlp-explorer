-- ----------------
-- Node Types Table
-- ----------------
-- id |       name
-- ----+-------------------
--  1 | projects
--  2 | surveyors
--  3 | surveys
--  4 | survey_seasons
--  5 | stations
--  6 | historic_visits
--  7 | visits
--  8 | locations
--  9 | historic_captures
-- 10 | captures

-- db reset >>> psql -U boutrous mlp2 < /Users/boutrous/Workspace/NodeJS/db/meat.sql

DROP TABLE IF EXISTS node_types;

CREATE TABLE IF NOT EXISTS node_types (
id serial PRIMARY KEY,
name VARCHAR (40) UNIQUE NOT NULL,
label VARCHAR (40) NOT NULL
);

INSERT INTO node_types (name, label) VALUES ('projects', 'Project');
INSERT INTO node_types (name, label) VALUES ('surveyors', 'Surveyor');
INSERT INTO node_types (name, label) VALUES ('surveys', 'Survey');
INSERT INTO node_types (name, label) VALUES ('survey_seasons', 'SurveySeason');
INSERT INTO node_types (name, label) VALUES ('stations', 'Station');
INSERT INTO node_types (name, label) VALUES ('historic_visits', 'HistoricVisit');
INSERT INTO node_types (name, label) VALUES ('visits', 'Visit');
INSERT INTO node_types (name, label) VALUES ('locations', 'Location');
INSERT INTO node_types (name, label) VALUES ('historic_captures', 'HistoricCapture');
INSERT INTO node_types (name, label) VALUES ('captures', 'Capture');

SELECT * FROM node_types;

-- ----------------
-- Nodes Table
-- ----------------

DROP TABLE IF EXISTS nodes;

CREATE TABLE IF NOT EXISTS nodes (
  owner_id INT NOT NULL,
  owner_type VARCHAR (40) NOT NULL,
  dependent_id INT NOT NULL,
  dependent_type VARCHAR (40) NOT NULL,
  unique (owner_id, owner_type, dependent_id, dependent_type),
  CONSTRAINT fk_owner_type
    FOREIGN KEY(owner_type)
      REFERENCES node_types(name),
  CONSTRAINT fk_dependent_type
    FOREIGN KEY(dependent_type)
      REFERENCES node_types(name)
);

CREATE INDEX owner_index ON nodes (owner_id);
CREATE INDEX dependent_index ON nodes (dependent_id);

-- confirm table created
SELECT * FROM nodes;

-- function: rename column
BEGIN;
CREATE OR REPLACE FUNCTION rename_column(
                        _tbl varchar(40),
                        _col varchar(40),
                        _colnew varchar(40)
    ) RETURNS void LANGUAGE plpgsql AS $$
    DECLARE
        _res RECORD;
    BEGIN
        EXECUTE 'SELECT column_name
                FROM information_schema.columns
                WHERE table_name=$1 and column_name=$2;' USING _tbl, _col INTO _res;
        RAISE NOTICE '%', _res;
        IF _res IS NOT NULL
        THEN
            EXECUTE format('ALTER TABLE %s RENAME COLUMN %s TO %s;', _tbl, _col, _colnew);
        END IF;
    END $$;

-- function: rename owner type as table name
CREATE OR REPLACE FUNCTION rename_owner_types(_tbl regclass) RETURNS void LANGUAGE plpgsql AS $$
     DECLARE
        r RECORD;
        node_type RECORD;
     BEGIN
        FOR r IN EXECUTE format('SELECT id, owner_type FROM %I', _tbl)
        LOOP
                RAISE NOTICE '%', r;
                -- look up node type name
                SELECT * FROM node_types WHERE label = r.owner_type INTO node_type;
                -- only proceed if update already done previously
                IF node_type.name IS NOT NULL
                THEN
                    RAISE NOTICE 'Node Type: %', node_type;
                    EXECUTE format(E'UPDATE %I SET owner_type = \'%s\' WHERE id=%s', _tbl, node_type.name, r.id);
                END IF;
        END LOOP;
    END $$;

-- create node mappings
--    Projects (root owners)
--    Surveyors (root owners)
    -- update id auto-increment
    SELECT setval('surveyors_id_seq', (SELECT MAX(id) FROM surveyors)+1);

--    Surveys  (strictly owned by Surveyors)
    SELECT rename_column('surveys', 'surveyor_id', 'owner_id');
    SELECT rename_column('stations', 'station_owner_type', 'owner_type');
--    Survey Seasons  (strictly owned by Surveys)
--    Stations
    SELECT rename_column('stations', 'station_owner_id', 'owner_id');
    SELECT rename_column('stations', 'station_owner_type', 'owner_type');
    ALTER TABLE stations DROP CONSTRAINT IF EXISTS fk_owner;
--     ALTER TABLE stations ADD CONSTRAINT fk_owner
--         FOREIGN KEY(owner_id, owner_type)
--         REFERENCES nodes(owner_id, owner_type);
    SELECT rename_owner_types('stations');

--    Historic Visits (strictly owned by Stations)
--    Visits (strictly owned by Stations)
--    Locations (strictly owned by Visits)

--    Historic Captures
    SELECT rename_column('historic_captures', 'capture_owner_id', 'owner_id');
    SELECT rename_column('historic_captures', 'capture_owner_type', 'owner_type');
    ALTER TABLE historic_captures DROP CONSTRAINT IF EXISTS fk_owner;
--     ALTER TABLE historic_captures ADD CONSTRAINT fk_owner
--         FOREIGN KEY(owner_id, owner_type)
--             REFERENCES nodes(owner_id, owner_type);
    SELECT rename_owner_types('historic_captures');

--    Captures
    SELECT rename_column('captures', 'capture_owner_id', 'owner_id');
    SELECT rename_column('captures', 'capture_owner_type', 'owner_type');
    SELECT rename_owner_types('captures');

--    Capture Images (owned by either Captures or Historic Captures)
    SELECT rename_column('capture_images', 'captureable_id', 'owner_id');
    SELECT rename_column('capture_images', 'captureable_type', 'owner_type');
    SELECT rename_owner_types('capture_images');

--    Images
    SELECT rename_column('images', 'image_owner_id', 'owner_id');
    SELECT rename_column('images', 'image_owner_type', 'owner_type');
    SELECT rename_owner_types('images');

--    Location Photos
--    Image States
--    Image Types

--    Users (drop)
    DROP TABLE IF EXISTS users;

COMMIT;


