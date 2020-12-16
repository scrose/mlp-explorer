-- =========================================================
-- Schema Migration script
-- =========================================================
-- Restore database to original:
-- db reset >>> psql -U boutrous mlp2 < path/to/original/meat.sql
-- db reset >>> psql -U boutrous mlp2 < /Users/boutrous/Workspace/NodeJS/db/meat.sql
-- db reset >>> psql -U boutrous mlp2 < /Users/boutrous/Workspace/NodeJS/mlp-db/meat.sql


-- update owner types
select rename_owner_types('captures');

-- -------------------------------------------------------------
--    Captures
-- -------------------------------------------------------------

DROP TABLE IF EXISTS "mlp_captures";

CREATE TABLE "public"."mlp_captures" (
     "id" serial primary key NOT NULL,
     "owner_id" integer NOT NULL,
     "fn_photo_reference" character varying(255),
     "f_stop" double precision,
     "shutter_speed" integer,
     "iso" integer,
     "focal_length" integer,
     "camera_id" integer,
     "lens_id" integer,
     "capture_datetime" timestamp,
     "lat" double precision,
     "long" double precision,
     "elevation" double precision,
     "azimuth" integer,
     "comments" character varying(255),
     "created_at" timestamp NOT NULL,
     "updated_at" timestamp NOT NULL,
     "alternate" boolean,
     "published" boolean
) WITH (oids = false);

CREATE INDEX "index_mlp_captures_on_owner_id" ON "public"."mlp_captures" USING btree ("owner_id");

-- Historic Captures

DROP TABLE IF EXISTS "mlp_historic_captures";

CREATE TABLE "public"."mlp_historic_captures" (
      "capture_id" integer primary key NOT NULL,
      "plate_id" character varying(255),
      "digitization_location" character varying(255),
      "digitization_datetime" timestamp,
      "lac_ecopy" character varying(255),
      "lac_wo" character varying(255),
      "lac_collection" character varying(255),
      "lac_box" character varying(255),
      "lac_catalogue" character varying(255),
      "condition" character varying(255),
      CONSTRAINT fk_node_id FOREIGN KEY (capture_id)
          REFERENCES mlp_captures (id)
) WITH (oids = false);

-- Modern Captures

DROP TABLE IF EXISTS "mlp_modern_captures";

CREATE TABLE "public"."mlp_modern_captures" (
      "capture_id" integer primary key NOT NULL,
      CONSTRAINT fk_node_id FOREIGN KEY (capture_id)
          REFERENCES mlp_captures (id)
) WITH (oids = false);
