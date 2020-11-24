/* Surveys */

/* rename surveyor id to parent id */
ALTER TABLE surveys RENAME COLUMN surveyor_id TO parent_id;

/* add parent id type */
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS parent_type_id INT;

/* set default to surveyor (=1) */
UPDATE surveys SET parent_type_id = 1;

/* Map surveyors (1) to surveys (2) in nodes table */
insert into nodes (parent_id, parent_type_id, child_id, child_type_id)
  select parent_id, parent_type_id, id, (
    select id from node_types where name='surveys'
  ) from surveys;

/* confirm results */
select count(*) from nodes;
select parent_id, id from surveys order by id desc limit 10;
select parent_id, child_id from nodes order by child_id desc limit 10;


-- CREATE TRIGGER surveys_insert
--   AFTER INSERT
--   ON surveys
--   FOR EACH ROW
--   EXECUTE PROCEDURE map_nodes('surveys');
