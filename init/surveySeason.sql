/* Init survey seasons table */

BEGIN;
    CREATE OR REPLACE FUNCTION init_survey_seasons() RETURNS void AS
    $$
    BEGIN

    DROP FUNCTION init_survey_seasons();

--     ALTER TABLE survey_seasons ADD COLUMN IF NOT EXISTS node_type INT;
--     ALTER TABLE survey_seasons ALTER COLUMN node_type SET DEFAULT 2;
--     ALTER TABLE survey_seasons ADD CONSTRAINT fk_node_type
--         FOREIGN KEY(node_type)
--           REFERENCES node_types(id);

    ALTER TABLE survey_seasons ADD CONSTRAINT  fk_survey_id
        FOREIGN KEY(survey_id)
            REFERENCES surveys(id);

    ALTER TABLE survey_seasons ADD CONSTRAINT  check_year
        CHECK (survey_seasons.year > 1700 AND survey_seasons.year <= EXTRACT(YEAR FROM NOW()));

    END;
    $$
    LANGUAGE plpgsql;
    -- update id auto-increment
    SELECT setval('survey_seasons_id_seq', (SELECT MAX(id) FROM survey_seasons)+1);
    SELECT init_survey_seasons();
COMMIT;
