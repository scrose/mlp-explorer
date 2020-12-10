-- ----------------
-- Node Types Table
-- ----------------
-- id |       type
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
-- db reset >>> psql -U boutrous mlp2 < /Users/boutrous/Workspace/NodeJS/mlp-db/meat.sql

DROP TABLE IF EXISTS node_types;

CREATE TABLE node_types (
id serial PRIMARY KEY,
type VARCHAR (40) UNIQUE NOT NULL,
label VARCHAR (40) NOT NULL
);

INSERT INTO node_types (type, label) VALUES ('projects', 'Project');
INSERT INTO node_types (type, label) VALUES ('surveyors', 'Surveyor');
INSERT INTO node_types (type, label) VALUES ('surveys', 'Survey');
INSERT INTO node_types (type, label) VALUES ('survey_seasons', 'SurveySeason');
INSERT INTO node_types (type, label) VALUES ('stations', 'Station');
INSERT INTO node_types (type, label) VALUES ('historic_visits', 'HistoricVisit');
INSERT INTO node_types (type, label) VALUES ('visits', 'Visit');
INSERT INTO node_types (type, label) VALUES ('locations', 'Location');
INSERT INTO node_types (type, label) VALUES ('historic_captures', 'HistoricCapture');
INSERT INTO node_types (type, label) VALUES ('captures', 'Capture');
INSERT INTO node_types (type, label) VALUES ('capture_images', 'CaptureImage');
INSERT INTO node_types (type, label) VALUES ('images', 'Image');

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
  UNIQUE (owner_id, owner_type, dependent_id, dependent_type),
  CONSTRAINT ck_same_type CHECK (owner_type != dependent_type),
  CONSTRAINT fk_owner_type FOREIGN KEY(owner_type) REFERENCES node_types(type),
  CONSTRAINT fk_dependent_type FOREIGN KEY(dependent_type) REFERENCES node_types(type)
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
                RAISE NOTICE 'Existing ID, Node Type: %', r;
                -- look up node type name
                SELECT * FROM node_types WHERE label = r.owner_type INTO node_type;
                -- only proceed if update already done previously
                IF node_type.type IS NOT NULL
                THEN
                    RAISE NOTICE 'Converted Node Type: %', node_type;
                    EXECUTE format(E'UPDATE %I SET owner_type = \'%s\' WHERE id=%s', _tbl, node_type.type, r.id);
                END IF;
        END LOOP;
    END $$;

/**
===========================
Enumerated Types
===========================
*/

--    Participant Groups

    DROP TABLE IF EXISTS participant_group_types;
    CREATE TABLE IF NOT EXISTS participant_group_types (
         id SERIAL PRIMARY KEY NOT NULL,
         type varchar(40) NOT NULL,
         UNIQUE(type)
    );

    INSERT INTO participant_group_types (type)
    VALUES ('hiking_party'), ('field_notes_authors'), ('photographers');

    DROP TABLE IF EXISTS participant_groups;
    CREATE TABLE IF NOT EXISTS participant_groups (
        owner_id INTEGER NOT NULL,
        participant_id INTEGER NOT NULL,
        group_type varchar (40) NOT NULL,
        created_at timestamp NOT NULL,
        updated_at timestamp NOT NULL,
        UNIQUE (owner_id, participant_id, group_type),
        CONSTRAINT fk_owner_type FOREIGN KEY(owner_id) REFERENCES visits(id),
        CONSTRAINT fk_participant FOREIGN KEY(participant_id) REFERENCES participants(id),
        CONSTRAINT fk_group_type FOREIGN KEY(group_type) REFERENCES participant_group_types(type)
    );

--    Copy existing participant table data into merged participant groups
--      fn_authors_visits: {participant_id, visit_id}
--      hiking_parties: {participant_id, visit_id}
--      photographers_visits: {participant_id, visit_id}

    INSERT INTO participant_groups (owner_id, participant_id, group_type, created_at, updated_at)
    SELECT visit_id, participant_id, 'field_notes_authors', NOW(), NOW()
    FROM fn_authors_visits
    WHERE participant_id IS NOT NULL;

    DROP TABLE fn_authors_visits;

    INSERT INTO participant_groups (owner_id, participant_id, group_type, created_at, updated_at)
    SELECT visit_id, participant_id, 'hiking_party', created_at, updated_at FROM hiking_parties
    WHERE participant_id IS NOT NULL;

    DROP TABLE hiking_parties;

    INSERT INTO participant_groups (owner_id, participant_id, group_type, created_at, updated_at)
    SELECT visit_id, participant_id, 'photographers', NOW(), NOW() FROM photographers_visits
    WHERE participant_id IS NOT NULL;

    DROP TABLE photographers_visits;


--    Metadata Files

    DROP TABLE IF EXISTS metadata_types;
    CREATE TABLE IF NOT EXISTS metadata_types (
                     id SERIAL PRIMARY KEY NOT NULL,
                     type varchar(40) NOT NULL,
                     UNIQUE(type)
    );

    INSERT INTO metadata_types (type)
    VALUES ('field_notes'), ('ancillary');

    SELECT rename_column('metadata_files', 'metadata_owner_id', 'owner_id');
    SELECT rename_column('metadata_files', 'metadata_owner_type', 'owner_type');
    SELECT rename_column('metadata_files', 'metadata_file', 'filename');
    SELECT rename_owner_types('metadata_files');
    SELECT setval('metadata_files_id_seq', (SELECT MAX(id) FROM metadata_files)+1);

    -- Add metadata type column
    DO $$
        BEGIN
            BEGIN
                ALTER TABLE metadata_files ADD COLUMN metadata_type varchar(40) DEFAULT 'ancillary';
                UPDATE metadata_files SET metadata_type = 'ancillary';
            EXCEPTION
                WHEN duplicate_column THEN RAISE NOTICE 'Column "metadata_type" already exists in metadata_files.';
            END;
        END;
    $$;

    -- Metadata files constraints

    ALTER TABLE metadata_files ALTER COLUMN owner_id SET NOT NULL;
    ALTER TABLE metadata_files ALTER COLUMN filename SET NOT NULL;

    ALTER TABLE metadata_files DROP CONSTRAINT IF EXISTS fk_metadata_type;
    ALTER TABLE metadata_files ADD CONSTRAINT fk_metadata_type
       FOREIGN KEY(metadata_type) REFERENCES metadata_types(type);

    ALTER TABLE metadata_files DROP CONSTRAINT IF EXISTS fk_metadata_owner_type;
    ALTER TABLE metadata_files ADD CONSTRAINT fk_metadata_owner_type
        FOREIGN KEY(owner_type) REFERENCES node_types(type);

    --    Copy existing field_notes table data into metadata files table

    INSERT INTO metadata_files (owner_id,
                                owner_type,
                                metadata_type,
                                filename,
                                created_at,
                                updated_at)
    SELECT visit_id,
           'visits',
           'field_notes',
           field_note_file,
           created_at,
           updated_at
    FROM field_notes;

    DROP TABLE field_notes;

--    Shutter speeds

    DROP TABLE IF EXISTS shutter_speeds;
    CREATE TABLE IF NOT EXISTS shutter_speeds (
        id SERIAL PRIMARY KEY NOT NULL,
        speed varchar(40),
        UNIQUE(speed)
      );

    INSERT INTO shutter_speeds (speed)
    VALUES ('30'), ('25'), ('20'), ('15'), ('13'), ('10'), ('8'), ('6'),
           ('5'), ('4'), ('3.2'), ('2.5'), ('2'), ('1.6'), ('1.3'), ('1'),
           ('0.8'), ('0.6'), ('0.5'), ('0.4'), ('0.3'), ('1/4'), ('1/5'),
           ('1/6'), ('1/8'), ('1/10'), ('1/13'), ('1/15'), ('1/20'),
           ('1/25'), ('1/30'), ('1/40'), ('1/50'), ('1/60'), ('1/80'),
           ('1/100'), ('1/125'), ('1/160'), ('1/200'), ('1/250'),
           ('1/320'), ('1/400'), ('1/500'), ('1/640'), ('1/800'),
           ('1/1000'), ('1/1250'), ('1/1600'), ('1/2000'), ('1/2500'),
           ('1/3200'), ('1/4000'), ('1/8000');

--    ISO settings
    DROP TABLE IF EXISTS iso;
    CREATE TABLE IF NOT EXISTS iso (
        id SERIAL PRIMARY KEY NOT NULL,
        setting INTEGER
    );

    INSERT INTO shutter_speeds (speed)
    VALUES (50), (100), (125), (160), (200), (250), (320), (400), (500), (640),
           (800), (1000), (1250), (1600), (2000), (2500), (3200), (4000), (5000),
           (6400), (12800), (25600), (51200), (102400);

/**
===========================
Model schema updates
===========================
*/


--    Projects (root owners)
    SELECT setval('projects_id_seq', (SELECT MAX(id) FROM projects)+1);


--    Surveyors (root owners)
    -- update id auto-increment
    SELECT setval('surveyors_id_seq', (SELECT MAX(id) FROM surveyors)+1);


--    Surveys  (strictly owned by Surveyors)
    SELECT rename_column('surveys', 'surveyor_id', 'owner_id');
    SELECT setval('surveys_id_seq', (SELECT MAX(id) FROM surveys)+1);

    -- Foreign key constraint
    ALTER TABLE surveys DROP CONSTRAINT IF EXISTS fk_owner_id;
    ALTER TABLE surveys ADD CONSTRAINT fk_owner_id FOREIGN KEY(owner_id) REFERENCES surveyors(id);

--    Survey Seasons  (strictly owned by Surveys)
    SELECT rename_column('survey_seasons', 'survey_id', 'owner_id');
    SELECT setval('survey_seasons_id_seq', (SELECT MAX(id) FROM survey_seasons)+1);

    -- Foreign key constraint
    ALTER TABLE survey_seasons DROP CONSTRAINT IF EXISTS fk_owner_id;
    ALTER TABLE survey_seasons ADD CONSTRAINT fk_owner_id FOREIGN KEY(owner_id) REFERENCES surveys(id);

    -- Year constraint
    ALTER TABLE survey_seasons DROP CONSTRAINT IF EXISTS check_year;
    ALTER TABLE survey_seasons ADD CONSTRAINT check_year
    CHECK (survey_seasons.year > 1700 AND survey_seasons.year <= EXTRACT(YEAR FROM NOW()));


--    Stations
    SELECT rename_column('stations', 'station_owner_id', 'owner_id');
    SELECT rename_column('stations', 'station_owner_type', 'owner_type');
    SELECT rename_owner_types('stations');
    SELECT setval('stations_id_seq', (SELECT MAX(id) FROM stations)+1);

--     ALTER TABLE stations ADD CONSTRAINT fk_owner
--         FOREIGN KEY(owner_id, owner_type)
--         REFERENCES nodes(owner_id, owner_type);

--    Map stations in nodes table
--    insert into nodes (parent_id, parent_type_id, child_id, child_type_id)
--      select parent_id, parent_type_id, id, (
--        select id from node_types where name='surveys'
--      ) from surveys;

    -- Latitude/Longitude constraints
--    ALTER TABLE stations DROP CONSTRAINT IF EXISTS check_latitude;
--    ALTER TABLE stations ADD CONSTRAINT check_latitude
--    CHECK (stations.lat ~* '^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$')
--
--    ALTER TABLE stations DROP CONSTRAINT IF EXISTS check_longitude;
--    ALTER TABLE stations ADD CONSTRAINT check_longitude
--    CHECK (stations.long ~* '^[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$')

--    Historic Visits (strictly owned by Stations)
    SELECT rename_column('historic_visits', 'station_id', 'owner_id');

    SELECT setval('historic_visits_id_seq', (SELECT MAX(id) FROM historic_visits)+1);


--    Visits (strictly owned by Stations)
    SELECT rename_column('visits', 'station_id', 'owner_id');

    SELECT setval('visits_id_seq', (SELECT MAX(id) FROM visits)+1);


--    Locations (strictly owned by Visits)
    SELECT rename_column('locations', 'visit_id', 'owner_id');

    SELECT setval('locations_id_seq', (SELECT MAX(id) FROM locations)+1);

-- Latitude/Longitude constraints
--    ALTER TABLE stations DROP CONSTRAINT IF EXISTS check_latitude;
--    ALTER TABLE stations ADD CONSTRAINT check_latitude
--    CHECK (stations.lat ~* '^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$')
--
--    ALTER TABLE stations DROP CONSTRAINT IF EXISTS check_longitude;
--    ALTER TABLE stations ADD CONSTRAINT check_longitude
--    CHECK (stations.long ~* '^[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$')

--    Historic Captures
    SELECT rename_column('historic_captures', 'capture_owner_id', 'owner_id');
    SELECT rename_column('historic_captures', 'capture_owner_type', 'owner_type');

      -- Foreign key constraint
--    ALTER TABLE historic_captures DROP CONSTRAINT IF EXISTS fk_owner;
--    ALTER TABLE historic_captures ADD CONSTRAINT fk_owner
--         FOREIGN KEY(owner_id, owner_type)
--             REFERENCES nodes(owner_id, owner_type);

    SELECT rename_owner_types('historic_captures');

    SELECT setval('historic_captures_id_seq', (SELECT MAX(id) FROM historic_captures)+1);


--    Captures
    SELECT rename_column('captures', 'capture_owner_id', 'owner_id');
    SELECT rename_column('captures', 'capture_owner_type', 'owner_type');
    SELECT rename_owner_types('captures');

    SELECT setval('captures_id_seq', (SELECT MAX(id) FROM captures)+1);


--    Capture Images (owned by either Captures or Historic Captures)
    SELECT rename_column('capture_images', 'captureable_id', 'owner_id');
    SELECT rename_column('capture_images', 'captureable_type', 'owner_type');
    SELECT rename_owner_types('capture_images');

    SELECT setval('capture_images_id_seq', (SELECT MAX(id) FROM capture_images)+1);

--    ALTER TABLE stations DROP CONSTRAINT IF EXISTS check_capture_type;
--    ALTER TABLE stations ADD CONSTRAINT check_capture_type
--    CHECK (capture_images.owner_type = ANY (ARRAY['captures', 'historic_captures']);)


--    Images
    SELECT rename_column('images', 'image_owner_id', 'owner_id');
    SELECT rename_column('images', 'image_owner_type', 'owner_type');
    SELECT rename_owner_types('images');

-- TODO: convert ScenicImage and LocationImage image types to scenic and location
--    ALTER TABLE stations DROP CONSTRAINT IF EXISTS check_image_type;
--    ALTER TABLE stations ADD CONSTRAINT check_image_type
--    CHECK (images.type = ANY (ARRAY['scenic', 'location']);)

    SELECT setval('images_id_seq', (SELECT MAX(id) FROM images)+1);

--    Location Photos
    DROP TABLE IF EXISTS location_photos;

--    TODO: Image States
--    TODO: Image Types

--    Cameras
SELECT setval('cameras_id_seq', (SELECT MAX(id) FROM cameras)+1);

--    Lens
SELECT setval('lens_id_seq', (SELECT MAX(id) FROM lens)+1);

--    Users (drop)
    DROP TABLE IF EXISTS users;

COMMIT;


