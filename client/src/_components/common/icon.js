/*!
 * MLP.Client.Components.Common.Icon
 * File: icon.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core'
import {
    faHome,
    faUser,
    faSignInAlt,
    faSignOutAlt,
    faInfoCircle,
    faPlus,
    faMinus,
    faTimes,
    faEdit,
    faTrashAlt,
    faFileImport,
    faFileExport,
    faFilter,
    faSearch,
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
    faFileUpload,
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
    faStar
} from '@fortawesome/free-solid-svg-icons';
library.add(faHome,
    faUser,
    faSignInAlt,
    faSignOutAlt,
    faInfoCircle,
    faPlus,
    faMinus,
    faTimes,
    faEdit,
    faTrashAlt,
    faFileImport,
    faFileExport,
    faFilter,
    faSearch,
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
    faFileUpload,
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
    faStar)

/**
 * Select icon class. Uses FontAwesome icon library.
 * Reference: https://fontawesome.com/
 *
 * @public
 */

const getIconClass = (iconType) => {
    const iconComponents = {
        home: 'home',
        user: 'user',
        login: 'sign-in-alt',
        logout: 'sign-out-alt',
        info: 'info-circle',
        show: 'info-circle',
        add: 'plus',
        minus: 'minus',
        edit: 'edit',
        delete: 'trash-alt',
        import: 'file-import',
        export: 'file-export',
        master: 'images',
        filter: 'filter',
        search: 'search',
        success: 'check-circle',
        error: 'times',
        cancel: 'times-circle',
        logo: 'mountain',
        map: 'map-marked-alt',
        tree: 'list-alt',
        close: 'times-circle',
        right: 'caret-right',
        tools: 'ellipsis-v',
        expand: 'plus-circle',
        collapse: 'minus-circle',
        hopen: 'chevron-circle-down',
        hclose: 'chevron-circle-right',
        hopenleft: 'angle-double-left',
        hcloseleft: 'angle-double-right',
        prev: 'chevron-circle-left',
        next: 'chevron-circle-right',
        vopen: 'chevron-circle-down',
        vclose: 'chevron-circle-right',
        upload: 'file-upload',
        metadata_files: 'file-download',
        projects: 'project-diagram',
        surveyors: 'hiking',
        surveys: 'binoculars',
        survey_seasons: 'calendar',
        stations: 'map-marker-alt',
        historic_visits: 'calendar-day',
        modern_visits: 'calendar-day',
        historic_captures: 'camera-retro',
        modern_captures: 'camera-retro',
        historic_images: 'image',
        modern_images: 'image',
        locations: 'compass',
        glass_plate_listings: 'archive',
        maps: 'map',
        participant_groups: 'users',
        comparisons: 'images',
        default: 'star'
    };
    return iconComponents.hasOwnProperty(iconType)
        ? iconComponents[iconType]
        : iconComponents.default
}

/**
 * Render icon component.
 *
 * @public
 */

const Icon = ({type, size='lg'}) => {
    return  <FontAwesomeIcon icon={getIconClass(type)} size={size} />
}

export default Icon;
