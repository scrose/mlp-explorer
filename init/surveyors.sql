/* Init surveyors table */

BEGIN;
    CREATE OR REPLACE FUNCTION init_surveyors() RETURNS void AS
    $$
    BEGIN

    DROP FUNCTION init_surveyors();

    ALTER TABLE surveyors ADD COLUMN IF NOT EXISTS node_type INT;
    ALTER TABLE surveyors ALTER COLUMN node_type SET DEFAULT 1;
    ALTER TABLE surveyors ADD CONSTRAINT fk_node_type
        FOREIGN KEY(node_type)
          REFERENCES node_types(id);

    END;
    $$
    LANGUAGE plpgsql;
    -- update id auto-increment
    SELECT setval('surveyors_id_seq', (SELECT MAX(id) FROM surveyors)+1);
    -- SELECT init_surveyors();
COMMIT;
