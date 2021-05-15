/*!
 * MLP.Client.Components.Common.Slider
 * File: slider.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Button from './button';
import Image from './image';
import Dialog from './dialog';
import { getModelLabel } from '../../_services/schema.services.client';

/**
 * Image slider component.
 *
 * @public
 * @param {Array} images
 * @return {JSX.Element}
 */

const Slider = ({ images = [] }) => {

    // selected slide state
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const [expandImage, setExpandImage] = React.useState(false);
    const selectedImage = images[selectedIndex];
    const { file={}, url = {}, metadata = {}, label = '' } = selectedImage || {};
    const {file_type=''} = file || {};

    // increment/decrement index to make slide visible
    const prevSlide = () => {
        setSelectedIndex((selectedIndex - 1 + images.length) % images.length);
    };
    const nextSlide = () => {
        setSelectedIndex((selectedIndex + 1) % images.length);
    };

    return (
        Object.keys(url).length > 0 &&
        <div className="slider">
            <Button icon={'prev'} className={'prev'} onClick={prevSlide} />
            <Button icon={'next'} className={'next'} onClick={nextSlide} />
            <div className={'slides'}>
                <div className={'numbertext'}>{selectedIndex + 1}/{images.length}</div>
                <div className={'expand-image'}><Button icon={'enlarge'} onClick={()=>{
                    setExpandImage(true)
                }} /></div>
                {
                    <Image
                        key={`slide_${selectedIndex}`}
                        url={url}
                        title={label}
                        label={label}
                        scale={'medium'}
                    />
                }
            </div>
            <div className={'caption'}>
                <p>
                    {label}
                    {metadata.hasOwnProperty('image_state') ? ' [' + metadata.image_state + ']' : ''}
                </p>

            </div>
            <div className={'thumbnails h-menu'}>
                <ul>
                {
                    (images || []).map((image, index) => {
                        const { url = {}, label = '' } = image || {};
                        return (
                            <li key={`slide_button_${index}`}>
                                <Image
                                    url={url}
                                    title={label}
                                    label={label}
                                    scale={'thumb'}
                                    onClick={() => {
                                        setSelectedIndex(index);
                                    }}
                                />
                            </li>
                        );
                    })
                }
                </ul>
            </div>
            {
                expandImage &&
                <Dialog
                    title={`${getModelLabel(file_type)}: ${label}`}
                    setToggle={setExpandImage}>
                    <Image
                        key={`slide_${selectedIndex}`}
                        url={url}
                        title={label}
                        scale={'medium'}
                    />
                </Dialog>
            }
        </div>
    );
};

export default Slider;