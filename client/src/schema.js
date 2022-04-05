/*!
 * MLP.Client.Schema
 * File: schema.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
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
        project: "Mountain Legacy Project",
        name: "Explorer",
        title: "Welcome to the Mountain Legacy Project Explorer",
        mlp_url: 'http://mountainlegacy.ca',
        carousel: 47285,
    },
    routes: {
        '/': {
            name: 'dashboard',
            label: ''
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
        image: {
            fallbackSrc: '/fallback_img.png'
        },
        validation: {
            isRequired: 'This field is required.',
            isSelected: 'Please select an item.',
            isMultiSelected: 'Please select at least one item.',
            filesSelected: 'Please select files to upload.',
            isLatitude: 'Latitude is invalid.',
            isLongitude: 'Longitude is invalid.',
            isAzimuth: 'Azimuth is invalid.',
            isEmail: 'Not a valid email address.',
            isPassword: 'Passwords must have a minimum eight and maximum 20 characters, at least one uppercase letter, one lowercase letter, one number and one special character',
            isValidForm: 'Form not valid.',
            isRepeatPassword: 'Passwords do not match.'
        },
        authentication: {
            noAuth: 'Authentication failed. Please contact the site administrator.'
        },
        canvas: {
            streamError: 'Error occurred during parsing of data stream.',
            default: 'Error: could not complete operation.',
            emptyCanvas: `Please load both canvases to complete operation.`,
            collinearPts: 'Control points should not be collinear (form a line).',
            missingControlPoints: `Missing control points to complete operation.`,
            maxControlPoints: 'Maximum number of control points selected.',
            mismatchedDims: `Images must be scaled to the same width to complete operation.`
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
            submit: 'Upload Mastered Image',
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
        },
        download: {
            label: 'Download File',
            legend: 'Download',
            submit: 'Download',
            render: 'download'
        }
    },
    captures: {
        types: ['historic_captures', 'modern_captures'],
        sorted: ['historic_visits', 'locations'],
        unsorted: ['projects', 'surveys', 'survey_seasons', 'modern_visits']
    },
    excluded: ['historic_images', 'modern_images', 'supplemental_images', 'historic_captures', 'modern_captures'],
    models: {
        users: {
            fieldsets: [
                {
                    legend: 'User Authentication',
                    collapsible: false,
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
                dependents: [
                    'stations',
                    'historic_captures',
                    'modern_captures'
                ],
                files: false
            },
            fieldsets: [
                {
                    restrict: ['edit', 'delete'],
                    nodes_id: {
                        render: 'hidden',
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
                dependents: [
                    'survey_seasons',
                    'historic_captures',
                    'modern_captures',
                    'supplemental_images'
                ],
                files: [
                    'supplemental_images'
                ]
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
                    'maps',
                    'supplemental_images'
                ],
                files: [
                    'supplemental_images'
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
                dependents: [
                    'historic_visits',
                    'modern_visits',
                    'modern_captures',
                    'supplemental_images',
                    'metadata_files'
                ],
                files: [
                    'supplemental_images',
                    'metadata_files'
                ]
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
                        render: 'float',
                        suffix: '°',
                        validate: ['isAzimuth']
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
                    restrict: ['edit', 'delete'],
                    nodes_id: {
                        render: 'hidden'
                    },
                    owner_id: {
                        render: 'hidden'
                    }
                },
                {
                    legend: 'Edit Captures',
                    render: 'component',
                    restrict: ['edit'],
                    users: ['editor', 'administrator', 'super_administrator'],
                    modern_captures: {
                        label: 'Historic Captures',
                        render: 'nodeEditor',
                        reference: 'node',
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
                    'modern_captures',
                    'supplemental_images',
                    'metadata_files'
                ],
                files: [
                    'metadata_files',
                    'supplemental_images'
                ]
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
                    legend: 'Edit Attached Metadata',
                    render: 'component',
                    restrict: ['edit'],
                    users: ['editor', 'administrator', 'super_administrator'],
                    modern_captures: {
                        label: 'Dependents',
                        render: 'nodeEditor',
                        reference: 'node',
                    }
                },
                {
                    legend: 'Visit Details',
                    date: {
                        label: 'Visit Date',
                        render: 'date'
                    },
                    start_time: {
                        label: 'Start Time',
                        render: 'time'
                    },
                    finish_time: {
                        label: 'Finish Time',
                        render: 'time'
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
                        min: -273,
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
                        label: 'Relative Humidity',
                        render: 'float',
                        suffix: '%'
                    },
                    weather_wb: {
                        label: 'Wet Bulb',
                        render: 'float',
                        suffix: '°C'
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
                    users: ['administrator', 'super_administrator'],
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
                    legend: 'Edit Capture Images',
                    render: 'component',
                    restrict: ['edit'],
                    modern_captures: {
                        label: 'Capture Images',
                        render: 'nodeEditor',
                        reference: 'node',
                    }
                },
                {
                    legend: 'Image Upload',
                    render: 'multiple',
                    restrict: ['new'],
                    users: ['administrator', 'super_administrator'],
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
                    legend: 'Comparison',
                    restrict: ['new', 'edit'],
                    users: ['editor', 'administrator', 'super_administrator'],
                    modern_captures: {
                        label: 'Repeated Modern Captures for Comparison',
                        render: 'compareSelector',
                        reference: 'node',
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
                        render: 'datetime',
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
                    restrict: ['move'],
                    owner_id: {
                        render: 'hidden'
                    }
                },
                {
                    legend: 'Bul, Image Upload',
                    restrict: ['import'],
                    users: ['administrator', 'super_administrator'],
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
                    users: ['administrator', 'super_administrator'],
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
                    legend: 'Comparison',
                    restrict: ['new', 'edit'],
                    users: ['editor', 'administrator', 'super_administrator'],
                    historic_captures: {
                        label: 'Historic Captures for Comparison',
                        render: 'compareSelector',
                        reference: 'node',
                    }
                },
                {
                    legend: 'Capture Details',
                    restrict: ['show', 'new', 'edit', 'import'],
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
                        label: 'Alternate',
                        render: 'checkbox'
                    }
                },
                {
                    legend: 'Coordinates',
                    restrict: ['show', 'new', 'edit', 'import'],
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
                        render: 'float',
                        suffix: '°',
                        validate: ['isAzimuth']
                    }
                },
                {
                    legend: 'Camera Details',
                    restrict: ['show', 'new', 'edit', 'import'],
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
                },
                {
                    legend: 'Edit Capture Images',
                    render: 'component',
                    restrict: ['edit'],
                    modern_captures: {
                        label: 'Capture Images',
                        render: 'nodeEditor',
                        reference: 'node',
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
                dependents: [
                    'modern_captures',
                    'supplemental_images'
                ],
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
                        label: 'Photo Start Index',
                        render: 'int',
                        min: 0
                    },
                    legacy_photos_end: {
                        label: 'Photos End Index',
                        render: 'int',
                        min: 0
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
                    restrict: ['edit'],
                    files_id: {
                        render: 'hidden'
                    }
                },
                {
                    legend: 'Image Upload',
                    restrict: ['new'],
                    users: ['administrator', 'super_administrator'],
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
                    restrict: ['edit', 'show', 'upload'],
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
                    filename: {
                        render: 'text',
                        label: 'Filename',
                        restrict: ['show']
                    },
                    format: {
                        label: 'Image Format'
                    },
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
                        render: 'float',
                        suffix: '°'
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
                    restrict: ['edit'],
                    files_id: {
                        render: 'hidden'
                    }
                },
                {
                    legend: 'Image Upload',
                    restrict: ['new'],
                    users: ['administrator', 'super_administrator'],
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
                    restrict: ['master'],
                    users: ['administrator', 'super_administrator'],
                    historic_capture: {
                        render: 'hidden'
                    },
                    modern_capture: {
                        render: 'hidden'
                    }
                },
                {
                    legend: 'Capture Details',
                    restrict: ['edit', 'show', 'upload'],
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
                        render: 'text',
                        label: 'Filename',
                        restrict: ['show']
                    },
                    mimetype: {
                        render: 'text',
                        label: 'Format',
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
        master_images: {
            attributes: {
                filetype: 'image',
                order: 12,
                label: "Master Images",
                singular: "Master Image"
            },
            fieldsets: [
                {
                    legend: 'Image Metadata',
                    users: ['administrator', 'super_administrator'],
                    capture: {
                        label: 'Capture',
                        render: 'text'
                    },
                    filename: {
                        label: 'Filename',
                        render: 'int'
                    },
                    mime_type: {
                        label: 'Type',
                        render: 'text'
                    },
                    width: {
                        label: 'Width',
                        render: 'int'
                    },
                    height: {
                        label: 'Height',
                        render: 'int'
                    },
                },
            ]
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
                    restrict: ['edit'],
                    files_id: {
                        render: 'hidden'
                    }
                },
                {
                    legend: 'Image Upload',
                    restrict: ['new'],
                    users: ['administrator', 'super_administrator'],
                    supplemental_images: {
                        label: 'Image File',
                        render: 'file',
                        validate: ['filesSelected']
                    }
                },
                {
                    legend: 'Image Details',
                    restrict: ['new', 'edit'],
                    image_type: {
                        label: 'Image Type',
                        render: 'select',
                        reference: 'image_types',
                        validate: ['isRequired']
                    },
                    capture_datetime: {
                        label: 'Capture Datetime',
                        render: 'datetime'
                    },
                    comments: {
                        label: 'Comments',
                        render: 'textarea'
                    }
                },
                {
                    legend: 'Image Details',
                    restrict: ['show'],
                    filename: {
                        render: 'text',
                        label: 'Filename',
                        restrict: ['show']
                    },
                    image_type: {
                        label: 'Image Type',
                        render: 'select',
                        reference: 'image_types'
                    },
                    mimetype: {
                        render: 'text',
                        label: 'Format',
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
                    legend: 'File Upload',
                    restrict: ['new'],
                    users: ['administrator', 'super_administrator'],
                    metadata_files: {
                        label: 'Metadata File (PDF)',
                        render: 'file',
                        validate: ['filesSelected']
                    },
                    type: {
                        label: 'Metadata Type',
                        render: 'select',
                        reference: 'metadata_file_types',
                        validate: ['isRequired']
                    },
                },
                {
                    legend: 'Edit Metadata Type',
                    restrict: ['edit'],
                    files_id: {
                        render: 'hidden'
                    },
                    type: {
                        label: 'Metadata Type',
                        render: 'select',
                        reference: 'metadata_file_types',
                        validate: ['isRequired']
                    },
                },
                {
                    legend: 'File Details',
                    restrict: ['show'],
                    filename: {
                        label: 'Filename',
                        render: 'int'
                    },
                    type: {
                        label: 'Metadata Type',
                        reference: 'metadata_file_types'
                    },
                    mimetype: {
                        label: 'Format',
                        render: 'text'
                    },
                    file_size: {
                        render: 'filesize',
                        label: 'File size',
                    },
                    created_at: {
                        label: 'Created',
                        render: 'datetime',
                    },
                    updated_at: {
                        label: 'Last Updated',
                        render: 'datetime',
                    },
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
                    legend: "Camera",
                    users: ['administrator', 'super_administrator'],
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
                    legend: "Lens",
                    users: ['administrator', 'super_administrator'],
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
        image_types: {
            attributes: {
                label: 'Image Types',
                singular: 'Image Type'
            },
            fieldsets: [
                {
                    legend: 'Image Type Settings',
                    users: ['administrator', 'super_administrator'],
                    name: {
                        label: 'Name',
                        validate: ['isRequired']
                    },
                    label: {
                        label: 'Label'
                    },
                }]
        },
        metadata_file_types: {
            attributes: {
                label: 'Metadata File Types',
                singular: 'Metadata File Type'
            },
            fieldsets: [
                {
                    legend: 'Metadata File Type Settings',
                    users: ['administrator', 'super_administrator'],
                    name: {
                        label: 'Name',
                        validate: ['isRequired']
                    },
                    label: {
                        label: 'Label'
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
                    users: ['administrator', 'super_administrator'],
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
                label: 'Participants',
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
        },
        files: {
            attributes: {
                label: "Files",
                singular: "File"
            }
        }
    }
}
