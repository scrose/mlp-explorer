/*!
 * MLP.Client.Components.Editor.Menu
 * File: editor.menu.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { getNodeURI, redirect } from '../../_utils/paths.utils.client';
import Icon from '../common/icon';
import { useRouter } from '../../_providers/router.provider.client';
import { getDependents, getModelLabel, getNodeLabel } from '../../_services/schema.services.client';
import Alert from '../common/alert';
import { useMessenger } from '../../_providers/messenger.provider.client';

/**
 * Editor menu component.
 *
 * @public
 */

const MenuEditor = ({view, node=null}) => {

    const api = useRouter();
    const msg = useMessenger();

    // lookup model dependent nodes
    const dependents = getDependents(node.type) || [];

    // visibility settings for menu & menu items
    const menuExclude = ['dashboard', 'login', 'register']
    const toolExclude = ['dashboard', 'list', 'register', 'new'];

    return (
        view && !menuExclude.includes(view) ?
        <div className={'editor-tools h-menu'}>
            <ul>
                {node && !toolExclude.includes(view) ?
                <li>
                    { dependents.map(dep => {
                        const label = getModelLabel(dep);
                        return <button
                            key={dep}
                            title={`Add new ${label}.`}
                            onClick={() => api.router(getNodeURI(dep, 'new', node.id))}
                        >
                            <Icon type={'add'}/> <span>Add New {label}</span>
                        </button>
                    })
                    }
                </li>: ''
                }
                {node && !toolExclude.includes(view) ?
                    <li key={'edit'}>
                        <button
                            title={`Edit this ${node.type} item.`}
                            onClick={() => api.router(getNodeURI(node.type, 'edit', node.id))}
                        >
                            <Icon type={'edit'} /> <span>Edit</span>
                        </button>
                    </li> : ''
                }
                {node && !toolExclude.includes(view) ?
                    <li key={'remove'}>
                        <Alert
                            icon={'delete'}
                            title={`Delete ${node.type} record?`}
                            description={`Please confirm the deletion of ${node.type} item: ${getNodeLabel(node)}.`}
                            label={'Delete'}
                            callback={() => {
                                const route = getNodeURI(node.type, 'remove', node.id);
                                try {
                                    // API callback to delete item
                                    api.post(route)
                                        .then(res => {
                                            console.log('Deletion response:', res);
                                            // redirect('/?msg=deleted')
                                        })
                                        .catch(err => console.error(err))
                                }
                                catch (err) {
                                    console.error(err)
                                }
                            }}
                        />
                    </li> : ''
                }
            </ul>
        </div>
            : ''
    )
}

export default MenuEditor;
