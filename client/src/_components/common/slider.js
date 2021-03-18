/*!
 * MLP.Client.Components.Common.Slider
 * File: slider.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { getFileLabel, getNodeLabel } from '../../_services/schema.services.client';
import Button from './button';
import Image from './image';

/**
 * Image slider component.
 *
 * @public
 * @param {Array} images
 * @return {JSX.Element}
 */

const Slider = ({images=[]}) => {

    // selected slide state
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const selectedImage = images[selectedIndex]
    const {url={}, file={}, metadata={}} = selectedImage || {};

    // increment/decrement index to make slide visible
    const prevSlide = () => {
        setSelectedIndex((selectedIndex - 1 + images.length) % images.length);
    }
    const nextSlide = () => {
        setSelectedIndex((selectedIndex + 1) % images.length);
    }

    return (
        <div className="slider">
            <Button icon={'prev'} className={'prev'} onClick={prevSlide} />
            <Button icon={'next'} className={'next'} onClick={nextSlide} />
            <div className={'slides'}>
                <div className={'numbertext'}>{selectedIndex}/{images.length}</div>
                {
                    <Image
                        key={`slide_${ selectedIndex }`}
                        url={url}
                        title={getNodeLabel(selectedImage)}
                        label={getNodeLabel(selectedImage)}
                        scale={'medium'}
                    />
                }
            </div>
            <div className={'caption'}>
                <p>
                    {getFileLabel(file) || ''}
                    {metadata.hasOwnProperty('image_state') ? ' [' + metadata.image_state + ']' : ''}
                </p>

            </div>
            <div className={'thumbnails'}>
                {
                    (images || []).map((image, index) => {
                        const { url={} } = image || {};
                        return (
                            <Image
                                key={`slide_button_${ index }`}
                                url={url}
                                title={getNodeLabel(image)}
                                label={getNodeLabel(image)}
                                scale={'thumb'}
                                onClick={()=>{setSelectedIndex(index)}}
                            />
                        )
                    })
                }
            </div>
        </div>
    )
}

export default Slider;