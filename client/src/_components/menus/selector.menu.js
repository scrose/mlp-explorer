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
import { initCanvas } from '../common/canvas';
import Input from '../common/input';
import Messenger from '../common/messenger';
import { readTIFF } from '../../_utils/image.utils.client';

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

    // submit selection for canvas loading
    const _handleSubmit = () => {
        setSelected(initCanvas(canvasID, selectedImage));
        setToggle(false);
    }

    // update selected image file for canvas loading
    const _handleChange = (e) => {
        // reset error message
        setError(null);

        // Get requested image file
        const {target={}} = e || {};
        if (target.files && Object.keys(target.files).length > 0) {

            // get local file data
            const file = target.files[0];

            console.log(file.type)

            // Handle TIFF format images
            if (file.type === 'image/tiff') {
                (async function() {
                    try {
                        const tiff = await readTIFF(target.files[0]);
                        const image = await tiff.getImage();

                        // set canvas properties
                        setSelectedImage({
                            loaded: true,
                            file: {
                                file_type: file.type,
                                file_size: file.size,
                            },
                            metadata: {
                                x_dim: image.getWidth(),
                                y_dim: image.getHeight(),
                            },
                            filename: file.name,
                            url: '',
                            fileData: image,
                        });
                    }
                    catch (err) {
                        setError('TIFF file could not be read.')
                    }
                })();
                return;
            }
            if (['image/jpeg', 'image/png'].includes(file.type)) {
                // Non-TIFF formats
                setSelectedImage({
                    loaded: true,
                    file: {
                        file_type: file.type,
                        file_size: file.size
                    },
                    filename: file.name,
                    url: URL.createObjectURL(file),
                    fileData: null
                });
            }
            else {
                setError(`Image format ${file.type} is not supported.`)
            }
        }
    }

    // get name from file
    const selectedFile = selectedImage && selectedImage.hasOwnProperty('filename')
        ? selectedImage.filename
        : '';

    return <>
        {
            selection && Object.keys(selection).length > 0 &&
            <Accordion label={'Select Historic Image'} type={'historic_images'} open={true}>
                <CaptureSelector
                    selection={selection}
                    setSelectedImage={setSelectedImage}
                    onSubmit={_handleSubmit}
                />
            </Accordion>
        }
        {
            <Accordion label={'Select Image'} type={'image'} open={true}>
                <Messenger closeable={false} message={error} level={'error'} />
                <Input
                    type={'file'}
                    name={'image_file'}
                    files={[selectedFile]}
                    onChange={_handleChange}
                />
            </Accordion>
        }
        {
            selectedImage &&
            <fieldset className={'submit'}>
                <Messenger closeable={false} message={`Image ${selectedFile} selected.`} level={'info'} />
                <Button
                    label={'Load Image'}
                    onClick={_handleSubmit}
                />
            </fieldset>
        }
        </>;
};

const CaptureSelector = ({selection, setSelectedImage, onSubmit}) => {

    const [tabIndex, setTabIndex] = React.useState(0);
    const [imageIndex, setImageIndex] = React.useState(0);
    const [captureIndex, setCaptureIndex] = React.useState(0);

    // destructure selected capture
    const selectedCapture = selection[tabIndex];
    const { node = {}, files = {} } = selectedCapture || {};
    const { historic_images = [] } = files || {};

    return <div className={`tab h-menu`}>
        <div className={`v-menu`}>
            <ul>
                {
                    selection.map((capture, index) => {
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
                <ul>
                    {
                        historic_images.map(imgData => {
                            const { file = {}, url = {}, label = '' } = imgData || {};
                            return (
                                <li
                                    key={`capture_gallery_file_${file.id || ''}`}
                                >
                                    <label
                                        className={imageIndex === file.id ? 'active' : ''}
                                        key={`label_selection`}
                                        htmlFor={file.id}
                                    >
                                        <input
                                            readOnly={true}
                                            checked={imageIndex === file.id}
                                            type={'radio'}
                                            name={'historic_captures'}
                                            id={file.id}
                                            value={file.id}
                                            onClick={() => {
                                                setImageIndex(file.id);
                                                setCaptureIndex(tabIndex);
                                                setSelectedImage(imgData);
                                            }}>
                                        </input>
                                        <Image
                                            url={url}
                                            title={`Select ${file.filename || ''}.`}
                                            label={label}
                                            onClick={() => {
                                                setImageIndex(file.id);
                                                setCaptureIndex(tabIndex);
                                                setSelectedImage(imgData);
                                            }}
                                            onDoubleClick={onSubmit}
                                        />
                                    </label>
                                </li>
                            );
                        })
                    }
                </ul>
            </div>
        </div>
    </div>
}