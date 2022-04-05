/*!
 * MLP.Client.Components.Common.Carousel
 * File: carousel.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import Button from './button';
import Image from './image';
import Dialog from './dialog';
import { getModelLabel } from '../../_services/schema.services.client';
import {useRouter} from "../../_providers/router.provider.client";
import {createNodeRoute} from "../../_utils/paths.utils.client";
import {useData} from "../../_providers/data.provider.client";

/**
 * Image carousel component.
 *
 * @public
 * @param {Array} images
 * @param thumbnails
 * @param navigation
 * @param fit
 * @param autoslide
 * @param titles
 * @param captions
 * @param expandable
 * @return {JSX.Element}
 */

const Carousel = ({
                      images = [],
                      thumbnails = true,
                      slideshow=false,
                      fit='contain',
                      autoslide=null,
                      titles=[],
                      captions=[],
                      expandable=true,
                      draggable=false
                  }) => {

    // selected slide state
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const [expandImage, setExpandImage] = React.useState(false);
    const selectedImage = images[selectedIndex];
    const { file={}, url={}, label='' } = selectedImage || {};
    const { owner_id='', owner_type='', file_type='', id='' } = file || {};

    const router = useRouter();
    const api = useData();

    // create view link for selected image
    const isImage = api.model === 'historic_captures' || api.model === 'modern_captures';
    const link = createNodeRoute(
        isImage ? file_type : owner_type,
        'show',
        isImage ? id: owner_id
    )

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
            {
                images.length > 0 && <div className={'slides fade'}>
                    {
                        images.map((img, index) => {
                            const {url = null} = img || {};
                            return <div
                                key={`slide_${index}`}
                                className={`slide fade`}
                                style={{
                                    opacity: index === selectedIndex ? 1.0 : 0,
                                    position: index === selectedIndex ? 'relative' : 'absolute'
                                }}
                            >
                                <Image
                                    url={url}
                                    scale={'medium'}
                                    fit={fit}
                                    onClick={() => {
                                        return slideshow ? null : router.update(link)
                                    }}
                                />
                            </div>
                        })
                    }
                    <div className={'numbertext'}>{selectedIndex + 1}/{images.length}</div>
                    {
                        expandable && <div className={'expand-image'}><Button icon={'enlarge'} onClick={() => {
                            setExpandImage(true);
                        }}/></div>
                    }
                </div>
            }
            {
                !slideshow && images.length > 0 && titles.length === images.length
                && <div className={'slide-menu h-menu vcentered'}>
                    <ul>
                        <li><Button icon={'prev'} className={'prev'} onClick={prevSlide} /></li>
                        <li><Button
                            label={'Click to View'}
                            title={'View Capture Details'}
                            className={'capture-button'}
                            icon={file_type}
                            onClick={()=>{router.update(link)}}
                        /></li>
                        <li><a href={link}>{titles[selectedIndex]}</a></li>
                        <li className={'push'}><Button icon={'next'} className={'next'} onClick={nextSlide} /></li>
                    </ul>
                </div>
            }
            {
                thumbnails
                    ?
                    <div className={'thumbnails h-menu'}>
                        <ul>
                            {
                                (images || []).map((image, index) => {
                                    const {url = null, file=null, label=''} = image || {};
                                    const { owner_id='', owner_type='' } = file || {};
                                    return (
                                        <li
                                            key={`slide_button_${index}`}
                                            draggable={draggable}
                                            onDragStart={(e) => {
                                                // attach node metadata to data transfer object
                                                e.dataTransfer.setData(
                                                    'application/json',
                                                    JSON.stringify({
                                                        id: owner_id, model: owner_type, label: titles[index] || label
                                                    })
                                                );
                                            }}
                                        >
                                            {
                                                draggable &&
                                                    <Button
                                                        className={'move capture-draggable'}
                                                        icon={'move'}
                                                        title={`Move ${titles[index] || label}.`}
                                                    />
                                            }
                                            <Image
                                                url={url}
                                                title={titles[index] || label}
                                                caption={titles[index] || label}
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
                    <div className={'slide-menu h-menu vcentered'}>
                        <ul>
                            <li><Button icon={'prev'} className={'prev'} onClick={prevSlide} /></li>
                            <li style={{flexGrow: 1}} className={'centred'}>
                                <div className={'dots'}>
                                    {
                                        (images || []).map((image, index) => {
                                            return (
                                                <span
                                                    key={`carousel_img_${index}`}
                                                    className={`dot${index === selectedIndex ? ' active' : ''}`}
                                                    onClick={() => {setSelectedIndex(index)}}
                                                />);
                                        })
                                    }
                                </div>
                            </li>
                            <li className={'push'}><Button icon={'next'} className={'next'} onClick={nextSlide} /></li>
                        </ul>
                    </div>
            }
            {
                slideshow && images.length > 0 && captions.length === images.length && captions[selectedIndex] &&
                <div className={'caption'}>
                    <p>{captions[selectedIndex]}</p>
                </div>
            }
            {
                images.length === 0 && <div>
                    <h4>No Images Found</h4>
                    <Image
                        scale={'medium'}
                        fit={fit}
                        title={'No Images Found'}
                        caption={'No Images Found'}
                    />
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
                        title={label}
                        scale={'medium'}
                    />
                </Dialog>
            }
        </div>
    );
};

export default Carousel;