/*!
 * MLP.Client.Components.Common.Icon
 * File: icon.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
    faFolderOpen,
    faAngleDoubleLeft,
    faAngleDoubleRight,
    faArchive,
    faBars,
    faBinoculars,
    faCalendar,
    faCalendarDay,
    faCameraRetro,
    faCaretRight,
    faCheckCircle,
    faChevronCircleDown,
    faChevronCircleLeft,
    faChevronCircleRight,
    faCog,
    faColumns,
    faCompass,
    faCompress,
    faCrosshairs,
    faEdit,
    faEllipsisV,
    faEraser,
    faExchangeAlt,
    faExclamationCircle,
    faExpand,
    faFile,
    faFileDownload,
    faFileExport,
    faFileImport,
    faUpload,
    faFilter,
    faHiking,
    faHome,
    faImage,
    faImages,
    faInfoCircle,
    faListAlt,
    faMap,
    faMapMarkedAlt,
    faMapMarkerAlt,
    faMinus,
    faMinusCircle,
    faMountain,
    faMousePointer,
    faObjectGroup,
    faPlus,
    faPlusCircle,
    faPlusSquare,
    faProjectDiagram,
    faQuestionCircle,
    faSearch,
    faSignInAlt,
    faSignOutAlt,
    faStar,
    faTimes,
    faTimesCircle,
    faToolbox,
    faTools,
    faTrashAlt,
    faUndo,
    faUser,
    faUsers,
    faArrowsAltH,
    faSave,
    faSlidersH,
    faRulerCombined,
    faFileImage,
    faGripLinesVertical,
    faCrop,
    faFileCsv,
    faFilePdf,
    faFileAlt,
    faSync,
    faArrowsAlt,
    faSearchPlus,
    faSearchMinus
} from '@fortawesome/free-solid-svg-icons';

/**
 * Custom icons: Font Awesome integration.
 * - Use a prefix like 'fac' that doesn't conflict with a prefix in the
 *   standard Font Awesome styles (So avoid fab, fal, fas, far, fa).
 *
 *
 * @public
 */


export const faMLPLogo = {
    prefix: 'fas',
    iconName: 'mlp_logo',
    icon: [22, 32, [], null,
        "M21.999 28.88l-7.853-17.185 0.015-0.64h-1.485l0.015 0.643-1.897 4.162c-0.605-1.117-0.669-1.384-0.669-1.384-0.47-0.198-0.745-0.589-0.88-0.839 0 0 0 0 0 0s0 0 0 0c0.104-0.076 0.255-0.245 0.413-0.443 0.994-0.784 1.972-1.413 1.972-1.413s-0.057-0.207-0.163-0.5c0.008-0.013 0.017-0.025 0.026-0.038 0.084 0.134 0.137 0.218 0.137 0.218l0.235-0.23c0 0 0.723-0.243 1.39-0.559 0.445-0.004 0.93-0.012 1.431-0.024 0.776-0.019 1.275-0.933 1.452-2.016 0.355 0.019 1.227 0.066 1.393 0.075 0.21 0.012 0.186-0.152 0.186-0.152v-1.559c0 0 0.018-0.127-0.203-0.126-0.239 0.001-1.019 0.050-1.363 0.072-0.156-1.024-0.632-1.86-1.466-1.86-0.946 0-1.768 0-2.392 0-1.379 0-1.262 0.652-1.262 0.652v2.438c-0.152 0.176-0.262 0.47-0.344 0.731-0.001 0.001-0.003 0.002-0.004 0.002-0.364-0.723-0.839-1.607-1.038-1.718-0.343-0.19-0.979-0.439-0.979-0.439-0.201 0.132-0.132-0.287 0.127-0.457 0.032-0.021 0.39-0.228 0.39-0.228l-0.048 0.39 0.228-0.162v0.247l0.209-0.247v0.337l0.152-0.223 0.038 0.223 0.117-0.223 0.093 0.057 0.076-0.171h0.133v-0.162l0.304-0.599c0 0 0.685 0.247 0.476-0.228s0.040-1.047 0.040-1.047 0.379-0.19 0.55-0.761 0.277-0.4 0.277-0.4v-0.552h-0.162c0 0-1.446-5.1-5.766-0.856-0.136 0.134-0.011-0.167-0.13-0.049l-0.136 0.506 0.073 0.127c0 0 0.135 0.127 0.096 0.255l-0.055-0.090-0.279 0.609-0.254 0.33 0.266-0.101 0.242-0.329-0.255 0.431-0.101 0.203 0.252-0.060-0.151 0.288c-0 0-0 0-0 0-0.477 0.604-1.194 1.041-1.88 1.345-1.503 0.666-1.114 1.275-1.647 1.732 0.019 0.038-0.4 3.114-1.18 3.936s0.533 0.86-0.285 1.545c-0.612 0.512-0.458 0.982-0.429 1.33l-0.047 0.021c0 0-0.002 0.11 0.001 0.284-0 0.001-0.001 0.001-0.001 0.002l0.001-0c0.008 0.704 0.075 2.441 0.532 2.075 0.571-0.457 0.914 0.228 0.419 0.495-0.203 0.109 0.19 0.837 0.723 1.658 0.767 1.181 1.827 2.553 1.827 2.553s-0.192 0.471-0.393 1.051c-0.013-0.021-0.026-0.043-0.036-0.064-0.36-0.758-1.589 5.421-2.172 7.212-0.082 1.239-0.163 1.213-0.163 1.213s2.188 1.423 4.047 1.805c0 0 0.671 0.043 1.12-0.266 0.279-0.192 0.042-0.573 0.009-0.814s-1.042-1.561-2.184-1.889c-0.524-0.151 0.337-0.294 0.192-0.633s0.498-0.983 0.495-1.097c-0.003-0.114 2.021-3.751 2.021-3.751s-0.068-0.020-0.184-0.056c0.308-0.588 0.521-0.985 0.521-0.985s1.142-0.837 0.723-2.664-0.152-1.675-0.152-1.675-0.016-0.053-0.031-0.131c0.618 0.884 1.231 1.68 1.231 1.68s-0.079 0.194-0.188 0.484c-0.017-0.025-0.033-0.051-0.047-0.076-0.223-0.426-0.648 1.495-1.062 3.508l-2.395 5.253 0.367 0.254 1.502-2.968c-0.093 0.424-0.179 0.79-0.255 1.056-0.094 1.027-0.125 1.11-0.131 1.113 0.032 0.017 2.244 1.197 4.033 1.598 0 0 0.714 0.038 1.074-0.22 0.268-0.192 0.019-0.56-0.022-0.793s-1.073-1.48-2.198-1.757c-0.515-0.127 0.317-0.299 0.163-0.623s0.448-0.976 0.441-1.087c-0.008-0.111 1.825-3.728 1.825-3.728s-0.058-0.014-0.157-0.041c0.109-0.205 0.173-0.325 0.173-0.325s1.195-0.827 0.69-2.544c-0.325-0.729-0.707-1.384-0.707-1.384s-0.155-0.208-0.291-0.431l1.388-2.742 0.412 17.109h0.528l0.394-17.11 7.546 14.872 0.366-0.254zM5.972 2.802c0.018-0.019 0.036-0.039 0.055-0.062l-0.043 0.082-0.012-0.020zM9.112 13.641c0 0 0 0 0 0s-0-0-0-0 0 0 0 0zM9.198 13.666c-0.001 0.001-0.003 0.001-0.004 0.002 0.001-0.001 0.003-0.001 0.004-0.002zM9.178 13.675c-0.001 0-0.003 0.001-0.004 0.001 0.001-0.001 0.003-0.001 0.004-0.001zM9.159 13.678c-0.001 0-0.002 0-0.003 0 0.001 0 0.002-0 0.003-0zM9.143 13.677c-0-0-0.001-0-0.001-0s0.001 0 0.001 0zM9.217 13.655c0.001-0.001 0.002-0.001 0.003-0.002-0.001 0.001-0.002 0.001-0.003 0.002zM9.207 13.565c0.010 0.021 0.021 0.043 0.034 0.066-0.013-0.024-0.024-0.045-0.034-0.066z"
    ]
}

export const faMLPWordmark = {
    prefix: 'fas',
    iconName: 'mlp_wordmark',
    icon: [103, 35, [], null,
        "M 5.923 21.803 L 11.503 21.803 C 12.07 21.803 12.46 21.746 12.673 21.633 L 12.733 21.653 L 12.593 25.083 L 2.353 25.083 L 2.353 6.803 C 2.6 6.823 2.873 6.836 3.173 6.843 L 4.133 6.873 C 4.773 6.893 5.466 6.903 6.213 6.903 C 8.3 6.903 10.363 6.866 12.403 6.793 C 12.303 7.593 12.253 8.663 12.253 10.003 C 12.253 10.15 12.263 10.26 12.283 10.333 L 12.253 10.373 C 11.78 10.233 11.106 10.163 10.233 10.163 L 5.923 10.163 L 5.923 13.653 L 9.163 13.653 C 10.163 13.653 10.763 13.626 10.963 13.573 L 11.013 16.953 C 10.573 16.906 10.006 16.883 9.313 16.883 L 5.923 16.883 L 5.923 21.803 ZM 14.168 25.083 L 19.138 17.793 L 14.298 10.793 L 18.578 10.793 L 21.108 15.153 L 23.848 10.793 L 27.818 10.793 C 27.811 10.793 27.711 10.926 27.518 11.193 L 23.068 17.553 L 28.128 25.083 L 23.888 25.083 L 21.148 20.453 L 18.448 25.083 L 14.168 25.083 ZM 33.681 24.793 L 33.681 28.813 C 33.681 29.6 33.701 30.11 33.741 30.343 L 30.331 30.343 L 30.331 10.793 L 33.681 10.793 L 33.681 11.683 C 34.788 10.91 35.848 10.523 36.861 10.523 C 37.868 10.523 38.765 10.663 39.551 10.943 C 40.338 11.23 41.025 11.67 41.611 12.263 C 42.918 13.543 43.571 15.373 43.571 17.753 C 43.571 19.333 43.201 20.743 42.461 21.983 C 41.835 23.03 40.965 23.866 39.851 24.493 C 38.865 25.053 37.798 25.333 36.651 25.333 C 35.505 25.333 34.515 25.153 33.681 24.793 Z M 33.681 14.763 L 33.681 21.353 C 34.375 21.933 35.275 22.223 36.381 22.223 C 38.181 22.223 39.348 21.353 39.881 19.613 C 40.061 19.02 40.151 18.383 40.151 17.703 C 40.151 17.03 40.088 16.49 39.961 16.083 C 39.835 15.676 39.668 15.323 39.461 15.023 C 39.255 14.73 39.025 14.486 38.771 14.293 C 38.518 14.093 38.258 13.933 37.991 13.813 C 37.525 13.606 37.048 13.503 36.561 13.503 C 36.068 13.503 35.555 13.616 35.021 13.843 C 34.495 14.07 34.048 14.376 33.681 14.763 ZM 49.609 4.713 L 49.609 23.553 C 49.609 24.333 49.629 24.843 49.669 25.083 L 46.189 25.083 L 46.189 4.713 L 49.609 4.713 ZM 52.412 18.013 C 52.412 17.013 52.582 16.053 52.922 15.133 C 53.268 14.22 53.758 13.42 54.392 12.733 C 55.785 11.26 57.595 10.523 59.822 10.523 C 62.035 10.523 63.795 11.22 65.102 12.613 C 66.348 13.946 66.972 15.673 66.972 17.793 C 66.972 19.92 66.328 21.68 65.042 23.073 C 63.688 24.553 61.888 25.293 59.642 25.293 C 57.328 25.293 55.515 24.566 54.202 23.113 C 53.008 21.793 52.412 20.093 52.412 18.013 Z M 55.732 17.933 C 55.732 18.506 55.828 19.063 56.022 19.603 C 56.215 20.136 56.488 20.596 56.842 20.983 C 57.602 21.81 58.595 22.223 59.822 22.223 C 60.962 22.223 61.858 21.82 62.512 21.013 C 63.152 20.226 63.472 19.203 63.472 17.943 C 63.472 16.67 63.145 15.64 62.492 14.853 C 61.785 14.02 60.822 13.603 59.602 13.603 C 58.362 13.603 57.392 14.05 56.692 14.943 C 56.052 15.763 55.732 16.76 55.732 17.933 ZM 73.044 15.133 L 73.044 23.553 C 73.044 24.333 73.061 24.843 73.094 25.083 L 69.694 25.083 L 69.694 10.793 L 73.044 10.793 L 73.044 11.853 C 73.817 10.966 74.631 10.523 75.484 10.523 C 76.337 10.523 77.007 10.626 77.494 10.833 L 77.254 14.513 L 77.194 14.553 C 76.874 13.986 76.214 13.703 75.214 13.703 C 74.834 13.703 74.444 13.833 74.044 14.093 C 73.651 14.353 73.317 14.7 73.044 15.133 ZM 78.484 18.053 C 78.484 16.986 78.664 16 79.024 15.093 C 79.391 14.18 79.907 13.38 80.574 12.693 C 81.994 11.246 83.854 10.523 86.154 10.523 C 88.094 10.523 89.651 11.166 90.824 12.453 C 91.984 13.693 92.564 15.25 92.564 17.123 C 92.564 17.843 92.507 18.336 92.394 18.603 C 91.487 18.856 89.634 18.983 86.834 18.983 L 82.024 18.983 C 82.257 19.963 82.807 20.723 83.674 21.263 C 84.541 21.803 85.667 22.073 87.054 22.073 C 88.501 22.073 89.744 21.813 90.784 21.293 C 91.057 21.16 91.264 21.033 91.404 20.913 C 91.384 21.293 91.361 21.686 91.334 22.093 L 91.184 24.223 C 90.491 24.696 89.367 25.023 87.814 25.203 C 87.361 25.263 86.924 25.293 86.504 25.293 C 84.191 25.293 82.277 24.616 80.764 23.263 C 79.244 21.903 78.484 20.166 78.484 18.053 Z M 88.924 16.333 C 88.551 14.373 87.484 13.393 85.724 13.393 C 84.337 13.393 83.284 13.99 82.564 15.183 C 82.351 15.55 82.184 15.95 82.064 16.383 C 82.284 16.396 82.551 16.406 82.864 16.413 L 83.884 16.413 C 84.217 16.426 84.541 16.433 84.854 16.433 L 85.634 16.433 C 86.094 16.433 86.547 16.426 86.994 16.413 L 88.114 16.373 C 88.421 16.366 88.691 16.353 88.924 16.333 ZM 98.757 15.133 L 98.757 23.553 C 98.757 24.333 98.773 24.843 98.807 25.083 L 95.407 25.083 L 95.407 10.793 L 98.757 10.793 L 98.757 11.853 C 99.53 10.966 100.343 10.523 101.197 10.523 C 102.05 10.523 102.72 10.626 103.207 10.833 L 102.967 14.513 L 102.907 14.553 C 102.587 13.986 101.927 13.703 100.927 13.703 C 100.547 13.703 100.157 13.833 99.757 14.093 C 99.363 14.353 99.03 14.7 98.757 15.133 Z"
    ]
}

/**
 * Add icons to FA library.
 *
 * @public
 */

library.add(
    faSearchMinus,
    faSearchPlus,
    faMLPLogo,
    faMLPWordmark,
    faSync,
    faFileAlt,
    faFileCsv,
    faFilePdf,
    faCrop,
    faFileImage,
    faRulerCombined,
    faSlidersH,
    faSave,
    faArrowsAltH,
    faFile,
    faQuestionCircle,
    faExclamationCircle,
    faToolbox,
    faObjectGroup,
    faTools,
    faExchangeAlt,
    faEraser,
    faAngleDoubleLeft,
    faAngleDoubleRight,
    faMousePointer,
    faCrosshairs,
    faCompress,
    faCog,
    faBars,
    faHome,
    faUser,
    faSignInAlt,
    faSignOutAlt,
    faInfoCircle,
    faPlus,
    faMinus,
    faPlusSquare,
    faTimes,
    faEdit,
    faTrashAlt,
    faFileImport,
    faFileExport,
    faFilter,
    faSearch,
    faCog,
    faUndo,
    faImage,
    faImages,
    faCheckCircle,
    faTimesCircle,
    faMountain,
    faMapMarkedAlt,
    faListAlt,
    faCaretRight,
    faEllipsisV,
    faPlusCircle,
    faMinusCircle,
    faChevronCircleDown,
    faChevronCircleRight,
    faChevronCircleLeft,
    faAngleDoubleLeft,
    faAngleDoubleRight,
    faUpload,
    faFileDownload,
    faProjectDiagram,
    faHiking,
    faBinoculars,
    faCalendar,
    faMapMarkerAlt,
    faCalendarDay,
    faCameraRetro,
    faCompass,
    faArchive,
    faMap,
    faUsers,
    faColumns,
    faExpand,
    faStar,
    faFolderOpen,
    faGripLinesVertical,
    faArrowsAlt);


/**
 * Select icon class. Uses FontAwesome icon library.
 * Reference: https://fontawesome.com/
 *
 * @public
 */

const getIconClass = (iconType) => {
    const iconComponents = {
        spinner: 'cog',
        menu: 'bars',
        home: 'home',
        dashboard: 'columns',
        user: 'user',
        login: 'sign-in-alt',
        logout: 'sign-out-alt',
        info: 'info-circle',
        show: 'info-circle',
        new: 'plus',
        add: 'plus',
        minus: 'minus',
        select: 'mouse-pointer',
        crosshairs: 'crosshairs',
        crop: 'crop',
        adjust: 'sliders-h',
        resize: 'ruler-combined',
        edit: 'edit',
        move: 'arrows-alt',
        load: 'folder-open',
        delete: 'trash-alt',
        import: 'file-import',
        export: 'file-export',
        align: 'images',
        overlay: 'columns',
        filter: 'filter',
        search: 'search',
        undo: 'undo',
        sync: 'sync',
        erase: 'eraser',
        swap: 'exchange-alt',
        save: 'save',
        zoomIn: 'search-plus',
        zoomOut: 'search-minus',
        slide: 'grip-lines-vertical',
        help: 'question-circle',
        success: 'check-circle',
        warning: 'exclamation-circle',
        error: 'times-circle',
        cancel: 'times-circle',
        logo: 'mountain',
        file: 'file',
        map: 'map-marked-alt',
        tree: 'list-alt',
        close: 'times-circle',
        right: 'caret-right',
        tools: 'ellipsis-v',
        options: 'ellipsis-v',
        settings: 'cog',
        expand: 'plus-circle',
        enlarge: 'expand',
        compress: 'compress',
        collapse: 'minus-circle',
        hopen: 'chevron-circle-down',
        hclose: 'chevron-circle-right',
        hopenleft: 'angle-double-left',
        hcloseleft: 'angle-double-right',
        prev: 'chevron-circle-left',
        next: 'chevron-circle-right',
        vopen: 'chevron-circle-down',
        vclose: 'chevron-circle-right',
        upload: 'upload',
        download: 'file-download',
        image: 'image',
        images: 'images',
        files: 'file',
        metadata_files: 'file',
        projects: 'project-diagram',
        surveyors: 'mlp_logo',
        surveys: 'binoculars',
        survey_seasons: 'calendar',
        stations: 'map-marker-alt',
        historic_visits: 'calendar-day',
        modern_visits: 'calendar-day',
        captures: 'camera-retro',
        historic_captures: 'camera-retro',
        modern_captures: 'camera-retro',
        unsorted_captures: 'images',
        historic_images: 'image',
        modern_images: 'image',
        supplemental_images: 'image',
        locations: 'compass',
        glass_plate_listings: 'archive',
        maps: 'map',
        participant_groups: 'users',
        comparisons: 'images',
        iat: 'toolbox',
        jpg: 'file-image',
        jpeg: 'file-image',
        png: 'file-image',
        tif: 'file-image',
        tiff: 'file-image',
        raw: 'file-image',
        pdf: 'file-pdf',
        rtf: 'file-alt',
        default: 'star',
        mlp: 'mlp_logo',
        wordmark: 'mlp_wordmark'
    };
    return iconComponents.hasOwnProperty(iconType)
        ? iconComponents[iconType]
        : null
}

/**
 * Render icon component.
 *
 * @public
 */

const Icon = ({type, size='lg', spin=false}) => {
    const iconType = getIconClass(type);
    return  iconType && <FontAwesomeIcon icon={iconType} size={size} spin={spin} />
}
export default Icon;



