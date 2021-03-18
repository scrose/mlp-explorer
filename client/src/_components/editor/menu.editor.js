/*!
 * MLP.Client.Components.Editor.Menu
 * File: editor.menu.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { getNodeURI, redirect } from '../../_utils/paths.utils.client';
import { useRouter } from '../../_providers/router.provider.client';
import {
    genSchema,
    getDependentTypes,
    getFileLabel,
    getModelLabel,
    getNodeLabel,
} from '../../_services/schema.services.client';
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

    // destructure root node data
    const {node={}, file={}} = api.root || {};
    const {file_type=''} = file || {};
    const type = node.type || file.file_type || '';
    const id = node.id || file.id || '';

    // lookup model dependent nodes in schema
    const dependents = getDependentTypes(type) || [];

    // check for capture bulk import
    const historicCaptureImport = dependents.length > 0
        ? dependents.find(dependent => dependent === 'historic_captures' )
        : null;

    const modernCaptureImport = dependents.length > 0
        ? dependents.find(dependent => dependent === 'modern_captures' )
        : null;

    // toggle to dhow/hide popup dialogs
    const [dialogToggle, setDialogToggle] = React.useState(null);

    // dropdown toggle for tools menu items
    const [dropdownToggle, setDropdownToggle] = React.useState(false);
    let dropdown = React.createRef();

    // create hide dropdown function
    const hideDropdown = React.useCallback((e) => {
        if (dropdown && !dropdown.contains(e.target)) {
            setDropdownToggle(false);
            document.removeEventListener('click', hideDropdown);
        }
    }, [dropdown]);

    // create event listener to close menu upon click
    React.useEffect(() => {
        if (dropdownToggle) {
            document.addEventListener('click', hideDropdown);
        }
        else {
            document.removeEventListener('click', hideDropdown);
        }
    }, [dropdown, hideDropdown, dropdownToggle, setDropdownToggle]);

    // visibility settings for menu & menu items
    const menuExclude = ['new', 'dashboard', 'login', 'register', 'notFound'];
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
                    {
                        Object.keys(api.root).length > 0 && !showExclude.includes(api.view) ?
                        <li key={'show'}>
                            <Button
                                label={'View'}
                                title={`View this ${getModelLabel(type)}.`}
                                icon={'info'}
                                onClick={e =>
                                    onClick(e, type, 'show', id)
                                } />
                        </li> : ''
                    }
                    {
                        api.root && !editExclude.includes(api.view) ?
                        <li key={'edit'}>
                            <Button
                                icon={'edit'}
                                label={'Edit'}
                                title={`Edit this ${getModelLabel(type)}.`}
                                onClick={e =>
                                    onClick(e, type, 'edit', id)
                                }
                            />
                        </li> : ''
                    }
                    {
                        api.root && !deleteExclude.includes(api.view) ?
                        <li key={'remove'}>
                            <Button
                                icon={'delete'}
                                label={'Delete'}
                                title={`Delete this ${getModelLabel(type)} item.`}
                                onClick={() => {setDialogToggle('remove')}}
                            />
                            {
                                dialogToggle === 'remove' ?
                                <Alert
                                    setToggle={setDialogToggle}
                                    title={`Delete 
                                    ${getModelLabel(type)} 
                                    ${getNodeLabel(api.root) || getFileLabel(file)} record?`}
                                    description={
                                        <>
                                            <p>Please confirm the deletion of {getModelLabel(type)}:</p>
                                            <p><b>{getNodeLabel(api.root)}</b></p>
                                            <p>Note that any dependent nodes for this record will also be deleted.</p>
                                        </>
                                    }
                                    callback={() => {
                                        router.remove(api.root);
                                    }}
                                /> : ''
                            }
                        </li> : ''
                    }
                    {
                        file_type==='modern_images' && api.root && !editExclude.includes(api.view) ?
                            <li key={'master'}>
                                <Button
                                    icon={'master'}
                                    label={'Master'}
                                    title={`Master this ${getModelLabel(file_type)}.`}
                                    onClick={e =>
                                        onClick(e, file_type, 'master', id)
                                    }
                                />
                            </li> : ''
                    }
                    {
                        // add dropdown menu for adding dependent nodes
                        dependents.length > 0
                            ? <li>
                                <Button
                                    icon={'tools'}
                                    label={'Add Items'}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setDropdownToggle(true);
                                    }} />
                                {
                                    // toggle dropdown menu items
                                    dropdownToggle ?
                                        <ul
                                            className={`v-menu dropdown`}
                                            ref={(element) => {dropdown = element}}
                                        >
                                            {
                                                // include option to add dependent items
                                                dependents.map(dependent => {
                                                    return (
                                                        <li key={`add_${dependent}`}>
                                                            <Button
                                                                icon={'add'}
                                                                type={dependent}
                                                                label={getModelLabel(dependent)}
                                                                onClick={() => {setDialogToggle(dependent)}}
                                                            />
                                                        </li>
                                                    );
                                                })
                                            }
                                            {
                                                // include option to import historic captures
                                                historicCaptureImport ?
                                                    <li key={'import_historic'}>
                                                        <Button
                                                            icon={'import'}
                                                            type={'historic_captures'}
                                                            label={`Import ${getModelLabel('historic_captures', 'label')}`}
                                                            onClick={() => {setDialogToggle('import_historic_captures')}}
                                                        />
                                                    </li>
                                                    : ''
                                            }
                                            {
                                                // include option to add modern captures
                                                modernCaptureImport ?
                                                    <li key={'import_modern'}>
                                                        <Button
                                                            icon={'import'}
                                                            type={'modern_captures'}
                                                            label={`Import ${getModelLabel('modern_captures', 'label')}`}
                                                            onClick={() => {setDialogToggle('import_modern_captures')}}
                                                        />
                                                    </li>
                                                    : ''
                                            }
                                        </ul> : ''
                                }
                            </li>
                            : ''
                    }
                </ul>
                {
                    dependents.map(dependent => {
                        return dialogToggle === dependent
                            ? <Dialog
                                key={`dialog_${dependent}`}
                                setToggle={setDialogToggle}
                                title={`Add new ${getModelLabel(dependent)}.`}>
                                <Importer
                                    view={'add'}
                                    model={dependent}
                                    options={api.options}
                                    schema={genSchema('new', dependent)}
                                    route={getNodeURI(dependent, 'new', id)}
                                    callback={() => {
                                        redirect(getNodeURI(type, 'show', id));
                                    }}
                                />
                            </Dialog>
                            : ''
                    })
                }
                {
                    historicCaptureImport && dialogToggle === 'import_historic_captures' ?
                            <Dialog
                                key={'import_historic_captures'}
                                title={`Bulk ${getModelLabel('historic_captures', 'label')} import.`}
                                setToggle={() => {}}>
                                <Importer
                                    view={'import'}
                                    model={'historic_captures'}
                                    options={api.options}
                                    schema={genSchema('import', 'historic_captures')}
                                    route={getNodeURI('historic_captures', 'import', id)}
                                    callback={() => {
                                        redirect(getNodeURI(type, 'show', id));
                                    }}
                                />
                            </Dialog> : ''
                }
                {
                    modernCaptureImport && dialogToggle === 'import_modern_captures' ?
                        <Dialog
                            key={'import_modern_captures'}
                            title={`Import ${getModelLabel('modern_captures', 'label')}`}
                            setToggle={setDialogToggle}>
                            <Importer
                                view={'import'}
                                model={'modern_captures'}
                                options={api.options}
                                schema={genSchema('import', 'modern_captures')}
                                route={getNodeURI('modern_captures', 'import', id)}
                                callback={() => {
                                    redirect(
                                        getNodeURI(type, 'show', id
                                        )
                                    );
                                }}
                            />
                        </Dialog> : ''
                }
                    </div>
                    : ''
                    )
                    }

                    export default MenuEditor;
