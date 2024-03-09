
-- -------------------------------------------------------------
--    DB update to allow
-- -------------------------------------------------------------

--    Create new overlay view for nodes controller

-- ALTER TYPE views ADD VALUE 'overlay';
--
-- --    Update user role permissions for new overlay view
--
-- INSERT INTO user_permissions (view, role, created_at, updated_at)
-- VALUES ('overlay', 'visitor', now(), now()),
--         ('overlay', 'registered', now(), now()),
--         ('overlay', 'editor', now(), now()),
--         ('overlay', 'administrator', now(), now()),
--         ('overlay', 'super_administrator', now(), now());

--    Add new node type and relations for map objects/features data

insert into "public"."node_types" (name, label)
values ('map_objects', 'Map Objects'),
        ('map_features', 'Map Features');

insert into "node_relations" (dependent_type, owner_type)
values ('map_objects', null), ('map_features', 'map_objects');

--    Add metadata file relations for map node

insert into "file_relations" (dependent_type, owner_type)
values ('metadata_files', 'map_objects');

-- insert into "file_relations" (dependent_type, owner_type)
-- values ('metadata_files', 'surveys'),
--        ('metadata_files', 'survey_seasons');

--    Add new metadata file type for KML geographic data

insert into "public"."metadata_file_types" (name, label)
values ('geographic_data', 'Geographic Map Data');

--    Add map object types table

create TABLE "public"."map_object_types"
(
    id    serial PRIMARY KEY,
    name  VARCHAR(40) UNIQUE NOT NULL,
    label VARCHAR(40) UNIQUE NOT NULL
);

insert into "public"."map_object_types" (name, label)
values ('nts', 'NTS Maps'),
       ('boundary', 'Boundaries'),
       ('other', 'Other Map Objects');

--    Add map feature types table

create TABLE "public"."map_feature_types"
(
    id    serial PRIMARY KEY,
    name  VARCHAR(40) UNIQUE NOT NULL,
    label VARCHAR(40) UNIQUE NOT NULL
);

insert into "public"."map_feature_types" (name, label)
values ('mapsheet', 'NTS Mapsheet'),
       ('boundary', 'Boundaries'),
       ('marker', 'Marker'),
       ('other', 'Other Map Feature');

--    Add map objects node table for geographic objects

CREATE TABLE "public"."map_objects" (
         "nodes_id" integer primary key,
         "name" character varying(255) NOT NULL,
         "type" character varying(255) NOT NULL,
         "description" text,
         UNIQUE (name),
         CONSTRAINT fk_nodes_id FOREIGN KEY (nodes_id)
             REFERENCES nodes (id) ON DELETE CASCADE,
         CONSTRAINT fk_map_object_types_id FOREIGN KEY (type)
             REFERENCES map_object_types (name) ON DELETE SET NULL);

--    Add map features node table as map object dependents

CREATE TABLE "public"."map_features" (
         "nodes_id" integer primary key,
         "owner_id" integer NOT NULL,
         "name" character varying(255) NOT NULL,
         "type" character varying(255),
         "description" text,
         "geometry" json,
         UNIQUE (name),
         CONSTRAINT fk_nodes_id FOREIGN KEY (nodes_id)
             REFERENCES nodes (id) ON DELETE CASCADE,
         CONSTRAINT fk_owner_id FOREIGN KEY (owner_id)
             REFERENCES nodes (id) ON DELETE CASCADE,
         CONSTRAINT fk_map_feature_types_id FOREIGN KEY (type)
             REFERENCES map_feature_types (name) ON DELETE SET NULL);

--    Add map objects type to metadata types

insert into "public"."metadata_types" (name, label)
values ('map_object_types', 'Map Object Types');

--    Add map objects reference to maps table

ALTER TABLE maps ADD COLUMN IF NOT EXISTS map_features_id integer;

ALTER TABLE maps
    ADD CONSTRAINT fk_map_features_id FOREIGN KEY (map_features_id)
    REFERENCES map_features (nodes_id) ON UPDATE CASCADE ON DELETE SET NULL;