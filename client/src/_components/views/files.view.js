/*!
 * MLP.Client.Components.Common.View.File
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
import { groupBy, sanitize } from '../../_utils/data.utils.client';
import { genSchema, getModelLabel } from '../../_services/schema.services.client';
import File from '../common/file';
import Table from '../common/table';

/**
 * Group and sort file records by type.
 *
 * @public
 * @param {Array} files
 * @return {JSX.Element}
 */

const groupFiles = (files) => {

    files = (files || [])
        // // sort alphabetically
        .sort(function(a, b){
            // TODO sort station numbers in strings
            return a.file_type.localeCompare(b.file_type);
        });
    return groupBy(files, 'file_type');
}

/**
 * View file records associated with a node as tabs.
 *
 * @public
 * @return {JSX.Element}
 */

export const FilesList = ({files}) => {

    // group and sort files
    files = groupFiles(files) || {};

    return (
        Object.keys(files).length > 0
            ?   <div>
                {
                    Object.keys(files).map(key => {
                        return (
                            <div key={key} >
                                <h5>{getModelLabel(key, 'label')}</h5>
                                {
                                    files[key]
                                        .map((file) =>
                                            <File
                                                key={file.id}
                                                file={file}
                                                scale={'thumb'}
                                            />
                                        )
                                }
                            </div>
                        )
                    })
                }
            </div>
            : ''
    );
}

/**
 * View file records with metadata associated with a node as tabs.
 *
 * @public
 * @return {JSX.Element}
 */

export const FilesTable = ({files=[]}) => {

    files = groupFiles(files) || {};

    // prepare file metadata for table rows
    // - set render option for item fields
    // - returns row object indexed by field name
    const filterRows = (fileData, model) => {
        // get fields filtered by render setting
        const { fields = {} } = genSchema('table', model);

        // filter file record data by fields
        return fileData
            .map(file => {

                // destructure model data
                const {data={}} = file;

                // include thumbnail at start of row
                const row = {
                    thumbnail: <File file={file} metadata={data} scale={'thumb'} />
                }

                // include renderable metadata fields
                Object.keys(fields)
                    .filter(key => fields[key].render !== 'hidden')
                    .reduce((o, key) => {
                        // check if field is reference or model data
                        row[key] = data.hasOwnProperty(key)
                            ? sanitize(data[key], fields[key].render)
                            : sanitize(file[key], fields[key].render)
                        return o;
                }, {});

                return row;
            });
    }

    // prepare file metadata fields for table header
    // - omit hidden metadata fields
    // - returns col header object indexed by field name
    const filterCols = (model) => {

        // include column for thumbnail image
        const cols = [{ name: 'thumbnail', label: 'Image', }];
        const { fields = {} } = genSchema('table', model);
        return Object.keys(fields)
            .filter(key => fields[key].render !== 'hidden')
            .reduce((o, key) => {
                o.push(fields[key]);
                return o;
            }, cols);
    }

    return (
        Object.keys(files).length > 0
            ? <div>
                {
                    Object.keys(files).map(model => {
                        return (
                            <div key={model}>
                                <h5>{getModelLabel(model, 'label')}</h5>
                                <Table
                                    rows={ filterRows(files[model], model) }
                                    cols={ filterCols(model) }
                                    classname={'files'}
                                />
                            </div>
                        )
                    })
                }
            </div>
            : ''
    );
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
            <FilesList
                files={files || []}
            />),
        table: () => (
            <FilesTable
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
