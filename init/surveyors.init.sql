/* Init surveyors table */

BEGIN;
    CREATE OR REPLACE FUNCTION init_surveyors() RETURNS void AS
    $$
    BEGIN

    DROP FUNCTION init_surveyors();

    END;
    $$
    LANGUAGE plpgsql;

    -- update id auto-increment
    SELECT setval('surveyors_id_seq', (SELECT MAX(id) FROM surveyors)+1);

    -- SELECT init_surveyors();
COMMIT;
