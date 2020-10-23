-- ----------------
-- Node Types
-- ----------------
-- id |       name
-- ----+-------------------
--  1 | surveyors
--  2 | surveys
--  3 | survey_seasons
--  4 | stations
--  5 | historic_visits
--  6 | visits
--  7 | locations
--  8 | historic_captures
--  9 | captures

DROP TABLE IF EXISTS node_types;

CREATE TABLE IF NOT EXISTS node_types (
id serial PRIMARY KEY,
name VARCHAR (255) UNIQUE NOT NULL
);

INSERT INTO node_types (name) VALUES ('surveyors');
INSERT INTO node_types (name) VALUES ('surveys');
INSERT INTO node_types (name) VALUES ('survey_seasons');
INSERT INTO node_types (name) VALUES ('stations');
INSERT INTO node_types (name) VALUES ('historic_visits');
INSERT INTO node_types (name) VALUES ('visits');
INSERT INTO node_types (name) VALUES ('locations');
INSERT INTO node_types (name) VALUES ('historic_captures');
INSERT INTO node_types (name) VALUES ('captures');

SELECT * FROM node_types;
