-- =========================================================
-- Schema Migration script
-- =========================================================
-- Restore database to original:
-- db reset >>> psql -U boutrous mlp2 < path/to/original/meat.sql
-- db reset >>> psql -U boutrous mlp2 < /Users/boutrous/Workspace/NodeJS/db/meat.sql
-- db reset >>> psql -U boutrous mlp2 < /Users/boutrous/Workspace/NodeJS/mlp-db/meat.sql

begin;

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
       ('mlp_modern_visits', 'Visit'),
       ('mlp_locations', 'Location'),
       ('mlp_historic_captures', 'HistoricCapture'),
       ('mlp_modern_captures', 'Capture'),
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
values ('mlp_projects', null),
       ('mlp_surveyors', null),
       ('mlp_surveys', 'mlp_surveyors'),
       ('mlp_survey_seasons', 'mlp_surveys'),
       ('mlp_stations', 'mlp_projects'),
       ('mlp_stations', 'mlp_survey_seasons'),
       ('mlp_historic_visits', 'mlp_stations'),
       ('mlp_modern_visits', 'mlp_stations'),
       ('mlp_locations', 'mlp_modern_visits'),
       ('mlp_historic_captures', 'mlp_surveys'),
       ('mlp_historic_captures', 'mlp_survey_seasons'),
       ('mlp_historic_captures', 'mlp_projects'),
       ('mlp_historic_captures', 'mlp_historic_visits'),
       ('mlp_modern_captures', 'mlp_survey_seasons'),
       ('mlp_modern_captures', 'mlp_modern_visits'),
       ('mlp_modern_captures', 'mlp_stations'),
       ('mlp_modern_captures', 'mlp_locations'),
       ('mlp_capture_images', 'mlp_modern_captures'),
       ('mlp_capture_images', 'mlp_historic_captures'),
       ('mlp_images', 'mlp_locations'),
       ('mlp_images', 'mlp_stations'),
       ('mlp_images', 'mlp_survey_seasons'),
       ('mlp_images', 'mlp_surveys'),
       ('mlp_images', 'mlp_modern_visits'),
       ('mlp_cameras', 'mlp_historic_captures'),
       ('mlp_cameras', 'mlp_modern_captures'),
       ('mlp_cameras', 'mlp_images'),
       ('mlp_glass_plate_listings', 'mlp_survey_seasons'),
       ('mlp_maps', 'mlp_survey_seasons'),
       ('mlp_participant_groups', 'mlp_modern_visits'),
       ('mlp_metadata_files', 'mlp_modern_visits'),
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
    "owner_id" integer,
    "owner_type"  varchar(40),
    "created_at" timestamp without time zone NOT NULL,
    "updated_at" timestamp without time zone NOT NULL,
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

DROP TABLE IF EXISTS "mlp_projects" cascade;

CREATE TABLE "public"."mlp_projects" (
         "nodes_id" integer primary key,
         "name" character varying(255),
         "description" text,
         CONSTRAINT fk_nodes_id FOREIGN KEY (nodes_id)
             REFERENCES mlp_nodes (id)
) WITH (oids = false);

-- populate the nodes table
insert into mlp_nodes (old_id, type, owner_id, owner_type, created_at, updated_at, published, legacy_path, fs_path)
select id, 'mlp_projects', null, null, created_at, updated_at, published, null, fs_path
from projects order by id;

insert into mlp_projects (nodes_id)
select id from mlp_nodes where type='mlp_projects' order by old_id;

-- populate the projects table
update  mlp_projects
set name = q.name,
    description = q.description
from (select * from projects order by id) as q
where (select old_id from mlp_nodes where id=mlp_projects.nodes_id) = q.id;


-- -------------------------------------------------------------
--    Surveyors (root owners)
-- -------------------------------------------------------------

DROP TABLE IF EXISTS "mlp_surveyors" cascade;

CREATE TABLE "public"."mlp_surveyors" (
      "nodes_id" integer primary key,
      "last_name" character varying(255),
      "given_names" character varying(255),
      "short_name" character varying(255),
      "affiliation" character varying(255),
      CONSTRAINT "fk_nodes_id" FOREIGN KEY (nodes_id)
          REFERENCES "mlp_nodes" (id)
) WITH (oids = false);

-- populate the nodes table

insert into mlp_nodes (old_id, type, owner_id, owner_type, created_at, updated_at, published, legacy_path, fs_path)
select id, 'mlp_surveyors', null, null, created_at, updated_at, published, null, fs_path
from surveyors order by id;

insert into mlp_surveyors (nodes_id)
select id from mlp_nodes where type='mlp_surveyors' order by old_id;

-- populate the surveyors table
update  mlp_surveyors
set last_name = q.last_name,
    given_names = q.given_names,
    short_name = q.short_name,
    affiliation = q.affiliation
from (select * from surveyors order by id) as q
where (select old_id from mlp_nodes where id=mlp_surveyors.nodes_id) = q.id;


-- -------------------------------------------------------------
--    Surveys  (owned by surveyors)
-- -------------------------------------------------------------

DROP TABLE IF EXISTS "mlp_surveys";

CREATE TABLE "public"."mlp_surveys" (
        "nodes_id" integer primary key,
        "name" character varying(255),
        "historical_map_sheet" character varying(255),
        CONSTRAINT fk_nodes_id FOREIGN KEY (nodes_id)
            REFERENCES mlp_nodes (id)
) WITH (oids = false);

-- update owner ids
update surveys set surveyor_id=q.id
from (select * from mlp_nodes) as q
where surveys.surveyor_id=q.old_id and q.type='mlp_surveyors';

-- populate the nodes table
insert into mlp_nodes (old_id, type, owner_id, owner_type, created_at, updated_at, published, legacy_path, fs_path)
select id, 'mlp_surveys', surveyor_id, 'mlp_surveyors', created_at, updated_at, published, null, fs_path
from surveys order by id;

-- populate the projects table
insert into mlp_surveys (nodes_id)
select id from mlp_nodes where type='mlp_surveys' order by old_id;

update  mlp_surveys
set name = q.name,
    historical_map_sheet = q.historical_map_sheet
from (select * from surveys order by id) as q
where (select old_id from mlp_nodes where id=mlp_surveys.nodes_id) = q.id;


-- -------------------------------------------------------------
--    Survey Seasons  (owned by surveys)
-- -------------------------------------------------------------

DROP TABLE IF EXISTS "mlp_survey_seasons";

CREATE TABLE "public"."mlp_survey_seasons" (
       "nodes_id" integer primary key,
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
       CONSTRAINT fk_nodes_id FOREIGN KEY (nodes_id)
           REFERENCES mlp_nodes (id)
) WITH (oids = false);

CREATE INDEX if not exists "index_survey_seasons_on_record_id"
    ON "public"."mlp_survey_seasons" USING btree ("record_id");

-- update owner ids
update survey_seasons set survey_id=q.id
from (select * from mlp_nodes) as q
where survey_seasons.survey_id=q.old_id and q.type='mlp_surveys';

-- populate the nodes table
insert into mlp_nodes (old_id, type, owner_id, owner_type, created_at, updated_at, published, legacy_path, fs_path)
select id, 'mlp_survey_seasons', survey_id, 'mlp_surveys', created_at, updated_at, published, null, fs_path
from survey_seasons order by id;

-- populate the projects table
insert into mlp_survey_seasons (nodes_id)
select id from mlp_nodes where type='mlp_survey_seasons' order by old_id;

update  mlp_survey_seasons
set year=q.year,
    geographic_coverage=q.geographic_coverage,
    record_id=q.record_id,
    jurisdiction=q.jurisdiction,
    affiliation=q.affiliation,
    archive=q.archive,
    collection=q.collection,
    location=q.location,
    sources=q.sources,
    notes=q.notes
from (select * from survey_seasons order by id) as q
where (select old_id from mlp_nodes where id=mlp_survey_seasons.nodes_id) = q.id;


-- -------------------------------------------------------------
--    Stations (multiple owners)
-- -------------------------------------------------------------

DROP TABLE IF EXISTS "mlp_stations";

CREATE TABLE "public"."mlp_stations" (
         "nodes_id" integer primary key,
         "name" character varying(255),
         "lat" double precision,
         "long" double precision,
         "elevation" double precision,
         "nts_sheet" character varying(255),
         CONSTRAINT fk_nodes_id FOREIGN KEY (nodes_id)
             REFERENCES mlp_nodes (id)
) WITH (oids = false);

-- update owner data
update stations
set station_owner_type=q.name
from (select * from mlp_node_types) as q
where stations.station_owner_type=q.label;

update stations
set station_owner_id=q.id
from (select * from mlp_nodes) as q
where stations.station_owner_id=q.old_id
  and q.type=stations.station_owner_type;

-- populate the nodes table
insert into mlp_nodes (old_id, type, owner_id, owner_type, created_at, updated_at, published, legacy_path, fs_path)
select id, 'mlp_stations', station_owner_id, station_owner_type, created_at, updated_at, published, null, fs_path
from stations order by id;

-- populate the projects table
insert into mlp_stations (nodes_id)
select id from mlp_nodes where type='mlp_stations' order by old_id;

update  mlp_stations
set name=q.name,
    lat=q.lat,
    long=q.long,
    elevation=q.elevation,
    nts_sheet=q.nts_sheet
from (select * from stations order by id) as q
where (select old_id from mlp_nodes where id=mlp_stations.nodes_id) = q.id;


-- -------------------------------------------------------------
--    Historic Visits (owned by stations)
-- -------------------------------------------------------------

DROP TABLE IF EXISTS "mlp_historic_visits";

CREATE TABLE "public"."mlp_historic_visits" (
        "nodes_id" integer primary key,
        "date" date,
        "comments" text,
        CONSTRAINT fk_nodes_id FOREIGN KEY (nodes_id)
            REFERENCES mlp_nodes (id)
) WITH (oids = false);

-- update owner ids
update historic_visits set station_id=q.id
from (select * from mlp_nodes) as q
where historic_visits.station_id=q.old_id and q.type='mlp_stations';

-- populate the nodes table
insert into mlp_nodes (old_id, type, owner_id, owner_type, created_at, updated_at, published, legacy_path, fs_path)
select id, 'mlp_historic_visits', station_id, 'mlp_stations', created_at, updated_at, published, null, fs_path
from historic_visits order by id;

-- populate the table
insert into mlp_historic_visits (nodes_id)
select id from mlp_nodes where type='mlp_historic_visits' order by old_id;

update  mlp_historic_visits
set date=q.date,
    comments=q.comments
from (select * from historic_visits order by id) as q
where (select old_id from mlp_nodes where id=mlp_historic_visits.nodes_id) = q.id;



-- -------------------------------------------------------------
--    Visits (owned by stations)
-- -------------------------------------------------------------

DROP TABLE IF EXISTS "mlp_modern_visits";

CREATE TABLE "public"."mlp_modern_visits" (
      "nodes_id" integer primary key,
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
      CONSTRAINT fk_nodes_id FOREIGN KEY (nodes_id)
          REFERENCES mlp_nodes (id)
) WITH (oids = false);

-- update owner ids
update visits set station_id=q.id
from (select * from mlp_nodes) as q
where visits.station_id=q.old_id and q.type='mlp_stations';

-- populate the nodes table
insert into mlp_nodes (old_id, type, owner_id, owner_type, created_at, updated_at, published, legacy_path, fs_path)
select id, 'mlp_modern_visits', station_id, 'mlp_stations', created_at, updated_at, published, null, fs_path
from visits order by id;

-- populate the table
insert into mlp_modern_visits (nodes_id)
select id from mlp_nodes where type='mlp_modern_visits' order by old_id;

update  mlp_modern_visits
set date=q.date,
    start_time=q.start_time,
    finish_time=q.finish_time,
    pilot=q.pilot,
    rw_call_sign=q.rw_call_sign,
    visit_narrative=q.visit_narrative,
    illustration=q.illustration,
    weather_narrative=q.weather_narrative,
    weather_temp=q.weather_temp,
    weather_ws=q.weather_ws,
    weather_gs=q.weather_gs,
    weather_pressure=q.weather_pressure,
    weather_rh=q.weather_rh,
    weather_wb=q.weather_wb,
    fn_physical_location=q.fn_physical_location,
    fn_transcription_comment=q.fn_transcription_comment
from (select * from visits order by id) as q
where (select old_id from mlp_nodes where id=mlp_modern_visits.nodes_id) = q.id;


-- -------------------------------------------------------------
--    Locations (owned by visits)
-- -------------------------------------------------------------
DROP TABLE IF EXISTS "mlp_locations";

CREATE TABLE "public"."mlp_locations" (
      "nodes_id" integer primary key,
      "location_narrative" text,
      "location_identity" character varying(255),
      "legacy_photos_start" integer,
      "legacy_photos_end" integer,
      "lat" double precision,
      "long" double precision,
      "elevation" double precision,
      CONSTRAINT fk_nodes_id FOREIGN KEY (nodes_id)
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

-- update owner ids
update locations set visit_id=q.id
from (select * from mlp_nodes) as q
where locations.visit_id=q.old_id and q.type='mlp_modern_visits';

-- populate the nodes table
insert into mlp_nodes (old_id, type, owner_id, owner_type, created_at, updated_at, published, legacy_path)
select id, 'mlp_locations', visit_id, 'mlp_modern_visits', created_at, updated_at, published, null
from locations order by id;

-- populate the table
insert into mlp_locations (nodes_id)
select id from mlp_nodes where type='mlp_locations' order by old_id;

update  mlp_locations
set location_narrative=q.location_narrative,
    location_identity=q.location_identity,
    legacy_photos_start=q.legacy_photos_start,
    legacy_photos_end=q.legacy_photos_end,
    lat=q.lat,
    long=q.long,
    elevation=q.elevation
from (select * from locations order by id) as q
where (select old_id from mlp_nodes where id=mlp_locations.nodes_id) = q.id;

commit;


