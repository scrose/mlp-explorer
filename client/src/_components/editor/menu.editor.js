/*!
 * MLP.Client.Components.Editor.Menu
 * File: editor.menu.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { getNodeURI } from '../../_utils/paths.utils.client';
import Icon from '../common/icon';
import { useRouter } from '../../_providers/router.provider.client';
import { getDependents, getModelLabel, getNodeLabel } from '../../_services/schema.services.client';
import Alert from '../common/alert';
import { useData } from '../../_providers/data.provider.client';

/**
 * Editor menu component.
 *
 * @public
 */

const MenuEditor = () => {

    const router = useRouter();
    const api = useData()

    // lookup model dependent nodes
    const dependents = getDependents(api.root.type) || [];

    // visibility settings for menu & menu items
    const menuExclude = ['dashboard', 'login', 'register', 'add']
    const toolExclude = ['dashboard', 'list', 'register', 'add'];

    return (
        api.view && !menuExclude.includes(api.view) ?
        <div className={'editor-tools h-menu'}>
            <ul>
                {api.root && !toolExclude.includes(api.view) ?
                    <li>
                        <button
                            title={`Edit this ${api.root.type} item.`}
                            onClick={() => router.update(getNodeURI(api.root.type, 'show', api.root.id))}
                        >
                            <Icon type={'info'} /> <span>View</span>
                        </button>
                    </li>: ''
                }
                {api.root && !toolExclude.includes(api.view) ?
                <li>
                    { dependents.map(depNode => {
                        const label = getModelLabel(depNode);
                        return <button
                            key={depNode}
                            title={`Add new ${label}.`}
                            onClick={() => router.update(getNodeURI(depNode, 'new', api.root.id))}
                        >
                            <Icon type={'add'}/> <span>Add New {label}</span>
                        </button>
                    })
                    }
                </li>: ''
                }
                {api.root && !toolExclude.includes(api.view) ?
                    <li key={'edit'}>
                        <button
                            title={`Edit this ${api.root.type} item.`}
                            onClick={() => router.update(getNodeURI(api.root.type, 'edit', api.root.id))}
                        >
                            <Icon type={'edit'} /> <span>Edit</span>
                        </button>
                    </li> : ''
                }
                {api.root && !toolExclude.includes(api.view) ?
                    <li key={'remove'}>
                        <Alert
                            icon={'delete'}
                            title={`Delete ${api.root.type} record?`}
                            description={
                                <div>
                                    <p>Please confirm the deletion of {getModelLabel(api.root.type)}:</p>
                                    <p><b>{getNodeLabel(api.root)}</b></p>
                                    <p>Note that any dependent nodes for this record will also be deleted.</p>
                                </div>
                            }
                            label={'Delete'}
                            callback={() => {router.remove(api.root)}}
                        />
                    </li> : ''
                }
            </ul>
        </div>
            : ''
    )
}

export default MenuEditor;
