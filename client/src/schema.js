/*!
 * MLP.Client.Schema
 * File: schema.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

/**
 * MLP Schema
 * Description: This is a configuration document for defining rendering,
 *              labelling, routing, input validation, node/file relations
 *              and other settings for the client-side web application.
 * @private
 */

export const schema = {
    app: {
        protocol: 'http://',
        host: 'localhost',
        apiPort: 3001,
        clientPort: 3000,
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
        '/iat': {
            name: 'imageToolkit',
            label: 'Image Analysis Toolkit'
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
            isSelected: 'Please select an item.',
            isMultiSelected: 'Please select at least one item.',
            filesSelected: 'Please select files to upload.',
            isLatitude: 'Latitude is invalid.',
            isLongitude: 'Longitude is invalid.',
            isEmail: 'Not a valid email address.',
            isPassword: 'Passwords must have a minimum eight and maximum 20 characters, at least one uppercase letter, one lowercase letter, one number and one special character',
            isValidForm: 'Form not valid.',
            isRepeatPassword: 'Passwords do not match.'
        },
        authentication: {
            noAuth: 'Authentication failed. Please contact the site administrator.'
        },
        canvas: {
            emptyCanvas: `One or more canvases are not loaded.`,
            missingControlPoints: `Too few control points for operation.`,
            maxControlPoints: 'Maximum number of control points selected.'
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
            label: 'Add New',
            legend: 'Add',
            submit: 'Add',
            render: 'update'
        },
        edit: {
            label: 'Update',
            legend: 'Edit',
            submit: 'Update',
            render: 'update'
        },
        remove: {
            label: 'Remove',
            legend: 'Delete',
            submit: 'Delete',
            render: 'update'
        },
        show: {
            label: 'Info',
            legend: 'Item',
            render: 'nodes'
        },
        master: {
            label: 'Master',
            legend: 'Master Images',
            submit: 'Apply Alignment',
            render: 'master'
        },
        mapFilter: {
            label: 'Map Filter',
            legend: 'Filter',
            submit: 'Filter',
            render: 'form'
        },
        filter: {
            label: 'Filter',
            legend: 'Filter',
            submit: 'Filter',
            render: 'filter'
        },
        search: {
            label: 'Search',
            legend: 'Search',
            submit: '',
            render: 'form'
        }
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
                    restrict: ['edit', 'delete'],
                    nodes_id: {
                        render: 'hidden'
                    }
                },
                {
                    legend: 'Surveyor Details',
                    given_names: {
                        label: 'Given Names'
                    },
                    last_name: {
                        label: 'Last Name'
                    },
                    short_name: {
                        label: 'Short Name'
                    },
                    affiliation: {
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
                    restrict: ['edit', 'delete'],
                    nodes_id: {
                        render: 'hidden'
                    },
                    owner_id: {
                        render: 'hidden'
                    }
                },
                {
                    legend: 'Survey Details',
                    name: {
                        label: 'Survey Name',
                        validate: ['isRequired'],
                        tooltip: 'The survey name is required.'
                    },
                    historical_map_sheet: {
                        label: 'Historical Map Sheet'
                    }
                }]
        },
        survey_seasons: {
            attributes: {
                order: 4,
                label: "Survey Seasons",
                singular: "Survey Season",
                dependents: [
                    'stations',
                    'historic_captures',
                    'modern_captures',
                    'glass_plate_listings',
                    'maps'
                ]
            },
            fieldsets: [
                {
                    restrict: ['edit', 'delete'],
                    nodes_id: {
                        render: 'hidden',
                        validate: ['isRequired']
                    },
                    owner_id: {
                        render: 'hidden'
                    }
                },
                {
                    legend: 'Survey Season Details',
                    year: {
                        label: 'Year',
                        render: 'year',
                        validate: ['isRequired']
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
                    restrict: ['edit', 'delete'],
                    nodes_id: {
                        render: 'hidden'
                    },
                    owner_id: {
                        render: 'hidden'
                    }
                },
                {
                    restrict: ['new', 'show', 'edit', 'delete'],
                    legend: 'Station Details',
                    name: {
                        label: 'Station Name',
                        validate: ['isRequired']
                    },
                    nts_sheet: {
                        label: 'NTS Sheet'
                    }
                },
                {
                    restrict: ['new', 'show', 'edit', 'delete'],
                    legend: 'Coordinates',
                    lat: {
                        label: 'Latitude',
                        render: 'coord',
                        validate: ['isLatitude']
                    },
                    lng: {
                        label: 'Longitude',
                        render: 'coord',
                        validate: ['isLongitude']
                    },
                    elev: {
                        label: 'Elevation',
                        render: 'float',
                        suffix: 'm'
                    },
                    azim: {
                        label: 'Azimuth',
                        render: 'float'
                    }
                },
                {
                    legend: 'Filter Map Stations',
                    restrict: ['mapFilter'],
                    surveyors: {
                        render: 'select',
                        reference: 'surveyors',
                        label: 'Surveyor'
                    },
                    surveys: {
                        render: 'select',
                        reference: 'surveys',
                        label: 'Survey',
                    },
                    survey_seasons: {
                        render: 'select',
                        reference: 'survey_seasons',
                        label: 'Survey Season'
                    }
                }]
        },
        historic_visits: {
            attributes: {
                order: 6,
                label: "Historic Visits",
                singular: "Historic Visit",
                prefix: "Historic Visit",
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
                dependents: [
                    'locations',
                    'participant_groups',
                    'modern_captures']
            },
            fieldsets: [
                {
                    restrict: ['edit', 'delete'],
                    nodes_id: {
                        render: 'hidden'
                    },
                    owner_id: {
                        render: 'hidden'
                    }
                },
                {
                    legend: 'Visit Details',
                    date: {
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
                        label: 'Narrative',
                        render: 'textarea'
                    },
                    illustration: {
                        label: 'Illustration'
                    }
                },
                {
                    legend: 'Weather Conditions',
                    weather_narrative: {
                        label: 'Weather Description',
                        render: 'textarea'
                    },
                    weather_temp: {
                        label: 'Temperature',
                        render: 'float',
                        suffix: '°C'
                    },
                    weather_ws: {
                        label: 'Wind Speed',
                        render: 'float',
                        suffix: 'km/h'
                    },
                    weather_gs: {
                        label: 'Gust Speed',
                        suffix: 'km/h',
                        render: 'float'
                    },
                    weather_pressure: {
                        label: 'Barometric Pressure',
                        suffix: 'kPa',
                        render: 'float'
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
                prefix: "Capture",
                dependents: ['historic_images']
            },
            fieldsets: [
                {
                    restrict: ['edit', 'delete'],
                    nodes_id: {
                        render: 'hidden'
                    }
                },
                {
                    legend: 'Image Upload',
                    restrict: ['import'],
                    historic_images: {
                        label: 'Image Files',
                        render: 'file',
                        multiple: true,
                        validate: ['filesSelected']
                    },
                    image_state: {
                        render: 'select',
                        label: 'Image State',
                        reference: 'image_states',
                        validate: ['isRequired']
                    }
                },
                {
                    legend: 'Image Upload',
                    render: 'multiple',
                    restrict: ['new'],
                    historic_images: {
                        label: 'Image File',
                        render: 'file',
                        validate: ['filesSelected'],
                    },
                    image_state: {
                        render: 'select',
                        label: 'Image State',
                        reference: 'image_states',
                        validate: ['isRequired']
                    }
                },
                {
                    legend: 'Digitization Details',
                    restrict: ['show', 'new', 'edit'],
                    fn_photo_reference: {
                        label: 'Field Notes Photo Reference'

                    },
                    digitization_location: {
                        label: 'Digitization Location'
                    },
                    digitization_datetime: {
                        label: 'Digitization Datetime',
                        render: 'date',
                    },
                    comments: {
                        label: 'Comments'
                    }
                },
                {
                    legend: 'Camera Details',
                    restrict: ['show', 'new', 'edit'],
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
                        render: 'float',
                        min: 0,
                        prefix: 'f/'
                    },
                    shutter_speed: {
                        label: 'Shutter Speed',
                        render: 'smallText'
                    },
                    focal_length: {
                        label: 'Focal Length',
                        render: 'float',
                        min: 0,
                        suffix: 'mm'
                    },
                    capture_datetime: {
                        label: 'Capture Datetime',
                        render: 'datetime'
                    }
                },
                {
                    legend: 'Library Archives Canada (LAC) Metadata',
                    restrict: ['show', 'new', 'edit'],
                    lac_ecopy: {
                        label: 'LAC ECopy Number'
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
                prefix: "Modern Capture",
                dependents: ['modern_images']
            },
            fieldsets: [
                {
                    restrict: ['edit', 'delete'],
                    nodes_id: {
                        render: 'hidden'
                    }
                },
                {
                    legend: 'Image Upload',
                    restrict: ['import'],
                    modern_images: {
                        label: 'Image Files',
                        render: 'file',
                        multiple: true,
                        validate: ['filesSelected']
                    },
                    image_state: {
                        render: 'select',
                        label: 'Image State',
                        reference: 'image_states',
                        validate: ['isRequired']
                    }
                },
                {
                    legend: 'Image Upload',
                    render: 'multiple',
                    restrict: ['new'],
                    modern_images: {
                        label: 'Image File',
                        render: 'file',
                        validate: ['filesSelected'],
                    },
                    image_state: {
                        render: 'select',
                        label: 'Image State',
                        reference: 'image_states',
                        validate: ['isRequired']
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
                        label: 'Latitude',
                        render: 'coord',
                        validate: ['isLatitude']
                    },
                    lng: {
                        label: 'Longitude',
                        render: 'coord',
                        validate: ['isLongitude']
                    },
                    elev: {
                        label: 'Elevation',
                        render: 'float',
                        suffix: 'm'
                    },
                    azim: {
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
                        label: 'F-stop',
                        render: 'float',
                        min: 0,
                        prefix: 'f/'
                    },
                    shutter_speed: {
                        label: 'Shutter Speed',
                        render: 'smallText'
                    },
                    focal_length: {
                        label: 'Focal Length',
                        render: 'float',
                        min: 0,
                        suffix: 'mm'
                    }
                }
            ]
        },
        locations: {
            attributes: {
                order: 10,
                label: "Locations",
                prefix: "Location",
                singular: "Location",
                dependents: ['modern_captures'],
                files: ['supplemental_images']
            },
            fieldsets: [
                {
                    restrict: ['edit', 'delete'],
                    nodes_id: {
                        render: 'hidden'
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
                    files_id: {
                        render: 'hidden',
                        restrict: ['edit']
                    }
                },
                {
                    legend: 'Image Upload',
                    restrict: ['new'],
                    historic_images: {
                        label: 'Image File',
                        render: 'file',
                        validate: ['filesSelected']
                    },
                    image_state: {
                        render: 'select',
                        label: 'Image State',
                        reference: 'image_states',
                        validate: ['isRequired']
                    }
                },
                {
                    legend: 'Capture Details',
                    restrict: ['edit', 'show'],
                    image_state: {
                        label: 'Image State',
                        render: 'select',
                        reference: 'image_states',
                        validate: ['isRequired']
                    }
                },
                {
                    legend: 'Image Details',
                    restrict: ['show'],
                    file_size: {
                        render: 'filesize',
                        label: 'File size',

                    },
                    x_dim: {
                        render: 'imgsize',
                        label: 'Image Width'
                    },
                    y_dim: {
                        render: 'imgsize',
                        label: 'Image Height'
                    },
                    format: {
                        label: 'Image Format'
                    },
                    channels: {
                        label: 'Channels'
                    },
                    density: {
                        label: 'Density'
                    },
                    space: {
                        label: 'Space'
                    },
                    comments: {
                        label: 'Comments'
                    }
                },
                {
                    legend: 'Camera Details',
                    restrict: ['show'],
                    lens_id: {
                        render: 'select',
                        reference: 'lens',
                        label: 'Lens'
                    },
                    f_stop: {
                        label: 'F-stop',
                        render: 'float',
                        min: 0,
                        prefix: 'f/'
                    },
                    shutter_speed: {
                        label: 'Shutter Speed',
                        render: 'smallText'
                    },
                    focal_length: {
                        label: 'Focal Length',
                        render: 'float',
                        min: 0,
                        suffix: 'mm'
                    }
                },
                {
                    legend: 'Coordinates',
                    restrict: ['show'],
                    lat: {
                        label: 'Latitude',
                        render: 'coord',
                    },
                    lng: {
                        label: 'Longitude',
                        render: 'coord',
                    },
                    elev: {
                        label: 'Elevation',
                        suffix: 'm',
                        render: 'float'
                    },
                    azim: {
                        label: 'Azimuth',
                        render: 'float'
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
                    files_id: {
                        render: 'hidden',
                        restrict: ['edit']
                    }
                },
                {
                    legend: 'Image Upload',
                    restrict: ['new'],
                    modern_images: {
                        label: 'Image File',
                        render: 'file',
                        validate: ['filesSelected']
                    },
                    image_state: {
                        render: 'select',
                        label: 'Image State',
                        reference: 'image_states',
                        validate: ['isRequired']
                    }
                },
                {
                    legend: 'Capture Details',
                    restrict: ['edit', 'show'],
                    image_state: {
                        label: 'Image State',
                        render: 'select',
                        reference: 'image_states',
                        validate: ['isRequired']
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
                        label: 'Latitude',
                        render: 'coord',
                        validate: ['isLatitude']
                    },
                    lng: {
                        label: 'Longitude',
                        render: 'coord',
                        validate: ['isLongitude']
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
                        label: 'F-stop',
                        render: 'float',
                        min: 0,
                        prefix: 'f/'
                    },
                    shutter_speed: {
                        label: 'Shutter Speed',
                        render: 'smallText'
                    },
                    focal_length: {
                        label: 'Focal Length',
                        render: 'float',
                        min: 0,
                        suffix: 'mm'
                    },
                    iso: {
                        label: 'ISO',
                        render: 'int'
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
                    comments: {
                        label: 'Comments'
                    }
                },
                {
                    legend: 'Coordinates',
                    lat: {
                        label: 'Latitude',
                        render: 'coord',
                        validate: ['isLatitude']
                    },
                    lng: {
                        label: 'Longitude',
                        render: 'coord',
                        validate: ['isLongitude']
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
                        label: 'F-stop',
                        render: 'float',
                        min: 0,
                        prefix: 'f/'
                    },
                    shutter_speed: {
                        label: 'Shutter Speed',
                        render: 'smallText'
                    },
                    focal_length: {
                        label: 'Focal Length',
                        render: 'float',
                        min: 0,
                        suffix: 'mm'
                    },
                    iso: {
                        label: 'ISO',
                        render: 'int'
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
                    name: {
                        label: 'Image Name',
                        validate: ['isAlphanumeric']
                    },
                    label: {
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
                        label: 'Make',
                        validate: ['isRequired']
                    },
                    model: {
                        label: 'Model',
                        validate: ['isRequired']
                    },
                    unit: {
                        label: 'Unit'
                    },
                    format: {
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
                        label: 'Brand',
                        validate: ['isRequired']
                    },
                    focal_length: {
                        label: 'Focal Length',
                        render: 'float'
                    },
                    max_aperture: {
                        label: 'Max Aperture',
                        render: 'float'
                    }
                }]
        },
        glass_plate_listings: {
            attributes: {
                order: 12,
                label: 'Glass Plate Listings',
                singular: 'Glass Plate Listing',
            },
            fieldsets: [
                {
                    legend: 'Glass Plate Listing Details',
                    container: {
                        label: 'Container'
                    },
                    plates: {
                        label: 'Plates'
                    },
                    notes: {
                        label: 'Notes'
                    }
                }]
        },
        maps: {
            attributes: {
                order: 12,
                label: 'Maps',
                singular: 'Map',
            },
            fieldsets: [
                {
                    legend: 'Map Details',
                    nts_map: {
                        label: 'NTS Map'
                    },
                    historic_map: {
                        label: 'Historic Map'
                    },
                    links: {
                        label: 'Links'
                    }
                }]
        },
        comparisons: {
            attributes: {
                order: 12,
                label: 'Comparisons',
                singular: 'Comparison',
            },
            fieldsets: [
                {
                    legend: 'Capture Images',
                    historic_capture: {
                        label: 'Historic Capture',
                        validate: ['isRequired']
                    },
                    modern_capture: {
                        label: 'Modern Capture',
                        validate: ['isRequired']
                    },
                }]
        },
        participant_group_types: {
            attributes: {
                label: 'Group Types',
                singular: 'Group Type'
            },
            fieldsets: [
                {
                    legend: 'Group Type Settings',
                    name: {
                        label: 'Name',
                        validate: ['isRequired']
                    },
                    label: {
                        label: 'Label'
                    },
                }]
        },
        participant_groups: {
            attributes: {
                label: 'Visit Participants',
                singular: 'Participant Group'
            },
            fieldsets: [
                {
                    legend: 'Add New Participant Group',
                    restrict: ['new'],
                    group_type: {
                        render: 'select',
                        label: 'Group Type',
                        reference: 'participant_group_types',
                        validate: ['isRequired']
                    },
                    participants: {
                        label: 'Participants',
                        render: 'multiselect',
                        reference: 'participants',
                        validate: ['isMultiSelected']
                    }
                },
                {
                    legend: 'Hiking Group',
                    restrict: ['show', 'edit'],
                    hiking_party: {
                        label: 'Participants',
                        render: 'multiselect',
                        reference: 'participants'
                    },
                    group_type: {
                        render: 'hidden'
                    }
                },
                {
                    legend: 'Field Notes Authors',
                    restrict: ['show', 'edit'],
                    field_notes_authors: {
                        label: 'Participants',
                        render: 'multiselect',
                        reference: 'participants'
                    },
                    group_type: {
                        render: 'hidden'
                    }
                },
                {
                    legend: 'Photographers',
                    restrict: ['show', 'edit'],
                    photographers: {
                        label: 'Participants',
                        render: 'multiselect',
                        reference: 'participants'
                    },
                    group_type: {
                        render: 'hidden'
                    }
                }]
        },
        participants: {
            attributes: {
                order: 12,
                label: 'Participant',
                singular: 'Participant',
            },
            fieldsets: [
                {
                    legend: 'Participants',
                    restrict: ['list'],
                    full_name: {
                        label: 'Name'
                    }
                },
                {
                    legend: 'Participant Details',
                    restrict: ['show', 'new', 'edit'],
                    last_name: {
                        label: 'Last Name',
                        validate: ['isRequired']
                    },
                    given_names: {
                        label: 'Given Names',
                        validate: ['isRequired']
                    }
                }
            ]
        }
    }
}
