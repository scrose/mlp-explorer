/*!
 * MLP.Client.Components.Menu.Editor
 * File: editor.menu.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import {createNodeRoute, redirect} from '../../_utils/paths.utils.client';
import {useRouter} from '../../_providers/router.provider.client';
import {useUser} from '../../_providers/user.provider.client';
import {genSchema, getModelLabel} from '../../_services/schema.services.client';
import Button from '../common/button';
import Importer from '../tools/import.tools';
import Exporter from '../tools/export.tools';
import Download from '../common/download';
import Downloader from '../tools/download.tools';
import Dialog from '../common/dialog';
import MetadataView from '../views/metadata.view';
import Remover from '../views/remover.view';
import OptionsView from '../views/options.view';
import HelpView from '../views/help.view';
import Dropdown from "../common/dropdown";

/**
 * Editor menu component.
 *
 * @public
 */

const EditorMenu = ({
                        className = '',
                        model = '',
                        view = '',
                        id = '',
                        label = '',
                        compact = true,
                        fileType = '',
                        filename='',
                        owner = null,
                        metadata = null,
                        dependents = [],
                        callback = null
                    }) => {

    const router = useRouter();
    const user = useUser();
    const modelLabel = getModelLabel(model);

    // generate unique ID value for form inputs
    const menuID = Math.random().toString(16).substring(2);

    // get user role
    const {role = ['']} = user || {};
    const isAdmin = role[0] === 'administrator' || role[0] === 'super_administrator';

    // get optional group type used as fieldset selector (if exists)
    const {group_type = '', image_state = '' } = metadata || {};

    // visibility settings for menu & menu items
    const showExclude = ['dashboard', 'list', 'register', 'new'];
    const editExclude = ['dashboard', 'list', 'register', 'new', 'attach'];
    const removeExclude = ['dashboard', 'list', 'register', 'new', 'attach'];
    const dependentsExclude = ['new'];

    // exclude some options for non-administrators
    const dependentsExcludeUser = !isAdmin
        ? ['historic_images', 'modern_images', 'supplemental_images']
        : [];

    // is this a root menu (ie. top editor-tools)?
    const isEditorMenu = className === 'editor-tools';
    const isOptions = view === 'options';

    // get redirect URI
    // - dependents return to the owner view
    // - owners return to themselves
    const redirectURI = owner && Object.keys(owner || {}).length > 0
        ? createNodeRoute(owner.type, 'show', owner.id)
        : createNodeRoute(model, 'show', id);

    console.log(isEditorMenu , id , model , metadata , view, showExclude.includes(view))

    // visibility of menu items
    const isVisible = {
        new: isOptions,
        show: !!(!isEditorMenu && id && model && metadata && !showExclude.includes(view)),
        edit: !!(!isEditorMenu && id && model && metadata && !editExclude.includes(view)),
        move: (model === 'modern_captures' || model === 'historic_captures')
            && !!(id && model && metadata && !editExclude.includes(view)),
        remove: (isAdmin) && !!(!isEditorMenu && id && model && metadata && !removeExclude.includes(view)),
        attach: view === 'attach',
        attachItem: view === 'attachItem',
        iat: image_state !== 'raw' && (fileType === 'modern_images'
            || fileType === 'historic_images'
            || fileType === 'supplemental_images'),
        download: !isEditorMenu && (fileType === 'modern_images'
            || fileType === 'historic_images'
            || fileType === 'supplemental_images'),
        rawDownload: !isEditorMenu && (fileType === 'modern_images'
            || fileType === 'historic_images'
            || fileType === 'supplemental_images'),
        bulkDownload: !isEditorMenu && model === 'stations' && view !== 'files',
        dependents: !dependentsExclude.includes(view),
        addNew: !!(isEditorMenu || (!isOptions && dependents.length > 0)),
        import_hc: isAdmin && !!(dependents || [])
                .find(dependent => dependent === 'historic_captures')
            && !dependentsExclude.includes(view),
        import_mc: isAdmin && !!(dependents || [])
                .find(dependent => dependent === 'modern_captures')
            && !dependentsExclude.includes(view),
    }

    // toggle to dhow/hide popup dialogs
    const [dialogToggle, setDialogToggle] = React.useState('');

    // include submenu items to add dependent items
    const dependentItems = (dependents || [])
        .filter(() => {
            return isVisible.attach || isVisible.dependents
        })
        .map(dependent => {
            if (dependentsExcludeUser.includes(dependent)) return null;
            return {
                icon: 'add',
                type: dependent,
                label: `Add New ${getModelLabel(dependent)}`,
                callback: () => {
                    setDialogToggle(dependent)
                }
            }
        });

    // include option to import historic captures
    const importHCItem = isVisible.import_hc
        ? {
            icon: 'import',
            type: 'historic_captures',
            label: `Import ${getModelLabel('historic_captures', 'label')}`,
            callback: () => {
                setDialogToggle('import_hc')
            }
        }
        : null;

    // include option to import modern captures
    const importMCItem = isVisible.import_hc
        ? {
            icon: 'import',
            type: 'modern_captures',
            label: `Import ${getModelLabel('modern_captures', 'label')}`,
            callback: () => {
                setDialogToggle('import_mc')
            }
        }
        : null;

    // menu item to add new Surveyor
    const addSurveyorItem = isEditorMenu
        ? {
            icon: 'surveyors',
            type: 'surveyors',
            label: `Add new ${getModelLabel('surveyors')}`,
            callback: (e) => {
                e.preventDefault();
                router.update(createNodeRoute('surveyors', 'new', id));
            }
        }
        : null;

    // menu item to add new Project
    const addProjectItem = isEditorMenu
        ? {
            icon: 'projects',
            type: 'projects',
            label: `Add new ${getModelLabel('projects')}`,
            callback: (e) => {
                e.preventDefault();
                router.update(createNodeRoute('projects', 'new', id));
            }
        }
        : null;

    // Bulk import description
    const bulkImportDescription = <p>
        Use this form to import multiple capture images. Each image
        will generate a unique historic or modern capture entry.
        Metadata included below will apply to each imported capture.
    </p>

    const _editorDialogs = {
        help: <HelpView setToggle={setDialogToggle}/>,
        show: <Dialog
            key={`${menuID}_dialog_show`}
            title={`${modelLabel} Details`}
            setToggle={setDialogToggle}>
            <MetadataView model={model} metadata={metadata}/>
        </Dialog>,
        new: <Dialog
            key={`${menuID}_dialog_new`}
            title={`Create New ${getModelLabel(model)}`}
            setToggle={setDialogToggle}>
            <Importer
                view={'new'}
                model={model}
                options={{
                    node: {
                        id: null,
                        type: model,
                        owner: owner
                    }
                }}
                schema={genSchema({view: 'new', model: model, user: user})}
                route={createNodeRoute(model, 'new')}
                onCancel={() => {
                    setDialogToggle(null)
                }}
                callback={(error, model, id) => {
                    callback
                        ? callback(error, model, id)
                        : redirect(createNodeRoute(model, 'show', id));
                }}
            />
        </Dialog>,
        edit: <Dialog
            key={`${menuID}_dialog_edit`}
            title={`Edit ${getModelLabel(model)}${label ? ': ' + label : ''}`}
            setToggle={setDialogToggle}>
            <Importer
                view={'edit'}
                model={model}
                options={{
                    node: {
                        id: id,
                        type: model,
                        owner: owner
                    }
                }}
                schema={genSchema({view: 'edit', model: model, fieldsetKey: group_type, user: user})}
                route={createNodeRoute(model, 'edit', id)}
                data={metadata}
                onCancel={() => {
                    setDialogToggle(null)
                }}
                callback={() => {
                    setDialogToggle(null);
                    redirect(router.route);
                }}
            />
        </Dialog>,
        remove: <Remover
            key={`${menuID}_dialog_remove`}
            id={owner && group_type ? owner.id : id}
            label={label}
            onCancel={() => {
                setDialogToggle(null)
            }}
            model={model}
            groupType={group_type}
            callback={(error) => {
                setDialogToggle(null);
                if (!error) {
                    callback ? callback() : redirect(
                        model === 'projects' || model === 'surveyors' ? '/' : redirectURI
                    );
                }
            }}
        />,
        options: <OptionsView
            setToggle={setDialogToggle}
            onCancel={() => {
                setDialogToggle(null)
            }}
            callback={() => {
            }}
        />,
        import_hc: <Dialog
            key={`${menuID}_dialog_import_hc`}
            title={`Bulk ${getModelLabel('historic_captures', 'label')} Import`}
            setToggle={setDialogToggle}>
            {
                bulkImportDescription
            }
            <Importer
                view={'import'}
                model={'historic_captures'}
                batchType={'historic_images'}
                schema={genSchema({view: 'import', model: 'historic_captures', user: user})}
                route={createNodeRoute('historic_captures', 'import', id)}
                onCancel={() => {
                    setDialogToggle(null)
                }}
                callback={(error, model, id) => {
                    setDialogToggle(null);
                    callback ? callback(error, model, id) : redirect(router.route);
                }}
            />
        </Dialog>,
        import_mc: <Dialog
            key={`${menuID}_dialog_import_mc`}
            title={`Bulk ${getModelLabel('modern_captures', 'label')} Import`}
            setToggle={setDialogToggle}>
            {
                bulkImportDescription
            }
            <Importer
                view={'import'}
                model={'modern_captures'}
                batchType={'modern_images'}
                schema={genSchema({view: 'import', model: 'modern_captures', user: user})}
                hasUploads={true}
                route={createNodeRoute('modern_captures', 'import', id)}
                onCancel={() => {
                    setDialogToggle(null)
                }}
                callback={(error, model, id) => {
                    setDialogToggle(null);
                    callback ? callback(error, model, id) : redirect(router.route);
                }}
            />
        </Dialog>,
        exporter: <Dialog
            key={`${menuID}_dialog_export`}
            title={`Export Metadata to File`}
            setToggle={setDialogToggle}>
            <Exporter setToggle={setDialogToggle}/>
        </Dialog>,
        bulkDownload: <Dialog
            key={`${menuID}_dialog_bulk_download`}
            title={`Bulk Download Images`}
            setToggle={setDialogToggle}>
            <Downloader setToggle={setDialogToggle} id={id} />
        </Dialog>,
    }

    // create dependents dialog popups for requested model
    const _dependentDialogs = (dependents || []).reduce((o, dependent) => {
        o[dependent] = <Dialog
            key={`${menuID}_dialog_${dependent}`}
            setToggle={setDialogToggle}
            title={`Add New ${getModelLabel(dependent)}`}>
            <Importer
                view={'add'}
                model={dependent}
                options={{
                    node: {
                        id: null,
                        type: dependent,
                        owner: {
                            id: id,
                            type: model
                        }
                    }
                }}
                schema={genSchema({view: 'new', model: dependent, user: user})}
                route={createNodeRoute(dependent, 'new', id)}
                onCancel={() => {
                    setDialogToggle(null)
                }}
                callback={(data) => {
                    setDialogToggle(null);
                    callback ? callback(data) : redirect(router.route);
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

    return (
        // restrict menu to authenticated users
        <>
            {
                // render overlay dialog box
                showDialog(dialogToggle)
            }
            <div className={`${className} h-menu`}>
                <ul>
                    {
                        user && isVisible.new &&
                        <li key={`${menuID}_menuitem_new`}>
                            <Button
                                icon={'new'}
                                label={!compact ? 'Add New' : ''}
                                title={`Add New ${label}.`}
                                onClick={() => {setDialogToggle('new')}}
                            />
                        </li>
                    }
                    {
                        // add dropdown menu for adding dependent nodes
                        user && isVisible.addNew && <li key={`${menuID}_menuitem_add_new`}>
                            <Dropdown label={'Add New'} compact={compact} items={dependentItems.concat(
                                importHCItem,
                                importMCItem,
                                addSurveyorItem,
                                addProjectItem
                            )} />
                        </li>
                    }
                    {
                        isVisible.show &&
                        <li key={`${menuID}_menuitem_show`}>
                            <Button
                                icon={'show'}
                                label={!compact ? 'Info' : ''}
                                title={`View ${modelLabel} details.`}
                                onClick={() => {setDialogToggle('show')}}
                            />
                        </li>
                    }
                    {
                        isVisible.download &&
                        <li key={`${menuID}_menuitem_download`}>
                            <Download
                                type={fileType}
                                callback={console.log}
                                route={`/files/download/${id}`}
                                format={'img'}
                                label={compact ? '' : `Download`}
                                filename ={filename}
                            />
                        </li>
                    }
                    {
                        user && isVisible.rawDownload &&
                        <li key={`${menuID}_menuitem_raw_download`}>
                            <Download
                                type={fileType}
                                callback={console.log}
                                route={`/files/download/raw?id=${id}`}
                                format={'zip'}
                                label={compact ? '' : `Download Raw File`}
                                filename ={`${filename}.zip`}
                            />
                        </li>
                    }
                    {
                        user && isVisible.bulkDownload &&
                        <li key={`${menuID}_menuitem_bulk_download`}>
                            <Button
                                icon={'bulk_download'}
                                label={!compact ? 'Download' : ''}
                                title={`Bulk Downloader.`}
                                onClick={() => {
                                    setDialogToggle('bulkDownload')
                                }}
                            />
                        </li>
                    }
                    {
                        user && isVisible.edit &&
                        <li key={`${menuID}_menuitem_edit`}>
                            <Button
                                icon={'edit'}
                                label={!compact ? 'Edit' : ''}
                                title={`Edit ${label}.`}
                                onClick={() => { setDialogToggle('edit') } }
                            />
                        </li>
                    }
                    {
                        user && isVisible.remove &&
                        <li key={`${menuID}_menuitem_remove`}>
                            <Button
                                icon={'delete'}
                                label={!compact ? 'Delete' : ''}
                                title={`Delete this ${label}.`}
                                onClick={() => {
                                    setDialogToggle('remove');
                                }}
                            />
                        </li>
                    }
                    {
                        user && isEditorMenu && <li key={`${menuID}_menuitem_options`}>
                            <Button
                                icon={'options'}
                                label={!compact ? 'Options': ''}
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
