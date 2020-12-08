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

DROP TABLE IF EXISTS node_types;

CREATE TABLE IF NOT EXISTS node_types (
id serial PRIMARY KEY,
name VARCHAR (255) UNIQUE NOT NULL,
label VARCHAR (255) NOT NULL
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
  owner_type INT NOT NULL,
  dependent_id INT NOT NULL,
  dependent_type INT NOT NULL,
  unique (owner_id, owner_type, dependent_id, dependent_type),
  CONSTRAINT fk_owner_type
    FOREIGN KEY(owner_type)
      REFERENCES node_types(id),
  CONSTRAINT fk_dependent_type
    FOREIGN KEY(dependent_type)
      REFERENCES node_types(id)
);

CREATE INDEX owner_index ON nodes (owner_id);
CREATE INDEX dependent_index ON nodes (dependent_id);

-- confirm table created
SELECT * FROM nodes;

-- remap owner type to node type
BEGIN;
CREATE OR REPLACE FUNCTION rename_owner_types(_tbl regclass) RETURNS void LANGUAGE plpgsql AS $$
     DECLARE
        r RECORD;
        node_type RECORD;
        owner_type_index INT;
     BEGIN
        FOR r IN EXECUTE format('SELECT id, owner_type FROM %I', _tbl)
        LOOP
                RAISE NOTICE '%', r;
                SELECT * FROM node_types WHERE id = r.owner_type INTO node_type;
                RAISE NOTICE 'Node Type: %', node_type;
                EXECUTE format('UPDATE %s SET owner_type = %s WHERE id=%s', _tbl, node_type.name, r.id);
        END LOOP;
    END $$;

-- create node mappings
--    Projects (root owners)
--    Surveyors (root owners)
--    Surveys  (strictly owned by Surveyors)
--    Survey Seasons  (strictly owned by Surveys)
--    Stations
--    ALTER TABLE stations RENAME COLUMN station_owner_id TO owner_id;
--    ALTER TABLE stations RENAME COLUMN station_owner_type TO owner_type;
    SELECT rename_owner_types('stations');

--    Historic Visits (strictly owned by Stations)
--    Visits (strictly owned by Stations)
--    Locations (strictly owned by Visits)

--    Historic Captures
--    ALTER TABLE historic_captures RENAME COLUMN capture_owner_id TO owner_id;
--    ALTER TABLE historic_captures RENAME COLUMN capture_owner_type TO owner_type;
    SELECT rename_owner_types('historic_captures');

--    Captures
--    ALTER TABLE captures RENAME COLUMN capture_owner_id TO owner_id;
--    ALTER TABLE captures RENAME COLUMN capture_owner_type TO owner_type;
    SELECT rename_owner_types('captures');

--    Capture Images (owned by either Captures or Historic Captures)
--    ALTER TABLE capture_images RENAME COLUMN captureable_id TO owner_id;
--    ALTER TABLE capture_images RENAME COLUMN captureable_type TO owner_type;
    SELECT rename_owner_types('capture_images');

--    Images
--    ALTER TABLE images RENAME COLUMN image_owner_id TO owner_id;
--    ALTER TABLE images RENAME COLUMN image_owner_type TO owner_type;
    SELECT rename_owner_types('images');

--    Location Photos
--    Image States
--    Image Types

COMMIT;


