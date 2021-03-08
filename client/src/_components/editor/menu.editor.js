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
import { genSchema, getDependents, getModelLabel, getNodeLabel } from '../../_services/schema.services.client';
import Alert from '../common/alert';
import { useData } from '../../_providers/data.provider.client';
import Button from '../common/button';
import Importer from '../views/importer.view';
import Dialog from '../common/dialog';

/**
 * Editor menu component.
 *
 * @public
 */

const MenuEditor = () => {

    const router = useRouter();
    const api = useData();

    // lookup model dependent nodes
    const dependents = getDependents(api.root.type) || [];

    // check for capture bulk import
    const capture = dependents.length > 0
        ? dependents.find(dependent =>
            (dependent === 'historic_captures' || dependent === 'modern_captures')
        )
        : null;

    // visibility settings for menu & menu items
    const menuExclude = ['dashboard', 'login', 'register', 'notFound'];
    const showExclude = ['dashboard', 'list', 'register'];
    const editExclude = ['dashboard', 'list', 'register', 'add'];
    const deleteExclude = ['dashboard', 'list', 'register', 'add'];

    function onClick(e, model, view, id) {
        e.preventDefault();
        router.update(getNodeURI(model, view, id));
    }

    return (
        api.view && !menuExclude.includes(api.view) ?
        <div className={'editor-tools h-menu'}>
            <ul>
                {api.root && !showExclude.includes(api.view) ?
                    <li key={'show'}>
                        <Button
                            label={'View'}
                            title={`View this ${getModelLabel(api.root.type)} item.`}
                            icon={'info'}
                            onClick={e =>
                                onClick(e, api.root.type, 'show', api.root.id)
                            } />
                    </li> : ''
                }
                {api.root && !editExclude.includes(api.view) ?
                    <li key={'edit'}>
                        <button
                            title={`Edit this ${getModelLabel(api.root.type)} item.`}
                            onClick={e =>
                                onClick(e, api.root.type, 'edit', api.root.id)
                            }
                        >
                            <Icon type={'edit'} /> <span>Edit</span>
                        </button>
                    </li> : ''
                }
                {api.root && !deleteExclude.includes(api.view) ?
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
                {
                    capture ?
                        <li key={'upload'}>
                            <Dialog
                                icon={'import'}
                                label={`Import`}
                                title={`Bulk ${getModelLabel(capture)} import.`}
                                children={
                                    <Importer
                                        view={'import'}
                                        model={capture}
                                        options={api.options}
                                        schema={genSchema('import', capture)}
                                        route={getNodeURI(capture, 'import', api.root.id)}
                                        callback={() => {
                                            redirect(
                                                getNodeURI(api.root.type, 'show', api.root.id
                                                )
                                            );
                                        }}
                                    />
                                }
                            />
                        </li>
                        : ''
                    }
            </ul>
        </div>
            : ''
    )
}

export default MenuEditor;
