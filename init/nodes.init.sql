-- =========================================================
-- Schema Migration script
-- =========================================================

begin;

-- -------------------------------------------------------------
-- Model Types HorzTable
-- -------------------------------------------------------------

drop table if exists "node_types" CASCADE;

create TABLE"public"."node_types"
(
    id    serial PRIMARY KEY,
    name  VARCHAR(40) UNIQUE NOT NULL,
    label VARCHAR(40) UNIQUE NOT NULL
);

insert into "public"."node_types" (name, label)
values ('users', 'Users'),
       ('projects', 'Project'),
       ('surveyors', 'Surveyor'),
       ('surveys', 'Survey'),
       ('survey_seasons', 'SurveySeason'),
       ('stations', 'Station'),
       ('historic_visits', 'HistoricVisit'),
       ('modern_visits', 'Visit'),
       ('locations', 'Location'),
       ('historic_captures', 'HistoricCapture'),
       ('modern_captures', 'Capture'),
       ('files', 'Files');


-- -------------------------------------------------------------
-- Model Relations HorzTable
-- -------------------------------------------------------------

drop table if exists "node_relations" cascade;

create TABLE "node_relations"
(
    "id "            serial PRIMARY KEY,
    "dependent_type" VARCHAR(40) NOT NULL,
    "owner_type"     VARCHAR(40),
    UNIQUE (owner_type, dependent_type),
    CONSTRAINT fk_owner_type FOREIGN KEY (owner_type)
        REFERENCES "node_types" (name),
    CONSTRAINT fk_dependent_type FOREIGN KEY (dependent_type)
        REFERENCES "node_types" (name)
);

insert into "node_relations" (dependent_type, owner_type)
values ('projects', null),
       ('surveyors', null),
       ('surveys', 'surveyors'),
       ('survey_seasons', 'surveys'),
       ('stations', 'projects'),
       ('stations', 'survey_seasons'),
       ('historic_visits', 'stations'),
       ('modern_visits', 'stations'),
       ('locations', 'modern_visits'),
       ('historic_captures', 'surveys'),
       ('historic_captures', 'survey_seasons'),
       ('historic_captures', 'projects'),
       ('historic_captures', 'historic_visits'),
       ('modern_captures', 'survey_seasons'),
       ('modern_captures', 'modern_visits'),
       ('modern_captures', 'stations'),
       ('modern_captures', 'locations');


-- -------------------------------------------------------------
-- Nodes HorzTable
-- -------------------------------------------------------------

drop table if exists nodes cascade;

create TABLE IF NOT EXISTS "public"."nodes"
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
        REFERENCES nodes (id),
    CONSTRAINT fk_node_relation FOREIGN KEY (type, owner_type)
        REFERENCES node_relations (dependent_type, owner_type)
);

create INDEX node_index
    ON "nodes" (id, type);
CREATE INDEX "index_nodes_on_legacy_path"
    ON "public"."nodes" USING btree ("legacy_path");


-- -------------------------------------------------------------
--    Projects (root owners)
-- -------------------------------------------------------------

DROP TABLE IF EXISTS "projects" cascade;

CREATE TABLE "public"."projects" (
         "nodes_id" integer primary key,
         "name" character varying(255),
         "description" text,
         CONSTRAINT fk_nodes_id FOREIGN KEY (nodes_id)
             REFERENCES nodes (id) ON DELETE CASCADE
) WITH (oids = false);

-- populate the nodes table
insert into nodes (old_id, type, owner_id, owner_type, created_at, updated_at, published, legacy_path, fs_path)
select id, 'projects', null, null, created_at, updated_at, published, null, fs_path
from old_projects order by id;

insert into projects (nodes_id)
select id from nodes where type='projects' order by old_id;

-- populate the old_projects table
update  projects
set name = q.name,
    description = q.description
from (select * from old_projects order by id) as q
where (select old_id from nodes where id=projects.nodes_id) = q.id;


-- -------------------------------------------------------------
--    Surveyors (root owners)
-- -------------------------------------------------------------

DROP TABLE IF EXISTS "surveyors" cascade;

CREATE TABLE "public"."surveyors" (
      "nodes_id" integer primary key,
      "last_name" character varying(255),
      "given_names" character varying(255),
      "short_name" character varying(255),
      "affiliation" character varying(255),
      CONSTRAINT "fk_nodes_id" FOREIGN KEY (nodes_id)
          REFERENCES "nodes" (id) ON DELETE CASCADE
) WITH (oids = false);

-- populate the nodes table

insert into nodes (old_id, type, owner_id, owner_type, created_at, updated_at, published, legacy_path, fs_path)
select id, 'surveyors', null, null, created_at, updated_at, published, null, fs_path
from old_surveyors order by id;

insert into surveyors (nodes_id)
select id from nodes where type='surveyors' order by old_id;

-- populate the old_surveyors table
update  surveyors
set last_name = q.last_name,
    given_names = q.given_names,
    short_name = q.short_name,
    affiliation = q.affiliation
from (select * from old_surveyors order by id) as q
where (select old_id from nodes where id=surveyors.nodes_id) = q.id;


-- -------------------------------------------------------------
--    Surveys  (owned by surveyors)
-- -------------------------------------------------------------

DROP TABLE IF EXISTS "surveys";

CREATE TABLE "public"."surveys" (
        "nodes_id" integer primary key,
        "owner_id" integer not null,
        "name" character varying(255),
        "historical_map_sheet" character varying(255),
        CONSTRAINT fk_nodes_id FOREIGN KEY (nodes_id)
            REFERENCES nodes (id) ON DELETE CASCADE,
        CONSTRAINT fk_nodes_owner_id FOREIGN KEY (owner_id)
            REFERENCES nodes (id) ON DELETE CASCADE
) WITH (oids = false);

-- update owner ids
update old_surveys set surveyor_id=q.id
from (select * from nodes) as q
where old_surveys.surveyor_id=q.old_id and q.type='surveyors';

-- populate the nodes table
insert into nodes (old_id, type, owner_id, owner_type, created_at, updated_at, published, legacy_path, fs_path)
select id, 'surveys', surveyor_id, 'surveyors', created_at, updated_at, published, null, fs_path
from old_surveys order by id;

-- populate the surveys table
insert into surveys (nodes_id, owner_id)
select id, owner_id from nodes where type='surveys' order by old_id;

update surveys
set name = q.name,
    historical_map_sheet = q.historical_map_sheet
from (select * from old_surveys order by id) as q
where (select old_id from nodes where id=surveys.nodes_id) = q.id;


-- -------------------------------------------------------------
--    Survey Seasons  (owned by surveys)
-- -------------------------------------------------------------

DROP TABLE IF EXISTS "survey_seasons";

CREATE TABLE "public"."survey_seasons" (
       "nodes_id" integer primary key,
       "owner_id" integer not null,
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
           REFERENCES nodes (id) ON DELETE CASCADE,
       CONSTRAINT fk_nodes_owner_id FOREIGN KEY (owner_id)
           REFERENCES nodes (id) ON DELETE CASCADE
) WITH (oids = false);

CREATE INDEX if not exists "index_old_survey_seasons_on_record_id"
    ON "public"."survey_seasons" USING btree ("record_id");

-- update owner ids
update old_survey_seasons set survey_id=q.id
from (select * from nodes) as q
where old_survey_seasons.survey_id=q.old_id and q.type='surveys';

-- populate the nodes table
insert into nodes (old_id, type, owner_id, owner_type, created_at, updated_at, published, legacy_path, fs_path)
select id, 'survey_seasons', survey_id, 'surveys', created_at, updated_at, published, null, fs_path
from old_survey_seasons order by id;

-- populate the survey_seasons table
insert into survey_seasons (nodes_id, owner_id)
select id, owner_id from nodes where type='survey_seasons' order by old_id;

update survey_seasons
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
from (select * from old_survey_seasons order by id) as q
where (select old_id from nodes where id=survey_seasons.nodes_id) = q.id;


-- -------------------------------------------------------------
--    Stations (multiple owners)
-- -------------------------------------------------------------

DROP TABLE IF EXISTS "stations";

CREATE TABLE "public"."stations" (
         "nodes_id" integer primary key,
         "owner_id" integer not null,
         "name" character varying(255),
         lat  double precision,
         long double precision,
         elev double precision,
         azim double precision,
         "nts_sheet" character varying(255),
         CONSTRAINT fk_nodes_id FOREIGN KEY (nodes_id)
             REFERENCES nodes (id) ON DELETE CASCADE,
         CONSTRAINT fk_nodes_owner_id FOREIGN KEY (owner_id)
             REFERENCES nodes (id) ON DELETE CASCADE
) WITH (oids = false);

-- update owner data
update old_stations
set station_owner_type=q.name
from (select * from node_types) as q
where old_stations.station_owner_type=q.label;

update old_stations
set station_owner_id=q.id
from (select * from nodes) as q
where old_stations.station_owner_id=q.old_id
  and q.type=old_stations.station_owner_type;

-- populate the nodes table
insert into nodes (old_id, type, owner_id, owner_type, created_at, updated_at, published, legacy_path, fs_path)
select id, 'stations', station_owner_id, station_owner_type, created_at, updated_at, published, null, fs_path
from old_stations order by id;

-- populate the stations table
insert into stations (nodes_id, owner_id)
select id, owner_id from nodes where type='stations' order by old_id;

update stations
set name=q.name,
    nts_sheet=q.nts_sheet,
    lat=q.lat,
    long=q.long,
    elev=q.elevation
from (select * from old_stations order by id) as q
where (select old_id from nodes where id=stations.nodes_id) = q.id;


-- -------------------------------------------------------------
--    Historic Visits (owned by stations)
-- -------------------------------------------------------------

DROP TABLE IF EXISTS "historic_visits";

CREATE TABLE "public"."historic_visits" (
        "nodes_id" integer primary key,
        "owner_id" integer not null,
        "date" date,
        "comments" text,
        CONSTRAINT fk_nodes_id FOREIGN KEY (nodes_id)
            REFERENCES nodes (id) ON DELETE CASCADE,
        CONSTRAINT fk_nodes_owner_id FOREIGN KEY (owner_id)
            REFERENCES nodes (id) ON DELETE CASCADE
) WITH (oids = false);

-- update owner ids
update old_historic_visits set station_id=q.id
from (select * from nodes) as q
where old_historic_visits.station_id=q.old_id and q.type='stations';

-- populate the nodes table
insert into nodes (old_id, type, owner_id, owner_type, created_at, updated_at, published, legacy_path, fs_path)
select id, 'historic_visits', station_id, 'stations', created_at, updated_at, published, null, fs_path
from old_historic_visits order by id;

-- populate the historic_visits table
insert into historic_visits (nodes_id, owner_id)
select id, owner_id from nodes where type='historic_visits' order by old_id;

update  historic_visits
set date=q.date,
    comments=q.comments
from (select * from old_historic_visits order by id) as q
where (select old_id from nodes where id=historic_visits.nodes_id) = q.id;



-- -------------------------------------------------------------
--    Visits (owned by stations)
-- -------------------------------------------------------------

DROP TABLE IF EXISTS "modern_visits";

CREATE TABLE "public"."modern_visits" (
      "nodes_id" integer primary key,
      "owner_id" integer not null,
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
          REFERENCES nodes (id) ON DELETE CASCADE,
      CONSTRAINT fk_nodes_owner_id FOREIGN KEY (owner_id)
          REFERENCES nodes (id) ON DELETE CASCADE
) WITH (oids = false);

-- update owner ids
update old_visits set station_id=q.id
from (select * from nodes) as q
where old_visits.station_id=q.old_id and q.type='stations';

-- populate the nodes table
insert into nodes (old_id, type, owner_id, owner_type, created_at, updated_at, published, legacy_path, fs_path)
select id, 'modern_visits', station_id, 'stations', created_at, updated_at, published, null, fs_path
from old_visits order by id;

-- populate the modern_visits table
insert into modern_visits (nodes_id, owner_id)
select id, owner_id from nodes where type='modern_visits' order by old_id;

update  modern_visits
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
from (select * from old_visits order by id) as q
where (select old_id from nodes where id=modern_visits.nodes_id) = q.id;


-- -------------------------------------------------------------
--    Locations (owned by visits)
-- -------------------------------------------------------------
DROP TABLE IF EXISTS "locations";

CREATE TABLE "public"."locations" (
      "nodes_id" integer primary key,
      "owner_id" integer not null,
      "location_narrative" text,
      "location_identity" character varying(255),
      "legacy_photos_start" integer,
      "legacy_photos_end" integer,
      lat  double precision,
      long double precision,
      elev double precision,
      azim double precision,
      CONSTRAINT fk_nodes_id FOREIGN KEY (nodes_id)
          REFERENCES nodes (id) ON DELETE CASCADE,
      CONSTRAINT fk_nodes_owner_id FOREIGN KEY (owner_id)
          REFERENCES nodes (id) ON DELETE CASCADE
) WITH (oids = false);

-- update owner ids
update old_locations set visit_id=q.id
from (select * from nodes) as q
where old_locations.visit_id=q.old_id and q.type='modern_visits';

-- populate the nodes table
insert into nodes (old_id, type, owner_id, owner_type, created_at, updated_at, published, legacy_path)
select id, 'locations', visit_id, 'modern_visits', created_at, updated_at, published, null
from old_locations order by id;

-- populate the locations table
insert into locations (nodes_id, owner_id)
select id, owner_id from nodes where type='locations' order by old_id;

update  locations
set location_narrative=q.location_narrative,
    location_identity=q.location_identity,
    legacy_photos_start=q.legacy_photos_start,
    legacy_photos_end=q.legacy_photos_end,
    lat=q.lat,
    long=q.long,
    elev=q.elevation
from (select * from old_locations order by id) as q
where (select old_id from nodes where id=locations.nodes_id) = q.id;


-- Latitude/Longitude constraints
--    ALTER TABLE old_locations DROP CONSTRAINT IF EXISTS check_latitude;
--    ALTER TABLE old_locations ADD CONSTRAINT check_latitude
--    CHECK (old_stations.lat ~* '^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$')
--
--    ALTER TABLE old_locations DROP CONSTRAINT IF EXISTS check_longitude;
--    ALTER TABLE old_locations ADD CONSTRAINT check_longitude
--    CHECK (old_stations.long ~* '^[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$')


-- -------------------------------------------------------------
--    Historic Captures
-- -------------------------------------------------------------

DROP TABLE IF EXISTS "historic_captures";

CREATE TABLE "public"."historic_captures" (
      "nodes_id" integer primary key,
      "owner_id" integer not null,
      "plate_id" character varying(255),
      "fn_photo_reference" character varying(255),
      "f_stop" double precision,
      "shutter_speed" character varying(255),
      "focal_length" integer,
      "cameras_id" integer,
      "lens_id" integer,
      "capture_datetime" timestamp,
      "digitization_location" character varying(255),
      "digitization_datetime" timestamp,
      "lac_ecopy" character varying(255),
      "lac_wo" character varying(255),
      "lac_collection" character varying(255),
      "lac_box" character varying(255),
      "lac_catalogue" character varying(255),
      "condition" character varying(255),
      "comments" character varying(255),
      CONSTRAINT fk_nodes_id FOREIGN KEY (nodes_id)
          REFERENCES nodes (id) ON DELETE CASCADE,
      CONSTRAINT fk_nodes_owner_id FOREIGN KEY (owner_id)
          REFERENCES nodes (id) ON DELETE CASCADE,
      CONSTRAINT fk_camera FOREIGN KEY (cameras_id)
          REFERENCES cameras (id),
      CONSTRAINT fk_lens FOREIGN KEY (lens_id)
          REFERENCES lens (id)
) WITH (oids = false);

-- update owner ids in captures with nodes reference ids
-- update owner data
update old_historic_captures
set capture_owner_type=q.name
from (select * from node_types) as q
where old_historic_captures.capture_owner_type=q.label;

update old_historic_captures
set capture_owner_id=q.id
from (select * from nodes) as q
where old_historic_captures.capture_owner_id=q.old_id
  and q.type=old_historic_captures.capture_owner_type;

-- populate the nodes table with captures
insert into nodes (old_id, type, owner_id, owner_type, created_at, updated_at, published, legacy_path)
select id, 'historic_captures', capture_owner_id, capture_owner_type, created_at, updated_at, published, null
from old_historic_captures order by id;

-- populate the historic_captures table
insert into historic_captures (nodes_id, owner_id)
select id, owner_id from nodes where type='historic_captures' order by old_id;

update  historic_captures
set plate_id = q.plate_id,
    fn_photo_reference=q.fn_photo_reference,
    f_stop=q.f_stop,
    shutter_speed=q.shutter_speed,
    focal_length=q.focal_length,
    cameras_id=q.camera_id,
    lens_id=q.lens_id,
    capture_datetime=q.capture_datetime,
    digitization_location=q.digitization_location,
    digitization_datetime=q.digitization_datetime,
    lac_ecopy=q.lac_ecopy,
    lac_wo=q.lac_wo,
    lac_collection=q.lac_collection,
    lac_box=q.lac_box,
    lac_catalogue=q.lac_catalogue,
    condition=q.condition,
    comments=q.comments
from (select * from old_historic_captures order by id) as q
where (select old_id from nodes where id=historic_captures.nodes_id) = q.id;


-- update shutter speed column (convert to float)
-- convert empty strings to nulls
UPDATE historic_captures SET shutter_speed=NULL where shutter_speed = '';
UPDATE historic_captures SET shutter_speed = regexp_replace(shutter_speed, '1/', '');
ALTER TABLE historic_captures
    ALTER COLUMN shutter_speed TYPE double precision USING NULLIF(shutter_speed, '')::double precision;

-- Latitude/Longitude constraints
--    ALTER TABLE stations DROP CONSTRAINT IF EXISTS check_latitude;
--    ALTER TABLE stations ADD CONSTRAINT check_latitude
--    CHECK (stations.lat ~* '^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$')
--
--    ALTER TABLE stations DROP CONSTRAINT IF EXISTS check_longitude;
--    ALTER TABLE stations ADD CONSTRAINT check_longitude
--    CHECK (stations.long ~* '^[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$')

-- -------------------------------------------------------------
--    Modern Captures
-- -------------------------------------------------------------

DROP TABLE IF EXISTS "modern_captures";

CREATE TABLE "public"."modern_captures" (
    "nodes_id" integer primary key,
    "owner_id" integer not null,
    "fn_photo_reference" character varying(255),
    "f_stop" double precision,
    "shutter_speed" character varying(255),
    "iso" integer,
    "focal_length" integer,
    "cameras_id" integer,
    "lens_id" integer,
    "capture_datetime" timestamp,
    "lat" double precision,
    "long" double precision,
    "elev" double precision,
    "azimuth" integer,
    "comments" character varying(255),
    "alternate" boolean,
    CONSTRAINT fk_nodes_id FOREIGN KEY (nodes_id)
        REFERENCES nodes (id) ON DELETE CASCADE,
    CONSTRAINT fk_nodes_owner_id FOREIGN KEY (owner_id)
        REFERENCES nodes (id) ON DELETE CASCADE,
    CONSTRAINT fk_camera FOREIGN KEY (cameras_id)
        REFERENCES cameras (id),
    CONSTRAINT fk_lens FOREIGN KEY (lens_id)
        REFERENCES lens (id)
) WITH (oids = false);

-- update owner data
update old_captures
set capture_owner_type=q.name
from (select * from node_types) as q
where old_captures.capture_owner_type=q.label;

update old_captures
set capture_owner_id=q.id
from (select * from nodes) as q
where old_captures.capture_owner_id=q.old_id
  and q.type=old_captures.capture_owner_type;

-- populate the nodes table with captures
insert into nodes (old_id, type, owner_id, owner_type, created_at, updated_at, published, legacy_path)
select id, 'modern_captures', capture_owner_id, capture_owner_type, created_at, updated_at, published, null
from old_captures order by id;

-- populate the modern_captures table
insert into modern_captures (nodes_id, owner_id)
select id, owner_id from nodes where type='modern_captures' order by old_id;

update  modern_captures
set  fn_photo_reference=q.fn_photo_reference,
     f_stop=q.f_stop,
     shutter_speed=q.shutter_speed,
     focal_length=q.focal_length,
     cameras_id=q.camera_id,
     lens_id=q.lens_id,
     capture_datetime=q.capture_datetime,
     lat=q.lat,
     long=q.long,
     elev=q.elevation,
     azimuth=q.azimuth,
     alternate=q.alternate,
     comments=q.comments
from (select * from old_captures order by id) as q
where (select old_id from nodes where id=modern_captures.nodes_id) = q.id;

-- update shutter speed column (convert to float)
UPDATE modern_captures SET shutter_speed=NULL where shutter_speed = '';
UPDATE modern_captures SET shutter_speed = regexp_replace(shutter_speed, '1/', '')::double precision;
ALTER TABLE modern_captures
    ALTER COLUMN shutter_speed TYPE double precision USING NULLIF(shutter_speed, '')::double precision;

-- Latitude/Longitude constraints
--    ALTER TABLE stations DROP CONSTRAINT IF EXISTS check_latitude;
--    ALTER TABLE stations ADD CONSTRAINT check_latitude
--    CHECK (stations.lat ~* '^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$')
--
--    ALTER TABLE stations DROP CONSTRAINT IF EXISTS check_longitude;
--    ALTER TABLE stations ADD CONSTRAINT check_longitude
--    CHECK (stations.long ~* '^[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$')


commit;


