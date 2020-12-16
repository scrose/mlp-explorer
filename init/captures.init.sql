-- =========================================================
-- Schema Migration: Captures
-- =========================================================

begin;

-- -------------------------------------------------------------
--    Historic Captures
-- -------------------------------------------------------------

-- rename table
ALTER TABLE if exists historic_captures
    RENAME TO mlp_historic_captures;

-- update owner data
select rename_column('mlp_historic_captures', 'capture_owner_id', 'owner_id');
select rename_column('mlp_historic_captures', 'capture_owner_type', 'owner_type');
select rename_column('mlp_historic_captures', 'camera_id', 'cameras_id');
select rename_owner_types('mlp_historic_captures');

update mlp_historic_captures
set owner_type=q.name
from (select * from mlp_node_types) as q
where mlp_historic_captures.owner_type=q.label;

update mlp_historic_captures
set owner_id=q.id
from (select * from mlp_nodes) as q
where mlp_historic_captures.owner_id=q.old_id
  and q.type=mlp_historic_captures.owner_type;

-- drop owners type table
alter table mlp_historic_captures
    drop column IF EXISTS owner_type;

-- convert empty strings to nulls
UPDATE mlp_historic_captures
SET shutter_speed=NULL
where shutter_speed = '';

-- add cameras reference
alter table mlp_historic_captures
    drop CONSTRAINT IF EXISTS fk_camera;
alter table mlp_historic_captures
    add CONSTRAINT fk_camera
        FOREIGN KEY (camera_id)
            REFERENCES cameras (id);

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
ALTER TABLE if exists captures
    RENAME TO mlp_modern_captures;

-- update owner data
select rename_column('mlp_modern_captures', 'capture_owner_id', 'owner_id');
select rename_column('mlp_modern_captures', 'capture_owner_type', 'owner_type');
select rename_column('mlp_modern_captures', 'camera_id', 'cameras_id');
select rename_owner_types('mlp_modern_captures');

update mlp_modern_captures
set owner_type=q.name
from (select * from mlp_node_types) as q
where mlp_modern_captures.owner_type=q.label;

update mlp_modern_captures
set owner_id=q.id
from (select * from mlp_nodes) as q
where mlp_modern_captures.owner_id=q.old_id
  and q.type=mlp_modern_captures.owner_type;

-- drop owners type table
alter table mlp_modern_captures
    drop column IF EXISTS owner_type;

-- convert empty strings to nulls
UPDATE mlp_modern_captures
SET shutter_speed=NULL
where shutter_speed = '';

-- add cameras reference
alter table mlp_modern_captures
    drop CONSTRAINT IF EXISTS fk_camera;
alter table mlp_modern_captures
    add CONSTRAINT fk_camera
        FOREIGN KEY (camera_id)
            REFERENCES cameras (id);

-- Latitude/Longitude constraints
--    ALTER TABLE stations DROP CONSTRAINT IF EXISTS check_latitude;
--    ALTER TABLE stations ADD CONSTRAINT check_latitude
--    CHECK (stations.lat ~* '^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$')
--
--    ALTER TABLE stations DROP CONSTRAINT IF EXISTS check_longitude;
--    ALTER TABLE stations ADD CONSTRAINT check_longitude
--    CHECK (stations.long ~* '^[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$')

commit;