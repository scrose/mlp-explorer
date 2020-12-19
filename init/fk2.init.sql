-- =========================================================
-- Schema Migration script: Users
-- =========================================================
-- Restore database to original:
-- db reset >>> psql -U boutrous mlp2 < path/to/original/meat.sql
-- db reset >>> psql -U boutrous mlp2 < /Users/boutrous/Workspace/NodeJS/db/meat.sql
-- db reset >>> psql -U boutrous mlp2 < /Users/boutrous/Workspace/NodeJS/mlp-db/meat.sql

-- confrelid 	oid 	pg_class.oid 	If a foreign key, the referenced table; else 0

-- with col as (select string_agg(attname, ',') from pg_attribute
--      where attrelid = pg_constraint.conrelid and ARRAY[attnum] <@ pg_constraint.conkey),
-- select
--     (select r.relname from pg_class r where r.oid = c.conrelid)
--         as tbl,
--     (select data_type FROM information_schema.columns
--         where table_name = 'modern_visits' and column_name = col)
--         as type,
--     (select r.relname from pg_class r where r.oid = c.confrelid)
--         as ftbl
-- from pg_constraint c
-- where
--         c.conrelid = (select oid from pg_class where relname = 'modern_visits'
--     and relnamespace = (select oid from pg_namespace where nspname = 'public'));



    select
           column_name,
           data_type,
           (select r.relname from pg_class r where r.oid = pc.confrelid)
               as ftbl
    from information_schema.columns
    full join pg_constraint pc
        on column_name = (select string_agg(attname, ',') from pg_attribute
        where attrelid = pc.conrelid
          and ARRAY[attnum] <@ pc.conkey)
        and pc.conrelid = (
        select oid
        from pg_class
        where relname=table_name
        )
    where table_name = 'stations'
    and 'public' = (select nspname
                    from pg_namespace
                    where oid =
                          (select relnamespace
                           from pg_class
                           where relname = 'stations')
        );

--
-- select
--        ic.column_name,
--        (select string_agg(attname, ',') from pg_attribute
--         where attrelid = pc.conrelid
--           and ARRAY[attnum] <@ pc.conkey)
--           as fcol,
--        (select r.relname from pg_class r where r.oid = pc.confrelid)
--                 as ftbl
-- from pg_class r
--     left join pg_constraint pc on r.oid = pc.conrelid
-- -- where
--             pc.contype = 'f'
--           and r.relname = 'modern_images'
--           and relnamespace = (select oid from pg_namespace where nspname = 'public');
