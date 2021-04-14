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
    faAngleDoubleLeft,
    faAngleDoubleRight,
    faArchive,
    faBinoculars,
    faCalendar,
    faCalendarDay,
    faCameraRetro,
    faCaretRight,
    faCheckCircle,
    faChevronCircleDown,
    faChevronCircleLeft,
    faChevronCircleRight,
    faCompass,
    faColumns,
    faEdit,
    faUndo,
    faEllipsisV,
    faFileDownload,
    faFileExport,
    faFileImport,
    faFileUpload,
    faCog,
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
    faPlusSquare,
    faMountain,
    faPlus,
    faPlusCircle,
    faProjectDiagram,
    faSearch,
    faSignInAlt,
    faSignOutAlt,
    faStar,
    faTimes,
    faTimesCircle,
    faTrashAlt,
    faUser,
    faExpand,
    faUsers,
} from '@fortawesome/free-solid-svg-icons';

library.add(
    faCog,
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
    faColumns,
    faExpand,
    faStar)

/**
 * Select icon class. Uses FontAwesome icon library.
 * Reference: https://fontawesome.com/
 *
 * @public
 */

const getIconClass = (iconType) => {
    const iconComponents = {
        spinner: 'cog',
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
        edit: 'edit',
        delete: 'trash-alt',
        import: 'file-import',
        export: 'file-export',
        master: 'images',
        overlay: 'columns',
        filter: 'filter',
        search: 'search',
        undo: 'undo',
        success: 'check-circle',
        error: 'times-circle',
        cancel: 'times-circle',
        logo: 'mountain',
        map: 'map-marked-alt',
        tree: 'list-alt',
        close: 'times-circle',
        right: 'caret-right',
        tools: 'ellipsis-v',
        options: 'ellipsis-v',
        settings: 'cog',
        expand: 'plus-circle',
        enlarge: 'expand',
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

/**
 * Render loading spinner component.
 *
 * @public
 */

export const Loading = ({overlay=false}) => {

    return  <div className={`spinner ${overlay ? 'overlay' : ''}`}>
                <div className={`spinner-icon ${overlay ? 'overlay' : ''}`}>
                    <Icon type={'spinner'} size={'lg'} spin={true} />
                </div>
            </div>;
};
