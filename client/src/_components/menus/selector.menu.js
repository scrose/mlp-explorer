/*!
 * MLP.Client.Components.Menus.Selector
 * File: selector.menu.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Accordion from '../common/accordion';
import Button from '../common/button';
import Image from '../common/image';
import Input from '../common/input';
import Message from '../common/message';
import { sanitize, sorter } from '../../_utils/data.utils.client';
import Table from '../common/table';
import { useData } from '../../_providers/data.provider.client';
import { initCanvas } from '../tools/iat/iat';

/**
 * Image selector widget.
 *
 * @public
 * @param {Array} captures
 * @param {Function} setSelected
 */

export const ImageSelector = ({
                                  canvasID,
                                  selection={},
                                  setSelected = () => {},
                                  setToggle=()=>{}
                              }) => {

    const [selectedImage, setSelectedImage] = React.useState(null);
    const [error, setError] = React.useState(null);
    const allowedFileTypes = ['image/jpeg', 'image/png', 'image/tiff'];

    // submit selection for canvas loading
    const _handleSubmit = () => {
        setSelected(initCanvas(canvasID, selectedImage));
        setToggle(false);
    }

    // update selected image file for canvas loading
    const _handleChange = (e) => {
        // reset error message
        setError(null);

        // reject empty file list
        if (!e.target || !e.target.files) {
            return;
        }

        // Get requested image file
        const {target={}} = e || {};

        // get metadata (for capture images)
        const { files_id={} } = selectedImage || {};

        // get local file data
        const file = target.files[0];

        // Handle TIFF images
        if (allowedFileTypes.includes(file.type)) {
            // set canvas properties
            setSelectedImage({
                files_id: files_id,
                file: {
                    file_type: file.type,
                    file_size: file.size,
                },
                filename: file.name,
                fileData: target.files[0],
            });
        }
        else {
            setError(`Image format ${file.type} is not supported.`)
        }
    }

    // get name from file
    const selectedFile = selectedImage && selectedImage.hasOwnProperty('filename')
        ? selectedImage.filename
        : '';

    return <>
        {
            <Accordion label={'Select Image'} type={'image'} open={true}>
                <Message closeable={false} message={{ msg: error, type: 'error' }} />
                <Input
                    type={'file'}
                    name={'image_file'}
                    files={[selectedFile]}
                    onChange={_handleChange}
                />
            </Accordion>
        }
        {
            selection && Object.keys(selection).length > 0 &&
            <Accordion label={'Select Historic Image'} type={'historic_images'} open={false}>
                <CaptureSelector
                    selection={selection}
                    setSelectedImage={setSelectedImage}
                    onSubmit={_handleSubmit}
                />
            </Accordion>
        }
        {
            selectedImage &&
            <fieldset className={'submit'}>
                <Message
                    closeable={false}
                    message={{ msg: `Image ${selectedFile} selected.`, type: 'info' }}
                />
                <Button
                    label={'Load Image'}
                    onClick={_handleSubmit}
                />
            </fieldset>
        }
    </>;
};


/**
 * Image selector widget.
 *
 * @public
 * @param {Array} selection
 * @param setSelectedImage
 * @param onSubmit
 */

export const CaptureSelector = ({selection, setSelectedImage, onSubmit}) => {

    const [tabIndex, setTabIndex] = React.useState(0);
    const [imageIndex, setImageIndex] = React.useState(0);
    const [captureIndex, setCaptureIndex] = React.useState(-1);

    // destructure selected capture
    const selectedCapture = selection[tabIndex];
    const { node = {}, files = {} } = selectedCapture || {};
    const { historic_images = [] } = files || {};

    // handle thumbnail click
    const _handleClick = (id, data) => {
        setImageIndex(id);
        setCaptureIndex(tabIndex);
        setSelectedImage(data);
    }

    return <div className={`tab h-menu`}>
        <div className={`v-menu`}>
            <ul>
                {
                    selection
                        .sort(sorter)
                        .map((capture, index) => {
                            const { node = {}, label = '' } = capture || {};
                            return <li key={`tab_${node.id}`}>
                                <Button
                                    className={index === captureIndex ? 'active' : ''}
                                    icon={tabIndex === index ? 'collapse' : 'expand'}
                                    title={`View ${label}.`}
                                    label={label}
                                    onClick={() => {
                                        setTabIndex(index);
                                    }}
                                />
                            </li>;
                        })
                }
            </ul>
        </div>
        <div key={`tab_data_${node.id}`} className={'tab-data'}>
            <div className={'gallery h-menu capture-selector'}>
                <CaptureImagesSelector
                    files={historic_images}
                    imageIndex={imageIndex}
                    onClick={_handleClick}
                    onDblClick={onSubmit}
                />
            </div>
        </div>
    </div>
}

/**
 * Image selector widget.
 *
 * @public
 * @param {Array} captures
 * @param {Array} files
 */

export const CaptureImagesSelector = ({
                                          files,
                                          imageIndex,
                                          onClick=()=>{},
                                          onDblClick=()=>{}}) => {

    const api = useData();

    // prepare capture images columns
    const cols = [
        { name: 'thumbnail', label: 'Image', class: 'image-thumbnail'},
        { name: 'image_state', label: 'State'},
        { name: 'width', label: 'Width'},
        { name: 'height', label: 'Height'},
        { name: 'file_size', label: 'File Size'}
    ];

    // prepare capture image data rows
    const rows = files.map(fileData => {
        const { file={}, metadata={}, url={}, filename='' } = fileData || {};
        const { id={} } = file || {};
        const { image_states=[] } = api.options || {};
        // select image state label for value (if available)
        const imageState = image_states.find(opt => opt.value === metadata.image_state);
        const rows = {
            thumbnail: <label
                className={imageIndex ===  id ? 'active' : ''}
                key={`label_selection`}
                htmlFor={ id}
            >
                <input
                    readOnly={true}
                    checked={imageIndex === id}
                    type={'radio'}
                    name={'historic_captures'}
                    id={id}
                    value={id}
                    onClick={() => {onClick( id, fileData)}}
                >
                </input>
                <Image
                    url={url}
                    scale={'thumb'}
                    title={`Select ${filename || ''}.`}
                    label={filename}
                    onClick={() => {onClick(id, fileData)}}
                    onDoubleClick={onDblClick}
                />
            </label>,
            image_state: imageState && imageState.hasOwnProperty('label') ? imageState.label : 'n/a',
            width: sanitize(metadata.x_dim, 'imgsize'),
            height: sanitize(metadata.y_dim, 'imgsize'),
            file_size: sanitize(file.file_size, 'filesize')
        };
        // include file size in metadata
        metadata.file_size = file.file_size;

        return rows;
    });

    return <>
        <Table rows={rows} cols={cols} className={'files'} />
    </>
}


