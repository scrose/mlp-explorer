/*!
 * MLP.Client.Schema
 * File: schema.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

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
    register: {
        attributes: {
            type: 'form',
            label: 'User Registration',
            method: 'post'
        },
        users: {
            email: {
                label: 'Email',
                render: 'email',
                restrict: [
                    'administrator',
                    'super_administrator'
                ]
            },
            password: {
                render: 'password',
                restrict: [
                    'administrator',
                    'super_administrator'
                ]
            },
            repeat_password: {
                render: 'password',
                restrict: [
                    'administrator',
                    'super_administrator'
                ]
            },
            role: {
                render: 'select',
                restrict: [
                    'administrator',
                    'super_administrator'
                ]
            }
        }
    },
    login: {
        attributes: {
            type: 'form',
            label: 'User Login',
            method: 'post'
        },
        users: {
            email: {
                render: 'email',
                restrict: ['visitor']
            },
            password: {
                render: 'password',
                restrict: ['visitor']
            }
        }
    },
    dashboard: {
        attributes: {
            type: 'form',
            label: 'Dashboard',
        },
        users: {
            email: {
                render: 'readonly',
                restrict: null
            },
            role: {
                render: 'readonly',
                restrict: null
            }
        }
    },
    add: {
        attributes: {
            type: 'form',
            label: 'Create',
            method: 'post'
        },
        default: {
            field: {
                render: {
                    'integer': 'integer',
                    'text': 'text',
                    'varchar': 'text'
                },
                restrict: ['contributor', 'editor', 'administrator', 'super_administrator']
            }
        }
    },
    edit: {
        attributes: {
            type: 'form',
            label: 'Update',
            method: 'post'
        },
        users: {
            email: {
                label: 'Email',
                render: 'email'
            },
            role: {
                render: 'select'
            },
            password: {
                label: 'Reset Password',
                render: 'link'
            }
        }
    },
    remove: {
        attributes: {
            type: 'form',
            label: 'Delete',
            method: 'post'
        }
    },
    labels: {
        users: {
            email: 'Email',
            password: 'Password',
            repeat_password: 'Repeat Password',
            role: 'User Role'
        },
        projects: {
            name: 'Project Name',
            description: 'Project Description'
        },
        surveyors: {
            given_names: 'Given Names',
            last_name: 'Last Name',
            short_name: 'Short Name',
            affiliation: 'Affiliation'
        },
        surveys: {
            name: 'Survey Name',
            historical_map_sheet: 'Historical Map Sheet',
        },
        surveySeasons: {
            year: 'Year',
            geographic_coverage: 'Geographic Coverage',
            jurisdiction: 'Jurisdiction',
            affiliation: 'Affiliation',
            archive: 'Archive',
            collection: 'Collection',
            location: 'Location',
            sources: 'Sources',
            notes: 'Notes'
        },
        stations: {
            name: 'Station Name',
            lat: 'Latitude',
            long: 'Longitude',
            elevation: 'Elevation',
            nts_sheet: 'NTS Sheet',
            published: 'Published'
        },
        visits: {
            date: 'Visit Date',
            start_time: 'Start Time',
            finish_time: 'Finishe Time',
            pilot: 'Pilot',
            rw_call_sign: 'Call Sign',
            visit_narrative: 'Narrative',
            illustration: 'Illustration',
            weather_narrative: 'Weather Description',
            weather_temp: 'Temperature',
            weather_ws: 'Wind Speed',
            weather_gs: 'GS',
            weather_pressure: 'Atmospheric Pressure',
            weather_rh: 'RH',
            weather_wb: 'WB'
        },
        historicVisits: {
            date: 'Visit Date',
            comments: 'Comments'
        },
        locations: {
            location_narrative: 'Narrative',
            location_identity: 'Location ID',
            lat: 'Latitude',
            long: 'Longitude',
            elevation: 'Elevation',
            legacy_photos_start: 'Photo Start Index',
            legacy_photos_end: 'Photos End Index',
            published: 'Published'
        },
        historicCaptures: {
            plate_id:'Plate ID',
            fn_photo_reference: 'Field Notes Photo Reference',
            f_stop: 'F-stop',
            shutter_speed: 'Shutter Speed',
            focal_length: 'Focal Length',
            capture_datetime: 'Capture Datetime',
            camera_id: 'Camera',
            lens_id: 'Lens',
            digitization_location: 'Digitization Location',
            digitization_datetime: 'Digitization Datetime',
            lac_ecopy: 'LAC ECopy',
            lac_wo: 'LAC WO',
            lac_collection: 'LAC Collection',
            lac_box: 'LAC box',
            lac_catalogue: 'LAC Catalogue',
            condition: 'Condition',
            comments: 'comments'
        },
        captures:{
            fn_photo_reference: 'Field Notes Photo Reference',
            f_stop: 'F-stop',
            shutter_speed: 'Shutter Speed',
            focal_length: 'Focal Length',
            capture_datetime: 'Capture Datetime',
            camera_id: 'Camera',
            lens_id: 'Lens',
            lat: 'Latitude',
            long: 'Longitude',
            elevation: 'Elevation',
            azimuth: 'Azimuth',
            comments: 'Comments',
            alternate: 'Alternate'
        },
        captureImages:{
            file_size: 'File size',
            x_dim: 'Image Width',
            y_dim: 'Image Height',
            image_state: 'Image State',
            image_remote: 'Remote',
            comments: 'Comments',
            image_remote_processing: 'Remote Processing'
        },
        images: {
            file_size: 'File size',
            x_dim: 'Image Width',
            y_dim: 'Image Height',
            bit_depth: 'Bit Depth',
            image_remote: 'Remote',
            comments: 'Comments',
            lat: 'Latitude',
            long: 'Longitude',
            f_stop: 'F-stop',
            shutter_speed: 'Shutter Speed',
            focal_length: 'Focal Length',
            iso: 'ISO',
            capture_datetime: 'Capture Datetime',
            camera_id: 'Camera',
            lens_id: 'Lens',
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
    },
    errors: {
        formValidation: {
            isRequired: 'This field is required.',
            isEmail: 'Not a valid email address.',
            isPassword: 'Passwords must have a minimum eight and maximum 20 characters, at least one uppercase letter, one lowercase letter, one number and one special character',
            isValidForm: 'Form not valid.',
            isRepeatPassword: 'Passwords do not match.'
        }
    }
}
