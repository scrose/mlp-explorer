-- =========================================================
-- Schema Migration: Images
-- =========================================================

begin;

-- Rename owner columns (for convenience)
select rename_column('capture_images', 'captureable_id', 'owner_id');
select rename_column('capture_images', 'captureable_type', 'owner_type');
select rename_column('images', 'image_owner_id', 'owner_id');
select rename_column('images', 'image_owner_type', 'owner_type');

-- -------------------------------------------------------------
-- Function: Rename Column
-- -------------------------------------------------------------

create or replace function add_images(_oldtbl varchar(40),
                                      _newtbl varchar(40),
                                      _owner_type varchar(40),
                                      _iscap boolean=null
                                      ) RETURNS void
    LANGUAGE plpgsql as
$$
declare
    _r RECORD;
    _id integer;
    _settings camera_settings;
    _coord coordinate;
    _owner_id integer;
begin
    -- iterate over image data
    for _r in EXECUTE format(E'select * from %I where owner_type=\'%s\' order by id', _oldtbl, _owner_type)
        loop

        -- get camera settings (if available)

        -- get coordinates (if available)



        -- get corresponding owner
        if _iscap is not null
        then
            -- insert record into images table
            execute 'insert into images(
                               type,
                               file_name,
                               file_size,
                               x_dim,
                               y_dim,
                               bit_depth,
                               remote,
                               secure_token,
                               comments,
                               lat,
                               long,
                               elevation,
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
                               image_tmp)
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
                $16, $17, $18, $19, $20, $21, $22, $23, $24) returning id' using
                _newtbl,
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
                _r.image_tmp into _id;
            
            -- insert record into subtable
            execute format(E'insert into %I(
                               image_id,
                               owner_id,
                               image_state)
            values (%s, %s, %s) returning id',
                           _newtable,
                           _id,
                           _r.owner_id,
                           _r.image_state);
        else
            execute 'select id from nodes where old_id=$1::integer'
                using r.owner_id into _owner_id;
            -- insert record into subtable
            execute format(E'insert into %I(image_id, owner_id)
            values (%s, %s) returning id',
                           _newtable,
                           _id,
                           _owner_id);
        end if;
    end loop;
END
$$;

-- -------------------------------------------------------------
--    Images
-- -------------------------------------------------------------

-- update owner types
select rename_owner_types('images');


-- -------------------------------------------------------------
--    Historic Images (owned by Historic Captures)
-- -------------------------------------------------------------

CREATE TABLE "public"."historic_images" (
           "id" serial primary key NOT NULL,
           "owner_id" integer NOT NULL,
           "image_state" image_states,
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
           "camera_settings": camera_settings,
           "created_at" timestamp without time zone NOT NULL,
           "updated_at" timestamp without time zone NOT NULL,
           "fs_path" text,
           "legacy_path" text,
           "image_tmp" character varying(255),
        CONSTRAINT fk_owner_id FOREIGN KEY (owner_id)
            REFERENCES historic_captures (id)
) WITH (oids = false);

CREATE INDEX "index_historic_images_on_owner_id" ON "public"."historic_images" USING btree ("owner_id");
CREATE INDEX "index_images_on_legacy_path" ON "public"."historic_images" USING btree ("legacy_path");

-- populate tables
select add_images(
    'capture_images',
    'historic_images',
    'HistoricCapture',
    true);


-- -------------------------------------------------------------
--    Modern Images (owned by Modern Captures)
-- -------------------------------------------------------------

CREATE TABLE "public"."modern_images" (
        "id" serial primary key NOT NULL,
            "owner_id" integer NOT NULL,
            "image_state" image_states,
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
            "cameras_id" integer,
            "lens_id" integer,
            "created_at" timestamp without time zone NOT NULL,
            "updated_at" timestamp without time zone NOT NULL,
            "fs_path" text,
            "legacy_path" text,
            "image_tmp" character varying(255),
        CONSTRAINT fk_owner_id FOREIGN KEY (owner_id)
            REFERENCES modern_captures (id)
) WITH (oids = false);

CREATE INDEX "index_historic_images_on_owner_id" ON "public"."modern_images" USING btree ("owner_id");
CREATE INDEX "index_images_on_legacy_path" ON "public"."historic_images" USING btree ("legacy_path");

-- populate tables
select add_images(
               'capture_images',
               'modern_images',
               'Capture',
               true);



-- -------------------------------------------------------------
--    Scenic Images (multiple owners)
-- -------------------------------------------------------------

CREATE TABLE "public"."scenic_images" (
        "id" serial primary key NOT NULL,
        "owner_id" integer NOT NULL,
        "secure_token" character varying(255),
        "file_name" character varying(255) NOT NULL,
        "file_size" double precision,
        "x_dim" integer,
        "y_dim" integer,
        "bit_depth" integer,
        "remote" character varying(255),
        "comments" character varying(255),
        "lat" double precision,
        "long" double precision,
        "elevation" double precision,
        "f_stop" double precision,
        "shutter_speed" integer,
        "iso" integer,
        "focal_length" integer,
        "capture_datetime" timestamp,
        "cameras_id" integer,
        "lens_id" integer,
        "created_at" timestamp without time zone NOT NULL,
        "updated_at" timestamp without time zone NOT NULL,
        "fs_path" text,
        "legacy_path" text,
        "image_tmp" character varying(255),
       CONSTRAINT fk_owner_id FOREIGN KEY (owner_id)
           REFERENCES nodes (id)
) WITH (oids = false);

CREATE INDEX "index_scenic_images_on_owner_id" ON "public"."scenic_images" USING btree ("owner_id");

-- populate tables
select add_images(
               'images',
               'scenic_images',
               'ScenicImage',
               true);


-- -------------------------------------------------------------
--    Location Images (multiple owners)
-- -------------------------------------------------------------

-- drop old location_photos table
drop table if exists location_photos;

-- create new table
CREATE TABLE "public"."location_images" (
        "id" serial primary key NOT NULL,
        "owner_id" integer NOT NULL,
        "type" image_types,
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
        "cameras_id" integer,
        "lens_id" integer,
        "created_at" timestamp without time zone NOT NULL,
        "updated_at" timestamp without time zone NOT NULL,
        "fs_path" text,
        "legacy_path" text,
        "image_tmp" character varying(255),
       CONSTRAINT fk_owner_id FOREIGN KEY (owner_id)
           REFERENCES nodes (id)
) WITH (oids = false);

CREATE INDEX "index_location_images_on_owner_id" ON "public"."location_images" USING btree ("owner_id");

-- populate tables
select add_images(
               'images',
               'location_images',
               'LocationImage',
               true);

commit;


