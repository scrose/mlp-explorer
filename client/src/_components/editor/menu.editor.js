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

/**
 * Editor menu component.
 *
 * @public
 */

const MenuEditor = ({view, node=null}) => {

    const api = useRouter();

    // lookup model dependent nodes
    const dependents = getDependents(node.type) || [];

    // visibility settings for menu & menu items
    const menuExclude = ['dashboard', 'login', 'register', 'add']
    const toolExclude = ['dashboard', 'list', 'register', 'add'];

    return (
        view && !menuExclude.includes(view) ?
        <div className={'editor-tools h-menu'}>
            <ul>
                {node && !toolExclude.includes(view) ?
                    <li>
                        <button
                            title={`Edit this ${node.type} item.`}
                            onClick={() => api.router(getNodeURI(node.type, 'show', node.id))}
                        >
                            <Icon type={'info'} /> <span>View</span>
                        </button>
                    </li>: ''
                }
                {node && !toolExclude.includes(view) ?
                <li>
                    { dependents.map(depNode => {
                        const label = getModelLabel(depNode);
                        return <button
                            key={depNode}
                            title={`Add new ${label}.`}
                            onClick={() => api.router(getNodeURI(depNode, 'new', node.id))}
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
                            description={
                                <div>
                                    <p>Please confirm the deletion of {getModelLabel(node.type)}:</p>
                                    <p><b>{getNodeLabel(node)}</b></p>
                                    <p>Note that any dependent nodes for this record will also be deleted.</p>
                                </div>
                            }
                            label={'Delete'}
                            callback={() => {api.remove(node)}}
                        />
                    </li> : ''
                }
            </ul>
        </div>
            : ''
    )
}

export default MenuEditor;
