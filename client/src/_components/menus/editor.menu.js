/*!
 * MLP.Client.Components.Editor.Menu
 * File: editor.menu.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { getNodeURI, redirect } from '../../_utils/paths.utils.client';
import Icon from '../common/icon';

/**
 * Editor menu component.
 *
 * @public
 */

const EditorMenu = ({model, id=null, view}) => {
    const menuExclude = ['dashboard', 'login', 'register']
    const toolExclude = ['dashboard', 'list', 'register'];
    return (
        view && !menuExclude.includes(view) ?
        <div className={'editor-tools h-menu'}>
            <ul>
                <li>
                    <button
                        title={`Add new ${model} item.`}
                        onClick={() => redirect(getNodeURI(model, 'new'))}
                    >
                        <Icon type={'add'} /> <span>Add New</span>
                    </button>
                </li>
                {id && !toolExclude.includes(view) ?
                    <li>
                        <button
                            title={`Edit this ${model} item.`}
                            onClick={() => redirect(getNodeURI(model, 'edit', id))}
                        >
                            <Icon type={'edit'} /> <span>Edit</span>
                        </button>
                    </li> : ''
                }
                {id && !toolExclude.includes(view) ?
                    <li>
                        <button
                            title={`Delete this ${model} item.`}
                            onClick={() => redirect(getNodeURI(model, 'remove', id))}
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

export default EditorMenu;
