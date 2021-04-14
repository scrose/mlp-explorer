/*!
 * MLP.Client.Components.Common.Slider
 * File: slider.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
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
    const {url={}, metadata={}, label=''} = selectedImage || {};

    // increment/decrement index to make slide visible
    const prevSlide = () => {
        setSelectedIndex((selectedIndex - 1 + images.length) % images.length);
    }
    const nextSlide = () => {
        setSelectedIndex((selectedIndex + 1) % images.length);
    }

    return (
        Object.keys(url).length > 0 &&
        <div className="slider">
            <Button icon={'prev'} className={'prev'} onClick={prevSlide} />
            <Button icon={'next'} className={'next'} onClick={nextSlide} />
            <div className={'slides'}>
                <div className={'numbertext'}>{selectedIndex + 1}/{images.length}</div>
                {
                    <Image
                        key={`slide_${ selectedIndex }`}
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
                {
                    (images || []).map((image, index) => {
                        const { url={}, file={}, label='' } = image || {};
                        return (
                            <Image
                                key={`slide_button_${ index }`}
                                url={url}
                                title={label}
                                label={label}
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