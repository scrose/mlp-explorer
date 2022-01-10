/*!
 * MLP.Client.Components.Views.Image
 * File: image.view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import MetadataView from './metadata.view';
import Accordion from '../common/accordion';
import File from '../common/file';
import {useUser} from "../../_providers/user.provider.client";
import {useRouter} from "../../_providers/router.provider.client";
import {useData} from "../../_providers/data.provider.client";
import Image from "../common/image";
import {createNodeRoute, getExtension} from "../../_utils/paths.utils.client";
import {sanitize} from "../../_utils/data.utils.client";
import EditorMenu from "../menus/editor.menu";
import Table from "../common/table";


/**
 * View available versions of capture images.
 * - The option to master an image version is available for
 *   modern capture images only.
 *
 * @public
 * @param {String} model
 * @param {String} type
 * @param {Object} owner
 * @param {Array} files
 * @return {JSX.Element}
 */

export const ImagesTable = ({type, owner, files=[]}) => {

    const user = useUser();
    const router = useRouter();
    const api = useData();

    // prepare capture images columns
    const cols = [
        { name: 'thumbnail', label: 'Image', class: 'image-thumbnail'},
        { name: 'mime_type', label: 'Format'},
        { name: 'width', label: 'Width'},
        { name: 'height', label: 'Height'},
        { name: 'file_size', label: 'File Size'}
    ];

    // include editor menu for logged-in users
    if (user) {
        cols.push({ name: 'menu', label: 'Edit Options' })
    }

    // prepare capture image data rows
    const rows = files.map(fileData => {

        const { file={}, metadata={}, url={}, label='', filename='' } = fileData || {};
        const {file_type='', id=''} = file || {};
        const { image_states=[] } = api.options || {};

        // select image state label for value (if available)
        const imageState = image_states
            .find(opt => opt.value === metadata.image_state) || { label: metadata.image_state };

        // create table row data
        const row = {
            thumbnail: <Image
                url={url}
                scale={'thumb'}
                title={filename}
                caption={filename}
                onClick={()=>{
                    router.update(createNodeRoute(file_type, 'show', id))
                }}
            />,
            mime_type: metadata.mimetype || getExtension(filename),
            width: sanitize(metadata.x_dim, 'imgsize'),
            height: sanitize(metadata.y_dim, 'imgsize'),
            file_size: sanitize(file.file_size, 'filesize')
        };

        // include select file metadata
        metadata.filename = file.filename;
        metadata.file_size = file.file_size;
        metadata.mimetype = file.mimetype;

        // add editor menu for logged-in users
        if (user) {
            row.menu =  <EditorMenu
                fileType={type}
                filename={filename}
                model={type}
                id={id}
                owner={owner}
                label={label}
                metadata={metadata}
            />;
        }
        return row;
    });

    return  rows.length > 0
        ? <Table rows={rows} cols={cols} className={'files'} />
        : <div>No Images</div>
}

/**
 * Single image view component.
 *
 * @public
 * @param {Object} data
 * @param {String} model
 * @return {JSX.Element}
 */

const ImageView = ({data, model}) => {
    const { node={}, file={}, metadata={}, label='', owner={} } = data || {};
    return (
        <>
            <Accordion
                type={'show'}
                label={`${label} Metadata`}
                hasDependents={true}
                open={false}
            >
                <MetadataView
                    model={model}
                    owner={owner}
                    node={node}
                    metadata={metadata}
                    file={file}
                />
            </Accordion>
            <File
                data={data}
                scale={'medium'}
                owner={owner}
            />
        </>
    )
}

export default ImageView;
