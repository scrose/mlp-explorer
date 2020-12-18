-- =========================================================
-- Schema Migration: Metadata
-- =========================================================

begin;

-- -------------------------------------------------------------
--    Metadata Files
-- -------------------------------------------------------------

select rename_column('metadata_files', 'metadata_owner_id', 'owner_id');
select rename_column('metadata_files', 'metadata_owner_type', 'owner_type');
select rename_column('metadata_files', 'metadata_file', 'filename');
select rename_owner_types('metadata_files');

-- update id index
select setval('metadata_files_id_seq', (select max(id) from metadata_files) + 1);

-- Add metadata type column
DO
$$
    begin
        begin
            ALTER TABLE metadata_files
                ADD COLUMN metadata_type metadata_types DEFAULT 'ancillary';
            UPDATE metadata_files SET metadata_type = 'ancillary';
        EXCEPTION
            WHEN duplicate_column
                THEN RAISE NOTICE 'Column "metadata_type" already exists in metadata_files.';
        END;
    END;
$$;

-- Metadata files constraints

alter table metadata_files
    alter COLUMN owner_id SET NOT NULL;
alter table metadata_files
    alter COLUMN filename SET NOT NULL;

--    Copy existing field_notes table data into metadata files table
DO
$$
    begin
        IF EXISTS(SELECT *
                  FROM information_schema.tables
                  WHERE table_schema = current_schema()
                    AND table_name = 'field_notes') THEN
            insert into metadata_files (owner_id,
                                        owner_type,
                                        metadata_type,
                                        filename,
                                        created_at,
                                        updated_at)
            select visit_id,
                   'visits',
                   'field_notes',
                   field_note_file,
                   created_at,
                   updated_at
            from field_notes;

            drop table field_notes;
        end if;
    end;
$$;

-- Reassign owner references to nodes
update metadata_files
set owner_id=q.id
from (select * from nodes) as q
where metadata_files.owner_id=q.old_id
  and q.type=metadata_files.owner_type;


-- -------------------------------------------------------------
--    Glass Plate Listings
-- -------------------------------------------------------------
select setval('glass_plate_listings_id_seq', (select max(id) from glass_plate_listings) + 1);

select rename_column('glass_plate_listings', 'survey_season_id', 'owner_id');

-- Reassign owner references to nodes
update glass_plate_listings
set owner_id=q.id
from (select * from nodes) as q
where glass_plate_listings.owner_id=q.old_id
  and q.type='survey_season';


-- -------------------------------------------------------------
--    Maps
-- -------------------------------------------------------------
select setval('maps_id_seq', (select max(id) from maps) + 1);
select rename_column('maps', 'survey_season_id', 'owner_id');

-- Reassign owner references to nodes
update maps
set owner_id=q.id
from (select * from nodes) as q
where maps.owner_id=q.old_id
  and q.type='survey_season';


-- -------------------------------------------------------------
--    Cameras
-- -------------------------------------------------------------
select setval('cameras_id_seq', (select max(id) from cameras) + 1);


-- -------------------------------------------------------------
--    Lens
-- -------------------------------------------------------------
select setval('lens_id_seq', (select max(id) from lens) + 1);

commit;


