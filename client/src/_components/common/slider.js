/*!
 * MLP.Client.Components.Common.Slider
 * File: slider.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { getNodeLabel } from '../../_services/schema.services.client';
import Button from './button';
import Image from './image';
import { getNodeURI } from '../../_utils/paths.utils.client';

/**
 * Image slider component.
 *
 * @public
 * @param {Array} images
 * @return {JSX.Element}
 */

const Slider = ({images=[]}) => {

    // selected slide state
    const [selected, setSelected] = React.useState(0);
    let selectedImage = images[selected];
    const { url={} } = selectedImage || {};

    console.log('Images:', selectedImage.file.id, url['medium'])

    // increment/decrement visible slide
    const prevSlide = () => {
        setSelected((selected - 1 + images.length) % images.length);
    }

    const nextSlide = () => {
        setSelected((selected + 1) % images.length);
    }

    return (
        <div className="slider">
            <div className={'slides'}>
                <div className={'numbertext'}>{selected}/{images.length}</div>
                {
                    (images || []).map((image, index) => {
                        const {url={}} = image || {};
                        return (
                            selected === index ?
                            <Image
                                key={`slide_${ index }`}
                                url={url}
                                title={getNodeLabel(image)}
                                label={getNodeLabel(image)}
                                scale={'medium'}
                            /> : ''
                        )
                    })
                }
            </div>
            <Button icon={'prev'} className={'prev'} onClick={prevSlide} />
            <Button icon={'next'} className={'next'} onClick={nextSlide} />

            <div className={'caption'}>
                <p>
                    {
                        //images[toggle].
                        'caption'
                    }
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
                                onClick={()=>{setSelected(index)}}
                            />
                        )
                    })
                }
            </div>
        </div>
    )
}

export default Slider;