/*!
 * MLP.Client.Components.Editor.Menu
 * File: editor.menu.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React, { useCallback } from 'react';
import { getNodeURI, redirect } from '../../_utils/paths.utils.client';
import { useRouter } from '../../_providers/router.provider.client';
import { genSchema, getModelLabel } from '../../_services/schema.services.client';
import Button from '../common/button';
import Importer from '../tools/import.tools';
import Dialog from '../common/dialog';
import MetadataView from '../views/metadata.view';
import { useData } from '../../_providers/data.provider.client';
import { useUser } from '../../_providers/user.provider.client';
import Remover from '../views/remover.view';
import OptionsView from '../views/options.view';

/**
 * Editor menu component.
 *
 * @public
 */

const EditorMenu = ({
                        className='node',
                        model = '',
                        view='show',
                        id = '',
                        label = '',
                        fileType='',
                        owner=null,
                        metadata = null,
                        dependents = [],
                        callback=null
                    }) => {

    const router = useRouter();
    const api = useData();
    const user = useUser();
    const modelLabel = getModelLabel(model);

    // get optional group type used as fieldset selector (if exists)
    const {group_type = ''} = metadata || {};

    // visibility settings for menu & menu items
    const showExclude = ['dashboard', 'list', 'register', 'new', 'attach', 'attachItem'];
    const editExclude = ['dashboard', 'list', 'register', 'new', 'attach'];
    const removeExclude = ['dashboard', 'list', 'register', 'new', 'attach'];
    const dependentsExclude = ['new'];

    // is this a root menu (ie. top editor-tools)?
    const isEditor = className==='editor-tools';
    const isOptions = view === 'options';

    // get redirect URI
    // - dependents return to the owner view
    // - owners return to themselves
    const redirectURI = owner
        ? getNodeURI(owner.type, 'show', owner.id)
        : getNodeURI(model, 'show', id);

    // visibility of menu items
    const isVisible = {
        menu: !!(id || model || metadata || view),
        new: isOptions,
        show: !!(id && model && metadata && !showExclude.includes(view)),
        edit: !!(id && model && metadata && !editExclude.includes(view)),
        remove: !!(id && model && metadata && !removeExclude.includes(view)),
        attach: view === 'attach',
        attachItem: view === 'attachItem',
        master: fileType === 'modern_images',
        dependents: !dependentsExclude.includes(view),
        dropdown: !!(isEditor || dependents.length > 0),
        import_hc: !!(dependents || [])
            .find(dependent => dependent === 'historic_captures')
            && !dependentsExclude.includes(view),
        import_mc: !!(dependents || [])
            .find(dependent => dependent === 'modern_captures')
            && !dependentsExclude.includes(view)
    }

    // generate unique ID value for form inputs
    const menuID = Math.random().toString(16).substring(2);

    // toggle to dhow/hide popup dialogs
    const [dialogToggle, setDialogToggle] = React.useState('');

    // dropdown toggle for tools menu items
    const [dropdownToggle, setDropdownToggle] = React.useState(false);

    // Bulk import note
    const bulkImportDescription = <p>
        Use this form to import multiple capture images. Each image
        will generate a unique historic or modern capture entry.
        Metadata included below will apply to each imported capture.
    </p>

    const _editorDialogs = {
        show:   <Dialog
                    key={`${menuID}_dialog_show`}
                    title={`${modelLabel} Details`}
                    setToggle={setDialogToggle}>
                    <MetadataView model={model} metadata={metadata} />
                </Dialog>,
        new:   <Dialog
                    key={`${menuID}_dialog_edit`}
                    title={`Create New ${getModelLabel(model)}`}
                    setToggle={setDialogToggle}>
                    <Importer
                        view={'new'}
                        model={model}
                        options={api.options}
                        schema={genSchema('new', model)}
                        route={getNodeURI(model, 'new')}
                        callback={() => {
                            console.log('Callback new!')
                            setDialogToggle(null);
                            callback ? callback() : redirect(router.route);
                        }}
                    />
                </Dialog>,
        edit:   <Dialog
                    key={`${menuID}_dialog_edit`}
                    title={`Edit ${getModelLabel(model)} ${label ? ': ' + label : ''}`}
                    setToggle={setDialogToggle}>
                        <Importer
                            view={'edit'}
                            model={model}
                            options={api.options}
                            schema={genSchema('edit', model, group_type)}
                            route={getNodeURI(model, 'edit', id)}
                            data={metadata}
                            callback={() => {
                                setDialogToggle(null);
                                callback ? callback() : redirect(router.route);
                            }}
                        />
                    </Dialog>,
        remove:   <Remover
                        key={`${menuID}_dialog_remove`}
                        id={id}
                        label={label}
                        onCancel={() => {setDialogToggle('')}}
                        model={model}
                        callback={() => {
                            setDialogToggle(null);
                            callback ? callback() : redirect(redirectURI);
                        }}
                   />,
        options:   <OptionsView
                        setToggle={setDialogToggle}
                        callback={() => {}}
                   />,
        import_hc: <Dialog
                        key={`${menuID}_dialog_import_hc`}
                        title={`Bulk ${getModelLabel('historic_captures', 'label')} Import.`}
                        setToggle={() => {
                        }}>
                        {
                            bulkImportDescription
                        }
                        <Importer
                            view={'import'}
                            model={'historic_captures'}
                            options={api.options}
                            batchType={'historic_images'}
                            schema={genSchema('import', 'historic_captures')}
                            route={getNodeURI('historic_captures', 'import', id)}
                            callback={() => {
                                setDialogToggle(null);
                                callback ? callback() : redirect(router.route);
                            }}
                        />
                    </Dialog>,
        import_mc:  <Dialog
            key={`${menuID}_dialog_import_mc`}
            title={`Bulk ${getModelLabel('modern_captures', 'label')} Import.`}
            setToggle={setDialogToggle}>
            {
                bulkImportDescription
            }
            <Importer
                view={'import'}
                model={'modern_captures'}
                options={api.options}
                batchType={'modern_images'}
                schema={genSchema('import', 'modern_captures')}
                hasUploads={true}
                route={getNodeURI('modern_captures', 'import', id)}
                callback={() => {
                    setDialogToggle(null);
                    callback ? callback() : redirect(router.route);
                }}
            />
        </Dialog>
    }

    // create dependents dialog popups for requested model
    const _dependentDialogs = (dependents || []).reduce((o, dependent) => {
        o[dependent] =  <Dialog
            key={`${menuID}_dialog_${dependent}`}
            setToggle={setDialogToggle}
            title={`Add New ${getModelLabel(dependent)}`}>
            <Importer
                view={'add'}
                model={dependent}
                options={api.options}
                schema={genSchema('new', dependent)}
                route={getNodeURI(dependent, 'new', id)}
                callback={() => {
                    setDialogToggle(null);
                    callback ? callback() : redirect(router.route);
                }}
            />
        </Dialog>;
        return o;
    }, {});

    // show dialog popup
    const showDialog = (type) => {
        return _editorDialogs.hasOwnProperty(dialogToggle)
            ? _editorDialogs[dialogToggle]
            : _dependentDialogs.hasOwnProperty(type)
                ? _dependentDialogs[type]
                : ''
    }

    // Initialize map using reference callback to access DOM
    const dropdown = useCallback(domNode => {

        // create hide dropdown function
        const hideDropdown = (e) => {
            if (!domNode.contains(e.target)) {
                setDropdownToggle(false);
                document.removeEventListener('click', hideDropdown);
            }
        };

        // create event listener to close menu upon click
        if (domNode && dropdownToggle) {
            document.addEventListener('click', hideDropdown);
        } else {
            document.removeEventListener('click', hideDropdown);
        }

    }, [dropdownToggle, setDropdownToggle]);


    // handle click events -> routing
    function onClick(e, model, view, id) {
        e.preventDefault();
        router.update(getNodeURI(model, view, id));
    }

    return (
        // restrict to authenticated users
        user &&
        <>
            {
                // render overlay dialog box
                showDialog(dialogToggle)
            }
            <div className={`${className} h-menu`}>
                <ul>
                    {
                        isVisible.new &&
                        <li key={`${menuID}_menuitem_new`}>
                            <Button
                                icon={'new'}
                                title={`New ${label}.`}
                                onClick={(e) => {
                                    isEditor
                                        ? onClick(e, model, 'new', id)
                                        : setDialogToggle('new')}
                                }
                            />
                        </li>
                    }
                    {
                        isVisible.show &&
                        <li key={`${menuID}_menuitem_show`}>
                            <Button
                                icon={'show'}
                                title={`View ${modelLabel} details.`}
                                onClick={(e) => {
                                    isEditor
                                        ? onClick(e, model, 'show', id)
                                        : setDialogToggle('show')}
                                }
                            />
                        </li>
                    }
                    {
                        isVisible.edit &&
                        <li key={`${menuID}_menuitem_edit`}>
                            <Button
                                icon={'edit'}
                                title={`Edit ${label}.`}
                                onClick={(e) => {
                                    isEditor
                                        ? onClick(e, model, 'edit', id)
                                        : setDialogToggle('edit')}
                                }
                            />
                        </li>
                    }
                    {
                        isVisible.remove &&
                        <li key={`${menuID}_menuitem_remove`}>
                            <Button
                                icon={'delete'}
                                title={`Delete this ${label}.`}
                                onClick={() => {
                                    setDialogToggle('remove');
                                }}
                            />
                        </li>
                    }
                    {
                        isVisible.master &&
                        <li key={`${menuID}_menuitem_master`}>
                            <Button
                                icon={'master'}
                                title={`Master ${getModelLabel(fileType)} ${label}.`}
                                onClick={e =>
                                    onClick(e, fileType, 'master', id)
                                }
                            />
                        </li>
                    }
                    {
                        // add dropdown menu for adding dependent nodes
                        isVisible.dropdown &&
                        <li ref={dropdown} key={`${menuID}_menuitem_dropdown`}>
                            <Button
                                icon={'add'}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setDropdownToggle(true);
                                }} />

                            {
                                // toggle dropdown menu items
                                <div
                                    key={`${menuID}_data_dropdown`}
                                    className={`v-menu dropdown${dropdownToggle ? ' active' : ''}`}
                                >
                                    <ul>
                                        {
                                            (isVisible.attach || isVisible.dependents) &&
                                            <>
                                                {
                                                    // include submenu items to add dependent items
                                                    (dependents || []).map(dependent => {
                                                        return (
                                                            <li key={`add_${dependent}`}>
                                                                <Button
                                                                    icon={'add'}
                                                                    type={dependent}
                                                                    label={`Add New ${getModelLabel(dependent)}`}
                                                                    onClick={() => {
                                                                        setDialogToggle(dependent);
                                                                    }}
                                                                />
                                                            </li>
                                                        );
                                                    })
                                                }
                                            </>
                                        }
                                        {
                                            // include option to import historic captures
                                            isVisible.import_hc &&
                                            <li key={'import_historic'}>
                                                <Button
                                                    icon={'import'}
                                                    type={'historic_captures'}
                                                    label={`Import ${getModelLabel('historic_captures', 'label')}`}
                                                    onClick={() => {
                                                        setDialogToggle('import_hc');
                                                    }}
                                                />
                                            </li>
                                        }
                                        {
                                            // include option to add modern captures
                                            isVisible.import_mc &&
                                            <li key={'import_modern'}>
                                                <Button
                                                    icon={'import'}
                                                    type={'modern_captures'}
                                                    label={`Import ${getModelLabel('modern_captures', 'label')}`}
                                                    onClick={() => {
                                                        setDialogToggle('import_mc');
                                                    }}
                                                />
                                            </li>
                                        }
                                        {
                                            // show project / surveyor create buttons on editor tools menu
                                            isEditor &&
                                            <>
                                                <li>
                                                    <Button
                                                        icon={'surveyors'}
                                                        label={`Add new ${getModelLabel('surveyors')}`}
                                                        title={`Add new ${getModelLabel('surveyors')}`}
                                                        onClick={(e) => {
                                                            setDropdownToggle(false);
                                                            onClick(e, 'surveyors', 'new');
                                                        }}
                                                    />
                                                </li>
                                                <li>
                                                    <Button
                                                        icon={'projects'}
                                                        label={`Add new ${getModelLabel('projects')}`}
                                                        title={`Add new ${getModelLabel('projects')}`}
                                                        onClick={(e) => {
                                                            setDropdownToggle(false);
                                                            onClick(e, 'projects', 'new');
                                                        }}
                                                    />
                                                </li>
                                            </>
                                        }
                                    </ul>
                                </div>
                            }
                        </li>
                    }
                    {
                        isEditor &&
                        <li className={'push'} key={`${menuID}_menuitem_options`}>
                            <Button
                                icon={'options'}
                                title={`Edit metadata options.`}
                                onClick={() => setDialogToggle('options')}
                            />
                        </li>
                    }
                </ul>
            </div>
        </>
    );
};

export default EditorMenu;
