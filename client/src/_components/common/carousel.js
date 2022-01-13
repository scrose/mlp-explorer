/*!
 * MLP.Client.Components.Common.Carousel
 * File: carousel.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Button from './button';
import Image from './image';
import Dialog from './dialog';
import { getModelLabel } from '../../_services/schema.services.client';
import Loading from "./loading";
import {useRouter} from "../../_providers/router.provider.client";
import {createNodeRoute} from "../../_utils/paths.utils.client";

/**
 * Image carousel component.
 *
 * @public
 * @param {Array} images
 * @param menu
 * @param display
 * @return {JSX.Element}
 */

const Carousel = ({
                    images = [],
                    menu = true,
                    fit='contain',
                    autoslide=null,
                    captions=[],
                    expandable=true
}) => {

    // selected slide state
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const [expandImage, setExpandImage] = React.useState(false);
    const selectedImage = images[selectedIndex];
    const { file={}, url = {}, label = '', title = '' } = selectedImage || {};
    const { file_type='' } = file || {};

    const router = useRouter();

    // auto-increment slideshow
    React.useEffect(() => {
        const timer = autoslide ? setTimeout(() => {
                setSelectedIndex((selectedIndex + 1) % images.length);
            }, autoslide) : null;
        return () => {
            clearTimeout(timer);
        };
    }, [selectedIndex, images.length, setSelectedIndex, autoslide]);

    // increment/decrement index to make slide visible
    const prevSlide = () => {
        setSelectedIndex((selectedIndex - 1 + images.length) % images.length);
    };
    const nextSlide = () => {
        setSelectedIndex((selectedIndex + 1) % images.length);
    };

    return (
        <div className="carousel">
            <div className={'slides'}>
                { images.length === 0 && <Loading /> }
                {
                    images.map((img, index) => {
                        const { file={}, url={} } = img || {};
                        const { owner_type='', owner_id='' } = file || {};
                        return <div
                                key={`slide_${index}`}
                                className={'fade'}
                                style={{display: index === selectedIndex ? 'block' : 'none'}}
                            >
                            <Image
                                url={url}
                                scale={'medium'}
                                fit={fit}
                                onClick={()=>{
                                    if (owner_type && owner_id)
                                        router.update(createNodeRoute(owner_type, 'show', owner_id));
                                }}
                            />
                        </div>
                    })
                }
                <div className={'numbertext'}>{ selectedIndex + 1 }/{images.length}</div>
                {
                    expandable && <div className={'expand-image'}><Button icon={'enlarge'} onClick={() => {
                        setExpandImage(true);
                    }}/></div>
                }
            </div>
            {
                captions.length === images.length && <div className={'slide-menu h-menu vcentered'}>
                    <ul>
                        <li><Button icon={'prev'} className={'prev'} onClick={prevSlide} /></li>
                        <li><p>{captions[selectedIndex]}</p></li>
                        <li className={'push'}><Button icon={'next'} className={'next'} onClick={nextSlide} /></li>
                    </ul>
                </div>
            }
            {
                menu
                    ?
                    <div className={'thumbnails h-menu'}>
                        <ul>
                            {
                                (images || []).map((image, index) => {
                                    const {url = {}} = image || {};
                                    return (
                                        <li key={`slide_button_${index}`}>
                                            <Image
                                                url={url}
                                                title={captions[index]}
                                                caption={captions[index]}
                                                scale={'thumb'}
                                                onClick={() => {setSelectedIndex(index)}}
                                            />
                                        </li>
                                    );
                                })
                            }
                        </ul>
                    </div>
                    :
                    <div className={'dots'}>
                        {
                            (images || []).map((image, index) => {
                                return (
                                    <span
                                        key={`carousel_img_${index}`}
                                        className={`dot${index === selectedIndex ? ' active' : ''}`}
                                        onClick={() => {setSelectedIndex(index)}}
                                    />
                                );
                            })
                        }
                    </div>
            }
            {
                expandImage &&
                <Dialog
                    title={`${getModelLabel(file_type)}: ${label}`}
                    setToggle={setExpandImage}>
                    <Image
                        key={`slide_${selectedIndex}`}
                        url={url}
                        title={title || label}
                        scale={'medium'}
                    />
                </Dialog>
            }
        </div>
    );
};

export default Carousel;