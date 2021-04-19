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

/**
 * Image selector widget.
 *
 * @public
 * @param {Array} captures
 * @param {Function} setSelected
 */

export const ImageSelector = ({
                                  canvasID='canvas0',
                                  selection={},
                                  setSelected = () => {},
                                  setToggle=()=>{}
                              }) => {

    const [selectedImage, setSelectedImage] = React.useState(null);

    // submit selection for canvas loading
    const _handleSubmit = () => {
        setSelected(initCanvas(canvasID, selectedImage));
        setToggle(false);
    }

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
            selectedImage &&
            <fieldset className={'submit'}>
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