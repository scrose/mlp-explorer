-- =========================================================
-- Schema Migration: Files
-- =========================================================

begin;

-- -------------------------------------------------------------
-- File Types Table
-- -------------------------------------------------------------

drop table if exists "file_types" CASCADE;

create TABLE"public"."file_types"
(
    id    serial PRIMARY KEY,
    name  VARCHAR(40) UNIQUE NOT NULL CHECK (name ~ '^[\w]+$'),
    label VARCHAR(40) UNIQUE NOT NULL
);

insert into "public"."file_types" (name, label)
values ('historic_images', 'Historic Image'),
       ('modern_images', 'Modern Image'),
       ('supplemental_images', 'Supplemental Images'),
       ('metadata_files', 'Metadata Files'),
       ('field_notes', 'Field Notes');


-- -------------------------------------------------------------
-- File Relations Table
-- -------------------------------------------------------------

drop table if exists "file_relations" cascade;

create TABLE "file_relations"
(
    "id "            serial PRIMARY KEY,
    "dependent_type" VARCHAR(40) NOT NULL,
    "owner_type"     VARCHAR(40),
    UNIQUE (owner_type, dependent_type),
    CONSTRAINT fk_dependent_type FOREIGN KEY (dependent_type)
        REFERENCES "file_types" (name),
    CONSTRAINT fk_owner_type FOREIGN KEY (owner_type)
        REFERENCES "node_types" (name)
);

insert into "file_relations" (dependent_type, owner_type)
values ('modern_images', 'modern_captures'),
       ('historic_images', 'historic_captures'),
       ('supplemental_images', 'locations'),
       ('supplemental_images', 'stations'),
       ('supplemental_images', 'survey_seasons'),
       ('supplemental_images', 'surveys'),
       ('supplemental_images', 'modern_visits'),
       ('metadata_files', 'modern_visits'),
       ('metadata_files', 'stations'),
       ('field_notes', 'modern_visits');


-- -------------------------------------------------------------
-- Files Table
-- -------------------------------------------------------------

drop table if exists files cascade;

create TABLE IF NOT EXISTS "public"."files"
(
    "id"      serial PRIMARY KEY,
    "old_id" integer not null,
    "file_type"  character varying(40) not null,
    "mimetype"  character varying(40),
    "filename" varchar(255),
    "file_size" bigint,
    "owner_id" integer,
    "owner_type"  varchar(40),
    "created_at" timestamp without time zone NOT NULL,
    "updated_at" timestamp without time zone NOT NULL,
    "published" boolean,
    "legacy_path" text,
    "fs_path" text,
    "filename_tmp" character varying(255),
    CONSTRAINT fk_ownerid FOREIGN KEY (owner_id, owner_type)
        REFERENCES nodes (id, type),
    CONSTRAINT fk_file_relation FOREIGN KEY (file_type, owner_type)
        REFERENCES file_relations (dependent_type, owner_type)
);

create INDEX file_index
    ON "files" (id, file_type);
CREATE INDEX "index_files_on_legacy_path"
    ON "public"."files" USING btree ("legacy_path");



-- -------------------------------------------------------------
-- Image Enumerated Tables
-- -------------------------------------------------------------

-- categories of supplemental images

drop table if exists "image_types" CASCADE;

create TABLE"public"."image_types"
(
    id    serial PRIMARY KEY,
    name  VARCHAR(40) UNIQUE NOT NULL,
    label VARCHAR(40) UNIQUE NOT NULL
);

insert into "public"."image_types" (name, label)
values ('scenic', 'Scenic Image'),
       ('location', 'Location Image');

-- categories of capture image states

drop table if exists "image_states" CASCADE;

create TABLE"public"."image_states"
(
    id    serial PRIMARY KEY,
    name  VARCHAR(40) UNIQUE NOT NULL,
    label VARCHAR(40) UNIQUE NOT NULL
);

insert into "public"."image_states" (name, label)
values ('raw', 'RAW image'),
       ('interim', 'Interim Image'),
       ('master', 'Master Image'),
       ('misc', 'Miscellaneous Image'),
       ('gridded', 'Gridded Image');

-- -------------------------------------------------------------
--    Supplemental Images (multiple owners)
-- -------------------------------------------------------------

-- update owner data in supplemental images
update old_images
set image_owner_type=q.name
from (select * from node_types) as q
where old_images.image_owner_type = q.label;

update old_images
set image_owner_id=q.id
from (select * from nodes) as q
where old_images.image_owner_id = q.old_id
  and q.type = old_images.image_owner_type;

-- update shutter speed column (convert to float)
UPDATE old_images
SET shutter_speed=NULL
where shutter_speed = '';
UPDATE old_images
SET shutter_speed = regexp_replace(shutter_speed, '1/', '')::double precision;
ALTER TABLE old_images
    ALTER COLUMN shutter_speed TYPE double precision USING NULLIF(shutter_speed, '')::double precision;

-- drop old tables
drop table if exists location_photos cascade;
drop table if exists "public"."supplemental_images" cascade;

-- create new table
CREATE TABLE if not exists "public"."supplemental_images"
(
    "files_id"         integer primary key,
    "owner_id"         integer not null,
    "image_type"       character varying(40),
    "format"           character varying(255),
    "channels"         integer,
    "density"          integer,
    "space"            character varying(255),
    "x_dim"            integer,
    "y_dim"            integer,
    "bit_depth"        integer,
    "remote"           character varying(255),
    "secure_token"     character varying(255),
    "comments"         character varying(255),
    lat                double precision,
    lng               double precision,
    elev               double precision,
    azim               double precision,
    "f_stop"           double precision,
    "shutter_speed"    double precision,
    "iso"              integer,
    "focal_length"     integer,
    "capture_datetime" timestamp,
    "cameras_id"       integer,
    "lens_id"          integer,
    CONSTRAINT fk_file_id FOREIGN KEY (files_id)
        REFERENCES files (id) ON DELETE CASCADE,
    CONSTRAINT fk_owner_id FOREIGN KEY (owner_id)
        REFERENCES nodes (id) ON DELETE CASCADE,
    CONSTRAINT fk_image_type FOREIGN KEY (image_type)
        REFERENCES image_types (name),
    CONSTRAINT fk_cameras_id FOREIGN KEY (cameras_id)
        REFERENCES cameras (id),
    CONSTRAINT fk_lens_id FOREIGN KEY (lens_id)
        REFERENCES lens (id)
) WITH (oids = false);

CREATE INDEX "index_supplemental_images_on_owner_id"
    ON "public"."supplemental_images" USING btree ("owner_id");

-- populate the files table
insert into files (
                   old_id,
                   file_type,
                   mimetype,
                   filename,
                   file_size,
                   owner_id,
                   owner_type,
                   created_at,
                   updated_at,
                   legacy_path,
                   fs_path,
                   filename_tmp
                   )
select id,
       'supplemental_images',
       null,
       image,
       file_size,
       image_owner_id,
       image_owner_type,
       created_at,
       updated_at,
       legacy_path,
       fs_path,
       image_tmp
from old_images
order by id;

-- populate the supplemental_images table
insert into "public"."supplemental_images" (
                                        files_id,
                                        owner_id
                                        )
select id, owner_id
from files
where file_type = 'supplemental_images'
order by old_id;

update old_images
set type='scenic'
where type = 'ScenicImage';

update old_images
set type='location'
where type = 'LocationImage';

update supplemental_images
set image_type=q.type,
    x_dim=q.x_dim,
    y_dim=q.y_dim,
    bit_depth=q.bit_depth,
    remote=q.image_remote,
    secure_token=q.image_secure_token,
    comments=q.comments,
    lat=q.lat,
    lng=q.long,
    elev=q.elevation,
    f_stop=q.f_stop,
    shutter_speed=q.shutter_speed,
    iso=q.iso,
    focal_length=q.focal_length,
    capture_datetime=q.capture_datetime,
    cameras_id=q.camera_id,
    lens_id=q.lens_id
from (select * from old_images order by id) as q
where (select old_id from files where id = supplemental_images.files_id) = q.id;


-- -------------------------------------------------------------
--    Modern Images (owned by Modern Captures)
-- -------------------------------------------------------------

-- update owner data in original capture images
update old_capture_images
set captureable_type=q.name
from (select * from node_types) as q
where old_capture_images.captureable_type = q.label;

update old_capture_images
set captureable_id=q.id
from (select * from nodes) as q
where old_capture_images.captureable_id = q.old_id
  and q.type = old_capture_images.captureable_type;

DROP TABLE IF EXISTS "public"."modern_images" CASCADE;

CREATE TABLE "public"."modern_images"
(
    "files_id"         integer primary key,
    "owner_id"         integer NOT NULL,
    "image_state"      character varying(40) NOT NULL,
    "format"           character varying(255),
    "channels"         integer,
    "density"          integer,
    "space"            character varying(255),
    "x_dim"            integer,
    "y_dim"            integer,
    "bit_depth"        integer,
    "remote"           character varying(255),
    "secure_token"     character varying(255),
    "comments"         character varying(255),
    lat                double precision,
    lng                double precision,
    elev               double precision,
    azim               double precision,
    "f_stop"           double precision,
    "shutter_speed"    double precision,
    "iso"              integer,
    "focal_length"     integer,
    "capture_datetime" timestamp,
    "cameras_id"       integer,
    "lens_id"          integer,
    CONSTRAINT fk_file_id FOREIGN KEY (files_id)
        REFERENCES files (id) ON DELETE CASCADE,
    CONSTRAINT fk_owner_id FOREIGN KEY (owner_id)
        REFERENCES nodes (id) ON DELETE CASCADE,
    CONSTRAINT fk_image_state FOREIGN KEY (image_state)
        REFERENCES image_states (name),
    CONSTRAINT fk_cameras_id FOREIGN KEY (cameras_id)
        REFERENCES cameras (id),
    CONSTRAINT fk_lens_id FOREIGN KEY (lens_id)
        REFERENCES lens (id)
) WITH (oids = false);

CREATE INDEX "index_modern_images_on_owner_id"
    ON "public"."modern_images" USING btree ("owner_id");

-- populate the files table
insert into files (
    old_id,
    file_type,
    mimetype,
    filename,
    file_size,
    owner_id,
    owner_type,
    created_at,
    updated_at,
    legacy_path,
    fs_path,
    filename_tmp
)
select id,
       'modern_images',
       null,
       image,
       file_size,
       captureable_id,
       captureable_type,
       created_at,
       updated_at,
       legacy_path,
       fs_path,
       image_tmp
from old_capture_images
where captureable_type = 'modern_captures'
order by id;

-- populate table
with f as (select id, old_id from files where file_type = 'modern_images')
insert into modern_images (
    files_id,
    owner_id,
    image_state,
    x_dim,
    y_dim,
    bit_depth,
    remote,
    secure_token,
    comments)
select f.id,
       c.captureable_id,
       lower(c.image_state),
       c.x_dim,
       c.y_dim,
       c.bit_depth,
       c.image_remote,
       c.image_secure_token,
       c.comments
from old_capture_images c
         join f on f.old_id = c.id
where c.captureable_type = 'modern_captures'
order by id;


-- -------------------------------------------------------------
--    Historic Images (owned by Historic Captures)
-- -------------------------------------------------------------

DROP TABLE IF EXISTS "public"."historic_images" CASCADE;

CREATE TABLE "public"."historic_images"
(
    "files_id"         integer primary key,
    "owner_id"         integer NOT NULL,
    "image_state"      character varying(40) NOT NULL,
    "format"           character varying(255),
    "channels"         integer,
    "density"          integer,
    "space"            character varying(255),
    "x_dim"            integer,
    "y_dim"            integer,
    "bit_depth"        integer,
    "remote"           character varying(255),
    "secure_token"     character varying(255),
    "comments"         character varying(255),
    lat                double precision,
    lng               double precision,
    elev               double precision,
    azim               double precision,
    "f_stop"           double precision,
    "shutter_speed"    double precision,
    "iso"              integer,
    "focal_length"     integer,
    "capture_datetime" timestamp,
    "cameras_id"       integer,
    "lens_id"          integer,
    CONSTRAINT fk_file_id FOREIGN KEY (files_id)
        REFERENCES files (id) ON DELETE CASCADE,
    CONSTRAINT fk_owner_id FOREIGN KEY (owner_id)
        REFERENCES nodes (id) ON DELETE CASCADE,
    CONSTRAINT fk_image_state FOREIGN KEY (image_state)
        REFERENCES image_states (name),
    CONSTRAINT fk_cameras_id FOREIGN KEY (cameras_id)
        REFERENCES cameras (id),
    CONSTRAINT fk_lens_id FOREIGN KEY (lens_id)
        REFERENCES lens (id)
) WITH (oids = false);

CREATE INDEX "index_historic_images_on_owner_id"
    ON "public"."historic_images" USING btree ("owner_id");

-- populate the files table
insert into files (
    old_id,
    file_type,
    mimetype,
    filename,
    file_size,
    owner_id,
    owner_type,
    created_at,
    updated_at,
    legacy_path,
    fs_path,
    filename_tmp
)
select id,
       'historic_images',
       null,
       image,
       file_size,
       captureable_id,
       captureable_type,
       created_at,
       updated_at,
       legacy_path,
       fs_path,
       image_tmp
from old_capture_images
where captureable_type = 'historic_captures'
order by id;

-- populate table
with f as (select id, old_id from files where file_type = 'historic_images')
insert into historic_images (
                             files_id,
                             owner_id,
                             image_state,
                             x_dim,
                             y_dim,
                             bit_depth,
                             remote,
                             secure_token,
                             comments)
select f.id,
       c.captureable_id,
       lower(c.image_state),
       c.x_dim,
       c.y_dim,
       c.bit_depth,
       c.image_remote,
       c.image_secure_token,
       c.comments
from old_capture_images c
join f on c.id = f.old_id
where c.captureable_type = 'historic_captures'
order by id;


-- -------------------------------------------------------------
--    Metadata Files
-- -------------------------------------------------------------

-- categories of metadata

drop table if exists "metadata_types" CASCADE;

create TABLE"public"."metadata_types"
(
    id    serial PRIMARY KEY,
    name  VARCHAR(40) UNIQUE NOT NULL,
    label VARCHAR(40) UNIQUE NOT NULL
);

insert into "public"."metadata_types" (name, label)
values ('ancillary', 'Ancillary Metadata'),
       ('field_notes', 'Field Notes');

-- -------------------------------------------------------------
--    Metadata Files
-- -------------------------------------------------------------

DROP TABLE IF EXISTS "metadata_files";

CREATE TABLE "public"."metadata_files" (
   "files_id" integer not null,
   "owner_id" integer not null,
   "type" varchar(40),
   CONSTRAINT fk_file_id FOREIGN KEY (files_id)
       REFERENCES files (id) ON DELETE CASCADE,
   CONSTRAINT fk_owner_id FOREIGN KEY (owner_id)
       REFERENCES nodes (id) ON DELETE CASCADE,
   CONSTRAINT fk_metadata_type FOREIGN KEY (type)
       REFERENCES metadata_types (name) ON DELETE CASCADE
) WITH (oids = false);


-- -------------------------------------------------------------
--    Metadata (multiple owners)
-- -------------------------------------------------------------

update old_metadata_files
set metadata_owner_type=q.name
from (select * from node_types) as q
where old_metadata_files.metadata_owner_type=q.label;

update old_metadata_files
set metadata_owner_id=q.id
from (select * from nodes) as q
where old_metadata_files.metadata_owner_id=q.old_id
  and q.type=old_metadata_files.metadata_owner_type;

CREATE INDEX "index_metadata_files_on_owner_id"
    ON "public"."metadata_files" USING btree ("owner_id");

-- populate the files table
insert into files (
    old_id,
    file_type,
    mimetype,
    filename,
    file_size,
    owner_id,
    owner_type,
    created_at,
    updated_at,
    legacy_path,
    fs_path
)
select id,
       'metadata_files',
       null,
       metadata_file,
       null,
       metadata_owner_id,
       metadata_owner_type,
       created_at,
       updated_at,
       legacy_path,
       fs_path
from old_metadata_files
order by id;

-- populate new ancillary metadata table
with f as (select id, old_id from files where file_type = 'metadata_files')
insert into metadata_files (
    files_id,
    owner_id,
    type)
select f.id,
       c.metadata_owner_id,
       'ancillary'
from old_metadata_files c
         join f on c.id = f.old_id
order by id;

-- -------------------------------------------------------------
--    Field notes (owned by Modern Visits)
-- -------------------------------------------------------------

-- update owner ids
update old_field_notes set visit_id=q.id
from (select * from nodes) as q
where old_field_notes.visit_id=q.old_id and q.type='modern_visits';

-- populate the files table
insert into files (
    old_id,
    file_type,
    mimetype,
    filename,
    file_size,
    owner_id,
    owner_type,
    created_at,
    updated_at,
    legacy_path,
    fs_path
)
select id,
       'metadata_files',
       null,
       field_note_file,
       null,
       visit_id,
       'modern_visits',
       created_at,
       updated_at,
       legacy_path,
       fs_path
from old_field_notes
order by id;

-- populate new field notes table
with f as (select id, old_id from files where file_type = 'metadata_files')
insert into metadata_files (
    files_id,
    owner_id,
    type)
select f.id,
       c.visit_id,
       'field_notes'
from old_field_notes c
         join f on c.id = f.old_id
order by id;

commit;



