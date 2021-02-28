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
import Button from '../common/button';

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

    // menu display toggle
    const [toggle, setToggle] = React.useState(false);

    // visibility settings for menu & menu items
    const menuExclude = ['dashboard', 'login', 'register', 'notFound'];
    const showExclude = ['dashboard', 'list', 'register'];
    const editExclude = ['dashboard', 'list', 'register', 'add'];
    const deleteExclude = ['dashboard', 'list', 'register', 'add'];
    const exportExclude = ['dashboard', 'add'];

    function onClick(e, model, view, id) {
        e.preventDefault();
        router.update(getNodeURI(model, view, id));
    }

    return (
        api.view && !menuExclude.includes(api.view) ?
        <div className={'editor-tools h-menu'} onMouseLeave={() => {
            setToggle(false);
        }}>
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
                {api.root && !exportExclude.includes(api.view) ?
                    <li key={'export'}>
                        <button
                            title={`Export this ${api.root.type} item.`}
                            onClick={e =>
                                onClick(e, api.root.type, 'export', api.root.id)
                            }
                        >
                            <Icon type={'export'} /> <span>Export</span>
                        </button>
                    </li> : ''
                }
                { dependents.length > 0 ?
                    <li key={'tools'}>
                        <div>
                            <button
                                className={`toggle`}
                                title={`Expand editor tools.`}
                                onClick={() => {
                                    setToggle(!toggle);
                                }}
                            >
                                <span>Tools</span>&#160;&#160;<Icon type={'tools'} />
                            </button>
                        </div>
                        <div className={`collapsible${toggle ? ' active' : ''}`}>
                            <div className={'v-menu'}>
                                {
                                    dependents.map(depNode => {
                                        const label = getModelLabel(depNode);
                                        return (
                                            <ul key={depNode}>
                                                <li key={'new'}>
                                                    <button
                                                        key={depNode}
                                                        title={`Add new ${label}.`}
                                                        name={depNode}
                                                        onClick={e =>
                                                            onClick(e, depNode, 'new', api.root.id)
                                                        }
                                                    >
                                                        <Icon type={'add'}/> <span>Add {label}</span>
                                                    </button>
                                                </li>
                                                {
                                                    depNode === 'historic_captures' ?
                                                        <li key={'upload'}>
                                                            <button
                                                                key={depNode}
                                                                title={`Batch Upload ${label} capture images.`}
                                                                name={'upload'}
                                                                onClick={e =>
                                                                    onClick(e, 'historic_captures', 'import', api.root.id)
                                                                }
                                                            >
                                                                <Icon type={'upload'} />&#160;&#160;Batch Upload Capture Images
                                                            </button>
                                                        </li>
                                                        : ''
                                                }
                                                {
                                                    depNode === 'modern_captures' ?
                                                        <li key={'upload'}>
                                                            <button
                                                                key={depNode}
                                                                title={`Batch Upload ${label} capture images.`}
                                                                name={'upload'}
                                                                onClick={e =>
                                                                    onClick(e, 'modern_captures', 'import', api.root.id)
                                                                }
                                                            >
                                                                <Icon type={'upload'} />&#160;&#160;Batch Upload Capture Images
                                                            </button>
                                                        </li>
                                                        : ''
                                                }
                                            </ul>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    </li>: ''
                }
            </ul>
        </div>
            : ''
    )
}

export default MenuEditor;
