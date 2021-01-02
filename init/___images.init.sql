-- =========================================================
-- Schema Migration: Images
-- =========================================================

begin;

-- update owner data in original capture images
update old_capture_images
set captureable_type=q.name
from (select * from node_types) as q
where old_capture_images.captureable_type=q.label;

update old_capture_images
set captureable_id=q.id
from (select * from nodes) as q
where old_capture_images.captureable_id=q.old_id
  and q.type=old_capture_images.captureable_type;

-- -------------------------------------------------------------
--    Historic Images (owned by Historic Captures)
-- -------------------------------------------------------------
DROP TABLE IF EXISTS "public"."historic_images" CASCADE;

CREATE TABLE "public"."historic_images" (
        "nodes_id" integer primary key,
        "owner_id" integer NOT NULL,
        "image_state" image_states,
        "filename" character varying(255),
        "file_size" bigint,
        "x" integer,
        "y" integer,
        "bit_depth" integer,
        "remote" boolean,
        "secure_token" character varying(255),
        "comments" character varying(255),
        lat  double precision,
        long double precision,
        elev double precision,
        azim double precision,
        "f_stop"        double precision,
        "shutter_speed" double precision,
        "iso"           integer,
        "focal_length"  integer,
        "capture_datetime" timestamp,
        "cameras_id" integer,
        "lens_id" integer,
        "filename_tmp" character varying(255),
        CONSTRAINT fk_node_id FOREIGN KEY (nodes_id)
            REFERENCES nodes (id),
        CONSTRAINT fk_owner_id FOREIGN KEY (owner_id)
            REFERENCES nodes (id),
        CONSTRAINT fk_cameras_id FOREIGN KEY (cameras_id)
            REFERENCES cameras (id),
        CONSTRAINT fk_lens_id FOREIGN KEY (lens_id)
            REFERENCES lens (id)
) WITH (oids = false);

CREATE INDEX "index_historic_images_on_owner_id"
    ON "public"."historic_images" USING btree ("owner_id");
CREATE INDEX "index_historic_images_on_legacy_path"
    ON "public"."historic_images" USING btree ("legacy_path");

-- populate the nodes table
insert into nodes (old_id, type, owner_id, owner_type, created_at, updated_at, legacy_path, fs_path)
select id, 'historic_images', captureable_id, captureable_type, created_at, updated_at, legacy_path, fs_path
from old_capture_images where captureable_type='historic_captures' order by id;

-- populate the historic_images table
insert into public.historic_images (nodes_id, owner_id)
select id, owner_id from nodes where type='historic_images' order by old_id;

-- populate table
do $$
declare
    _r RECORD;
    _img_state image_states;
begin
    -- iterate over image data
    for _r in select * from old_capture_images where captureable_type='historic_captures' order by id
        loop
            _img_state = lower(_r.image_state);
            execute 'insert into historic_images(
                               owner_id,
                               filename,
                               image_state,
                               file_size,
                               x, y, bit_depth,
                               remote,
                               secure_token,
                               comments,
                               created_at,
                               updated_at,
                               fs_path,
                               legacy_path,
                               filename_tmp)
                values ($1, $2, $3::image_states, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)' using
                    _r.captureable_id,
                    _r.image,
                    _img_state,
                    _r.file_size,
                    _r.x_dim,
                    _r.y_dim,
                    _r.bit_depth,
                    _r.image_remote,
                    _r.image_secure_token,
                    _r.comments,
                    _r.created_at,
                    _r.updated_at,
                    _r.fs_path,
                    _r.legacy_path,
                    _r.image_tmp;
    end loop;
END
$$;


-- -------------------------------------------------------------
--    Modern Images (owned by Modern Captures)
-- -------------------------------------------------------------

DROP TABLE IF EXISTS "public"."modern_images" CASCADE;

CREATE TABLE "public"."modern_images" (
            "nodes_id" integer primary key,
            "owner_id" integer NOT NULL,
            "image_state" image_states,
            "filename" character varying(255),
            "file_size" bigint,
            "x" integer,
            "y" integer,
            "bit_depth" integer,
            "remote" boolean,
            "secure_token" character varying(255),
            "comments" character varying(255),
            lat  double precision,
            long double precision,
            elev double precision,
            azim double precision,
            "f_stop"        double precision,
            "shutter_speed" double precision,
            "iso"           integer,
            "focal_length"  integer,
            "capture_datetime" timestamp,
            "cameras_id" integer,
            "lens_id" integer,
            "created_at" timestamp without time zone NOT NULL,
            "updated_at" timestamp without time zone NOT NULL,
            "fs_path" text not null,
            "legacy_path" text,
            "filename_tmp" character varying(255),
            CONSTRAINT fk_nodes_id FOREIGN KEY (nodes_id)
                REFERENCES nodes (id),
            CONSTRAINT fk_owner_id FOREIGN KEY (owner_id)
                REFERENCES nodes (id),
            CONSTRAINT fk_cameras_id FOREIGN KEY (cameras_id)
                REFERENCES cameras (id),
            CONSTRAINT fk_lens_id FOREIGN KEY (lens_id)
                    REFERENCES lens (id)
) WITH (oids = false);

CREATE INDEX "index_modern_images_on_owner_id"
    ON "public"."modern_images" USING btree ("owner_id");
CREATE INDEX "index_modern_images_on_legacy_path"
    ON "public"."modern_images" USING btree ("legacy_path");

-- populate the nodes table
insert into nodes (old_id, type, owner_id, owner_type, created_at, updated_at, legacy_path, fs_path)
select id, 'modern_images', captureable_id, captureable_type, created_at, updated_at, legacy_path, fs_path
from old_capture_images where captureable_type='modern_captures' order by id;

-- populate the modern_captures table
insert into public.modern_images (nodes_id, owner_id)
select id, owner_id from nodes where type='modern_images' order by old_id;

-- populate table
do $$
    declare
        _r RECORD;
--         _dims dims;
        _img_state image_states;
        _filename text;
    begin
        -- iterate over image data
        for _r in select * from old_capture_images where captureable_type='modern_captures' order by id
            loop
                _img_state = lower(_r.image_state);
                execute 'insert into modern_images(
                               owner_id,
                               filename,
                               image_state,
                               file_size,
                               x, y, bit_depth,
                               remote,
                               secure_token,
                               comments,
                               created_at,
                               updated_at,
                               fs_path,
                               legacy_path,
                               filename_tmp)
                values ($1, $2, $3::image_states, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $15, $15)'
                    using
                    _r.captureable_id,
                    _filename,
                    _img_state,
                    _r.file_size,
                    _r.x_dim,
                    _r.y_dim,
                    _r.bit_depth,
                    _r.image_remote,
                    _r.image_secure_token,
                    _r.comments,
                    _r.created_at,
                    _r.updated_at,
                    _r.fs_path,
                    _r.legacy_path,
                    _r.image_tmp;
    end loop;
end
$$;


-- -------------------------------------------------------------
--    Supplemental Images (multiple owners)
-- -------------------------------------------------------------

-- update owner data in supplemental images
update old_images
set image_owner_type=q.name
from (select * from node_types) as q
where old_images.image_owner_type=q.label;

update old_images
set image_owner_id=q.id
from (select * from nodes) as q
where old_images.image_owner_id=q.old_id
  and q.type=old_images.image_owner_type;

-- update shutter speed column (convert to float)
UPDATE old_images SET shutter_speed=NULL where shutter_speed = '';
UPDATE old_images SET shutter_speed = regexp_replace(shutter_speed, '1/', '')::double precision;
ALTER TABLE old_images
    ALTER COLUMN shutter_speed TYPE double precision USING NULLIF(shutter_speed, '')::double precision;

-- drop old tables
drop table if exists location_photos cascade;
drop table if exists "public"."supplemental_images" cascade;

-- create new table
CREATE TABLE if not exists "public"."supplemental_images" (
        "nodes_id" integer primary key,
        "owner_id" integer NOT NULL,
        "image_type" image_types,
        "filename" character varying(255),
        "file_size" bigint,
        "x" integer,
        "y" integer,
        "bit_depth" integer,
        "remote" boolean,
        "secure_token" character varying(255),
        "comments" character varying(255),
        lat  double precision,
        long double precision,
        elev double precision,
        azim double precision,
        "f_stop"        double precision,
        "shutter_speed" double precision,
        "iso"           integer,
        "focal_length"  integer,
        "capture_datetime" timestamp,
        "cameras_id" integer,
        "lens_id" integer,
        "created_at" timestamp without time zone NOT NULL,
        "updated_at" timestamp without time zone NOT NULL,
        "fs_path" text,
        "legacy_path" text,
        "filename_tmp" character varying(255),
        CONSTRAINT fk_node_id FOREIGN KEY (nodes_id)
            REFERENCES nodes (id),
        CONSTRAINT fk_owner_id FOREIGN KEY (owner_id)
           REFERENCES nodes (id),
        CONSTRAINT fk_cameras_id FOREIGN KEY (cameras_id)
            REFERENCES cameras (id),
        CONSTRAINT fk_lens_id FOREIGN KEY (lens_id)
            REFERENCES lens (id)
) WITH (oids = false);

CREATE INDEX "index_supplemental_images_on_owner_id"
    ON "public"."supplemental_images" USING btree ("owner_id");
CREATE INDEX "index_supplemental_images_on_legacy_path"
    ON "public"."supplemental_images" USING btree ("legacy_path");

-- populate table
do $$
    declare
        _r RECORD;
        _image_type image_types;
    begin
        -- iterate over image data
        for _r in select * from old_images order by id
            loop
                -- get image type/reformat
                if _r.type = 'ScenicImage'
                then
                    _image_type = 'scenic';
                else
                    _image_type = 'location';
                end if;

                execute 'insert into supplemental_images(
                               image_type,
                               owner_id,
                               filename,
                               file_size,
                               x, y, bit_depth,
                               remote,
                               secure_token,
                               comments,
                               lat, long, elev,
                               f_stop,
                               shutter_speed,
                               iso,
                               focal_length,
                               capture_datetime,
                               cameras_id,
                               lens_id,
                               created_at,
                               updated_at,
                               fs_path,
                               legacy_path,
                               filename_tmp)
        values ($1::image_types, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
                $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)' using
                    _image_type,
                    _r.image_owner_id,
                    _r.image,
                    _r.file_size,
                    _r.x_dim,
                    _r.y_dim,
                    _r.bit_depth,
                    _r.image_remote,
                    _r.image_secure_token,
                    _r.comments,
                    _r.lat,
                    _r.long,
                    _r.elevation,
                    _r.f_stop,
                    _r.shutter_speed,
                    _r.iso,
                    _r.focal_length,
                    _r.capture_datetime,
                    _r.camera_id,
                    _r.lens_id,
                    _r.created_at,
                    _r.updated_at,
                    _r.fs_path,
                    _r.legacy_path,
                    _r.image_tmp;
    end loop;
END
$$;


commit;


