/*!
 * MLP.Client.Components.IAT.Opener
 * File: opener.iat.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import Accordion from '../../common/accordion';
import Button from '../../common/button';
import InputSelector from '../../selectors/input.selector';
import { UserMessage } from '../../common/message';
import {useIat} from "../../../_providers/iat.provider.client";
import {initPanel} from "../panel/panel.init.iat";

/**
 * Image selector widget. Used to select a local image file to load into the panel.
 *
 * @public
 * @param {Object} properties
 * @param {Function} callback
 * @param {Function} cancel
 */

export const ImageOpener = ({id=null, callback = ()=>{}, cancel=()=>{}}) => {

    const iat = useIat();
    const panel = iat && id ? iat[id] : {};

    const [selectedImage, setSelectedImage] = React.useState(null);
    const [message, setMessage] = React.useState(null);
    const allowedFileTypes = Object.keys(iat.options.formats || {}).map(key => {
        return iat.options.formats[key].value;
    });

    // get name from file
    const selectedFile = selectedImage && selectedImage.hasOwnProperty('filename') ? selectedImage.filename : '';
    // submit selection for canvas loading
    const _handleSubmit = () => {
        callback(initPanel(panel.properties.id, panel.properties.label, selectedImage));
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

        <Accordion label={'Select Image'} type={'image'} open={true}>
            <InputSelector
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
                        <li key={'submit_selector'}>
                            <Button
                                icon={'load'}
                                label={'Open Image'}
                                onClick={_handleSubmit}
                            />
                        </li>
                    }
                    <li key={'cancel_selector'}>
                        <Button
                            icon={'cancel'}
                            label={'Cancel'}
                            onClick={cancel}
                        />
                    </li>
                </ul>
            </fieldset>
        }
    </>;
};

