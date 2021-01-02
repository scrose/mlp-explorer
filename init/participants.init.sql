-- =========================================================
-- Schema Migration: Participants
-- =========================================================

begin;

--    Participant group types

drop table if exists "participant_group_types" CASCADE;

create TABLE"public"."participant_group_types"
(
    id    serial PRIMARY KEY,
    name  VARCHAR(40) UNIQUE NOT NULL,
    label VARCHAR(40) UNIQUE NOT NULL
);

insert into "public"."participant_group_types" (name, label)
values ('hiking_party', 'Hiking Parties'),
       ('field_notes_authors', 'Field Notes Authors'),
       ('photographers', 'Photographers Visits');

-- -------------------------------------------------------------
--    Participants
-- -------------------------------------------------------------

select setval('participants_id_seq', (select max(id) from participants) + 1);

-- -------------------------------------------------------------
--    Participant Groups (owned by visits)
-- -------------------------------------------------------------

drop table IF EXISTS participant_groups cascade;

create TABLE IF NOT EXISTS participant_groups
(
    id    serial PRIMARY KEY,
    owner_id       INTEGER     NOT NULL,
    participant_id INTEGER     NOT NULL,
    group_type     varchar(40),
    "created_at" timestamp without time zone NOT NULL,
    "updated_at" timestamp without time zone NOT NULL,
    UNIQUE (owner_id, participant_id, group_type),
    CONSTRAINT fk_owner_id FOREIGN KEY (owner_id)
        REFERENCES nodes (id),
    CONSTRAINT fk_participant FOREIGN KEY (participant_id)
        REFERENCES participants (id),
    CONSTRAINT fk_participant_group_type FOREIGN KEY (group_type)
        REFERENCES participant_group_types (name)
);

-- -------------------------------------------------------------
--    Footnote Authors (owned by visits)
-- -------------------------------------------------------------

update old_fn_authors_visits
set visit_id=q.id
from (select * from nodes) as q
where old_fn_authors_visits.visit_id=q.old_id
  and q.type='modern_visits';

insert into participant_groups (owner_id,
                                participant_id,
                                group_type,
                                created_at,
                                updated_at)
select visit_id, participant_id, 'field_notes_authors', NOW(), NOW()
from old_fn_authors_visits
where participant_id is not null;


-- -------------------------------------------------------------
--    Hiking Parties (owned by visits)
-- -------------------------------------------------------------

update old_hiking_parties
set visit_id=q.id
from (select * from nodes) as q
where old_hiking_parties.visit_id=q.old_id
  and q.type='modern_visits';

insert into participant_groups (owner_id,
                                participant_id,
                                group_type,
                                created_at,
                                updated_at)
select visit_id, participant_id, 'hiking_party', created_at, updated_at
from old_hiking_parties
where participant_id is not null;


-- -------------------------------------------------------------
--    Photographers Visits (owned by visits)
-- -------------------------------------------------------------

update old_photographers_visits
set visit_id=q.id
from (select * from nodes) as q
where old_photographers_visits.visit_id=q.old_id
  and q.type='modern_visits';

insert into participant_groups (owner_id,
                                participant_id,
                                group_type,
                                created_at,
                                updated_at)
select visit_id, participant_id, 'photographers', NOW(), NOW()
from old_photographers_visits
where participant_id is not null;


commit;


