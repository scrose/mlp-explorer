/*!
 * MLP.Client.Components.Editor.Menu
 * File: editor.menu.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React, { useCallback } from 'react';
import { createNodeRoute, redirect } from '../../_utils/paths.utils.client';
import { useRouter } from '../../_providers/router.provider.client';
import { genSchema, getModelLabel, getStaticView } from '../../_services/schema.services.client';
import Button from '../common/button';
import Importer from '../tools/import.tools';
import Dialog from '../common/dialog';
import MetadataView from '../views/metadata.view';
import { useData } from '../../_providers/data.provider.client';
import { useUser } from '../../_providers/user.provider.client';
import Remover from '../views/remover.view';
import OptionsView from '../views/options.view';
import HelpView from '../views/help.view';
import Exporter from '../tools/export.tools';
import Download from '../common/download';

/**
 * Editor menu component.
 *
 * @public
 */

const MenuEditor = ({
                        className='node',
                        model = '',
                        view='',
                        id = '',
                        label = '',
                        compact=true,
                        fileType='',
                        filename='',
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
    const {group_type = '', image_state=''} = metadata || {};

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
    const redirectURI = owner && Object.keys(owner || {}).length > 0
        ? createNodeRoute(owner.type, 'show', owner.id)
        : createNodeRoute(model, 'show', id);

    // visibility of menu items
    const isVisible = {
        menu: !!(id || model || metadata || view),
        new: isOptions,
        show: !!(id && model && metadata && !showExclude.includes(view)),
        edit: !!(id && model && metadata && !editExclude.includes(view)),
        move: (model === 'modern_captures' || model === 'historic_captures')
            && !!(id && model && metadata && !editExclude.includes(view)),
        remove: !!(id && model && metadata && !removeExclude.includes(view)),
        attach: view === 'attach',
        attachItem: view === 'attachItem',
        iat: image_state !== 'raw' && (fileType === 'modern_images'
            || fileType === 'historic_images'
            || fileType === 'supplemental_images'),
        download: fileType === 'modern_images'
                || fileType === 'historic_images'
                || fileType === 'supplemental_images',
        dependents: !dependentsExclude.includes(view),
        dropdown: !!(isEditor || dependents.length > 0),
        import_hc: !!(dependents || [])
            .find(dependent => dependent === 'historic_captures')
            && !dependentsExclude.includes(view),
        import_mc: !!(dependents || [])
            .find(dependent => dependent === 'modern_captures')
            && !dependentsExclude.includes(view),
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
        help: <HelpView setToggle={setDialogToggle} />,
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
                        route={createNodeRoute(model, 'new')}
                        onCancel={() => {setDialogToggle(null)}}
                        callback={(error, model, id) => {
                            setDialogToggle(null);
                            callback
                                ? callback(error, model, id)
                                : redirect(createNodeRoute(model, 'show', id));
                        }}
                    />
                </Dialog>,
        edit:   <Dialog
                    key={`${menuID}_dialog_edit`}
                    title={`Edit ${getModelLabel(model)}${label ? ': ' + label : ''}`}
                    setToggle={setDialogToggle}>
                        <Importer
                            view={'edit'}
                            model={model}
                            options={api.options}
                            schema={genSchema('edit', model, group_type)}
                            route={createNodeRoute(model, 'edit', id)}
                            data={metadata}
                            onCancel={() => {setDialogToggle(null)}}
                            callback={(error, model, id) => {
                                setDialogToggle(null);
                                callback
                                    ? callback(error, model, id)
                                    : redirect(router.route);
                            }}
                        />
                    </Dialog>,
        remove:   <Remover
                        key={`${menuID}_dialog_remove`}
                        id={owner && group_type ? owner.id : id}
                        label={label}
                        onCancel={() => {setDialogToggle(null)}}
                        model={model}
                        groupType={group_type}
                        callback={() => {
                            setDialogToggle(null);
                            callback ? callback() : redirect(
                                model === 'projects' || model === 'surveyors'
                                    ? '/'
                                    : redirectURI
                            );
                        }}
                   />,
        options:   <OptionsView
                        setToggle={setDialogToggle}
                        onCancel={() => {setDialogToggle(null)}}
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
                            route={createNodeRoute('historic_captures', 'import', id)}
                            onCancel={() => {setDialogToggle(null)}}
                            callback={(error, model, id) => {
                                setDialogToggle(null);
                                callback ? callback(error, model, id) : redirect(router.route);
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
                route={createNodeRoute('modern_captures', 'import', id)}
                onCancel={() => {setDialogToggle(null)}}
                callback={(error, model, id) => {
                    setDialogToggle(null);
                    callback ? callback(error, model, id) : redirect(router.route);
                }}
            />
        </Dialog>,
        exporter:   <Dialog
            key={`${menuID}_dialog_export`}
            title={`Export Metadata to File`}
            setToggle={setDialogToggle}>
            <Exporter setToggle={setDialogToggle} />
        </Dialog>,
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
                route={createNodeRoute(dependent, 'new', id)}
                onCancel={() => {setDialogToggle(null)}}
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
    function _handleClick(e, model, view, id) {
        e.preventDefault();
        router.update(createNodeRoute(model, view, id));
    }

    return (
        // restrict menu to authenticated users
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
                                label={!compact ? 'Add New' : ''}
                                title={`New ${label}.`}
                                onClick={(e) => {
                                    isEditor
                                        ? _handleClick(e, model, 'new', id)
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
                                label={!compact ? 'Info' : ''}
                                title={`View ${modelLabel} details.`}
                                onClick={(e) => {
                                    isEditor
                                        ? _handleClick(e, model, 'show', id)
                                        : setDialogToggle('show')}
                                }
                            />
                        </li>
                    }
                    {
                        isVisible.download &&
                        <li key={`${menuID}_menuitem_download`}>
                            <Download
                                filename={filename || 'download'}
                                label={!compact ? 'Download' : ''}
                                type={fileType}
                                format={'img'}
                                route={createNodeRoute(fileType, 'raw', id)}
                                callback={console.log}
                            />
                        </li>
                    }
                    {
                        isVisible.edit &&
                        <li key={`${menuID}_menuitem_edit`}>
                            <Button
                                icon={'edit'}
                                label={!compact ? 'Edit' : ''}
                                title={`Edit ${label}.`}
                                onClick={(e) => {
                                    isEditor
                                        ? _handleClick(e, model, 'edit', id)
                                        : setDialogToggle('edit')}
                                }
                            />
                        </li>
                    }
                    {
                        isVisible.move && <li
                            draggable={false}
                            key={`${menuID}_menuitem_move`}
                            onDragStart={(e) => {
                                // attache node metadata to data transfer object
                                e.dataTransfer.setData(
                                    'application/json',
                                    JSON.stringify({id: id, type: model, label: label})
                                );
                            }}
                        >
                            <Button
                                disabled={true}
                                className={'move'}
                                label={!compact ? 'Move' : ''}
                                icon={'move'}
                                title={`Move ${label}.`}
                            />
                        </li>
                    }
                    {
                        isVisible.remove &&
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
                        // add dropdown menu for adding dependent nodes
                        isVisible.dropdown &&
                        <li ref={dropdown} key={`${menuID}_menuitem_dropdown`}>
                            <Button
                                icon={'add'}
                                label={!compact ? 'Add New' : ''}
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
                                                        label={`Add New ${getModelLabel('surveyors')}`}
                                                        title={`Add new ${getModelLabel('surveyors')}`}
                                                        onClick={(e) => {
                                                            setDropdownToggle(false);
                                                            _handleClick(e, 'surveyors', 'new');
                                                        }}
                                                    />
                                                </li>
                                                <li>
                                                    <Button
                                                        icon={'projects'}
                                                        label={`Add New ${getModelLabel('projects')}`}
                                                        title={`Add new ${getModelLabel('projects')}`}
                                                        onClick={(e) => {
                                                            setDropdownToggle(false);
                                                            _handleClick(e, 'projects', 'new');
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
                        isVisible.iat &&
                        <li key={`${menuID}_menuitem_iat`}>
                            <Button
                                icon={'iat'}
                                label={!compact ? 'Open in IAT' : ''}
                                title={`Load ${getModelLabel(fileType)} ${label} in IAT.`}
                                onClick={() =>
                                    // launch IAT tool for capture image mastering:
                                    // - load historic images into Panel 1
                                    // - load modern images into Panel 2
                                    router.update(
                                        fileType === 'historic_images'
                                            ? `/iat?input1=${id}&type1=${fileType}`
                                            : `/iat?input2=${id}&type2=${fileType}`
                                    )
                                }
                            />
                        </li>
                    }
                    {
                        isEditor &&
                        <>
                            <li className={'push'} key={`${menuID}_menuitem_export`}>
                                <Button
                                    icon={'export'}
                                    label={'Export'}
                                    title={`View data export options.`}
                                    onClick={() => {setDialogToggle('exporter')}}
                                />
                            </li>
                            <li key={`${menuID}_menuitem_help`}>
                                <Button
                                    icon={'help'}
                                    label={'Help'}
                                    title={`View the help pages.`}
                                    onClick={() => {setDialogToggle('help')}}
                                />
                            </li>
                            <li key={`${menuID}_menuitem_options`}>
                                <Button
                                    icon={'options'}
                                    label={'Options'}
                                    title={`Edit metadata options.`}
                                    onClick={() => setDialogToggle('options')}
                                />
                            </li>
                        </>
                    }
                </ul>
            </div>
        </>
    );
};

export default MenuEditor;
