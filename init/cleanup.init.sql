-- =========================================================
-- Schema Migration script
-- =========================================================
-- Restore database to original:
-- db reset >>> psql -U boutrous mlp2 < path/to/original/meat.sql
-- db reset >>> psql -U boutrous mlp2 < /Users/boutrous/Workspace/NodeJS/db/meat.sql
-- db reset >>> psql -U boutrous mlp2 < /Users/boutrous/Workspace/NodeJS/mlp-db/meat.sql

begin;

-- remove old tables
drop table if exists old_capture_images cascade;
drop table if exists old_projects cascade;
drop table if exists old_surveyors cascade;
drop table if exists old_surveys cascade;
drop table if exists old_survey_seasons cascade;
drop table if exists old_stations cascade;
drop table if exists old_historic_visits cascade;
drop table if exists old_visits cascade;
drop table if exists old_locations cascade;
drop table if exists old_historic_captures cascade;
drop table if exists old_captures cascade;
drop table if exists old_capture_images cascade;
drop table if exists old_images cascade;
drop table if exists field_notes cascade;
drop table if exists hiking_parties cascade;
drop table if exists photographers_visits cascade;

-- remove old_id from nodes
alter table nodes drop column old_id;

-- update labels on node types
update public.node_types
set label='Survey Season' where name='survey_seasons';
update public.node_types
set label='Historic Visit' where name='historic_visit';
update public.node_types
set label='Historic Capture' where name='historic_captures';
update public.node_types
set label='Modern Visit' where name='modern_visits';
update public.node_types
set label='Modern Capture' where name='modern_captures';


commit;


