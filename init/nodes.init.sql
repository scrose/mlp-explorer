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

drop table IF EXISTS model_types;

create TABLE model_types
(
    id    serial PRIMARY KEY,
    type  VARCHAR(40) UNIQUE NOT NULL,
    label VARCHAR(40) UNIQUE NOT NULL
);

insert into model_types (type, label)
values ('users', 'Users');
insert into model_types (type, label)
values ('projects', 'Project');
insert into model_types (type, label)
values ('surveyors', 'Surveyor');
insert into model_types (type, label)
values ('surveys', 'Survey');
insert into model_types (type, label)
values ('survey_seasons', 'SurveySeason');
insert into model_types (type, label)
values ('stations', 'Station');
insert into model_types (type, label)
values ('historic_visits', 'HistoricVisit');
insert into model_types (type, label)
values ('visits', 'Visit');
insert into model_types (type, label)
values ('locations', 'Location');
insert into model_types (type, label)
values ('historic_captures', 'HistoricCapture');
insert into model_types (type, label)
values ('captures', 'Capture');
insert into model_types (type, label)
values ('capture_images', 'CaptureImage');
insert into model_types (type, label)
values ('images', 'Image');
insert into model_types (type, label)
values ('glass_plate_listings', 'Glass Plate Listings');
insert into model_types (type, label)
values ('cameras', 'Camera');
insert into model_types (type, label)
values ('metadata_files', 'Metadata Files');
insert into model_types (type, label)
values ('maps', 'Maps');
insert into model_types (type, label)
values ('participants', 'Participants');
insert into model_types (type, label)
values ('participant_groups', 'Participant Groups');
insert into model_types (type, label)
values ('shutter_speed', 'Camera');
insert into model_types (type, label)
values ('iso', 'ISO Settings');


select *
from model_types;


-- -------------------------------------------------------------
-- Model Relations Table
-- -------------------------------------------------------------

drop table if exists model_relations;

create TABLE model_relations
(
    id             serial PRIMARY KEY,
    dependent_type VARCHAR(40),
    owner_type     VARCHAR(40),
    UNIQUE (owner_type, dependent_type),
    CONSTRAINT ck_same_type CHECK (owner_type != dependent_type),
    CONSTRAINT fk_owner_type FOREIGN KEY (owner_type)
        REFERENCES node_types (type),
    CONSTRAINT fk_dependent_type FOREIGN KEY (dependent_type)
        REFERENCES node_types (type)
);

insert into model_relations (dependent_type, owner_type)
values ('projects', null);
insert into model_relations (dependent_type, owner_type)
values ('surveyors', null);
insert into model_relations (dependent_type, owner_type)
values ('surveys', 'surveyors');
insert into model_relations (dependent_type, owner_type)
values ('survey_seasons', 'surveys');
insert into model_relations (dependent_type, owner_type)
values ('stations', 'projects');
insert into model_relations (dependent_type, owner_type)
values ('stations', 'survey_seasons');
insert into model_relations (dependent_type, owner_type)
values ('historic_visits', 'stations');
insert into model_relations (dependent_type, owner_type)
values ('visits', 'stations');
insert into model_relations (dependent_type, owner_type)
values ('locations', 'visits');
insert into model_relations (dependent_type, owner_type)
values ('historic_captures', 'surveys');
insert into model_relations (dependent_type, owner_type)
values ('historic_captures', 'survey_seasons');
insert into model_relations (dependent_type, owner_type)
values ('historic_captures', 'projects');
insert into model_relations (dependent_type, owner_type)
values ('historic_captures', 'historic_visits');
insert into model_relations (dependent_type, owner_type)
values ('captures', 'survey_seasons');
insert into model_relations (dependent_type, owner_type)
values ('captures', 'visits');
insert into model_relations (dependent_type, owner_type)
values ('captures', 'stations');
insert into model_relations (dependent_type, owner_type)
values ('captures', 'locations');
insert into model_relations (dependent_type, owner_type)
values ('capture_images', 'captures');
insert into model_relations (dependent_type, owner_type)
values ('capture_images', 'historic_capture');
insert into model_relations (dependent_type, owner_type)
values ('images', 'locations');
insert into model_relations (dependent_type, owner_type)
values ('images', 'stations');
insert into model_relations (dependent_type, owner_type)
values ('images', 'survey_seasons');
insert into model_relations (dependent_type, owner_type)
values ('images', 'surveys');
insert into model_relations (dependent_type, owner_type)
values ('images', 'visits');
insert into model_relations (dependent_type, owner_type)
values ('glass_plate_listings', 'survey_seasons');
insert into model_relations (dependent_type, owner_type)
values ('maps', 'survey_seasons');
insert into model_relations (dependent_type, owner_type)
values ('iso', null);
insert into model_relations (dependent_type, owner_type)
values ('camera', null);
insert into model_relations (dependent_type, owner_type)
values ('shutter_speed', null);
insert into model_relations (dependent_type, owner_type)
values ('participants', null);
insert into model_relations (dependent_type, owner_type)
values ('participant_groups', 'visits');
insert into model_relations (dependent_type, owner_type)
values ('metadata_files', 'visits');
insert into model_relations (dependent_type, owner_type)
values ('metadata_files', 'stations');


-- -------------------------------------------------------------
-- Models Table
-- -------------------------------------------------------------

drop table IF EXISTS models;

create TABLE IF NOT EXISTS models
(
    owner_id       INT         NOT NULL,
    owner_type     VARCHAR(40) NOT NULL,
    dependent_id   INT         NOT NULL,
    dependent_type VARCHAR(40) NOT NULL,
    UNIQUE (owner_id, owner_type, dependent_id, dependent_type),
    CONSTRAINT ck_same_type CHECK (owner_type != dependent_type),
    CONSTRAINT fk_model_relation FOREIGN KEY (owner_type, dependent_type)
        REFERENCES model_relations (owner_type, dependent_type)
--  CONSTRAINT fk_owner_type FOREIGN KEY(owner_type)
--    REFERENCES model_types(type)
--  CONSTRAINT fk_dependent_type FOREIGN KEY(dependent_type)
--    REFERENCES model_types(type)
);

create INDEX owner_index ON models (owner_id);
create INDEX dependent_index ON models (dependent_id);

-- confirm table created
select *
from models;

-- function: rename column
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

-- function: rename owner type as table name
create or replace function rename_owner_types(_tbl regclass) RETURNS void
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
            select * from model_types where label = r.owner_type INTO node_type;
            -- only proceed if update already done previously
            IF node_type.type is NOT NULL
            THEN
                RAISE NOTICE 'Converted Node Type: %', node_type;
                EXECUTE format(E'UPDATE %I SET owner_type = \'%s\' WHERE id=%s', _tbl, node_type.type, r.id);
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

drop table IF EXISTS metadata_types;

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

drop table IF EXISTS shutter_speeds;

create TABLE shutter_speeds
(
    id    SERIAL PRIMARY KEY NOT NULL,
    speed varchar(40),
    UNIQUE (speed)
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
       ('1/50'),
       ('1/60'),
       ('1/80'),
       ('1/100'),
       ('1/125'),
       ('1/160'),
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

--    ISO settings
drop table IF EXISTS iso;
create TABLE IF NOT EXISTS iso
(
    id      SERIAL PRIMARY KEY NOT NULL,
    setting INTEGER
);

insert into iso (setting)
values (null),
       (50),
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
--    Participant Groups
-- -------------------------------------------------------------

drop table IF EXISTS participant_group_types;
create TABLE IF NOT EXISTS participant_group_types
(
    id   SERIAL PRIMARY KEY NOT NULL,
    type varchar(40)        NOT NULL,
    UNIQUE (type)
);

insert into participant_group_types (type)
values ('hiking_party'),
       ('field_notes_authors'),
       ('photographers');

drop table IF EXISTS participant_groups;
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

--      fn_authors_visits: {participant_id, visit_id}

insert into participant_groups (owner_id, participant_id, group_type, created_at, updated_at)
select visit_id, participant_id, 'field_notes_authors', NOW(), NOW()
from fn_authors_visits
where participant_id is not null;

drop table fn_authors_visits;

--      hiking_parties: {participant_id, visit_id}

insert into participant_groups (owner_id, participant_id, group_type, created_at, updated_at)
select visit_id, participant_id, 'hiking_party', created_at, updated_at
from hiking_parties
where participant_id is not null;

drop table hiking_parties;

--      photographers_visits: {participant_id, visit_id}

insert into participant_groups (owner_id, participant_id, group_type, created_at, updated_at)
select visit_id, participant_id, 'photographers', NOW(), NOW()
from photographers_visits
where participant_id is not null;

drop table photographers_visits;


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

--    Map surveys in models table
insert into models (owner_id, owner_type, dependent_id, dependent_type)
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

--    Map survey seasons in models table
insert into models (owner_id, owner_type, dependent_id, dependent_type)
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

--    Map stations in models table
insert into models (owner_id, owner_type, dependent_id, dependent_type)
select owner_id, owner_type, id, 'stations'
from stations;

-- -------------------------------------------------------------
--    Historic Visits (strictly owned by Stations)
-- -------------------------------------------------------------

select rename_column('historic_visits', 'station_id', 'owner_id');
select rename_owner_types('historic_visits');

select setval('historic_visits_id_seq', (select max(id) from historic_visits) + 1);


--    Map historic visits in models table
insert into models (owner_id, owner_type, dependent_id, dependent_type)
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

--    Map visits in models table
insert into models (owner_id, owner_type, dependent_id, dependent_type)
select owner_id, 'stations', id, 'visits'
from visits;

-- -------------------------------------------------------------
--    Historic Captures
-- -------------------------------------------------------------

select rename_column('historic_captures', 'capture_owner_id', 'owner_id');
select rename_column('historic_captures', 'capture_owner_type', 'owner_type');
select rename_column('historic_captures', 'camera_id', 'cameras_id');

--    Map historic captures in models table
insert into models (owner_id, owner_type, dependent_id, dependent_type)
select owner_id, owner_type, id, 'historic_captures'
from historic_captures;

-- convert empty strings to nulls
UPDATE historic_captures
SET shutter_speed=NULL
where shutter_speed = '';

UPDATE historic_captures
SET cameras_id=NULL
where cameras_id = '';

UPDATE historic_captures
SET lens_id=NULL
where lens_id = '';

-- Foreign key constraints
alter table historic_captures
    drop CONSTRAINT IF EXISTS fk_shutter_speed;
alter table historic_captures
    add CONSTRAINT fk_shutter_speed
        FOREIGN KEY (shutter_speed) REFERENCES shutter_speeds (speed);

alter table historic_captures
    drop CONSTRAINT IF EXISTS fk_iso;
alter table historic_captures
    add CONSTRAINT fk_iso
        FOREIGN KEY (iso) REFERENCES iso (setting);

ALTER TABLE historic_captures
    DROP CONSTRAINT IF EXISTS fk_owner;
ALTER TABLE historic_captures
    ADD CONSTRAINT fk_owner
        FOREIGN KEY (owner_id, owner_type)
            REFERENCES models (owner_id, owner_type);

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
UPDATE captures
SET iso=NULL
where iso = '';

UPDATE captures
SET cameras_id=NULL
where cameras_id = '';

UPDATE captures
SET lens_id=NULL
where lens_id = '';

-- Foreign key constraints
alter table captures
    drop CONSTRAINT IF EXISTS fk_shutter_speed;
alter table captures
    add CONSTRAINT fk_shutter_speed
        FOREIGN KEY (shutter_speed)
            REFERENCES shutter_speeds (speed);

alter table captures
    drop CONSTRAINT IF EXISTS fk_iso;
alter table captures
    add CONSTRAINT fk_iso
        FOREIGN KEY (iso)
            REFERENCES iso (setting);

-- Convert alternate field to boolean
alter table captures
    alter COLUMN alternate drop DEFAULT;
alter table captures
    alter alternate TYPE bool
        USING CASE WHEN alternate = 'f' THEN FALSE ELSE TRUE END;
alter table captures
    alter COLUMN alternate SET DEFAULT FALSE;

--    Map captures in models table
insert into models (owner_id, owner_type, dependent_id, dependent_type)
select owner_id, owner_type, id, 'captures'
from captures;


-- -------------------------------------------------------------
--    Capture Images (owned by either Captures or Historic Captures)
-- -------------------------------------------------------------

select rename_column('capture_images', 'captureable_id', 'owner_id');
select rename_column('capture_images', 'captureable_type', 'owner_type');
select rename_owner_types('capture_images');

select setval('capture_images_id_seq', (select max(id) from capture_images) + 1);

--    ALTER TABLE stations DROP CONSTRAINT IF EXISTS check_capture_type;
--    ALTER TABLE stations ADD CONSTRAINT check_capture_type
--    CHECK (capture_images.owner_type = ANY (ARRAY['captures', 'historic_captures']);)

--    Map capture images in models table
insert into models (owner_id, owner_type, dependent_id, dependent_type)
select owner_id, owner_type, id, 'capture_images'
from capture_images;


-- -------------------------------------------------------------
--    Images
-- -------------------------------------------------------------

select rename_column('images', 'image_owner_id', 'owner_id');
select rename_column('images', 'image_owner_type', 'owner_type');
select rename_owner_types('images');

-- TODO: convert ScenicImage and LocationImage image types to scenic and location
--    ALTER TABLE stations DROP CONSTRAINT IF EXISTS check_image_type;
--    ALTER TABLE stations ADD CONSTRAINT check_image_type
--    CHECK (images.type = ANY (ARRAY['scenic', 'location']);)

select setval('images_id_seq', (select max(id) from images) + 1);

--    Map images in models table
insert into models (owner_id, owner_type, dependent_id, dependent_type)
select owner_id, owner_type, id, 'images'
from images;


-- -------------------------------------------------------------
--    Location photos
-- -------------------------------------------------------------

drop table if exists location_photos;



-- -------------------------------------------------------------
--    Metadata types
-- -------------------------------------------------------------

select rename_column('metadata_files', 'metadata_owner_id', 'owner_id');
select rename_column('metadata_files', 'metadata_owner_type', 'owner_type');
select rename_column('metadata_files', 'metadata_file', 'filename');
select rename_owner_types('metadata_files');
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
        FOREIGN KEY (owner_type) REFERENCES model_types (type);

--    Copy existing field_notes table data into metadata files table

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

--    Map capture images in models table
insert into models (owner_id, owner_type, dependent_id, dependent_type)
select owner_id, owner_type, id, 'metadata_files'
from metadata_files;

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


