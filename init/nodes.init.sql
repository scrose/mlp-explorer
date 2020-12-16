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

drop table if exists "mlp_node_types" CASCADE;

create TABLE"public"."mlp_node_types"
(
    id    serial PRIMARY KEY,
    name  VARCHAR(40) UNIQUE NOT NULL,
    label VARCHAR(40) UNIQUE NOT NULL
);

insert into "public"."mlp_node_types" (name, label)
values ('mlp_users', 'Users'),
       ('mlp_projects', 'Project'),
       ('mlp_surveyors', 'Surveyor'),
       ('mlp_surveys', 'Survey'),
       ('mlp_survey_seasons', 'SurveySeason'),
       ('mlp_stations', 'Station'),
       ('mlp_historic_visits', 'HistoricVisit'),
       ('mlp_visits', 'Visit'),
       ('mlp_locations', 'Location'),
       ('mlp_historic_captures', 'HistoricCapture'),
       ('mlp_captures', 'Capture'),
       ('mlp_capture_images', 'CaptureImage'),
       ('mlp_images', 'Image'),
       ('mlp_glass_plate_listings', 'Glass Plate Listings'),
       ('mlp_cameras', 'Cameras'),
       ('mlp_lens', 'Lenses'),
       ('mlp_metadata_files', 'Metadata Files'),
       ('mlp_maps', 'Maps'),
       ('mlp_participants', 'Participants'),
       ('mlp_participant_groups', 'Participant Groups');


-- -------------------------------------------------------------
-- Model Relations Table
-- -------------------------------------------------------------

drop table if exists "mlp_node_relations" cascade;

create TABLE "mlp_node_relations"
(
    "id "            serial PRIMARY KEY,
    "dependent_type" VARCHAR(40) NOT NULL,
    "owner_type"     VARCHAR(40),
    UNIQUE (owner_type, dependent_type),
    CONSTRAINT fk_owner_type FOREIGN KEY (owner_type)
        REFERENCES "mlp_node_types" (name),
    CONSTRAINT fk_dependent_type FOREIGN KEY (dependent_type)
        REFERENCES "mlp_node_types" (name)
);

insert into "mlp_node_relations" (dependent_type, owner_type)
values ('mlp_projects', 'mlp_mlp_projects'),
       ('mlp_surveyors', 'mlp_surveyors'),
       ('mlp_surveys', 'mlp_surveyors'),
       ('mlp_survey_seasons', 'mlp_surveys'),
       ('mlp_stations', 'mlp_projects'),
       ('mlp_stations', 'mlp_survey_seasons'),
       ('mlp_historic_visits', 'mlp_stations'),
       ('mlp_visits', 'mlp_stations'),
       ('mlp_locations', 'mlp_visits'),
       ('mlp_historic_captures', 'mlp_surveys'),
       ('mlp_historic_captures', 'mlp_survey_seasons'),
       ('mlp_historic_captures', 'mlp_projects'),
       ('mlp_historic_captures', 'mlp_historic_visits'),
       ('mlp_captures', 'mlp_survey_seasons'),
       ('mlp_captures', 'mlp_visits'),
       ('mlp_captures', 'mlp_stations'),
       ('mlp_captures', 'mlp_locations'),
       ('mlp_capture_images', 'mlp_captures'),
       ('mlp_capture_images', 'mlp_historic_captures'),
       ('mlp_images', 'mlp_locations'),
       ('mlp_images', 'mlp_stations'),
       ('mlp_images', 'mlp_survey_seasons'),
       ('mlp_images', 'mlp_surveys'),
       ('mlp_images', 'mlp_visits'),
       ('mlp_cameras', 'mlp_historic_captures'),
       ('mlp_cameras', 'mlp_captures'),
       ('mlp_cameras', 'mlp_images'),
       ('mlp_glass_plate_listings', 'mlp_survey_seasons'),
       ('mlp_maps', 'mlp_survey_seasons'),
       ('mlp_participant_groups', 'mlp_visits'),
       ('mlp_metadata_files', 'mlp_visits'),
       ('mlp_metadata_files', 'mlp_stations');


-- -------------------------------------------------------------
-- Nodes Table
-- -------------------------------------------------------------

drop table if exists mlp_nodes cascade;

create TABLE IF NOT EXISTS "public"."mlp_nodes"
(
    "id"      serial PRIMARY KEY,
    "old_id" integer not null,
    "type"  varchar(40) not null,
    "owner_id" integer not null,
    "owner_type"  varchar(40) not null,
    "created_at" timestamp NOT NULL,
    "updated_at" timestamp NOT NULL,
    "published" boolean,
    "legacy_path" text,
    "fs_path" text,
    CONSTRAINT fk_ownerid FOREIGN KEY (owner_id)
        REFERENCES mlp_nodes (id),
    CONSTRAINT fk_node_relation FOREIGN KEY (type, owner_type)
        REFERENCES mlp_node_relations (dependent_type, owner_type)
);

create INDEX node_index
    ON "mlp_nodes" (id, type);
CREATE INDEX "index_nodes_on_legacy_path"
    ON "public"."mlp_nodes" USING btree ("legacy_path");


-- -------------------------------------------------------------
--    Projects (root owners)
-- -------------------------------------------------------------

DROP TABLE IF EXISTS "mlp_projects";

CREATE TABLE "public"."mlp_projects" (
         "node_id" integer primary key,
         "name" character varying(255),
         "description" text,
         CONSTRAINT fk_node_id FOREIGN KEY (node_id)
             REFERENCES mlp_nodes (id)
) WITH (oids = false);


-- -------------------------------------------------------------
--    Surveyors (root owners)
-- -------------------------------------------------------------

DROP TABLE IF EXISTS "mlp_surveyors";

CREATE TABLE "public"."mlp_surveyors" (
      "node_id" integer primary key,
      "last_name" character varying(255),
      "given_names" character varying(255),
      "short_name" character varying(255),
      "affiliation" character varying(255),
      CONSTRAINT "fk_node_id" FOREIGN KEY (node_id)
          REFERENCES "mlp_nodes" (id)
) WITH (oids = false);


-- -------------------------------------------------------------
--    Surveys  (strictly owned by Surveyors)
-- -------------------------------------------------------------

DROP TABLE IF EXISTS "mlp_surveys";

CREATE TABLE "public"."mlp_surveys" (
        "node_id" integer primary key,
        "name" character varying(255),
        CONSTRAINT fk_node_id FOREIGN KEY (node_id)
            REFERENCES mlp_nodes (id)
) WITH (oids = false);


-- -------------------------------------------------------------
--    Survey Seasons  (strictly owned by Surveys)
-- -------------------------------------------------------------

DROP TABLE IF EXISTS "mlp_survey_seasons";

CREATE TABLE "public"."mlp_survey_seasons" (
       "node_id" integer primary key,
       "year" integer CHECK (year > 1800 AND year <= EXTRACT(YEAR FROM NOW())),
       "geographic_coverage" character varying(255),
       "record_id" integer,
       "jurisdiction" text,
       "affiliation" text,
       "archive" text,
       "collection" text,
       "location" text,
       "sources" text,
       "notes" text,
       CONSTRAINT fk_node_id FOREIGN KEY (node_id)
           REFERENCES mlp_nodes (id)
) WITH (oids = false);

CREATE INDEX "index_survey_seasons_on_record_id"
    ON "public"."mlp_survey_seasons" USING btree ("record_id");


-- -------------------------------------------------------------
--    Stations
-- -------------------------------------------------------------

DROP TABLE IF EXISTS "mlp_stations";

CREATE TABLE "public"."mlp_stations" (
         "node_id" integer primary key,
         "name" character varying(255),
         "lat" double precision,
         "long" double precision,
         "elevation" double precision,
         "nts_sheet" character varying(255),
         CONSTRAINT fk_node_id FOREIGN KEY (node_id)
             REFERENCES mlp_nodes (id)
) WITH (oids = false);


-- -------------------------------------------------------------
--    Historic Visits
-- -------------------------------------------------------------

DROP TABLE IF EXISTS "mlp_historic_visits";

CREATE TABLE "public"."mlp_historic_visits" (
        "node_id" integer primary key,
        "date" date,
        "comments" text,
        CONSTRAINT fk_node_id FOREIGN KEY (node_id)
            REFERENCES mlp_nodes (id)
) WITH (oids = false);


-- -------------------------------------------------------------
--    Visits (strictly owned by Stations)
-- -------------------------------------------------------------

DROP TABLE IF EXISTS "mlp_modern_visits";

CREATE TABLE "public"."mlp_modern_visits" (
      "node_id" integer primary key,
      "date" date,
      "start_time" time without time zone,
      "finish_time" time without time zone,
      "pilot" character varying(255),
      "rw_call_sign" character varying(255),
      "visit_narrative" text,
      "illustration" boolean,
      "weather_narrative" text,
      "weather_temp" double precision,
      "weather_ws" double precision,
      "weather_gs" double precision,
      "weather_pressure" double precision,
      "weather_rh" double precision,
      "weather_wb" double precision,
      "fn_physical_location" character varying(255),
      "fn_transcription_comment" text,
      CONSTRAINT fk_node_id FOREIGN KEY (node_id)
          REFERENCES mlp_nodes (id)
) WITH (oids = false);



-- -------------------------------------------------------------
--    Locations (strictly owned by Visits)
-- -------------------------------------------------------------
DROP TABLE IF EXISTS "locations";

CREATE TABLE "public"."locations" (
      "node_id" integer primary key,
      "location_narrative" text,
      "location_identity" character varying(255),
      "lat" double precision,
      "long" double precision,
      "legacy_photos_start" integer,
      "legacy_photos_end" integer,
      "elevation" double precision,
      CONSTRAINT fk_node_id FOREIGN KEY (node_id)
          REFERENCES mlp_nodes (id)
) WITH (oids = false);


-- Latitude/Longitude constraints
--    ALTER TABLE locations DROP CONSTRAINT IF EXISTS check_latitude;
--    ALTER TABLE locations ADD CONSTRAINT check_latitude
--    CHECK (stations.lat ~* '^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$')
--
--    ALTER TABLE locations DROP CONSTRAINT IF EXISTS check_longitude;
--    ALTER TABLE locations ADD CONSTRAINT check_longitude
--    CHECK (stations.long ~* '^[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$')
