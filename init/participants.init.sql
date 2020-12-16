-- =========================================================
-- Schema Migration script
-- =========================================================
-- Restore database to original:
-- db reset >>> psql -U boutrous mlp2 < path/to/original/meat.sql
-- db reset >>> psql -U boutrous mlp2 < /Users/boutrous/Workspace/NodeJS/db/meat.sql
-- db reset >>> psql -U boutrous mlp2 < /Users/boutrous/Workspace/NodeJS/mlp-db/meat.sql


-- -------------------------------------------------------------
-- Enumerated Types
-- -------------------------------------------------------------

--    Metadata Types

CREATE TYPE metadata_types AS ENUM ('field_notes', 'ancillary');

--    Image States

CREATE TYPE image_states AS ENUM ('raw', 'interim', 'master', 'misc');

--    Image Types

CREATE TYPE image_types AS ENUM ('capture', 'location', 'scenic');

--    Participant Group Types

CREATE TYPE participant_group_types AS ENUM ('hiking_party', 'field_notes_authors', 'photographers');

-- -------------------------------------------------------------
--    Participants
-- -------------------------------------------------------------

select setval('participants_id_seq', (select max(id) from participants) + 1);

-- -------------------------------------------------------------
--    Participant Groups (owned by visits)
-- -------------------------------------------------------------

drop table IF EXISTS participant_group_types cascade;
drop table IF EXISTS participant_groups cascade;

create TABLE IF NOT EXISTS mlp_participant_groups
(
    owner_id       INTEGER     NOT NULL,
    participant_id INTEGER     NOT NULL,
    group_type     participant_group_types,
    created_at     timestamp   NOT NULL,
    updated_at     timestamp   NOT NULL,
    UNIQUE (owner_id, participant_id, group_type),
    CONSTRAINT fk_owner_type FOREIGN KEY (owner_id) REFERENCES visits (id),
    CONSTRAINT fk_participant FOREIGN KEY (participant_id) REFERENCES participants (id),
);

--    Copy existing participant table data into merged participant groups

DO
$$
    begin
        --    Copy existing fn_authors_visits table data into participant groups table
        IF EXISTS(SELECT *
                  FROM information_schema.tables
                  WHERE table_schema = current_schema()
                    AND table_name = 'fn_authors_visits') THEN

            insert into participant_groups (owner_id,
                                            participant_id,
                                            group_type,
                                            created_at,
                                            updated_at)
            select visit_id, participant_id, 'field_notes_authors', NOW(), NOW()
            from fn_authors_visits
            where participant_id is not null;

            drop table fn_authors_visits;
        end if;
    end;
$$;

DO
$$
    begin
        --    Copy existing hiking_parties table data into participant groups table
        IF EXISTS(SELECT *
                  FROM information_schema.tables
                  WHERE table_schema = current_schema()
                    AND table_name = 'hiking_parties') THEN

            insert into participant_groups (owner_id,
                                            participant_id,
                                            group_type,
                                            created_at,
                                            updated_at)
            select visit_id, participant_id, 'hiking_party', created_at, updated_at
            from hiking_parties
            where participant_id is not null;

            drop table hiking_parties;
        end if;
    end;
$$;

DO
$$
    begin
        --    Copy existing photographers_visits table data into participant groups table
        IF EXISTS(SELECT *
                  FROM information_schema.tables
                  WHERE table_schema = current_schema()
                    AND table_name = 'photographers_visits') THEN

            insert into participant_groups (owner_id,
                                            participant_id,
                                            group_type,
                                            created_at,
                                            updated_at)
            select visit_id, participant_id, 'photographers', NOW(), NOW()
            from photographers_visits
            where participant_id is not null;

            drop table photographers_visits;
        end if;
    end;
$$;


commit;


