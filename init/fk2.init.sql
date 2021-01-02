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

WITH fk_cols AS (
SELECT
       col.attname as col,
       rel_fk.relname as ref_table,
       fk_col.attname as ref_id
FROM pg_catalog.pg_constraint con
         INNER JOIN pg_catalog.pg_class rel
                    ON rel.oid = con.conrelid
         INNER JOIN pg_catalog.pg_class rel_fk
                    ON rel_fk.oid = con.confrelid
         INNER JOIN pg_catalog.pg_namespace nsp
                    ON nsp.oid = connamespace
         INNER JOIN pg_catalog.pg_attribute col
                    ON (col.attrelid = rel.oid AND ARRAY[col.attnum] <@ con.conkey)
         INNER JOIN pg_catalog.pg_attribute fk_col
                    ON (fk_col.attrelid = rel_fk.oid AND ARRAY[fk_col.attnum] <@ con.confkey)
WHERE nsp.nspname = 'public'
  AND rel.relname = 'nodes')

select column_name as col, data_type, fk_cols.ref_table, fk_cols.ref_id
from information_schema.columns
    LEFT JOIN fk_cols ON column_name = fk_cols.col
where table_name = 'nodes'
order by fk_cols.col;


--     select
--            column_name,
--            data_type,
--            (select r.relname from pg_class r where r.oid = pc.confrelid)
--                as ftbl
--     from information_schema.columns
--     left join pg_constraint pc
--         on column_name = (select string_agg(attname, ',') from pg_attribute
--         where attrelid = pc.conrelid
--           and ARRAY[attnum] <@ pc.conkey)
--         and pc.conrelid = (select oid from pg_class where relname=table_name
--         )
--     where table_name = 'modern_visits'
--     and 'public' = (select nspname
--                     from pg_namespace
--                     where oid =
--                           (select relnamespace
--                            from pg_class
--                            where relname = 'modern_visits'));
--
-- WITH unnested_confkey AS (
--     SELECT oid, unnest(confkey) as confkey
--     FROM pg_constraint;
-- ),
--      unnested_conkey AS (
--          SELECT oid, unnest(conkey) as conkey
--          FROM pg_constraint
--      ),
--      cols AS (
--          select column_name
--          from information_schema.columns
--          where table_name = 'modern_visits'
-- )
-- select
--     col.attname                 AS constraint_column,
--     info_schema.data_type       AS data_type,
--     referenced_tbl.relname      AS referenced_table,
--     referenced_field.attname    AS referenced_column
-- FROM pg_constraint c
--          LEFT JOIN unnested_conkey con ON c.oid = con.oid
--          LEFT JOIN pg_class tbl ON tbl.oid = c.conrelid
--          LEFT JOIN pg_attribute col ON (col.attrelid = tbl.oid AND col.attnum = con.conkey)
--          LEFT JOIN pg_class referenced_tbl ON c.confrelid = referenced_tbl.oid
--          LEFT JOIN unnested_confkey conf ON c.oid = conf.oid
--          LEFT JOIN pg_attribute referenced_field ON (referenced_field.attrelid = c.confrelid
--                                                          AND referenced_field.attnum = conf.confkey)
--          LEFT JOIN information_schema.columns info_schema ON table_name = tbl.relname
-- WHERE c.contype = 'f' and tbl.relname = 'modern_images';

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
