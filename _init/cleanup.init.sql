-- =========================================================
-- Schema Migration script: Clean Up
-- =========================================================

begin;

-- delete old tables
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
drop table if exists old_glass_plate_listings cascade;
drop table if exists old_maps cascade;
drop table if exists old_metadata_files cascade;
drop table if exists old_field_notes cascade;
drop table if exists old_fn_authors_visits cascade;
drop table if exists old_hiking_parties cascade;
drop table if exists old_photographers_visits cascade;
drop table if exists preferences cascade;
drop table if exists pointsable_points cascade;
drop table if exists image_reggy_alignment_images cascade;
drop table if exists image_reggy_image_pairs cascade;
drop table if exists old_comparison_indices cascade;

-- remove old_id from nodes, files tables
alter table nodes drop column old_id;
alter table files drop column old_id;

-- update labels on node types
update public.node_types
set label='Survey Season' where name='survey_seasons';
update public.node_types
set label='Historic Visit' where name='historic_visit';
update public.node_types
set label='Historic Capture' where name='historic_captures';
update public.node_types
set label='Historic Image' where name='historic_images';
update public.node_types
set label='Modern Visit' where name='modern_visits';

commit;


