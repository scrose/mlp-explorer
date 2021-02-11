-- =========================================================
-- Schema Migration: Other Metadata
-- =========================================================

begin;


-- -------------------------------------------------------------
--    Glass Plate Listings (owned by survey seasons)
-- -------------------------------------------------------------

DROP TABLE IF EXISTS "glass_plate_listings";

CREATE TABLE "public"."glass_plate_listings" (
   "id" serial primary key,
   "owner_id" integer not null,
   "container" text,
   "plates" text,
   "notes" text,
   "created_at" timestamp without time zone NOT NULL,
   "updated_at" timestamp without time zone NOT NULL,
   CONSTRAINT fk_nodes_owner_id FOREIGN KEY (owner_id)
       REFERENCES survey_seasons (nodes_id) ON DELETE CASCADE
) WITH (oids = false);

update old_glass_plate_listings
set survey_season_id=q.id
from (select * from nodes) as q
where old_glass_plate_listings.survey_season_id=q.old_id
  and q.type='survey_seasons';

-- populate the metadata_files table
insert into glass_plate_listings (owner_id,
                                  container,
                                  plates,
                                  notes,
                                  created_at,
                                  updated_at)
select g.survey_season_id,
       g.container,
       g.plates,
       g.notes,
       g.created_at,
       g.updated_at
from old_glass_plate_listings g
order by id;

-- -------------------------------------------------------------
--    Maps (owned by survey seasons)
-- -------------------------------------------------------------


DROP TABLE IF EXISTS "maps";

CREATE TABLE "public"."maps" (
     "id" serial primary key,
     "owner_id" integer not null,
     "nts_map" text,
     "historic_map" text,
     "links" text,
     "created_at" timestamp without time zone NOT NULL,
     "updated_at" timestamp without time zone NOT NULL,
     CONSTRAINT fk_nodes_owner_id FOREIGN KEY (owner_id)
         REFERENCES survey_seasons (nodes_id) ON DELETE CASCADE
) WITH (oids = false);

update old_maps
set survey_season_id=q.id
from (select * from nodes) as q
where old_maps.survey_season_id=q.old_id
  and q.type='survey_seasons';

-- populate the metadata_files table
insert into maps (owner_id,
                  nts_map,
                  historic_map,
                  links,
                  created_at,
                  updated_at)
select g.survey_season_id,
       g.nts_map,
       g.historic_map,
       g.links,
       g.created_at,
       g.updated_at
from old_maps g
order by id;


-- -------------------------------------------------------------
--    Cameras
-- -------------------------------------------------------------
select setval('cameras_id_seq', (select max(id) from cameras) + 1);


-- -------------------------------------------------------------
--    Lens
-- -------------------------------------------------------------
select setval('lens_id_seq', (select max(id) from lens) + 1);

commit;


