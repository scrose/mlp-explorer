/*!
 * MLP.Client.Components.Menus.Navigator
 * File: navigator.menu.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Icon from '../common/icon';
import { getNodeURI } from '../../_utils/paths.utils.client';
import { useRouter } from '../../_providers/router.provider.client';
import { getModelLabel } from '../../_services/schema.services.client';

/**
 * Navigator menu component.
 *
 * @public
 */

const NavigatorMenu = ({view, set, toggle, setToggle}) => {

    // get API router
    const api = useRouter();

    return (
        <div className={'navigator-tools v-menu'}>
            <div>
                <ul>
                    <li>
                        <button
                            className={`toggle`}
                            title={`Expand navigator menu.`}
                            onClick={() => {
                                setToggle(!toggle);
                            }}
                        >
                            {toggle ? <Icon type={'hopenleft'} /> : <Icon type={'hcloseleft'} />}
                        </button>
                    </li>
                </ul>
            </div>
            <div className={`collapsible${toggle ? ' active' : ''}`}>
            <ul>
                <li>
                    <button
                        className={view === 'tree' ? 'active' : ''}
                        title={`View navigation tree.`}
                        onClick={() => set('tree')}
                    >
                        <Icon type={'tree'} /> <span>Tree View</span>
                    </button>
                </li>
                <li>
                    <button
                        className={view === 'map' ? 'active' : ''}
                        title={`View navigation map.`}
                        onClick={() => set('map')}
                    >
                        <Icon type={'map'} /> <span>Map View</span>
                    </button>
                </li>
                <li>
                    <button
                        title={`Add new ${getModelLabel('surveyors')}.`}
                        onClick={() => api.router(getNodeURI('surveyors', 'new'))}
                    >
                        <Icon type={'surveyors'}/> <span>Add {getModelLabel('surveyors')}</span>
                    </button>
                </li>
                <li>
                    <button
                        title={`Add new ${getModelLabel('projects')}.`}
                        onClick={() => api.router(getNodeURI('projects', 'new'))}
                    >
                        <Icon type={'projects'}/> <span>Add {getModelLabel('projects')}</span>
                    </button>
                </li>
            </ul>
            </div>
        </div>
    )
}

export default React.memo(NavigatorMenu);
