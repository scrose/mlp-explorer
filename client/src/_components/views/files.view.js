/*!
 * MLP.Client.Components.Views.Files
 * File: files.view.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import File from '../common/file';
import Accordion from '../common/accordion';
import { getModelLabel } from '../../_services/schema.services.client';
import EditorMenu from '../menus/editor.menu';
import { useUser } from '../../_providers/user.provider.client';
import { sanitize } from '../../_utils/data.utils.client';
import Table from '../common/table';
import Badge from '../common/badge';

/**
 * File Table component.
 *
 * @public
 * @param {String} model
 * @param {Object} owner
 * @param {Array} files
 * @return {JSX.Element}
 */

export const FilesTable = ({owner, files=[]}) => {

    const user = useUser();

    // prepare capture images columns
    const cols = [
        { name: 'mime_type', label: 'Type' },
        { name: 'download', label: 'File' },
        { name: 'metadata_type', label: 'Metadata Type'},
        { name: 'file_size', label: 'File Size'}
    ];

    // include editor menu for logged-in users
    if (user) {
        cols.push({ name: 'menu', label: 'Edit Options' })
    }

    // prepare capture image data rows
    const rows = files.map(fileData => {
        const { metadata_type={}, file={}, label='' } = fileData || {};
        const {
            file_type='',
            id='',
            mimetype='-',
            filename='-',
            file_size='-',
            created_at='',
            updated_at=''
        } = file || {};
        const ext = filename.split('.').pop() || '';

        const rows = {
            mime_type: <Badge icon={ ext || 'file' } title={mimetype || ext} />,
            download: <File data={fileData} />,
            metadata_type: metadata_type && metadata_type.hasOwnProperty('label') ? metadata_type.label: '-',
            file_size: sanitize(file.file_size, 'filesize') || 'n/a'
        };

        // add editor menu for logged-in users
        rows.menu = <EditorMenu
            fileType={file_type}
            model={file_type}
            id={id}
            owner={owner}
            label={label}
            metadata={{
                files_id: id,
                file_size: file_size,
                type: metadata_type && metadata_type.hasOwnProperty('name') ? metadata_type.name : '-',
                mimetype: mimetype,
                file_type: file_type,
                filename: filename,
                created_at: created_at,
                updated_at: updated_at
            }} />
        return rows;
    });

    return  <Table rows={rows} cols={cols} className={'files'} />

}

/**
 * File list component.
 *
 * @public
 * @param {Array} files
 * @param {Object} owner
 * @return
 */

export const FilesList = ({files, owner}) => {
    return Array.isArray(files) && files.length > 0 &&
        <div className={'gallery h-menu'}>
            <ul>
                {
                    files
                        .map((fileData, index) =>
                        <li key={`gallery_file_${index}`}>
                            <File data={fileData} scale={'thumb'} owner={owner} />
                        </li>
                    )
                }
            </ul>
        </div>
}

/**
 * View file records associated with a node as tabs.
 *
 * @public
 * @return {unknown[]}
 */

export const FilesView = ({ files, owner }) => {

    // check for empty of invalid node list
    if (Object.keys(files).length === 0) return null;

    return Object.keys(files).map((fileType, index) => {
        return files[fileType].length > 0 &&
            <Accordion
                key={`${fileType}_${index}`}
                type={fileType}
                label={getModelLabel(fileType, 'label')}
                hasDependents={false}
                open={true}
                menu={
                    <EditorMenu
                        view={'files'}
                        model={owner.type}
                        id={owner.id}
                        owner={owner}
                        label={getModelLabel(fileType, 'label')}
                        dependents={[fileType]}
                    />
                }>
                {
                    fileType === 'metadata_files'
                        ? <FilesTable files={files[fileType]} owner={owner} />
                        : <FilesList files={files[fileType]} owner={owner} />
                }
            </Accordion>
    });
};

export default FilesView;
