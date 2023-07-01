/*!
 * MLP.Client.Components.Menus.Nodes
 * File: node.menu.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import {getDependentTypes, getModelLabel, isImageType, isCaptureType} from '../../_services/schema.services.client';
import Button from '../common/button';
import Dropdown from "../common/dropdown";
import {useUser} from "../../_providers/user.provider.client";
import {genID} from "../../_utils/data.utils.client";
import {createNodeRoute, redirect} from "../../_utils/paths.utils.client";
import Download from "../common/download";
import {useDialog} from "../../_providers/dialog.provider.client";

/**
 * [Inline and Standalone] General node menu component for selecting view/edit options.
 * - menu options to view, create, edit, delete nodes and add node dependents
 * - displays dialogs for menu selections
 * - uses global navigation provider to select dialog
 *
 * @public
 * @param {String} id
 * @param {String} model
 * @param {String} label
 * @param compact
 * @param {Object} owner
 * @param {Object} metadata
 * @param attached
 * @param files
 * @param size
 * @param visible
 * @param callback
 * @param className
 * @return {JSX.Element}
 */

const EditorMenu = ({
                               id,
                               model,
                               label = '',
                               compact=true,
                               owner = null,
                               metadata = null,
                               attached={},
                               files={},
                               size= 'lg',
                               visible=['show', 'edit', 'remove', 'new'],
                               callback=()=>{},
                               className=''
                           }) => {
    // dialog provider
    const dialog = useDialog();

    // get user role
    const user = useUser();
    const {isAdmin=false, isEditor=false} = user || {};

    // destructure file metadata
    const {filename=`download_${model}_${id}`} = metadata || {};

    // get full model label
    const modelLabel = getModelLabel(model);

    // generate unique ID value for form inputs
    const menuID = genID();

    // handle dialog view
    // - sets node data in provider to load in dialog view
    const _handleDialog = (dialogID) => {
        dialog.setCurrent({
            dialogID: dialogID,
            id: id,
            model: model,
            label: label,
            metadata: metadata,
            owner: owner,
            files: files,
            attached: attached,
            callback: callback,
        });
    };

    // get dependent nodes to add to current node
    const dependentTypes = getDependentTypes(model);
    const addItems = (dependentTypes || [])
        .map(dependentType => {
            return {
                icon: 'add',
                type: dependentType,
                label: `Add New ${getModelLabel(dependentType)}`,
                callback: () => {_handleDialog(dependentType)}
            }
        })
        .concat([
            dependentTypes.includes('historic_captures')
                ? {
                    icon: 'import',
                    type: 'historic_captures',
                    label: `Import ${getModelLabel('historic_captures', 'label')}`,
                    callback: () => {_handleDialog('import_hc')}
                } : '',
            dependentTypes.includes('modern_captures')
                ? {
                    icon: 'import',
                    type: 'modern_captures',
                    label: `Import ${getModelLabel('modern_captures', 'label')}`,
                    callback: () => {_handleDialog('import_mc')}
                } : ''
        ])
        .filter(item => !!item);

    return <div className={`h-menu ${className}`}>
        <ul>
            {
                id && metadata && visible.includes('show') &&
            <li key={`${menuID}_node_menuitem_show`}>
                <Button
                    label={compact ? '' : 'View'}
                    size={size}
                    icon={'show'}
                    title={`View ${modelLabel} details.`}
                    onClick={() => {
                        _handleDialog('show')
                    }}
                />
            </li>
            }
            {
                // redirect to node page
                model && id && visible.includes('redirect') &&
                <li key={`${menuID}_node_menuitem_redirect`}>
                    <Button
                        label={compact ? '' : 'Go'}
                        size={size}
                        icon={'externalLink'}
                        title={`Go to ${modelLabel} page.`}
                        onClick={() => { redirect(createNodeRoute(model, 'show', id)) }}
                    />
                </li>
            }
            {
                ( ( id && isCaptureType(model) ) || visible.includes('iat')) &&
                <li key={`${menuID}_node_menuitem_iat`}>
                    <Button
                        label={compact ? '' : 'Use IAT'}
                        size={size}
                        icon={'iat'}
                        title={`Use Image Analysis Toolkit dialog.`}
                        onClick={() => { _handleDialog('iat') }}
                    />
                </li>
            }
            {
                // Download bulk images for station
                isEditor && id && model === 'stations' &&
                <li key={`${menuID}_node_menuitem_download_bulk`}>
                    <Button
                        label={compact ? '' : 'Bulk Download'}
                        size={size}
                        icon={'bulk_download'}
                        title={`Download Files for ${modelLabel}.`}
                        onClick={() => { _handleDialog('bulkDownload') } }
                    />
                </li>
            }
            {
                // add dropdown menu for adding dependent nodes (exclude images)
                isAdmin && visible.includes('new') && !isImageType(model) &&
                <li key={`${menuID}_node_menuitem_add_new`}>
                    {
                        addItems.length > 0
                            ? <Dropdown compact={compact} label={'Add New'} size={size} icon={'add'} items={addItems} />
                            : <Button
                                label={compact ? '' : 'Add New'}
                                size={size}
                                icon={'add'}
                                title={`Add new ${modelLabel}.`}
                                onClick={() => {_handleDialog('new')}}
                            />
                    }
                </li>
            }
            {
                // Edit node metadata/media
                isAdmin && id && metadata && visible.includes('edit') &&
                <li key={`${menuID}_node_menuitem_edit`}>
                    <Button
                        label={compact ? '' : 'Edit'}
                        size={size}
                        icon={'edit'}
                        title={`Edit ${modelLabel}.`}
                        onClick={() => { _handleDialog('edit') } }
                    />
                </li>
            }
            {
                // Download raw media file
                isEditor && id && (isImageType(model) || visible.includes('download')) &&
                <li key={`${menuID}_node_menuitem_download_raw_file`}>
                    <Download
                        label={compact ? '' : 'Download'}
                        size={size}
                        filename={`${filename}.zip`}
                        format={'zip'}
                        route={`/files/download/raw?${model}=${id}`}
                        callback={callback}
                    />
                </li>
            }
            {
                // Download public media file
                !isEditor && id && (isImageType(model) || visible.includes('download')) &&
                <li key={`${menuID}_node_menuitem_download_file`}>
                    <Download
                        label={compact ? '' : 'Download'}
                        size={size}
                        filename={`${filename}.zip`}
                        format={'zip'}
                        route={`/files/download/bulk/${id}`}
                        callback={callback}
                    />
                </li>
            }
            {
                // Remove node
                isAdmin && id && metadata && visible.includes('remove') &&
                <li key={`${menuID}_node_menuitem_remove`}>
                    <Button
                        label={compact ? '' : 'Delete'}
                        size={size}
                        icon={'delete'}
                        title={`Delete this ${modelLabel}.`}
                        onClick={() => { _handleDialog('remove') }}
                    />
                </li>
            }
        </ul>
    </div>;
};

export default React.memo(EditorMenu);