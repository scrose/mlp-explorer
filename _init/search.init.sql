-- =========================================================
-- Schema Migration script: Search Indices
-- =========================================================

begin;

CREATE INDEX IF NOT EXISTS projects_ts_idx
    ON projects USING GIN (to_tsvector('english',
                                       name || ' ' ||
                                       coalesce(description, '')
                               ));

CREATE INDEX IF NOT EXISTS surveyors_ts_idx
    ON surveyors USING GIN (to_tsvector('english',
                                        coalesce(given_names, '') || ' ' ||
                                        coalesce(last_name, '') || ' ' ||
                                        coalesce(short_name, '') || ' ' ||
                                        coalesce(affiliation, '')
                                ));

CREATE INDEX IF NOT EXISTS surveys_ts_idx
    ON surveys USING GIN (to_tsvector('english',
                                      name || ' ' ||
                                      coalesce(historical_map_sheet, '')
                              ));

CREATE INDEX IF NOT EXISTS survey_seasons_ts_idx
    ON survey_seasons USING GIN (to_tsvector('english', year || ' ' ||
                                                        coalesce(geographic_coverage, '') || ' ' ||
                                                        coalesce(jurisdiction, '') || ' ' ||
                                                        coalesce(affiliation, '') || ' ' ||
                                                        coalesce(archive, '') || ' ' ||
                                                        coalesce(collection, '') || ' ' ||
                                                        coalesce(location, '') || ' ' ||
                                                        coalesce(sources, '') || ' ' ||
                                                        coalesce(notes, '')
                                     ));

CREATE INDEX IF NOT EXISTS stations_ts_idx
    ON stations USING GIN (to_tsvector('english', name || ' ' || coalesce(nts_sheet, '')
));

CREATE INDEX IF NOT EXISTS modern_visits_ts_idx
    ON modern_visits USING GIN (to_tsvector('english',
                                            coalesce(pilot, '') || ' ' ||
                                            coalesce(rw_call_sign, '') || ' ' ||
                                            coalesce(visit_narrative, '') || ' ' ||
                                            coalesce(weather_narrative, '') || ' ' ||
                                            coalesce(fn_physical_location, '') || ' ' ||
                                            coalesce(fn_transcription_comment, '')
                                    ));

CREATE INDEX IF NOT EXISTS historic_captures_ts_idx
    ON historic_captures USING GIN (to_tsvector('english',
                                            coalesce(fn_photo_reference, '') || ' ' ||
                                            coalesce(digitization_location, '') || ' ' ||
                                            coalesce(lac_ecopy, '') || ' ' ||
                                            coalesce(lac_wo, '') || ' ' ||
                                            coalesce(lac_collection, '') || ' ' ||
                                            coalesce(lac_box, '') || ' ' ||
                                            coalesce(lac_catalogue, '') || ' ' ||
                                            coalesce(condition, '') || ' ' ||
                                            coalesce(comments, '')
                                    ));

CREATE INDEX IF NOT EXISTS modern_captures_ts_idx
    ON modern_captures USING GIN (to_tsvector('english',
                                                coalesce(fn_photo_reference, '') || ' ' ||
                                                coalesce(comments, '')
                                        ));

CREATE INDEX IF NOT EXISTS historic_visits_ts_idx
    ON historic_visits USING GIN (to_tsvector('english', coalesce(comments, ''))
        );


CREATE INDEX IF NOT EXISTS participants_ts_idx
    ON participants USING GIN (to_tsvector('english',
                                            coalesce(last_name, '') || ' ' ||
                                            coalesce(given_names, '')
                                    ));

CREATE INDEX IF NOT EXISTS maps_ts_idx
    ON maps USING GIN (to_tsvector('english',
                                           coalesce(nts_map, '') || ' ' ||
                                           coalesce(links, '') || ' ' ||
                                           coalesce(historic_map, '')
                                   ));

CREATE INDEX IF NOT EXISTS glass_plate_listings_ts_idx
    ON glass_plate_listings USING GIN (to_tsvector('english',
                                   coalesce(container, '') || ' ' ||
                                   coalesce(plates, '') || ' ' ||
                                   coalesce(notes, '')
                           ));

commit;


