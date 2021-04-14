-- =========================================================
-- Schema Migration: Other Metadata
-- =========================================================

begin;


-- -------------------------------------------------------------
-- Metadata Types Table
-- -------------------------------------------------------------

drop table if exists "metadata_types" CASCADE;

create TABLE"public"."metadata_types"
(
    id    serial PRIMARY KEY,
    name  VARCHAR(40) UNIQUE NOT NULL CHECK (name ~ '^[\w]+$'),
    label VARCHAR(40) UNIQUE NOT NULL
);

insert into "public"."metadata_types" (name, label)
values ('glass_plate_listings', 'Glass Plate Listings'),
       ('maps', 'Maps'),
       ('cameras', 'Cameras'),
       ('lens', 'Lens'),
       ('participants', 'Participants'),
       ('participant_groups', 'Participant Groups');

-- -------------------------------------------------------------
-- Metadata Relations Table
-- -------------------------------------------------------------

drop table if exists "metadata_relations" cascade;

create TABLE "metadata_relations"
(
    "id "            serial PRIMARY KEY,
    "dependent_type" VARCHAR(40) NOT NULL,
    "owner_type"     VARCHAR(40),
    UNIQUE (owner_type, dependent_type),
    CONSTRAINT fk_owner_type FOREIGN KEY (owner_type)
        REFERENCES "node_types" (name),
    CONSTRAINT fk_dependent_type FOREIGN KEY (dependent_type)
        REFERENCES "metadata_types" (name)
);

insert into "metadata_relations" (dependent_type, owner_type)
values ('glass_plate_listings', 'survey_seasons'),
       ('maps', 'survey_seasons'),
       ('cameras', 'historic_captures'),
       ('cameras', 'modern_captures'),
       ('lens', 'historic_captures'),
       ('lens', 'modern_captures'),
       ('participants', 'modern_visits'),
       ('participant_groups', 'modern_visits');


-- -------------------------------------------------------------
--    Glass Plate Listings (owned by Survey Seasons)
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
   UNIQUE (owner_id, container, plates),
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
     UNIQUE (owner_id, nts_map, historic_map, links),
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


