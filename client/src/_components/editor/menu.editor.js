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

/**
 * Editor menu component.
 *
 * @public
 */

const MenuEditor = ({model, id=null, view}) => {

    const api = useRouter();

    // visibility settings for menu/menu items
    const menuExclude = ['dashboard', 'login', 'register']
    const toolExclude = ['dashboard', 'list', 'register'];
    return (
        view && !menuExclude.includes(view) ?
        <div className={'editor-tools h-menu'}>
            <ul>
                <li>
                    <button
                        title={`Add new ${model} item.`}
                        onClick={() => api.router(getNodeURI(model, 'new'))}
                    >
                        <Icon type={'add'} /> <span>Add New</span>
                    </button>
                </li>
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
