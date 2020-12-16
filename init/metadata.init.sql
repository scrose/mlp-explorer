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

-- Remap to nodes
select remap_nodes('metadata_files',  null);

commit;


