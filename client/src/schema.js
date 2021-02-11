/*!
 * MLP.Client.Schema
 * File: schema.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

/**
 * MLP schema. The schema is a configuration file for defining
 * rendering, labelling, routing, input validation and node/file
 * relations settings for the client-side web application.
 * @private
 */

export const schema = {
    app: {
        project: "Mountain Legacy Project",
        name: "Explorer",
        title: "Welcome to the Mountain Legacy Project Explorer"
    },
    routes: {
        '/': {
            name: 'dashboard',
            label: 'Dashboard'
        },
        '/logout': {
            name: 'logout',
            label: 'Sign Out'
        },
        '/login': {
            name: 'login',
            label: 'Sign In'
        },
        '/not_found': {
            name: 'notFound',
            label: '404 Not Found'
        },
        '/unavailable': {
            name: 'unavailable',
            label: 'Unavailable'
        },
        '/server_error': {
            name: 'serverError',
            label: 'Server Error'
        },
        '/nodes': {
            redirect: '/not_found'
        },
        '/refresh': {
            redirect: '/not_found'
        }
    },
    errors: {
        validation: {
            isRequired: 'This field is required.',
            isEmail: 'Not a valid email address.',
            isPassword: 'Passwords must have a minimum eight and maximum 20 characters, at least one uppercase letter, one lowercase letter, one number and one special character',
            isValidForm: 'Form not valid.',
            isRepeatPassword: 'Passwords do not match.'
        },
        authentication: {
            noAuth: 'Authentication failed. Please contact the site administrator.'
        }
    },
    messages: {
        isLoggedIn: 'User is logged in!',
        isLoggedOut: 'User is logged out!',
        unauthorized: 'Access Denied!'
    },
    views: {
        users: {
            login: {
                legend: 'User Authentication',
                submit: 'Sign In',
                method: 'POST',
                render: 'login',
                buttons: 'bottom'
            },
            register : {
                legend: 'User Registration',
                submit: 'Register',
                method: 'POST',
                render: 'form'
            },
            list: {
                legend: 'Listing',
                render: 'listUsers'
            }
        },
        upload: {
            legend: 'File Upload',
            submit: 'Upload',
            method: 'POST',
            render: 'upload'
        },
        add: {
            legend: 'Create New',
            submit: 'Create',
            render: 'form'
        },
        edit: {
            legend: 'Update',
            submit: 'Update',
            render: 'form'
        },
        remove: {
            legend: 'Delete',
            submit: 'Delete',
            render: 'form'
        },
        show: {
            legend: 'Item',
            render: 'item'
        }
    },
    models: {
        users: {
            email: {
                label: 'Email',
                render: 'email',
                validate: ['isRequired', 'isEmail']
            },
            password: {
                label: 'Password',
                render: 'password',
                validate: ['isRequired', 'isPassword'],
                restrict: ['login', 'register']
            },
            role: {
                label: 'User Role',
                render: 'select',
                restrict: ['list', 'edit', 'delete', 'show'],
                validate: []
            }
        },
        projects: {
            attributes: {
                order: 1,
                label: "Projects",
                singular: "Project",
                dependents: ['stations', 'historic_captures', 'modern_captures']
            },
            nodes_id: {
                render: 'hidden',
                restrict: ['edit', 'delete'],
            },
            name: {
                key: 1,
                label: 'Project Name'
            },
            description: {
                label: 'Project Description'
            }
        },
        surveyors: {
            attributes: {
                order: 2,
                label: "Surveyors",
                singular: "Surveyor",
                dependents: ['surveys']
            },
            nodes_id: {
                render: 'hidden',
                restrict: ['edit', 'delete'],
            },
            given_names: {
                key: 2,
                label: 'Given Names'
            },
            last_name: {
                key: 1,
                label: 'Last Name'
            },
            short_name: {
                key: 3,
                label: 'Short Name'
            },
            affiliation: {
                key: 4,
                label: 'Affiliation'
            }
        },
        surveys: {
            attributes: {
                order: 3,
                label: "Surveys",
                singular: "Survey",
                dependents: ['survey_seasons', 'historic_captures', 'modern_captures']
            },
            nodes_id: {
                render: 'hidden',
                restrict: ['edit', 'delete'],
            },
            owner_id: {
                render: 'hidden'
            },
            name: {
                key: 1,
                label: 'Survey Name'
            },
            historical_map_sheet: {
                key: 2,
                label: 'Historical Map Sheet'
            },
        },
        survey_seasons: {
            attributes: {
                order: 4,
                label: "Survey Seasons",
                singular: "Survey Season",
                dependents: ['stations', 'historic_captures', 'modern_captures']
            },
            nodes_id: {
                render: 'hidden',
                restrict: ['edit', 'delete'],
            },
            owner_id: {
                render: 'hidden'
            },
            year: {
                key: 1,
                label: 'Year'
            },
            geographic_coverage: {
                label: 'Geographic Coverage'
            },
            jurisdiction: {
                label: 'Jurisdiction'
            },
            affiliation: {
                label: 'Affiliation'
            },
            archive: {
                label: 'Archive'
            },
            collection: {
                label: 'Collection'
            },
            location: {
                label: 'Location'
            },
            sources: {
                label: 'Sources'
            },
            notes: {
                label: 'Notes'
            }
        },
        stations: {
            attributes: {
                order: 5,
                label: "Stations",
                singular: "Station",
                dependents: ['modern_visits', 'modern_captures']
            },
            nodes_id: {
                render: 'hidden',
                restrict: ['edit', 'delete'],
            },
            owner_id: {
                render: 'hidden'
            },
            name: {
                key: 1,
                label: 'Station'
            },
            lat: {
                label: 'Latitude'
            },
            long: {
                label: 'Longitude'
            },
            elev: {
                label: 'Elevation'
            },
            azim: {
                label: 'Azimuth'
            },
            nts_sheet: {
                label: 'NTS Sheet'
            },
            // published: {
            //     label: 'Published'
            // }
        },
        historic_visits: {
            attributes: {
                order: 6,
                label: "Historic Visits",
                singular: "Historic Visit",
                dependents: ['historic_captures']
            },
            nodes_id: {
                render: 'hidden',
                restrict: ['edit', 'delete'],
            },
            owner_id: {
                render: 'hidden'
            },
            date: {
                key: 1,
                label: 'Visit Date'
            },
            comments: {
                label: 'Comments'
            }
        },
        modern_visits: {
            attributes: {
                order: 7,
                label: "Modern Visits",
                singular: "Modern Visit",
                dependents: ['modern_captures']
            },
            nodes_id: {
                render: 'hidden',
                restrict: ['edit', 'delete'],
            },
            owner_id: {
                render: 'hidden'
            },
            date: {
                key: 1,
                render: 'date',
                label: 'Visit Date'
            },
            start_time: {
                label: 'Start Time'
            },
            finish_time: {
                label: 'Finish Time'
            },
            pilot: {
                label: 'Pilot'
            },
            rw_call_sign: {
                label: 'RW Call Sign'
            },
            visit_narrative: {
                label: 'Narrative'
            },
            illustration: {
                label: 'Illustration'
            },
            weather_narrative: {
                label: 'Weather Description'
            },
            weather_temp: {
                label: 'Temperature'
            },
            weather_ws: {
                label: 'Wind Speed'
            },
            weather_gs: {
                label: 'Gust Speed'
            },
            weather_pressure: {
                label: 'Barometric Pressure'
            },
            weather_rh: {
                label: 'Relative Humidity'
            },
            weather_wb: {
                label: 'Wet Bulb'
            }
        },
        historic_captures: {
            attributes: {
                order: 8,
                label: "Historic Captures",
                singular: "Historic Capture",
                files: ['historic_images']
            },
            nodes_id: {
                render: 'hidden',
                restrict: ['edit', 'delete'],
            },
            owner_id: {
                render: 'hidden'
            },
            plate_id: {
                label: 'Plate ID'
            },
            fn_photo_reference: {
                label: 'Field Notes Photo Reference'
            },
            f_stop: {
                label: 'F-stop'
            },
            shutter_speed: {
                label: 'Shutter Speed'
            },
            focal_length: {
                label: 'Focal Length'
            },
            capture_datetime: {
                label: 'Capture Datetime'
            },
            cameras_id: {
                label: 'Camera'
            },
            lens_id: {
                label: 'Lens'
            },
            digitization_location: {
                label: 'Digitization Location'
            },
            digitization_datetime: {
                label: 'Digitization Datetime'
            },
            lac_ecopy: {
                label: 'LAC ECopy'
            },
            lac_wo: {
                label: 'LAC WO'
            },
            lac_collection: {
                label: 'LAC Collection'
            },
            lac_box: {
                label: 'LAC Box'
            },
            lac_catalogue: {
                label: 'LAC Catalogue'
            },
            condition: {
                label: 'Condition'
            },
            comments: {
                label: 'Comments'
            }
        },
        modern_captures:{
            attributes: {
                order: 9,
                label: "Modern Captures",
                singular: "Modern Capture",
                files: ['modern_images']
            },
            nodes_id: {
                render: 'hidden',
                restrict: ['edit', 'delete'],
            },
            owner_id: {
                render: 'hidden'
            },
            lat: {
                label: 'Latitude'
            },
            long: {
                label: 'Longitude'
            },
            elevation: {
                label: 'Elevation'
            },
            fn_photo_reference: {
                label: 'Field Notes Photo Reference'
            },
            f_stop: {
                label: 'F-stop'
            },
            shutter_speed: {
                label: 'Shutter Speed'
            },
            focal_length: {
                label: 'Focal Length'
            },
            capture_datetime: {
                label: 'Capture Datetime'
            },
            cameras_id: {
                label: 'Camera'
            },
            lens_id: {
                label: 'Lens'
            },
            azimuth: {
                label: 'Azimuth'
            },
            comments: {
                label: 'Comments'
            },
            alternate: {
                label: 'Alternate'
            }
        },
        locations: {
            attributes: {
                order: 10,
                label: "Locations",
                singular: "Location",
                files: ['supplemental_images']
            },
            nodes_id: {
                render: 'hidden',
                restrict: ['edit', 'delete'],
            },
            owner_id: {
                render: 'hidden'
            },
            location_narrative: {
                label: 'Narrative'
            },
            location_identity: {
                label: 'Location ID'
            },
            legacy_photos_start: {
                label: 'Photo Start Index'
            },
            legacy_photos_end: {
                label: 'Photos End Index'
            }
        },
        historic_images:{
            attributes: {
                filetype: 'image',
                order: 11,
                label: "Historic Images",
                singular: "Historic Image"
            },
            files: {
                render: 'file',
                restrict: ['upload']
            },
            files_id: {
                render: 'hidden',
                restrict: ['edit', 'delete'],
            },
            owner_id: {
                render: 'hidden'
            },
            file_size: {
                render: 'filesize',
                label: 'File size'
            },
            x_dim: {
                render: 'imgsize',
                label: 'Image Width'
            },
            y_dim: {
                render: 'imgsize',
                label: 'Image Height'
            },
            image_state: {
                label: 'Image State'
            },
            comments: {
                label: 'Comments'
            }
        },
        modern_images:{
            attributes: {
                filetype: 'image',
                order: 12,
                label: "Modern Images",
                singular: "Modern Image"
            },
            files_id: {
                render: 'hidden',
                restrict: ['edit', 'delete'],
            },
            owner_id: {
                render: 'hidden'
            },
            file_size: {
                label: 'File size'
            },
            x_dim: {
                label: 'Image Width'
            },
            y_dim: {
                label: 'Image Height'
            },
            bit_depth: {
                label: 'Bit Depth'
            },
            image_remote: {
                label: 'Remote'
            },
            comments: {
                label: 'Comments'
            },
            lat: {
                label: 'Latitude'
            },
            long: {
                label: 'Longitude'
            },
            f_stop: {
                label: 'F-stop'
            },
            shutter_speed: {
                label: 'Shutter Speed'
            },
            focal_length: {
                label: 'Focal Length'
            },
            iso: {
                label: 'ISO'
            },
            capture_datetime: {
                label: 'Capture Datetime'
            },
            cameras_id: {
                label: 'Camera'
            },
            lens_id: {
                label: 'Lens'
            },
        },
        supplemental_images: {
            attributes: {
                filetype: 'image',
                order: 12,
                label: "Supplemental Images",
                singular: "Supplemental Image"
            },
            files_id: {
                render: 'hidden',
                restrict: ['edit', 'delete'],
            },
            owner_id: {
                render: 'hidden'
            },
            image_type: {
                label: 'Type'
            },
            file_size: {
                label: 'File size'
            },
            x_dim: {
                label: 'Image Width'
            },
            y_dim: {
                label: 'Image Height'
            },
            bit_depth: {
                label: 'Bit Depth'
            },
            image_remote: {
                label: 'Remote'
            },
            comments: {
                label: 'Comments'
            },
            lat: {
                label: 'Latitude'
            },
            long: {
                label: 'Longitude'
            },
            f_stop: {
                label: 'F-stop'
            },
            shutter_speed: {
                label: 'Shutter Speed'
            },
            focal_length: {
                label: 'Focal Length'
            },
            iso: {
                label: 'ISO'
            },
            capture_datetime: {
                label: 'Capture Datetime'
            },
            cameras_id: {
                label: 'Camera'
            },
            lens_id: {
                label: 'Lens'
            },
        },
        metadata_files: {
            attributes: {
                order: 13,
                label: "Metadata Files",
                singular: "Metadata File"
            },
            files_id: {
                render: 'hidden',
                restrict: ['edit', 'delete'],
            },
            owner_id: {
                render: 'hidden'
            },
            type: {
                label: 'Type'
            }
        },
        cameras: {
            make: 'Make',
            model: 'Model',
            unit: 'Unit',
            format: 'Format'
        },
        glass_plate_listings: {
            container: 'Container',
            plates: 'Plates',
            notes: 'Notes'
        },
        lens: {
            brand: 'Brand',
            focal_length: 'Focal Length',
            max_aperture: 'Max Aperture'
        },
        maps: {
            nts_map: 'NTS Map',
            historic_map: 'Historic Map',
            links: 'Links'
        },
        participants: {
            last_name: 'Last Name',
            given_names: 'Given Names'
        },
        participant_groups: {
            group_type: {
                'photographers': 'Photographers'
            }
        }
    }
}
