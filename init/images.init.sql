-- =========================================================
-- Schema Migration: Images
-- =========================================================

begin;

-- Rename owner columns (for convenience)
select rename_column('old_capture_images', 'captureable_id', 'owner_id');
select rename_column('old_capture_images', 'captureable_type', 'owner_type');
select rename_column('old_images', 'image_owner_id', 'owner_id');
select rename_column('old_images', 'image_owner_type', 'owner_type');


-- -------------------------------------------------------------
--    Images
-- -------------------------------------------------------------

-- update owner types
select rename_owner_types('old_images');


-- -------------------------------------------------------------
--    Historic Images (owned by Historic Captures)
-- -------------------------------------------------------------

CREATE TABLE "public"."historic_images" (
            "id" serial primary key NOT NULL,
            "owner_id" integer NOT NULL,
            "image_state" image_states,
            "filename" character varying(255),
            "file_size" double precision,
            "dims" dims,
            "remote" character varying(255),
            "secure_token" character varying(255),
            "comments" character varying(255),
            "coord" coordinate,
            "camera_settings" camera_settings,
            "capture_datetime" timestamp,
            "cameras_id" integer,
            "lens_id" integer,
            "created_at" timestamp without time zone NOT NULL,
            "updated_at" timestamp without time zone NOT NULL,
            "fs_path" text not null,
            "legacy_path" text,
            "filename_tmp" character varying(255),
        CONSTRAINT fk_owner_id FOREIGN KEY (owner_id)
            REFERENCES historic_captures (id),
        CONSTRAINT fk_cameras_id FOREIGN KEY (cameras_id)
            REFERENCES cameras (id),
        CONSTRAINT fk_lens_id FOREIGN KEY (lens_id)
            REFERENCES lens (id)
) WITH (oids = false);

CREATE INDEX "index_historic_images_on_owner_id"
    ON "public"."historic_images" USING btree ("owner_id");
CREATE INDEX "index_historic_images_on_legacy_path"
    ON "public"."historic_images" USING btree ("legacy_path");

-- populate table
do $$
declare
    _r RECORD;
    _dims dims;
    _img_state image_states;
begin
    -- iterate over image data
    for _r in select * from old_capture_images where owner_type='HistoricCapture' order by id
        loop
            _dims = ROW(_r.x_dim, _r.y_dim, _r.bit_depth);
            _img_state = lower(_r.image_state);
            execute 'insert into historic_images(
                               owner_id,
                               filename,
                               file_size,
                               dims,
                               image_state,
                               remote,
                               secure_token,
                               comments,
                               created_at,
                               updated_at,
                               fs_path,
                               legacy_path,
                               filename_tmp)
                values ($1, $2, $3, $4::dims, $5::image_states, $6, $7, $8, $9, $10, $11, $12, $13)' using
                    _r.owner_id,
                    _r.image,
                    _r.file_size,
                    _dims,
                    _img_state,
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

CREATE TABLE "public"."modern_images" (
            "id" serial primary key NOT NULL,
            "owner_id" integer NOT NULL,
            "image_state" image_states,
            "filename" character varying(255),
            "file_size" double precision,
            "dims" dims,
            "remote" character varying(255),
            "secure_token" character varying(255),
            "comments" character varying(255),
            "coord" coordinate,
            "camera_settings" camera_settings,
            "capture_datetime" timestamp,
            "cameras_id" integer,
            "lens_id" integer,
            "created_at" timestamp without time zone NOT NULL,
            "updated_at" timestamp without time zone NOT NULL,
            "fs_path" text not null,
            "legacy_path" text,
            "filename_tmp" character varying(255),
        CONSTRAINT fk_owner_id FOREIGN KEY (owner_id)
            REFERENCES modern_captures (id),
        CONSTRAINT fk_cameras_id FOREIGN KEY (cameras_id)
            REFERENCES cameras (id),
        CONSTRAINT fk_lens_id FOREIGN KEY (lens_id)
                REFERENCES lens (id)
) WITH (oids = false);

CREATE INDEX "index_modern_images_on_owner_id"
    ON "public"."modern_images" USING btree ("owner_id");
CREATE INDEX "index_modern_images_on_legacy_path"
    ON "public"."modern_images" USING btree ("legacy_path");


-- populate table
do $$
    declare
        _r RECORD;
        _dims dims;
        _img_state image_states;
        _filename text;
    begin
        -- iterate over image data
        for _r in select * from old_capture_images where owner_type='Capture' order by id
            loop
                _dims = ROW(_r.x_dim, _r.y_dim, _r.bit_depth);
                _img_state = lower(_r.image_state);
                execute 'insert into modern_images(
                               owner_id,
                               filename,
                               file_size,
                               dims,
                               image_state,
                               remote,
                               secure_token,
                               comments,
                               created_at,
                               updated_at,
                               fs_path,
                               legacy_path,
                               filename_tmp)
                values ($1, $2, $3, $4::dims, $5::image_states, $6, $7, $8, $9, $10, $11, $12, $13)' using
                    _r.owner_id,
                    _filename,
                    _r.file_size,
                    _dims,
                    _img_state,
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

-- drop old tables
drop table if exists location_photos cascade;
drop table if exists "public"."supplemental_images" cascade;

-- create new table
CREATE TABLE if not exists "public"."supplemental_images" (
        "id" serial primary key NOT NULL,
        "owner_id" integer NOT NULL,
        "image_type" image_types,
        "filename" character varying(255),
        "file_size" double precision,
        "dims" dims,
        "remote" character varying(255),
        "secure_token" character varying(255),
        "comments" character varying(255),
        "coord" coordinate,
        "camera_settings" camera_settings,
        "capture_datetime" timestamp,
        "cameras_id" integer,
        "lens_id" integer,
        "created_at" timestamp without time zone NOT NULL,
        "updated_at" timestamp without time zone NOT NULL,
        "fs_path" text,
        "legacy_path" text,
        "filename_tmp" character varying(255),
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

-- update shutter speed column (convert to float)
UPDATE old_images SET shutter_speed=NULL where shutter_speed = '';
UPDATE old_images SET shutter_speed = regexp_replace(shutter_speed, '1/', '')::double precision;
ALTER TABLE old_images
    ALTER COLUMN shutter_speed TYPE double precision USING NULLIF(shutter_speed, '')::double precision;

-- populate table
do $$
    declare
        _r RECORD;
        _image_type image_types;
        _owner_id integer;
        _dims dims;
        _coord coordinate;
        _camera_settings camera_settings;
    begin
        -- iterate over image data
        for _r in select * from old_images order by id
            loop
                _dims = ROW(_r.x_dim, _r.y_dim, _r.bit_depth);
                _coord = ROW(_r.lat, _r.long, _r.elevation, null);
                _camera_settings = ROW(_r.f_stop, _r.shutter_speed, _r.iso, _r.focal_length);

                -- get node id
                select id from nodes where nodes.old_id=_r.owner_id into _owner_id;
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
                               dims,
                               remote,
                               secure_token,
                               comments,
                               coord,
                               camera_settings,
                               capture_datetime,
                               cameras_id,
                               lens_id,
                               created_at,
                               updated_at,
                               fs_path,
                               legacy_path,
                               filename_tmp)
        values ($1::image_types, $2, $3, $4, $5::dims, $6, $7, $8, $9::coordinate, $10::camera_settings, $11, $12, $13, $14, $15,
                $16, $17, $18)' using
                    _image_type,
                    _owner_id,
                    _r.image,
                    _r.file_size,
                    _dims,
                    _r.image_remote,
                    _r.image_secure_token,
                    _r.comments,
                    _coord,
                    _camera_settings,
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


