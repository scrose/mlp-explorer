/*!
 * MLP.Client.Components.Common.Icon
 * File: icon.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';

/**
 * Select icon class. Uses FontAwesome icon library.
 * Reference: https://fontawesome.com/
 *
 * @public
 */

const getIconClass = (iconType) => {
    const iconComponents = {
        home: 'fas fa-lg fa-home',
        user: 'fas fa-lg fa-user-circle',
        info: 'fas fa-lg fa-info-circle',
        add: 'fas fa-lg fa-plus',
        edit: 'fas fa-lg fa-edit',
        delete: 'fas fa-lg fa-trash-alt',
        success: 'fas fa-lg fa-check-circle',
        cancel: 'fas fa-lg fa-times-circle',
        logo: 'fas fa-mountain',
        map: 'fas fa-lg fa-map-marked-alt',
        tree: 'fas fa-lg fa-list',
        hopen: 'fas fa-lg fa-chevron-circle-down',
        hclose: 'fas fa-lg fa-chevron-circle-right',
        hopenleft: 'fas fa-lg fa-angle-double-left',
        hcloseleft: 'fas fa-lg fa-angle-double-right',
        vopen: 'fas fa-lg fa-chevron-circle-up',
        vclose: 'fas fa-lg fa-chevron-circle-down',
        projects: 'fas fa-project-diagram',
        surveyors: 'fas fa-hiking',
        surveys: 'fas fa-binoculars',
        survey_seasons: 'fas fa-calendar',
        stations: 'fas fa-map-marker-alt',
        historic_visits: 'fas fa-campground',
        modern_visits: 'fas fa-campground',
        historic_captures: 'fas fa-camera-retro',
        modern_captures: 'fas fa-camera-retro',
        locations: 'fas fa-location-arrow',
        default: 'fas fa-lg fa-star'
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

const Icon = ({type}) => {
    return (
        <i className={getIconClass(type)} />
    );
}

export default Icon;
