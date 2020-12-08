/* Init surveyors table */

BEGIN;
    CREATE OR REPLACE FUNCTION init_surveys() RETURNS void AS
    $$
    BEGIN

    DROP FUNCTION init_surveys();

    -- create node mappings
    ALTER TABLE surveys ADD CONSTRAINT  fk_owner_id
         FOREIGN KEY(surveyor_id)
             REFERENCES surveyors(id);

    /* Map owner ids  ids in table */
--    insert into nodes (parent_id, parent_type_id, child_id, child_type_id)
--      select parent_id, parent_type_id, id, (
--        select id from node_types where name='surveys'
--      ) from surveys;

    END;
    $$
    LANGUAGE plpgsql;

    -- reset id auto-increment
    SELECT setval('surveys_id_seq', (SELECT MAX(id) FROM surveys)+1);
    SELECT init_surveys();

COMMIT;
