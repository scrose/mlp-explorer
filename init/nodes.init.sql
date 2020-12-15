-- =========================================================
-- Schema Migration script
-- =========================================================
-- Restore database to original:
-- db reset >>> psql -U boutrous mlp2 < path/to/original/meat.sql
-- db reset >>> psql -U boutrous mlp2 < /Users/boutrous/Workspace/NodeJS/db/meat.sql
-- db reset >>> psql -U boutrous mlp2 < /Users/boutrous/Workspace/NodeJS/mlp-db/meat.sql


-- -------------------------------------------------------------
-- Function: Remap Nodes
-- -------------------------------------------------------------

begin;
create or replace function remap_nodes(  _tbl varchar(40),
                                         _owner_type varchar(40)=null
                                         ) RETURNS void

    LANGUAGE plpgsql as
$$
declare
    _rec RECORD;
begin

    -- Insert record into nodes table
    execute format(E'insert into nodes (node_id, type)
        select id, \'%s\' from %I returning nodes.id', _tbl, _tbl);

    RAISE NOTICE E'Model: \'%\'', _tbl;
    RAISE NOTICE E'Owner: \'%\'', _owner_type;

    -- Update owner references
    if ( _owner_type <> '' ) is true
    then
        execute format(E'update %I set owner_id = owners.id
            from (select * from nodes) as owners
            where %I.owner_id=owners.node_id
                and owners.type=\'%s\' returning *', _tbl, _tbl, _owner_type) into _rec;
    elsif _owner_type is null
    then
        execute format(E'update %I set owner_id = owners.id
            from (select * from nodes) as owners
            where %I.owner_id=owners.node_id
                and owners.type=%I.owner_type returning *', _tbl, _tbl, _tbl) into _rec;
        -- remove the owner_type column
        execute format(E'alter table %I drop column owner_type', _tbl);
    end if;

    -- remove ID serial auto-increment default and update ID values to node IDs
    execute format(E'alter table %I add column if not exists ' ||
                   E'node_id integer;', _tbl);
    execute format(E'update %I set node_id = refs.id from (
        select id from nodes where nodes.type=\'%s\' order by node_id) as refs', _tbl, _tbl);
--     execute format(E'alter table %I add column if not exists ' ||
--                    E'node_id integer;', _tbl);

    -- include foreign key constraint to nodes table
    execute format(E'alter table %I drop constraint if exists fk_node_id', _tbl);
    execute format(E'alter table %I
                        add constraint fk_node_id FOREIGN KEY (node_id) REFERENCES nodes (id)', _tbl);

    -- add triggers
    execute format(E'CREATE TRIGGER node_inserts
        BEFORE INSERT
        ON %I
        FOR EACH ROW
        EXECUTE PROCEDURE add_node()', _tbl);
end
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
    execute format(E'alter table %I alter COLUMN %s drop DEFAULT', _tbl, _col);
    execute format(E'alter table %I alter %s TYPE bool
            USING CASE WHEN %s = \'t\' THEN TRUE ELSE FALSE END', _tbl, _col, _col);
    execute format(E'alter table %I alter COLUMN %s SET DEFAULT FALSE;', _tbl, _col);
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
       ('participant_groups', 'Participant Groups');


-- -------------------------------------------------------------
-- Model Relations Table
-- -------------------------------------------------------------

drop table if exists node_relations cascade;

create TABLE node_relations
(
    id             serial PRIMARY KEY,
    dependent_type VARCHAR(40) NOT NULL,
    owner_type     VARCHAR(40),
    UNIQUE (owner_type, dependent_type),
    CONSTRAINT fk_owner_type FOREIGN KEY (owner_type)
        REFERENCES node_types (name),
    CONSTRAINT fk_dependent_type FOREIGN KEY (dependent_type)
        REFERENCES node_types (name)
);

insert into node_relations (dependent_type, owner_type)
values ('projects', 'projects'),
       ('surveyors', 'surveyors'),
       ('surveys', 'surveyors'),
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
    node_id integer not null,
    type    varchar(40) not null,
    CONSTRAINT fk_type FOREIGN KEY (type)
        REFERENCES node_types (name)
);

create INDEX node_index ON nodes (id, type);


-- =========================================================
-- Enumerated Types
-- =========================================================

--    Metadata Types

CREATE TYPE metadata_types AS ENUM ('field_notes', 'ancillary');

--    Image States

CREATE TYPE image_states AS ENUM ('raw', 'interim', 'master', 'misc');

--    Image Types

CREATE TYPE image_types AS ENUM ('capture', 'location', 'scenic');



/**
===========================
Model schema updates
===========================
*/


-- -------------------------------------------------------------
--    Projects (root owners)
-- -------------------------------------------------------------

-- Convert published field to boolean
select convert_boolean('projects', 'published');

-- Remap to nodes
select remap_nodes('projects',  '');



-- -------------------------------------------------------------
--    Surveyors (root owners)
-- -------------------------------------------------------------

-- Convert published field to boolean
select convert_boolean('surveyors', 'published');

-- Remap to nodes
select remap_nodes('surveyors',  '');


-- -------------------------------------------------------------
--    Surveys  (strictly owned by Surveyors)
-- -------------------------------------------------------------

select rename_column('surveys', 'surveyor_id', 'owner_id');

-- Convert published field to boolean
select convert_boolean('surveys', 'published');

-- Remap to nodes
select remap_nodes('surveys',  'surveyors');



-- -------------------------------------------------------------
--    Survey Seasons  (strictly owned by Surveys)
-- -------------------------------------------------------------

select rename_column('survey_seasons', 'survey_id', 'owner_id');

-- Convert published field to boolean
select convert_boolean('survey_seasons', 'published');

-- Year constraint
alter table survey_seasons
    drop CONSTRAINT IF EXISTS check_year;
alter table survey_seasons
    add CONSTRAINT check_year
        CHECK (survey_seasons.year > 1700 AND survey_seasons.year <= EXTRACT(YEAR FROM NOW()));

-- Remap to nodes
select remap_nodes('survey_seasons',  'surveys');


-- -------------------------------------------------------------
--    Stations
-- -------------------------------------------------------------

select rename_column('stations', 'station_owner_id', 'owner_id');
select rename_column('stations', 'station_owner_type', 'owner_type');
select rename_owner_types('stations');

-- Convert published field to boolean
select convert_boolean('stations', 'published');

-- Remap to nodes
select remap_nodes('stations',  null);


-- -------------------------------------------------------------
--    Historic Visits (strictly owned by Stations)
-- -------------------------------------------------------------

select rename_column('historic_visits', 'station_id', 'owner_id');

-- Convert published field to boolean
select convert_boolean('historic_visits', 'published');

-- Remap to nodes
select remap_nodes('historic_visits',  'stations');

-- -------------------------------------------------------------
--    Visits (strictly owned by Stations)
-- -------------------------------------------------------------

select rename_column('visits', 'station_id', 'owner_id');

-- Convert published field to boolean
select convert_boolean('visits', 'published');

-- Remap to nodes
select remap_nodes('visits',  'stations');


-- -------------------------------------------------------------
--    Locations (strictly owned by Visits)
-- -------------------------------------------------------------

select rename_column('locations', 'visit_id', 'owner_id');

select setval('locations_id_seq', (select max(id) from locations) + 1);

-- Latitude/Longitude constraints
--    ALTER TABLE locations DROP CONSTRAINT IF EXISTS check_latitude;
--    ALTER TABLE locations ADD CONSTRAINT check_latitude
--    CHECK (stations.lat ~* '^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$')
--
--    ALTER TABLE locations DROP CONSTRAINT IF EXISTS check_longitude;
--    ALTER TABLE locations ADD CONSTRAINT check_longitude
--    CHECK (stations.long ~* '^[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$')

-- Convert published field to boolean
select convert_boolean('locations', 'published');

-- Remap to nodes
select remap_nodes('locations',  'visits');

-- -------------------------------------------------------------
--    Historic Captures
-- -------------------------------------------------------------

select rename_column('historic_captures', 'capture_owner_id', 'owner_id');
select rename_column('historic_captures', 'capture_owner_type', 'owner_type');
select rename_column('historic_captures', 'camera_id', 'cameras_id');

select rename_owner_types('historic_captures');

-- convert empty strings to nulls
UPDATE historic_captures
SET shutter_speed=NULL
where shutter_speed = '';

-- Latitude/Longitude constraints
--    ALTER TABLE stations DROP CONSTRAINT IF EXISTS check_latitude;
--    ALTER TABLE stations ADD CONSTRAINT check_latitude
--    CHECK (stations.lat ~* '^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$')
--
--    ALTER TABLE stations DROP CONSTRAINT IF EXISTS check_longitude;
--    ALTER TABLE stations ADD CONSTRAINT check_longitude
--    CHECK (stations.long ~* '^[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$')

-- Convert published field to boolean
select convert_boolean('historic_captures', 'published');

-- Remap to nodes
select remap_nodes('historic_captures',  null);


-- -------------------------------------------------------------
--    Captures
-- -------------------------------------------------------------

select rename_column('captures', 'capture_owner_id', 'owner_id');
select rename_column('captures', 'capture_owner_type', 'owner_type');
select rename_column('captures', 'camera_id', 'cameras_id');
select rename_owner_types('captures');

-- convert empty strings to nulls
UPDATE captures
SET shutter_speed=NULL
where shutter_speed = '';

alter table captures
    drop CONSTRAINT IF EXISTS fk_camera;
alter table captures
    add CONSTRAINT fk_camera
        FOREIGN KEY (cameras_id)
            REFERENCES cameras (id);

-- Convert alternate field to boolean
select convert_boolean('captures', 'alternate');

-- Remap to nodes
select remap_nodes('captures',  null);

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

-- Remap to nodes
select remap_nodes('capture_images',  null);

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

-- Remap to nodes
select remap_nodes('images',  null);

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

-- Add metadata type column
DO
$$
    begin
        begin
            ALTER TABLE metadata_files
                ADD COLUMN metadata_type metadata_types DEFAULT 'ancillary';
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

-- Remap to nodes
select remap_nodes('metadata_files',  null);

-- -------------------------------------------------------------
--    Glass Plate Listings
-- -------------------------------------------------------------

select rename_column('glass_plate_listings', 'survey_season_id', 'owner_id');

-- Remap to nodes
select remap_nodes('glass_plate_listings',  'survey_seasons');


-- -------------------------------------------------------------
--    Maps
-- -------------------------------------------------------------

select rename_column('maps', 'survey_season_id', 'owner_id');

-- Remap to nodes
select remap_nodes('maps',  'survey_seasons');


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


commit;


