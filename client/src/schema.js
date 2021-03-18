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
            filesSelected: 'Please select files to upload.',
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
                label: 'Sign In',
                legend: 'User Authentication',
                submit: 'Sign In',
                method: 'POST',
                render: 'login'
            }
        },
        import: {
            label: 'Import',
            legend: 'Import New',
            submit: 'Import',
            method: 'POST',
            render: 'import',
            singular: false
        },
        upload: {
            label: 'Upload Files',
            legend: 'File Upload',
            submit: 'Upload',
            method: 'POST',
            render: 'upload'
        },
        new: {
            label: 'Create New',
            legend: 'Add',
            submit: 'Create',
            render: 'form'
        },
        edit: {
            label: 'Update',
            legend: 'Edit',
            submit: 'Update',
            render: 'form'
        },
        remove: {
            label: 'Remove',
            legend: 'Delete',
            submit: 'Delete',
            render: 'form'
        },
        show: {
            label: 'Info',
            legend: 'Item',
            render: 'nodes'
        },
        master: {
            label: 'Master',
            legend: 'Master Images',
            submit: 'Master',
            render: 'form'
        },
    },
    models: {
        users: {
            fieldsets: [
                {
                    legend: 'User Authentication',
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
                    }
                }
            ]
        },
        projects: {
            attributes: {
                order: 1,
                label: "Projects",
                singular: "Project",
                dependents: ['stations', 'historic_captures', 'modern_captures'],
                files: false
            },
            fieldsets: [
                {
                    nodes_id: {
                        render: 'hidden',
                        restrict: ['edit', 'delete'],
                    }
                },
                {
                    legend: 'Project Details',
                    name: {
                        key: 1,
                        label: 'Name'
                    },
                    description: {
                        label: 'Description'
                    }
                }]
        },
        surveyors: {
            attributes: {
                order: 2,
                label: "Surveyors",
                singular: "Surveyor",
                dependents: ['surveys'],
                files: false
            },
            fieldsets: [
                {
                    nodes_id: {
                        render: 'hidden',
                        restrict: ['edit', 'delete'],
                    },
                },
                {
                    legend: 'Surveyor Details',
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
                }]
        },
        surveys: {
            attributes: {
                order: 3,
                label: "Surveys",
                singular: "Survey",
                dependents: ['survey_seasons', 'historic_captures', 'modern_captures']
            },
            fieldsets: [
                {
                    nodes_id: {
                        render: 'hidden',
                        restrict: ['edit', 'delete'],
                    },
                    owner_id: {
                        render: 'hidden'
                    }
                },
                {
                    legend: 'Survey Details',
                    name: {
                        key: 1,
                        label: 'Survey Name'
                    },
                    historical_map_sheet: {
                        key: 2,
                        label: 'Historical Map Sheet'
                    }
                }]
        },
        survey_seasons: {
            attributes: {
                order: 4,
                label: "Survey Seasons",
                singular: "Survey Season",
                dependents: ['stations', 'historic_captures', 'modern_captures']
            },
            fieldsets: [
                {
                    nodes_id: {
                        render: 'hidden',
                        restrict: ['edit', 'delete'],
                    },
                    owner_id: {
                        render: 'hidden'
                    }
                },
                {
                    legend: 'Survey Season Details',
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
                        render: 'textarea',
                        label: 'Notes'
                    }
                }]
        },
        stations: {
            attributes: {
                order: 5,
                label: "Stations",
                singular: "Station",
                dependents: ['modern_visits', 'modern_captures']
            },
            fieldsets: [
                {
                    nodes_id: {
                        render: 'hidden',
                        restrict: ['edit', 'delete'],
                    },
                    owner_id: {
                        render: 'hidden',
                        restrict: ['edit', 'delete']
                    }
                },
                {
                    legend: 'Station Details',
                    name: {
                        key: 1,
                        label: 'Station'
                    },
                    nts_sheet: {
                        label: 'NTS Sheet'
                    }
                },
                {
                    legend: 'Coordinates',
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
                    }
                }]
        },
        historic_visits: {
            attributes: {
                order: 6,
                label: "Historic Visits",
                singular: "Historic Visit",
                dependents: ['historic_captures']
            },
            fieldsets: [
                {
                    nodes_id: {
                        render: 'hidden',
                        restrict: ['edit', 'delete'],
                    },
                    owner_id: {
                        render: 'hidden'
                    }
                },
                {
                    legend: 'Visit Details',
                    date: {
                        key: 1,
                        render: 'date',
                        label: 'Visit Date',
                    },
                    comments: {
                        label: 'Comments',
                    },
                }
            ]
        },
        modern_visits: {
            attributes: {
                order: 7,
                label: "Modern Visits",
                singular: "Modern Visit",
                dependents: ['modern_captures']
            },
            fieldsets: [
                {
                    nodes_id: {
                        render: 'hidden',
                        restrict: ['edit', 'delete'],
                    },
                    owner_id: {
                        render: 'hidden'
                    }
                },
                {
                    legend: 'Visit Details',
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
                    }
                },
                {
                    legend: 'Weather Conditions',
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
                }
            ]
        },
        historic_captures: {
            attributes: {
                order: 8,
                label: "Historic Captures",
                singular: "Historic Capture",
                files: ['historic_images']
            },
            fieldsets: [
                {
                    nodes_id: {
                        render: 'hidden',
                        restrict: ['edit', 'delete']
                    }
                },
                {
                    legend: 'Image Upload',
                    restrict: ['import'],
                    historic_images: {
                        label: 'Image File',
                        render: 'files',
                        validate: ['filesSelected']
                    },
                    image_state: {
                        render: 'select',
                        label: 'Image State',
                        reference: 'image_states'
                    }
                },
                {
                    legend: 'Image Upload',
                    render: 'multiple',
                    restrict: ['new', 'edit'],
                    historic_images: {
                        label: 'Image File',
                        render: 'file',
                        validate: ['filesSelected'],
                    },
                    image_state: {
                        render: 'select',
                        label: 'Image State',
                        reference: 'image_states'
                    }
                },
                {
                    legend: 'Digitization Details',
                    fn_photo_reference: {
                        label: 'Field Notes Photo Reference',
                        restrict: ['new', 'edit']
                    },
                    digitization_location: {
                        label: 'Digitization Location',
                        restrict: ['new', 'edit']
                    },
                    digitization_datetime: {
                        label: 'Digitization Datetime',
                        render: 'date',
                        restrict: ['new', 'edit']
                    },
                    comments: {
                        label: 'Comments'
                    },
                },
                {
                    legend: 'Camera Details',
                    cameras_id: {
                        label: 'Camera',
                        render: 'select',
                        reference: 'cameras'
                    },
                    lens_id: {
                        label: 'Lens',
                        render: 'select',
                        reference: 'lens'
                    },
                    f_stop: {
                        label: 'F-stop',
                        restrict: ['new', 'edit']
                    },
                    shutter_speed: {
                        label: 'Shutter Speed',
                        restrict: ['new', 'edit']
                    },
                    focal_length: {
                        label: 'Focal Length',
                        restrict: ['new', 'edit']
                    },
                    capture_datetime: {
                        label: 'Capture Datetime',
                        render: 'datetime',
                        restrict: ['new', 'edit']
                    },
                },
                {
                    legend: 'Library Archives Canada (LAC) Metadata',
                    lac_ecopy: {
                        label: 'LAC ECopy',
                        restrict: ['new', 'edit']
                    },
                    lac_wo: {
                        label: 'LAC WO',
                        restrict: ['new', 'edit']
                    },
                    lac_collection: {
                        label: 'LAC Collection',
                        restrict: ['new', 'edit']
                    },
                    lac_box: {
                        label: 'LAC Box',
                        restrict: ['new', 'edit']
                    },
                    lac_catalogue: {
                        label: 'LAC Catalogue',
                        restrict: ['new', 'edit']
                    },
                    condition: {
                        label: 'Condition'
                    },
                    plate_id: {
                        label: 'Plate ID'
                    }
                }
            ]
        },
        modern_captures: {
            attributes: {
                order: 9,
                label: "Modern Captures",
                singular: "Modern Capture",
                files: ['modern_images']
            },
            fieldsets: [
                {
                    nodes_id: {
                        render: 'hidden',
                        restrict: ['edit', 'delete'],
                    }
                },
                {
                    legend: 'Image Upload',
                    restrict: ['import'],
                    modern_images: {
                        label: 'Image File',
                        render: 'files',
                        validate: ['filesSelected']
                    },
                    image_state: {
                        render: 'select',
                        label: 'Image State',
                        reference: 'image_states'
                    }
                },
                {
                    legend: 'Image Upload',
                    render: 'multiple',
                    restrict: ['new', 'edit'],
                    historic_images: {
                        label: 'Image File',
                        render: 'file',
                        validate: ['filesSelected'],
                    },
                    image_state: {
                        render: 'select',
                        label: 'Image State',
                        reference: 'image_states'
                    }
                },
                {
                    legend: 'Capture Details',
                    fn_photo_reference: {
                        label: 'Field Notes Photo Reference'
                    },
                    capture_datetime: {
                        render: 'datetime',
                        label: 'Capture Datetime'
                    },
                    comments: {
                        label: 'Comments'
                    },
                    alternate: {
                        label: 'Alternate'
                    }
                },
                {
                    legend: 'Coordinates',
                    lat: {
                        label: 'Latitude'
                    },
                    long: {
                        label: 'Longitude'
                    },
                    elevation: {
                        label: 'Elevation'
                    },
                    azimuth: {
                        label: 'Azimuth'
                    }
                },
                {
                    legend: 'Camera Details',
                    cameras_id: {
                        render: 'select',
                        reference: 'cameras',
                        label: 'Camera'
                    },
                    lens_id: {
                        render: 'select',
                        reference: 'lens',
                        label: 'Lens'
                    },
                    f_stop: {
                        label: 'F-stop'
                    },
                    shutter_speed: {
                        label: 'Shutter Speed'
                    },
                    focal_length: {
                        label: 'Focal Length'
                    }
                }
            ]
        },
        locations: {
            attributes: {
                order: 10,
                label: "Locations",
                singular: "Location",
                files: ['supplemental_images']
            },
            fieldsets: [
                {
                    nodes_id: {
                        render: 'hidden',
                        restrict: ['edit', 'delete'],
                    },
                    owner_id: {
                        render: 'hidden'
                    }
                },
                {
                    legend: 'Location Details',
                    location_narrative: {
                        label: 'Narrative'
                    },
                    location_identity: {
                        key: 1,
                        label: 'Location ID'
                    },
                    legacy_photos_start: {
                        label: 'Photo Start Index'
                    },
                    legacy_photos_end: {
                        label: 'Photos End Index'
                    }
                }
            ]
        },
        historic_images: {
            attributes: {
                filetype: 'image',
                order: 11,
                label: "Historic Images",
                singular: "Historic Image"
            },
            fieldsets: [
                {
                    legend: 'Image Details',
                    file_size: {
                        render: 'filesize',
                        label: 'File size',
                        restrict: ['show', 'edit']
                    },
                    x_dim: {
                        render: 'imgsize',
                        label: 'Image Width',
                        restrict: ['show', 'edit']
                    },
                    y_dim: {
                        render: 'imgsize',
                        label: 'Image Height',
                        restrict: ['show', 'edit']
                    },
                    comments: {
                        label: 'Comments',
                        restrict: ['show', 'edit', 'delete']
                    }
                }]
        },
        modern_images: {
            attributes: {
                filetype: 'image',
                order: 12,
                label: "Modern Images",
                singular: "Modern Image"
            },
            fieldsets: [
                {
                    legend: 'Historic Capture Image',
                    restrict: ['master'],
                    historic_images: {
                        label: 'Historic Images',
                        render: 'imageSelect'
                    }
                },
                {
                    legend: 'Image Details',
                    restrict: ['show', 'edit'],
                    filename: {
                        label: 'Filename',
                        restrict: ['show']
                    },
                    file_size: {
                        render: 'filesize',
                        label: 'File size',
                        restrict: ['show']
                    },
                    x_dim: {
                        render: 'imgsize',
                        label: 'Image Width',
                        restrict: ['show']
                    },
                    y_dim: {
                        render: 'imgsize',
                        label: 'Image Height',
                        restrict: ['show']
                    },
                    bit_depth: {
                        label: 'Bit Depth',
                        restrict: ['show']
                    },
                    image_remote: {
                        label: 'Remote',
                        render: 'checkbox',
                        restrict: ['show', 'edit']
                    },
                    capture_datetime: {
                        label: 'Capture Datetime',
                        render: 'datetime',
                        restrict: ['show']
                    },
                    comments: {
                        label: 'Comments',
                        render: 'textarea',
                        restrict: ['show', 'edit']
                    }
                },
                {
                    legend: 'Coordinates',
                    restrict: ['show', 'edit'],
                    lat: {
                        label: 'Latitude'
                    },
                    long: {
                        label: 'Longitude'
                    }
                },
                {
                    legend: 'Camera Details',
                    restrict: ['show', 'edit'],
                    cameras_id: {
                        render: 'select',
                        label: 'Camera',
                        reference: 'cameras'
                    },
                    lens_id: {
                        render: 'select',
                        label: 'Lens',
                        reference: 'lens'
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
                }]
        },
        supplemental_images: {
            attributes: {
                filetype: 'image',
                order: 12,
                label: "Supplemental Images",
                singular: "Supplemental Image"
            },
            fieldsets: [
                {
                    legend: 'Image Details',
                    image_type: {
                        label: 'Type'
                    },
                    capture_datetime: {
                        label: 'Capture Datetime'
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
                    }
                },
                {
                    legend: 'Coordinates',
                    lat: {
                        label: 'Latitude'
                    },
                    long: {
                        label: 'Longitude'
                    }
                },
                {
                    legend: 'Camera Details',
                    cameras_id: {
                        render: 'select',
                        label: 'Camera',
                        reference: 'cameras'
                    },
                    lens_id: {
                        render: 'select',
                        label: 'Lens',
                        reference: 'lens'
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
                    }
                }]
        },
        metadata_files: {
            attributes: {
                order: 13,
                label: "Metadata Files",
                singular: "Metadata File"
            },
            fieldsets: [
                {
                    legend: 'File Details',
                    type: {
                        label: 'Type'
                    }
                }]
        },
        image_states: {
            attributes: {
                label: 'Image States',
                singular: 'Image State',
            },
            fieldsets: [
                {
                    label: {
                        key: 1,
                        label: 'Image State'
                    }
                }]
        },
        cameras: {
            attributes: {
                label: 'Camera Types',
                singular: 'Camera Type',
            },
            fieldsets: [
                {
                    make: {
                        key: 1,
                        label: 'Make'
                    },
                    model: {
                        key: 2,
                        label: 'Model'
                    },
                    unit: {
                        key: 3,
                        label: 'Unit'
                    },
                    format: {
                        key: 4,
                        label: 'Format'
                    },
                }]
        },
        lens: {
            attributes: {
                label: 'Lens Types',
                singular: 'Lens Type',
            },
            fieldsets: [
                {
                    brand: {
                        key: 1,
                        label: 'Brand'
                    },
                    focal_length: {
                        key: 2,
                        label: 'Focal Length'
                    },
                    max_aperture: {
                        key: 3,
                        label: 'Max Aperture'
                    }
                }]
        },
        glass_plate_listings: {
            attributes: {
                filetype: 'image',
                order: 12,
                label: 'Supplemental Images',
                singular: 'Supplemental Image',
            },
            fieldsets: [
                {
                    container: 'Container',
                    plates: 'Plates',
                    notes: 'Notes'
                }]
        },
        maps: {
            attributes: {
                filetype: 'image',
                order: 12,
                label: 'Supplemental Images',
                singular: 'Supplemental Image',
            },
            fieldsets: [
                {
                    nts_map: 'NTS Map',
                    historic_map: 'Historic Map',
                    links: 'Links'
                }]
        },
        participants: {
            attributes: {
                filetype: 'image',
                order: 12,
                label: 'Supplemental Images',
                singular: 'Supplemental Image',
            },
            fieldsets: [
                {
                    last_name: 'Last Name',
                    given_names: 'Given Names'
                }]
        },
        participant_groups: {
            attributes: {
                label: 'Participant Groups',
                singular: 'Participant Group',
            },
            fieldsets: [
                {
                    group_type: {
                        'photographers': 'Photographers'
                    }
                }]
        }
    }
}
