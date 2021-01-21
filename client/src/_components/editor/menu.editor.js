/*!
 * MLP.Client.Components.Editor.Menu
 * File: menu.editor.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { getRoot, redirect } from '../../_utils/paths.utils.client';
import { capitalize } from '../../_utils/data.utils.client';
import Icon from '../common/icon';

/**
 * Editor menu component.
 *
 * @public
 */

const MenuEditor = ({model, view}) => {
    const menuExclude = ['login', 'register']
    const editExclude = ['list', 'register'];
    return (
        !menuExclude.includes(view) ?
        <div className={'editor-tools h-menu'}>
            <ul>
                <li>
                    <h4>
                        {`${capitalize(model)} Menu`}
                    </h4>
                </li>
                <li>
                    <button
                        title={`Add new ${model} item.`}
                        onClick={() => redirect(`/${model}/new`)}
                    >
                        <Icon type={'add'} /> <span>Add New</span>
                    </button>
                </li>
                {!editExclude.includes(view) ?
                    <li>
                        <button
                            title={`Edit this ${model} item.`}
                            onClick={() => redirect(`/${model}/edit`)}
                        >
                            <Icon type={'edit'} /> <span>Edit</span>
                        </button>
                    </li> : ''
                }
                {!editExclude.includes(view) ?
                    <li>
                        <button
                            title={`Delete this ${model} item.`}
                            onClick={() => redirect(`/${model}/remove`)}
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
