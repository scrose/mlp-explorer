-- =========================================================
-- Schema Migration script: Search Indices
-- =========================================================

begin;

CREATE INDEX projects_ts_idx
    ON projects USING GIN (to_tsvector('english', description));
CREATE INDEX surveyors_ts_idx
    ON surveyors USING GIN (to_tsvector('english', given_names || ' ' || last_name));
CREATE INDEX historic_visits_ts_idx
    ON historic_visits USING GIN (to_tsvector('english', comments));
CREATE INDEX modern_visits_ts_idx
    ON modern_visits USING GIN (to_tsvector('english', visit_narrative || ' ' || weather_narrative));

commit;


