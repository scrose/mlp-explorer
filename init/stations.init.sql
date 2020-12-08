/* Init stations table */

BEGIN;
    CREATE OR REPLACE FUNCTION init_stations() RETURNS void AS
    $$
    BEGIN

    DROP FUNCTION init_stations();

    ALTER TABLE public.stations ADD CONSTRAINT IF NOT EXISTS fk_owner
        FOREIGN KEY(owner_id, owner_type)
          REFERENCES nodes(owner_id, owner_type);

    END;
    $$
    LANGUAGE plpgsql;

    -- initialization
    SELECT init_stations();

    -- update id auto-increment
    SELECT setval('stations_id_seq', (SELECT MAX(id) FROM stations)+1);


COMMIT;
