/*!
 * MLP.Client.Components.IAT.ImageSelector
 * File: imgselector.iat.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import Accordion from '../common/accordion';
import Button from '../common/button';
import Image from '../common/image';
import Input from '../common/input';
import { UserMessage } from '../common/message';
import { sanitize, sorter } from '../../_utils/data.utils.client';
import Table from '../common/table';
import { useData } from '../../_providers/data.provider.client';
import { initPanel } from './iat';
import { createNodeRoute } from '../../_utils/paths.utils.client';
import { useRouter } from '../../_providers/router.provider.client';
import Tabs from '../common/tabs';
import Loading from '../common/loading';
import { useUser } from '../../_providers/user.provider.client';

/**
 * Image selector widget. Used to select an image to load into the panel:
 * - from a local file
 * - from the MLP library via the API
 *
 * @public
 * @param {Object} properties
 * @param otherProperties
 * @param options
 * @param setToggle
 * @param callback
 */

export const ImageSelector = ({
                                  properties={},
                                  otherProperties={},
                                  options = {},
                                  setToggle = () => {},
                                  callback = () => {
                                  },
                              }) => {

    const router = useRouter();
    const user = useUser();

    const _isMounted = React.useRef(false);
    const [selectedImage, setSelectedImage] = React.useState(null);
    const [message, setMessage] = React.useState(null);
    const allowedFileTypes = Object.keys(options.formats || {}).map(key => {
        return options.formats[key].value;
    });

    // set image selection state
    const [selection, setSelection] = React.useState(null);

    // check if a capture is loaded in the other panel
    const isCapture = otherProperties.file_type === 'historic_images' || otherProperties.file_type === 'modern_images';

    // get name from file
    const selectedFile = selectedImage && selectedImage.hasOwnProperty('filename')
        ? selectedImage.filename
        : '';

    /**
     * Load corresponding images for mastering (if requested)
     */

    React.useEffect(() => {
        _isMounted.current = true;

        // requires user authentication
        if (!user) return () => {};

        const _loader = () => {
                router.get(createNodeRoute(otherProperties.file_type, 'master', otherProperties.files_id))
                    .then(res => {
                        if (_isMounted.current) {
                            if (!res || res.error) {
                                return res.hasOwnProperty('error')
                                        ? setMessage(res.error)
                                        : setMessage({ msg: 'Error occurred.', type: 'error' }
                                        );
                            }

                            // get capture data (if available)
                            const { response = {} } = res || {};
                            const { data = [] } = response || {};

                            // no capture data is available
                            if (data.length === 0) {
                                setMessage({ msg: `No ${properties.file_type} available.` });
                            }

                            // set selection captures:
                            // - for modern images, necessary to collect captures for all locations
                            setSelection(data);
                        }
                    });
        }

        // proceed if panel properties are available
        if (properties && isCapture) {
            // Initialize available capture image selection for given capture image
            _loader();
        }
        if (selectedFile) {
            setMessage({ msg: `Image ${selectedFile} selected.`, type: 'info' });
        }
        return () => {
            _isMounted.current = false;
        };
    }, [
        user,
        isCapture,
        properties,
        otherProperties,
        router,
        setSelection,
        callback,
        setMessage,
        selectedFile
    ]);

    // submit selection for canvas loading
    const _handleSubmit = () => {
        callback(initPanel(properties.id, properties.label, selectedImage));
        setToggle(false);
    };

    // update selected image file for canvas loading
    const _handleChange = (e) => {
        // reset error message
        setMessage(null);

        // reject empty file list
        if (!e.target || !e.target.files) {
            return;
        }

        // Get requested image file
        const { target = {} } = e || {};

        // get metadata (for capture images)
        const { files_id = {} } = selectedImage || {};

        // get local file data
        const file = target.files[0] || {};

        // Handle TIFF images
        if (file.hasOwnProperty('type') || allowedFileTypes.includes(file.type)) {
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
        } else {
            setMessage({msg: `Image format is not supported.`, type:'error'});
        }
    };

    return <>
        {
            message && <UserMessage onClose={()=>{setMessage(null)}} closeable={true} message={message} />
        }
        {
            isCapture && user && <>
                { Array.isArray(selection)
                    ? (
                        selection.length > 0
                            ? <Accordion label={'Select Capture Image'} type={'image'} open={true}>
                                <CaptureSelector
                                    fileType={otherProperties.file_type}
                                    selection={selection}
                                    setSelectedImage={setSelectedImage}
                                    onSubmit={_handleSubmit}
                                />
                            </Accordion>
                            : <div className={'msg error'}>No captures available.</div>
                    )
                    : <Loading />
                }
                </>
        }
        <Accordion label={'Select Image'} type={'image'} open={true}>
            <Input
                type={'file'}
                name={'image_file'}
                value={{importFiles: { name: selectedFile }}}
                files={[selectedFile]}
                onChange={_handleChange}
            />
        </Accordion>
        {
            <fieldset className={'submit h-menu'}>
                <ul>
                    {
                        selectedImage &&
                        <li key={'submit_selector'}><Button
                            icon={'download'}
                            label={'Load Image'}
                            onClick={_handleSubmit}
                        /></li>
                    }
                    <li key={'cancel_selector'}>
                        <Button
                            icon={'cancel'}
                            label={'Cancel'}
                            onClick={() => {
                                callback();
                                setToggle(false);
                            }}
                        />
                    </li>
                </ul>
            </fieldset>
        }
    </>;
};


/**
 * Image selector widget.
 *
 * @public
 * @param fileType
 * @param {Array} selection
 * @param setSelectedImage
 * @param onSubmit
 */

export const CaptureSelector = ({ fileType, selection, setSelectedImage, onSubmit }) => {

    const [imageIndex, setImageIndex] = React.useState(0);

    if (!Array.isArray(selection)) return null;

    // handle thumbnail click
    const _handleClick = (id, tabIndex, data) => {
        setImageIndex(id);
        setSelectedImage(data);
    };

    // collect capture selection
    const _items = selection
        .sort(sorter)
        .map((capture, index) => {
            const { files = {}, label = '' } = capture || {};
            const { historic_images = [], modern_images=[]  } = files || {};

            return {
                label: label,
                data: <CaptureImagesSelector
                        files={ fileType === 'modern_images' ? historic_images : modern_images }
                        imageIndex={imageIndex}
                        captureIndex={index}
                        onClick={_handleClick}
                        onDblClick={onSubmit}
                    />
            }
        });

    return _items.length > 0
        ?
        <Tabs
            orientation={'horizontal'}
            items={_items}
            className={'selector'}
        />
        : <Loading />

};


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
                                          captureIndex,
                                          onClick = () => {},
                                          onDblClick = () => {},
                                      }) => {
    const api = useData();

    // prepare capture images columns
    const cols = [
        { name: 'thumbnail', label: 'Image', class: 'image-thumbnail' },
        { name: 'image_state', label: 'State' },
        { name: 'width', label: 'Width' },
        { name: 'height', label: 'Height' },
        { name: 'file_size', label: 'File Size' },
    ];

    // prepare capture image data rows
    const rows = files.map(fileData => {
        const { file = {}, metadata = {}, url = {}, filename = '' } = fileData || {};
        const { id = {} } = file || {};
        const { image_states = [] } = api.options || {};
        // select image state label for value (if available)
        const imageState = image_states.find(opt => opt.value === metadata.image_state);
        const rows = {
            thumbnail: <label
                className={imageIndex === id ? 'selected' : ''}
                key={`label_selection`}
                htmlFor={id}
            >
                <input
                    readOnly={true}
                    checked={imageIndex === id}
                    type={'radio'}
                    name={'historic_captures'}
                    id={id}
                    value={id}
                    style={{display: 'none'}}
                    onClick={() => {
                        onClick(id, captureIndex, fileData);
                    }}
                >
                </input>
                <Image
                    url={url}
                    scale={'thumb'}
                    title={`Select ${filename || ''}.`}
                    caption={filename}
                    onClick={() => {
                        onClick(id, captureIndex, fileData);
                    }}
                    onDoubleClick={onDblClick}
                />
            </label>,
            image_state: imageState && imageState.hasOwnProperty('label') ? imageState.label : 'n/a',
            width: sanitize(metadata.x_dim, 'imgsize'),
            height: sanitize(metadata.y_dim, 'imgsize'),
            file_size: sanitize(file.file_size, 'filesize'),
        };
        // include file size in metadata
        metadata.file_size = file.file_size;

        return rows;
    });

    return <Table rows={rows} cols={cols} className={'files'} />;
};


