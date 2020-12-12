'use strict';

/**
 * Rendering settings
 * @private
 */

export default {
    main: {
        projectName: "Mountain Legacy Project",
        appName: "Explorer",
        title: "Welcome to the Mountain Legacy Project Explorer"
    },
    projects: {
        id: {
            label: "ID"
        },
        name: {
            label: 'Project Name'
        },
        description: {
            label: 'Project Description'
        },
    },
    surveyors: {
        id: {
            label: "ID"
        },
        given_names: 'Given Names',
        last_name: 'Last Name',
        short_name: 'TEST',
        affiliation: "Affiliation"
    },
    surveys: {
        id: {
            label: "ID"
        },
        owner_id: 16,
        name: 'Some Name',
        historical_map_sheet: 'Historical Map Sheet',
    },
    surveySeasons: {
        id: {
            label: "ID"
        },
        owner_id: 16,
        year: 1933,
        geographic_coverage: 'TEST',
        record_id: 0,
        jurisdiction: 'TEST',
        affiliation: 'TEST',
        archive: 'TEST',
        collection: 'TEST',
        location: 'TEST',
        sources: 'TEST',
        notes: 'TEST'
    },
    stations: {
        id: {
            label: "ID"
        },
        owner_id: 40,
        owner_type: 'survey_seasons',
        name: 'TEST',
        lat: 100.1,
        long: 100.1,
        elevation: 100.1,
        nts_sheet: 'TEST',
        published: false
    },
    visits: {
        id: {
            label: "ID"
        },
        owner_id: 61,
        date: '2005-08-19',
        start_time: '14:00:00',
        finish_time: '17:00:00',
        pilot: 'TEST',
        rw_call_sign: 'TEXT',
        visit_narrative: 'TEXT',
        illustration: false,
        weather_narrative: 'TEXT',
        weather_temp: 14,
        weather_ws: 25,
        weather_gs: 34,
        weather_pressure: 101,
        weather_rh: 15,
        weather_wb: 22
    },
    historicVisits: {
        id: {
            label: "ID"
        },
        owner_id: 9,
        date: '1927-01-01',
        comments: 'TEXT'
    },
    locations: {
        id: {
            label: "ID"
        },
        owner_id: 23,
        location_narrative: 'TEXT',
        location_identity: 'TEXT',
        lat: 100.1,
        long: 100.1,
        elevation: 100.1,
        legacy_photos_start: 5,
        legacy_photos_end: 8,
        published: true
    },
    historicCaptures: {
        id: {
            label: "ID"
        },
        owner_id: 64,
        owner_type: 'survey_seasons',
        plate_id:'529',
        fn_photo_reference: 'TEXT',
        f_stop: 555,
        shutter_speed: 34,
        focal_length: 12,
        capture_datetime: '2014-07-09 16:49:00.572006',
        camera_id: 6,
        lens_id: null,
        digitization_location: 'LAC',
        digitization_datetime: '2014-07-09 16:49:00.572006',
        lac_ecopy: 'IDENTIFIER',
        lac_wo: 'IDENTIFIER',
        lac_collection: 'IDENTIFIER',
        lac_box: 'IDENTIFIER',
        lac_catalogue: 'IDENTIFIER',
        condition: 'DESCRIPTION',
        comments: 'TEXT'
    },
    captures:{
        id: {
            label: "ID"
        },
        owner_id: 1051,
        owner_type: 'locations',
        fn_photo_reference: 'IDENTIFIER',
        f_stop: 55,
        shutter_speed: 55,
        focal_length: 56,
        capture_datetime: '2014-07-09 16:49:00.572006',
        camera_id: 6,
        lens_id: null,
        lat: 100.1,
        long: 100.1,
        elevation: 100.1,
        azimuth: 300,
        comments: 'TEXT',
        alternate: true
    },
    captureImages:{
        id: {
            label: "ID"
        },
        owner_id: 3897,
        owner_type: 'historic_captures',
        hash_key: 'IDENTIFIER',
        image: 'IDENTIFIER',
        file_size: 5566,
        x_dim: 1200,
        y_dim: 1600,
        image_state: 'MASTER',
        image_remote: 'IDENTIFIER',
        image_secure_token: 'IDENTIFIER',
        comments: 'TEXT',
        image_tmp: 'IDENTIFIER',
        image_remote_processing: false
    },
    images: {
        id: {
            label: "ID"
        },
        owner_id: 483,
        owner_type: 'locations',
        hash_key: 'IDENTIFIER',
        image: 'LC2_DSCF0342_011f9804-7099-11e2-a556-c82a14fffed2.JPG',
        file_size: 89089504,
        x_dim: 1200,
        y_dim: 1600,
        bit_depth: 8,
        image_remote: 'IDENTIFIER',
        image_secure_token: 'IDENTIFIER',
        comments: 'TEXT',
        lat: 100.1,
        long: 100.1,
        f_stop: 55,
        shutter_speed: 55,
        focal_length: 56,
        iso: 50,
        capture_datetime: '2014-07-09 16:49:00.572006',
        camera_id: 6,
        lens_id: null,
        type: 'location',
        image_tmp: 'IDENTIFIER',
        image_remote_processing: false
    },
    cameras: {
        id: {
            label: "ID"
        },
        make: 'TEXT',
        model: 'TEXT',
        unit: 'TEXT',
        format: 'TEXT'
    },
    glass_plate_listings: {
        id: {
            label: "ID"
        },
        owner_id: 93,
        container: 'TEXT',
        plates: 'TEXT',
        notes: 'TEXT'
    },
    lens: {
        id: {
            label: "ID"
        },
        brand: 'TEXT',
        focal_length: 4,
        max_aperture: 1.11
    },
    maps: {
        id: {
            label: "ID"
        },
        owner_id: 36,
        nts_map: 'TEXT',
        historic_map: 'TEXT',
        links: 'TEXT'
    },
    metadata_files:{
        id: {
            label: "ID"
        },
        owner_id: 992,
        owner_type: 'stations',
        type: 'field_notes',
        filename: 'PATH/to/FILE'
    },
    participants: {
        id: {
            label: "ID"
        },
        last_name: 'TEXT',
        given_names: 'TEXT'
    },
    participant_groups: {
        id: {
            label: "ID"
        },
        owner_id: 23,
        participant_id: 38,
        group_type: 'photographers'
    }
}
