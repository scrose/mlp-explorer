-- =========================================================
-- Schema Migration script
-- =========================================================
-- Restore database to original:
-- db reset >>> psql -U boutrous mlp2 < path/to/original/meat.sql
-- db reset >>> psql -U boutrous mlp2 < /Users/boutrous/Workspace/NodeJS/db/meat.sql
-- db reset >>> psql -U boutrous mlp2 < /Users/boutrous/Workspace/NodeJS/mlp-db/meat.sql


-- -------------------------------------------------------------
-- Model Types Table
-- -------------------------------------------------------------

drop table if exists node_types CASCADE;

create TABLE node_types
(
    id    serial PRIMARY KEY,
    name  VARCHAR(40) UNIQUE NOT NULL,
    label VARCHAR(40) UNIQUE NOT NULL
);

insert into node_types (name, label)
values ('default', 'Default Node'),
       ('users', 'Users'),
       ('projects', 'Project'),
       ('surveyors', 'Surveyor'),
       ('surveys', 'Survey'),
       ('survey_seasons', 'SurveySeason'),
       ('stations', 'Station'),
       ('historic_visits', 'HistoricVisit'),
       ('visits', 'Visit'),
       ('locations', 'Location'),
       ('historic_captures', 'HistoricCapture'),
       ('captures', 'Capture'),
       ('capture_images', 'CaptureImage'),
       ('images', 'Image'),
       ('glass_plate_listings', 'Glass Plate Listings'),
       ('cameras', 'Cameras'),
       ('lens', 'Lenses'),
       ('metadata_files', 'Metadata Files'),
       ('maps', 'Maps'),
       ('participants', 'Participants'),
       ('participant_groups', 'Participant Groups'),
       ('shutter_speed', 'Shutter Speed'),
       ('iso', 'ISO Settings');


select *
from node_types;


-- -------------------------------------------------------------
-- Model Relations Table
-- -------------------------------------------------------------

drop table if exists node_relations cascade;

create TABLE node_relations
(
    id             serial PRIMARY KEY,
    dependent_type VARCHAR(40) NOT NULL,
    owner_type     VARCHAR(40) NOT NULL,
    UNIQUE (owner_type, dependent_type),
    CONSTRAINT ck_same_type CHECK (owner_type != dependent_type),
    CONSTRAINT fk_owner_type FOREIGN KEY (owner_type)
        REFERENCES node_types (name),
    CONSTRAINT fk_dependent_type FOREIGN KEY (dependent_type)
        REFERENCES node_types (name)
);

insert into node_relations (dependent_type, owner_type)
values ('surveys', 'surveyors'),
       ('survey_seasons', 'surveys'),
       ('stations', 'projects'),
       ('stations', 'survey_seasons'),
       ('historic_visits', 'stations'),
       ('visits', 'stations'),
       ('locations', 'visits'),
       ('historic_captures', 'surveys'),
       ('historic_captures', 'survey_seasons'),
       ('historic_captures', 'projects'),
       ('historic_captures', 'historic_visits'),
       ('captures', 'survey_seasons'),
       ('captures', 'visits'),
       ('captures', 'stations'),
       ('captures', 'locations'),
       ('capture_images', 'captures'),
       ('capture_images', 'historic_captures'),
       ('images', 'locations'),
       ('images', 'stations'),
       ('images', 'survey_seasons'),
       ('images', 'surveys'),
       ('images', 'visits'),
       ('cameras', 'historic_captures'),
       ('cameras', 'captures'),
       ('cameras', 'images'),
       ('glass_plate_listings', 'survey_seasons'),
       ('maps', 'survey_seasons'),
       ('participant_groups', 'visits'),
       ('metadata_files', 'visits'),
       ('metadata_files', 'stations');


-- -------------------------------------------------------------
-- Nodes Table
-- -------------------------------------------------------------

drop table if exists nodes cascade;

create TABLE IF NOT EXISTS nodes
(
    id      serial PRIMARY KEY,
    node_id integer     not null,
    type    varchar(40) not null,
    UNIQUE (node_id, type),
    CONSTRAINT fk_type FOREIGN KEY (type)
        REFERENCES node_types (name)
);

create INDEX node_index ON nodes (node_id);

-- confirm table created
select *
from nodes;


-- -------------------------------------------------------------
-- Function: Rename Column
-- -------------------------------------------------------------

begin;
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
-- Copy node information from tables to nodes base table
-- -------------------------------------------------------------

create or replace function update_nodes(_tbl varchar(40),
                                        _id_col varchar(40),
                                        _type_col varchar(40)) RETURNS void
    LANGUAGE plpgsql as
$$
DECLARE
    r         RECORD;
    node_type RECORD;
begin
    for r in EXECUTE format('SELECT id, owner_type FROM %I', _tbl)
        loop
            raise NOTICE 'Existing ID, Node Type: %', r;
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
-- Copy node information from tables to nodes base table
-- -------------------------------------------------------------

create or replace function add_nodes(_tbl varchar(40),
                                        _id_col varchar(40),
                                        _type_col varchar(40)) RETURNS void
    LANGUAGE plpgsql as
$$
DECLARE
    r         RECORD;
    node_type RECORD;
begin
    for r in EXECUTE format('SELECT id FROM %I', _tbl)
        loop
            -- look up node type name
            insert into 
            -- only proceed if update already done previously
            IF node_type.name is NOT NULL
            THEN
                RAISE NOTICE 'Converted Node Type: %', node_type;
                EXECUTE format(E'UPDATE %I SET owner_type = \'%s\' WHERE id=%s', _tbl, node_type.name, r.id);
            END IF;
        END LOOP;
END
$$;


-- =========================================================
-- Enumerated Types
-- =========================================================

-- -------------------------------------------------------------
--    Metadata types
-- -------------------------------------------------------------

drop table if exists metadata_types cascade;

create TABLE IF NOT EXISTS metadata_types
(
    id   SERIAL PRIMARY KEY NOT NULL,
    type varchar(40)        NOT NULL,
    UNIQUE (type)
);

insert into metadata_types (type)
values ('field_notes'),
       ('ancillary');

-- -------------------------------------------------------------
--    Shutter speeds
-- -------------------------------------------------------------

drop table if exists shutter_speeds cascade;

create TABLE shutter_speeds
(
    id    SERIAL PRIMARY KEY NOT NULL,
    speed varchar(40) UNIQUE
);

insert into shutter_speeds (speed)
values (null),
       ('30'),
       ('25'),
       ('20'),
       ('15'),
       ('13'),
       ('10'),
       ('8'),
       ('6'),
       ('5'),
       ('4'),
       ('3.2'),
       ('2.5'),
       ('2'),
       ('1.6'),
       ('1.3'),
       ('1'),
       ('0.8'),
       ('0.6'),
       ('0.5'),
       ('0.4'),
       ('0.3'),
       ('1/4'),
       ('1/5'),
       ('1/6'),
       ('1/8'),
       ('1/10'),
       ('1/13'),
       ('1/15'),
       ('1/20'),
       ('1/25'),
       ('1/30'),
       ('1/40'),
       ('1/45'),
       ('1/50'),
       ('1/60'),
       ('1/80'),
       ('1/90'),
       ('1/100'),
       ('1/125'),
       ('1/160'),
       ('1/180'),
       ('1/200'),
       ('1/250'),
       ('1/320'),
       ('1/400'),
       ('1/500'),
       ('1/640'),
       ('1/800'),
       ('1/1000'),
       ('1/1250'),
       ('1/1600'),
       ('1/2000'),
       ('1/2500'),
       ('1/3200'),
       ('1/4000'),
       ('1/8000');


-- -------------------------------------------------------------
--    ISO settings
-- -------------------------------------------------------------

drop table IF EXISTS iso cascade;

create TABLE IF NOT EXISTS iso
(
    id      SERIAL PRIMARY KEY NOT NULL,
    setting INTEGER UNIQUE
);

insert into iso (setting)
values (null),
       (50),
       (64),
       (100),
       (125),
       (160),
       (200),
       (250),
       (320),
       (400),
       (500),
       (640),
       (800),
       (1000),
       (1250),
       (1600),
       (2000),
       (2500),
       (3200),
       (4000),
       (5000),
       (6400),
       (12800),
       (25600),
       (51200),
       (102400);



--    TODO: Image States
--    TODO: Image Types


/**
===========================
Model schema updates
===========================
*/

-- -------------------------------------------------------------
--    Participants
-- -------------------------------------------------------------

select setval('participants_id_seq', (select max(id) from participants) + 1);

-- -------------------------------------------------------------
--    Participant Groups (owned by visits)
-- -------------------------------------------------------------

drop table IF EXISTS participant_group_types cascade;
drop table IF EXISTS participant_groups cascade;

create TABLE IF NOT EXISTS participant_group_types
(
    id   SERIAL PRIMARY KEY NOT NULL,
    type varchar(40) UNIQUE NOT NULL
);

insert into participant_group_types (type)
values ('hiking_party'),
       ('field_notes_authors'),
       ('photographers');

create TABLE IF NOT EXISTS participant_groups
(
    owner_id       INTEGER     NOT NULL,
    participant_id INTEGER     NOT NULL,
    group_type     varchar(40) NOT NULL,
    created_at     timestamp   NOT NULL,
    updated_at     timestamp   NOT NULL,
    UNIQUE (owner_id, participant_id, group_type),
    CONSTRAINT fk_owner_type FOREIGN KEY (owner_id) REFERENCES visits (id),
    CONSTRAINT fk_participant FOREIGN KEY (participant_id) REFERENCES participants (id),
    CONSTRAINT fk_group_type FOREIGN KEY (group_type) REFERENCES participant_group_types (type)
);

--    Copy existing participant table data into merged participant groups

DO
$$
    begin
        --    Copy existing fn_authors_visits table data into participant groups table
        IF EXISTS(SELECT *
                  FROM information_schema.tables
                  WHERE table_schema = current_schema()
                    AND table_name = 'fn_authors_visits') THEN

            insert into participant_groups (owner_id,
                                            participant_id,
                                            group_type,
                                            created_at,
                                            updated_at)
            select visit_id, participant_id, 'field_notes_authors', NOW(), NOW()
            from fn_authors_visits
            where participant_id is not null;

            drop table fn_authors_visits;
        end if;
    end;
$$;

DO
$$
    begin
        --    Copy existing hiking_parties table data into participant groups table
        IF EXISTS(SELECT *
                  FROM information_schema.tables
                  WHERE table_schema = current_schema()
                    AND table_name = 'hiking_parties') THEN

            insert into participant_groups (owner_id,
                                            participant_id,
                                            group_type,
                                            created_at,
                                            updated_at)
            select visit_id, participant_id, 'hiking_party', created_at, updated_at
            from hiking_parties
            where participant_id is not null;

            drop table hiking_parties;
        end if;
    end;
$$;

DO
$$
    begin
        --    Copy existing photographers_visits table data into participant groups table
        IF EXISTS(SELECT *
                  FROM information_schema.tables
                  WHERE table_schema = current_schema()
                    AND table_name = 'photographers_visits') THEN

            insert into participant_groups (owner_id,
                                            participant_id,
                                            group_type,
                                            created_at,
                                            updated_at)
            select visit_id, participant_id, 'photographers', NOW(), NOW()
            from photographers_visits
            where participant_id is not null;

            drop table photographers_visits;
        end if;
    end;
$$;


-- -------------------------------------------------------------
--    Projects (root owners)
-- -------------------------------------------------------------

select setval('projects_id_seq', (select max(id) from projects) + 1);

-- Convert published field to boolean
alter table projects
    alter COLUMN published drop DEFAULT;
alter table projects
    alter published TYPE bool
        USING CASE WHEN published = 't' THEN TRUE ELSE FALSE END;
alter table projects
    alter COLUMN published SET DEFAULT FALSE;

select update_nodes('surveyors', 'id', null);


-- -------------------------------------------------------------
--    Surveyors (root owners)
-- -------------------------------------------------------------

-- update id auto-increment
select setval('surveyors_id_seq', (select max(id) from surveyors) + 1);

-- Convert published field to boolean
alter table surveyors
    alter COLUMN published drop DEFAULT;
alter table surveyors
    alter published TYPE bool
        USING CASE WHEN published = 't' THEN TRUE ELSE FALSE END;
alter table surveyors
    alter COLUMN published SET DEFAULT FALSE;


-- -------------------------------------------------------------
--    Surveys  (strictly owned by Surveyors)
-- -------------------------------------------------------------

select rename_column('surveys', 'surveyor_id', 'owner_id');
select setval('surveys_id_seq', (select max(id) from surveys) + 1);

-- Foreign key constraint
alter table surveys
    drop CONSTRAINT IF EXISTS fk_owner_id;
alter table surveys
    add CONSTRAINT fk_owner_id FOREIGN KEY (owner_id) REFERENCES surveyors (id);

-- Convert published field to boolean
alter table surveys
    alter COLUMN published drop DEFAULT;
alter table surveys
    alter published TYPE bool
        USING CASE WHEN published = 't' THEN TRUE ELSE FALSE END;
alter table surveys
    alter COLUMN published SET DEFAULT FALSE;

--    Map surveys in nodes table
insert into nodes (owner_id, owner_type, dependent_id, dependent_type)
select owner_id, 'surveyors', id, 'surveys'
from surveys;


-- -------------------------------------------------------------
--    Survey Seasons  (strictly owned by Surveys)
-- -------------------------------------------------------------

select rename_column('survey_seasons', 'survey_id', 'owner_id');
select setval('survey_seasons_id_seq', (select max(id) from survey_seasons) + 1);

-- Foreign key constraint
alter table survey_seasons
    drop CONSTRAINT IF EXISTS fk_owner_id;
alter table survey_seasons
    add CONSTRAINT fk_owner_id FOREIGN KEY (owner_id) REFERENCES surveys (id);

-- Year constraint
alter table survey_seasons
    drop CONSTRAINT IF EXISTS check_year;
alter table survey_seasons
    add CONSTRAINT check_year
        CHECK (survey_seasons.year > 1700 AND survey_seasons.year <= EXTRACT(YEAR FROM NOW()));

-- Convert published field to boolean
alter table survey_seasons
    alter COLUMN published drop DEFAULT;
alter table survey_seasons
    alter published TYPE bool
        USING CASE WHEN published = 't' THEN TRUE ELSE FALSE END;
alter table survey_seasons
    alter COLUMN published SET DEFAULT FALSE;

--    Map survey seasons in nodes table
insert into nodes (owner_id, owner_type, dependent_id, dependent_type)
select owner_id, 'surveys', id, 'survey_seasons'
from survey_seasons;


-- -------------------------------------------------------------
--    Stations
-- -------------------------------------------------------------

select rename_column('stations', 'station_owner_id', 'owner_id');
select rename_column('stations', 'station_owner_type', 'owner_type');
select rename_owner_types('stations');
select setval('stations_id_seq', (select max(id) from stations) + 1);

-- Convert published field to boolean
alter table stations
    alter COLUMN published drop DEFAULT;
alter table stations
    alter published TYPE bool
        USING CASE WHEN published = 't' THEN TRUE ELSE FALSE END;
alter table stations
    alter COLUMN published SET DEFAULT FALSE;

---   Foreign key constraints
ALTER TABLE stations
    DROP CONSTRAINT IF EXISTS fk_owner_type;
ALTER TABLE stations
    ADD CONSTRAINT fk_owner_type
        FOREIGN KEY (owner_type)
            REFERENCES node_types (name);

--    Map stations in nodes table
insert into nodes (owner_id, owner_type, dependent_id, dependent_type)
select owner_id, owner_type, id, 'stations'
from stations;

-- -------------------------------------------------------------
--    Historic Visits (strictly owned by Stations)
-- -------------------------------------------------------------

select rename_column('historic_visits', 'station_id', 'owner_id');
select setval('historic_visits_id_seq', (select max(id) from historic_visits) + 1);

--    Map historic visits in nodes table
insert into nodes (owner_id, owner_type, dependent_id, dependent_type)
select owner_id, 'stations', id, 'historic_visits'
from historic_visits;


-- -------------------------------------------------------------
--    Visits (strictly owned by Stations)
-- -------------------------------------------------------------

select rename_column('visits', 'station_id', 'owner_id');

select setval('visits_id_seq', (select max(id) from visits) + 1);


--    Locations (strictly owned by Visits)
select rename_column('locations', 'visit_id', 'owner_id');

select setval('locations_id_seq', (select max(id) from locations) + 1);

-- Latitude/Longitude constraints
--    ALTER TABLE stations DROP CONSTRAINT IF EXISTS check_latitude;
--    ALTER TABLE stations ADD CONSTRAINT check_latitude
--    CHECK (stations.lat ~* '^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$')
--
--    ALTER TABLE stations DROP CONSTRAINT IF EXISTS check_longitude;
--    ALTER TABLE stations ADD CONSTRAINT check_longitude
--    CHECK (stations.long ~* '^[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$')

--    Map visits in nodes table
insert into nodes (owner_id, owner_type, dependent_id, dependent_type)
select owner_id, 'stations', id, 'visits'
from visits;

-- -------------------------------------------------------------
--    Historic Captures
-- -------------------------------------------------------------

select rename_column('historic_captures', 'capture_owner_id', 'owner_id');
select rename_column('historic_captures', 'capture_owner_type', 'owner_type');
select rename_column('historic_captures', 'camera_id', 'cameras_id');

select rename_owner_types('historic_captures');

--    Map historic captures in nodes table
insert into nodes (owner_id, owner_type, dependent_id, dependent_type)
select owner_id, owner_type, id, 'historic_captures'
from historic_captures;

-- convert empty strings to nulls
UPDATE historic_captures
SET shutter_speed=NULL
where shutter_speed = '';

-- Foreign key constraints
-- alter table historic_captures
--     drop CONSTRAINT IF EXISTS fk_shutter_speed;
-- alter table historic_captures
--     add CONSTRAINT fk_shutter_speed
--         FOREIGN KEY (shutter_speed) REFERENCES shutter_speeds (speed);

ALTER TABLE historic_captures
    DROP CONSTRAINT IF EXISTS fk_owner_type;
ALTER TABLE historic_captures
    ADD CONSTRAINT fk_owner_type
        FOREIGN KEY (owner_type)
            REFERENCES node_types (name)
;

-- Latitude/Longitude constraints
--    ALTER TABLE stations DROP CONSTRAINT IF EXISTS check_latitude;
--    ALTER TABLE stations ADD CONSTRAINT check_latitude
--    CHECK (stations.lat ~* '^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$')
--
--    ALTER TABLE stations DROP CONSTRAINT IF EXISTS check_longitude;
--    ALTER TABLE stations ADD CONSTRAINT check_longitude
--    CHECK (stations.long ~* '^[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$')

select rename_owner_types('historic_captures');

select setval('historic_captures_id_seq', (select max(id) from historic_captures) + 1);


-- -------------------------------------------------------------
--    Captures
-- -------------------------------------------------------------

select rename_column('captures', 'capture_owner_id', 'owner_id');
select rename_column('captures', 'capture_owner_type', 'owner_type');
select rename_column('captures', 'camera_id', 'cameras_id');
select rename_owner_types('captures');

select setval('captures_id_seq', (select max(id) from captures) + 1);

-- convert empty strings to nulls
UPDATE captures
SET shutter_speed=NULL
where shutter_speed = '';

-- Foreign key constraints
-- alter table captures
--     drop CONSTRAINT IF EXISTS fk_shutter_speed;
-- alter table captures
--     add CONSTRAINT fk_shutter_speed
--         FOREIGN KEY (shutter_speed)
--             REFERENCES shutter_speeds (speed);

alter table captures
    drop CONSTRAINT IF EXISTS fk_iso;
alter table captures
    add CONSTRAINT fk_iso
        FOREIGN KEY (iso)
            REFERENCES iso (setting);

alter table captures
    drop CONSTRAINT IF EXISTS fk_camera;
alter table captures
    add CONSTRAINT fk_camera
        FOREIGN KEY (cameras_id)
            REFERENCES cameras (id);

ALTER TABLE captures
    DROP CONSTRAINT IF EXISTS fk_owner_type;
ALTER TABLE captures
    ADD CONSTRAINT fk_owner_type
        FOREIGN KEY (owner_type)
            REFERENCES node_types (name);

-- Convert alternate field to boolean
alter table captures
    alter COLUMN alternate drop DEFAULT;
alter table captures
    alter alternate TYPE bool
        USING CASE WHEN alternate = 'f' THEN FALSE ELSE TRUE END;
alter table captures
    alter COLUMN alternate SET DEFAULT FALSE;

--    Map captures in nodes table
insert into nodes (owner_id, owner_type, dependent_id, dependent_type)
select owner_id, owner_type, id, 'captures'
from captures;


-- -------------------------------------------------------------
--    Capture Images (owned by either Captures or Historic Captures)
-- -------------------------------------------------------------

select rename_column('capture_images', 'captureable_id', 'owner_id');
select rename_column('capture_images', 'captureable_type', 'owner_type');
select rename_owner_types('capture_images');

select setval('capture_images_id_seq', (select max(id) from capture_images) + 1);

ALTER TABLE capture_images
    DROP CONSTRAINT IF EXISTS fk_owner_type;
ALTER TABLE capture_images
    ADD CONSTRAINT fk_owner_type
        FOREIGN KEY (owner_type)
            REFERENCES node_types (name)
;

--    ALTER TABLE stations DROP CONSTRAINT IF EXISTS check_capture_type;
--    ALTER TABLE stations ADD CONSTRAINT check_capture_type
--    CHECK (capture_images.owner_type = ANY (ARRAY['captures', 'historic_captures']);)

--    Map capture images in nodes table
insert into nodes (owner_id, owner_type, dependent_id, dependent_type)
select owner_id, owner_type, id, 'capture_images'
from capture_images;


-- -------------------------------------------------------------
--    Images
-- -------------------------------------------------------------

select rename_column('images', 'image_owner_id', 'owner_id');
select rename_column('images', 'image_owner_type', 'owner_type');
select rename_column('images', 'camera_id', 'cameras_id');
select rename_owner_types('images');

-- TODO: convert ScenicImage and LocationImage image types to scenic and location
--    ALTER TABLE stations DROP CONSTRAINT IF EXISTS check_image_type;
--    ALTER TABLE stations ADD CONSTRAINT check_image_type
--    CHECK (images.type = ANY (ARRAY['scenic', 'location']);)

select setval('images_id_seq', (select max(id) from images) + 1);

---   Foriegn key constraints
ALTER TABLE images
    DROP CONSTRAINT IF EXISTS fk_owner_type;
ALTER TABLE images
    ADD CONSTRAINT fk_owner_type
        FOREIGN KEY (owner_type)
            REFERENCES node_types (name)
;

--    Map images in nodes table
insert into nodes (owner_id, owner_type, dependent_id, dependent_type)
select owner_id, owner_type, id, 'images'
from images;


-- -------------------------------------------------------------
--    Location photos
-- -------------------------------------------------------------

drop table if exists location_photos;


-- -------------------------------------------------------------
--    Metadata Files
-- -------------------------------------------------------------

select rename_column('metadata_files', 'metadata_owner_id', 'owner_id');
select rename_column('metadata_files', 'metadata_owner_type', 'owner_type');
select rename_column('metadata_files', 'metadata_file', 'filename');
select rename_owner_types('metadata_files');

-- reset auto-increment
select setval('metadata_files_id_seq', (select max(id) from metadata_files) + 1);

-- Add metadata type column
DO
$$
    begin
        begin
            ALTER TABLE metadata_files
                ADD COLUMN metadata_type varchar(40) DEFAULT 'ancillary';
            UPDATE metadata_files SET metadata_type = 'ancillary';
        EXCEPTION
            WHEN duplicate_column
                THEN RAISE NOTICE 'Column "metadata_type" already exists in metadata_files.';
        END;
    END;
$$;

-- Metadata files constraints

alter table metadata_files
    alter COLUMN owner_id SET NOT NULL;
alter table metadata_files
    alter COLUMN filename SET NOT NULL;

alter table metadata_files
    drop CONSTRAINT IF EXISTS fk_metadata_type;
alter table metadata_files
    add CONSTRAINT fk_metadata_type
        FOREIGN KEY (metadata_type) REFERENCES metadata_types (type);

alter table metadata_files
    drop CONSTRAINT IF EXISTS fk_metadata_owner_type;
alter table metadata_files
    add CONSTRAINT fk_metadata_owner_type
        FOREIGN KEY (owner_type)
            REFERENCES node_types (name);

--    Copy existing field_notes table data into metadata files table
DO
$$
    begin
        IF EXISTS(SELECT *
                  FROM information_schema.tables
                  WHERE table_schema = current_schema()
                    AND table_name = 'field_notes') THEN
            insert into metadata_files (owner_id,
                                        owner_type,
                                        metadata_type,
                                        filename,
                                        created_at,
                                        updated_at)
            select visit_id,
                   'visits',
                   'field_notes',
                   field_note_file,
                   created_at,
                   updated_at
            from field_notes;

            drop table field_notes;
        end if;
    end;
$$;

--    Map capture images in nodes table
insert into nodes (owner_id, owner_type, dependent_id, dependent_type)
select owner_id, owner_type, id, 'metadata_files'
from metadata_files;



-- -------------------------------------------------------------
--    Glass Plate Listings
-- -------------------------------------------------------------

select rename_column('glass_plate_listings', 'survey_season_id', 'owner_id');

select setval('glass_plate_listings_id_seq', (select max(id) from glass_plate_listings) + 1);

---   Foriegn key constraints
ALTER TABLE glass_plate_listings
    DROP CONSTRAINT IF EXISTS fk_owner_id;
ALTER TABLE glass_plate_listings
    ADD CONSTRAINT fk_owner_id
        FOREIGN KEY (owner_id)
            REFERENCES survey_seasons (id);

--    Map glass plates in nodes table
insert into nodes (owner_id, owner_type, dependent_id, dependent_type)
select owner_id, 'survey_seasons', id, 'glass_plate_listings'
from glass_plate_listings;


-- -------------------------------------------------------------
--    Maps
-- -------------------------------------------------------------

select rename_column('maps', 'survey_season_id', 'owner_id');

select setval('maps_id_seq', (select max(id) from maps) + 1);

---   Foriegn key constraints
ALTER TABLE maps
    DROP CONSTRAINT IF EXISTS fk_owner_id;
ALTER TABLE maps
    ADD CONSTRAINT fk_owner_id
        FOREIGN KEY (owner_id)
            REFERENCES survey_seasons (id);

--    Map glass plates in nodes table
insert into nodes (owner_id, owner_type, dependent_id, dependent_type)
select owner_id, 'survey_seasons', id, 'maps'
from maps;

-- -------------------------------------------------------------
--    Cameras
-- -------------------------------------------------------------

select setval('cameras_id_seq', (select max(id) from cameras) + 1);


-- -------------------------------------------------------------
--    Lens
-- -------------------------------------------------------------

select setval('lens_id_seq', (select max(id) from lens) + 1);


-- -------------------------------------------------------------
--    Users (drop)
-- -------------------------------------------------------------

drop table IF EXISTS users;

commit;


