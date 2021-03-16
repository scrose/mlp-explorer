/*!
 * MLP.Client.Components.Common.View.Files
 * File: files.view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { useRouter } from '../../_providers/router.provider.client';
import Form from '../common/form';
import NotfoundError from '../error/notfound.error';
import Loading from '../common/loading';
import ServerError from '../error/server.error';
import { sanitize } from '../../_utils/data.utils.client';
import { genSchema, getModelLabel } from '../../_services/schema.services.client';
import File from '../common/file';
import Table from '../common/table';


/**
 * View file records associated with a node as tabs.
 *
 * @public
 * @return {JSX.Element}
 */

export const FilesGallery = ({files}) => {
    return (
        files.length > 0
            ?   <div className={'gallery h-menu'}>
                <ul>
                    {
                        files.map(fileData =>
                            <li key={fileData.file.id}>
                                <File data={fileData} scale={'thumb'} />
                            </li>)
                    }
                </ul>
            </div>
            : ''
    )
}

/**
 * Build requested file(s) view.
 *
 * @param {Object} files
 * @param {String} view
 * @param {String} render
 * @public
 */

export const FilesView = ({files, view, render }) => {

    // select default form callback for view
    const api = useRouter();
    const callback = api.post;

    // view components indexed by render type
    const renders = {
        form: () => (
            <Form
                view={view}
                model={'files'}
                data={files}
                callback={callback}
            />),
        item: () => (
            <File
                index={'0'}
                data={files || ''}
                scale={'thumb'}
            />),
        list: () => (
            <FilesGallery
                files={files || []}
            />),
        table: () => (
            <CaptureImagesTable
                files={files || []}
            />),
        notFound: () => <NotfoundError />,
        serverError: () => <ServerError />
    }

    // render files view
    return (
        <div className={'files'}>
            {
                renders.hasOwnProperty(render) ? renders[render]() : <Loading/>
            }
        </div>
    )
}

export default FilesView;
