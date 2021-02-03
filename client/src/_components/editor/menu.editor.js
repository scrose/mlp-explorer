/*!
 * MLP.Client.Components.Editor.Menu
 * File: editor.menu.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { getNodeURI, reroute } from '../../_utils/paths.utils.client';
import Icon from '../common/icon';
import { useRouter } from '../../_providers/router.provider.client';
import { getDependents, getModelLabel, getNodeLabel } from '../../_services/schema.services.client';

/**
 * Editor menu component.
 *
 * @public
 */

const MenuEditor = ({model, view, id=null}) => {

    const api = useRouter();

    // lookup model dependent nodes
    const dependents = getDependents(model);

    // visibility settings for menu/menu items
    const menuExclude = ['dashboard', 'login', 'register']
    const toolExclude = ['dashboard', 'list', 'register', 'new'];
    return (
        view && !menuExclude.includes(view) ?
        <div className={'editor-tools h-menu'}>
            <ul>
                {id && !toolExclude.includes(view) ?
                <li>
                    { dependents.map(dep => {
                        const label = getModelLabel(dep);
                        return <button
                            title={`Add new ${label}.`}
                            onClick={() => api.router(getNodeURI(dep, 'new', id))}
                        >
                            <Icon type={'add'}/> <span>Add New {label}</span>
                        </button>
                    })
                    }
                </li>: ''
                }
                {id && !toolExclude.includes(view) ?
                    <li>
                        <button
                            title={`Edit this ${model} item.`}
                            onClick={() => api.router(getNodeURI(model, 'edit', id))}
                        >
                            <Icon type={'edit'} /> <span>Edit</span>
                        </button>
                    </li> : ''
                }
                {id && !toolExclude.includes(view) ?
                    <li>
                        <button
                            title={`Delete this ${model} item.`}
                            onClick={() => api.router(getNodeURI(model, 'remove', id))}
                        >
                            <Icon type={'delete'} /> <span>Delete</span>
                        </button>
                    </li> : ''
                }
            </ul>
        </div>
            : ''
    )
}

export default MenuEditor;
