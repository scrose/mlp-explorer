/* Init surveyors table */

BEGIN;
    CREATE OR REPLACE FUNCTION init_surveys() RETURNS void AS
    $$
    BEGIN

    DROP FUNCTION init_surveys();

    ALTER TABLE surveys ADD COLUMN IF NOT EXISTS node_type INT;
    ALTER TABLE surveys ALTER COLUMN node_type SET DEFAULT 2;
    ALTER TABLE surveys ADD CONSTRAINT fk_node_type
        FOREIGN KEY(node_type)
          REFERENCES node_types(id);

--     ALTER TABLE surveys ADD CONSTRAINT  fk_surveyor_id
--         FOREIGN KEY(surveyor_id)
--             REFERENCES surveyors(id);

    END;
    $$
    LANGUAGE plpgsql;
    -- update id auto-increment
    SELECT setval('surveys_id_seq', (SELECT MAX(id) FROM surveys)+1);
    SELECT init_surveys();
COMMIT;
