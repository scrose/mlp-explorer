-- =========================================================
-- Schema Migration: Captures
-- =========================================================

begin;

-- -------------------------------------------------------------
--    Historic Captures
-- -------------------------------------------------------------

-- rename table
ALTER TABLE if exists old_historic_captures
    RENAME TO historic_captures;

-- update owner data
select rename_column('historic_captures', 'capture_owner_id', 'owner_id');
select rename_column('historic_captures', 'capture_owner_type', 'owner_type');
select rename_column('historic_captures', 'camera_id', 'cameras_id');
select rename_owner_types('historic_captures');

update historic_captures
set owner_type=q.name
from (select * from node_types) as q
where historic_captures.owner_type=q.label;

update historic_captures
set owner_id=q.id
from (select * from nodes) as q
where historic_captures.owner_id=q.old_id
  and q.type=historic_captures.owner_type;

-- drop owners type table
alter table historic_captures
    drop column IF EXISTS owner_type;

-- add cameras reference
alter table historic_captures
    drop CONSTRAINT IF EXISTS fk_camera;
alter table historic_captures
    add CONSTRAINT fk_camera
        FOREIGN KEY (cameras_id)
            REFERENCES cameras (id);

-- update shutter speed column (convert to float)
-- convert empty strings to nulls
UPDATE historic_captures SET shutter_speed=NULL where shutter_speed = '';
UPDATE historic_captures SET shutter_speed = regexp_replace(shutter_speed, '1/', '');
ALTER TABLE historic_captures
    ALTER COLUMN shutter_speed TYPE double precision USING NULLIF(shutter_speed, '')::double precision;

-- create camera settings column
do $$
    begin
        begin
            alter table historic_captures add column camera_settings coordinate;
            -- copy values into coordinate
            update historic_captures set camera_settings=ROW(q.f_stop, q.shutter_speed, null, q.focal_length)
            from (select id, f_stop, shutter_speed, focal_length from historic_captures) as q
            where historic_captures.id=q.id;
            alter table historic_captures drop column if exists f_stop;
            alter table historic_captures drop column if exists shutter_speed;
            alter table historic_captures drop column if exists iso;
            alter table historic_captures drop column if exists focal_length;
        exception
            when duplicate_column then raise notice 'column camera_settings already exists in historic_captures.';
        end;
    end;
$$;

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

-- rename table
ALTER TABLE if exists old_captures
    RENAME TO modern_captures;

-- update owner data
select rename_column('modern_captures', 'capture_owner_id', 'owner_id');
select rename_column('modern_captures', 'capture_owner_type', 'owner_type');
select rename_column('modern_captures', 'camera_id', 'cameras_id');
select rename_owner_types('modern_captures');

update modern_captures
set owner_type=q.name
from (select * from node_types) as q
where modern_captures.owner_type=q.label;

update modern_captures
set owner_id=q.id
from (select * from nodes) as q
where modern_captures.owner_id=q.old_id
  and q.type=modern_captures.owner_type;

-- drop owners type table
alter table modern_captures
    drop column IF EXISTS owner_type;



-- add cameras reference
alter table modern_captures
    drop CONSTRAINT IF EXISTS fk_camera;
alter table modern_captures
    add CONSTRAINT fk_camera
        FOREIGN KEY (cameras_id)
            REFERENCES cameras (id);

-- create coordinate column
do $$
    begin
        begin
            alter table modern_captures add column coord coordinate;
            -- copy values into coordinate
            update modern_captures set coord=ROW(q.lat, q.long, q.elevation, q.azimuth)
            from (select id, lat, long, elevation, azimuth from modern_captures) as q
            where modern_captures.id=q.id;
            alter table modern_captures drop column if exists lat;
            alter table modern_captures drop column if exists long;
            alter table modern_captures drop column if exists elevation;
            alter table modern_captures drop column if exists azimuth;
        exception
            when duplicate_column then raise notice 'column coord already exists in modern_captures.';
        end;
    end;
$$;

-- update shutter speed column (convert to float)
UPDATE modern_captures SET shutter_speed=NULL where shutter_speed = '';
UPDATE modern_captures SET shutter_speed = regexp_replace(shutter_speed, '1/', '')::double precision;
ALTER TABLE modern_captures
    ALTER COLUMN shutter_speed TYPE double precision USING NULLIF(shutter_speed, '')::double precision;

-- create camera settings column
do $$
    begin
        begin
            alter table modern_captures add column camera_settings coordinate;
            -- copy values into coordinate
            update modern_captures set camera_settings= ROW(q.f_stop, q.shutter_speed, q.iso, q.focal_length)
            from (select id, f_stop, shutter_speed, iso, focal_length from modern_captures) as q
            where modern_captures.id=q.id;
            alter table modern_captures drop column if exists f_stop;
            alter table modern_captures drop column if exists shutter_speed;
            alter table modern_captures drop column if exists iso;
            alter table modern_captures drop column if exists focal_length;
        exception
            when duplicate_column then raise notice 'column camera_settings already exists in modern_captures.';
        end;
    end;
$$;

-- Latitude/Longitude constraints
--    ALTER TABLE stations DROP CONSTRAINT IF EXISTS check_latitude;
--    ALTER TABLE stations ADD CONSTRAINT check_latitude
--    CHECK (stations.lat ~* '^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$')
--
--    ALTER TABLE stations DROP CONSTRAINT IF EXISTS check_longitude;
--    ALTER TABLE stations ADD CONSTRAINT check_longitude
--    CHECK (stations.long ~* '^[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$')

commit;