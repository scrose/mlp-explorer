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
    faFileImage, faGripLinesVertical,
} from '@fortawesome/free-solid-svg-icons';

library.add(
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
    faGripLinesVertical)

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
        adjust: 'sliders-h',
        resize: 'ruler-combined',
        edit: 'edit',
        load: 'folder-open',
        delete: 'trash-alt',
        import: 'file-import',
        export: 'file-export',
        master: 'images',
        overlay: 'columns',
        filter: 'filter',
        search: 'search',
        undo: 'undo',
        erase: 'eraser',
        swap: 'exchange-alt',
        save: 'save',
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
        surveyors: 'hiking',
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
        iat: 'images',
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

