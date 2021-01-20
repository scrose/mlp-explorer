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
    const rootURL = getRoot();
    return (
        view ?
        <div className={'menu'}>
            <ul>
                <li>
                    <h4>
                        {`${capitalize(model)} Menu`}
                    </h4>
                </li>
                <li>
                    <button
                        title={`Add new ${model} item.`}
                        onClick={() => redirect(`${rootURL}/${model}/new`)}
                    >
                        <span>New</span>
                    </button>
                </li>
                {view !== 'list' ?
                    <li>
                        <button
                            title={`Edit this ${model} item.`}
                            onClick={() => redirect(`${rootURL}/${model}/edit`)}
                        >
                            <span>Edit</span>
                        </button>
                    </li> : ''
                }
                {view !== 'list' ?
                    <li>
                        <button
                            title={`Delete this ${model} item.`}
                            onClick={() => redirect(`${rootURL}/${model}/remove`)}
                        >
                            <span>Delete</span>
                        </button>
                    </li> : ''
                }
            </ul>
        </div>
            : ''
    )
}

export default MenuEditor;
