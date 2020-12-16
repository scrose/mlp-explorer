-- =========================================================
-- Schema Migration script
-- =========================================================
-- Restore database to original:
-- db reset >>> psql -U boutrous mlp2 < path/to/original/meat.sql
-- db reset >>> psql -U boutrous mlp2 < /Users/boutrous/Workspace/NodeJS/db/meat.sql
-- db reset >>> psql -U boutrous mlp2 < /Users/boutrous/Workspace/NodeJS/mlp-db/meat.sql


-- -------------------------------------------------------------
--    Images
-- -------------------------------------------------------------

-- update owner types
select rename_owner_types('images');

DROP TABLE IF EXISTS "mlp_images";

CREATE TABLE "public"."mlp_images" (
           "id" serial primary key NOT NULL,
           "file_name" character varying(255) NOT NULL,
           "file_size" double precision,
           "x_dim" integer,
           "y_dim" integer,
           "bit_depth" integer,
           "remote" character varying(255),
           "secure_token" character varying(255),
           "comments" character varying(255),
           "lat" double precision,
           "long" double precision,
           "elevation" double precision,
           "f_stop" double precision,
           "shutter_speed" integer,
           "iso" integer,
           "focal_length" integer,
           "capture_datetime" timestamp,
           "camera_id" integer,
           "lens_id" integer,
           "created_at" timestamp NOT NULL,
           "updated_at" timestamp NOT NULL,
           "fs_path" text,
           "legacy_path" text,
           "image_tmp" character varying(255),
           CONSTRAINT "mlp_images_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE INDEX "index_images_on_legacy_path" ON "public"."mlp_images" USING btree ("legacy_path");

--- Historic Images (owned by Historic Captures)

CREATE TABLE "public"."mlp_historic_images" (
       "image_id" integer NOT NULL,
       "owner_id" integer NOT NULL,
        CONSTRAINT fk_image_id FOREIGN KEY (image_id)
           REFERENCES mlp_images (id),
        CONSTRAINT fk_owner_id FOREIGN KEY (owner_id)
            REFERENCES mlp_historic_captures (capture_id)
) WITH (oids = false);

CREATE INDEX "index_historic_images_on_owner_id" ON "public"."mlp_historic_images" USING btree ("owner_id");

--- Modern Images (owned by Modern Captures)

CREATE TABLE "public"."mlp_modern_images" (
        "image_id" integer NOT NULL,
        "owner_id" integer NOT NULL,
        CONSTRAINT fk_image_id FOREIGN KEY (image_id)
            REFERENCES mlp_images (id),
        CONSTRAINT fk_owner_id FOREIGN KEY (owner_id)
            REFERENCES mlp_modern_captures (capture_id)
) WITH (oids = false);

CREATE INDEX "index_historic_images_on_owner_id" ON "public"."mlp_modern_images" USING btree ("owner_id");

--- Scenic Images

CREATE TABLE "public"."mlp_scenic_images" (
       "image_id" integer NOT NULL,
       "owner_id" integer NOT NULL,
       CONSTRAINT fk_image_id FOREIGN KEY (image_id)
           REFERENCES mlp_images (id),
       CONSTRAINT fk_owner_id FOREIGN KEY (owner_id)
           REFERENCES mlp_nodes (id)
) WITH (oids = false);

CREATE INDEX "index_scenic_images_on_owner_id" ON "public"."mlp_scenic_images" USING btree ("owner_id");

--- Location Images

CREATE TABLE "public"."mlp_location_images" (
       "image_id" integer NOT NULL,
       "owner_id" integer NOT NULL,
       CONSTRAINT fk_image_id FOREIGN KEY (image_id)
           REFERENCES mlp_images (id),
       CONSTRAINT fk_owner_id FOREIGN KEY (owner_id)
           REFERENCES mlp_nodes (id)
) WITH (oids = false);

CREATE INDEX "index_location_images_on_owner_id" ON "public"."mlp_location_images" USING btree ("owner_id");








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


