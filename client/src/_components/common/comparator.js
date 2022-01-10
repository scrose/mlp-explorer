/*!
 * MLP.Client.Components.Common.Comparator
 * File: slider.js
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
import {FilesList} from "../views/files.view";
import File from "./file";
import Slider from "./slider";

/**
 * Image comparator component.
 *
 * @public
 * @param {Array} images
 * @param menu
 * @param display
 * @return {JSX.Element}
 */

const Comparator = ({
                    images = [],
                    menu = true,
                    fit='contain',
                    autoslide=null,
                    expandable=true
}) => {

    // selected slide state
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const [pairToggle, setPairToggle] = React.useState(false);
    const [viewerType, setViewerType] = React.useState('overlay');
    const [expandImage, setExpandImage] = React.useState(false);
    const selectedImage = images[selectedIndex];

    const router = useRouter();

    // retrieve image metadata
    const { historic_captures={}, modern_captures={} } = selectedImage || {};
    const selectedCapture = pairToggle ? historic_captures : modern_captures;
    const { refImage={} } = selectedCapture || {};
    const { label='', file={}, url='', title='' } = refImage;
    const  {file_type='' } = file;

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
    const prevPair = () => {
        setSelectedIndex((selectedIndex - 1 + images.length) % images.length);
    };
    const nextPair = () => {
        setSelectedIndex((selectedIndex + 1) % images.length);
    };

    const getViewer = function() {
        const viewers = {
            slider: () => {
                return <Slider images={[historic_captures, modern_captures]} />
            },
            default: () => {
                return <div>
                    <div className={'fade'} style={{display: pairToggle ? 'block' : 'none'}}>
                        <Image
                            url={historic_captures.refImage.url || ''}
                            scale={'medium'}
                            fit={fit}
                        />
                    </div>
                    <div className={'fade'} style={{display: !pairToggle ? 'block' : 'none'}}>
                        <Image
                            url={modern_captures.refImage.url || ''}
                            scale={'medium'}
                            fit={fit}
                        />
                    </div>
                </div>
            }
        }
        return viewers.hasOwnProperty(viewerType) ? viewers[viewerType]() : viewers.default();
    }

    return (
        <div className="slider">
            <div className={'slides'}>
                { images.length > 0 ? getViewer() : <Loading /> }
                <div className={'numbertext'}>{ selectedIndex + 1 }/{images.length}</div>
                {
                    expandable && <div className={'expand-image'}><Button icon={'enlarge'} onClick={() => {
                        setExpandImage(true);
                    }}/></div>
                }
            </div>
            {
                label && <div className={'caption h-menu vcentered'}>
                    <ul>
                        <li><Button icon={'prev'} className={'prev'} onClick={prevPair} /></li>
                        <li><Button
                            title={'View as Overlay'}
                            className={'capture-toggle'}
                            icon={'images'}
                            disabled={viewerType === 'overlay'}
                            onClick={()=>{setViewerType('overlay')}}
                        /></li>
                        <li><Button
                            title={'View in Slider'}
                            className={'capture-toggle'}
                            icon={'overlay'}
                            onClick={()=>{setViewerType('slider')}}
                            disabled={viewerType === 'slider'}
                        /></li>
                        {
                            viewerType === 'overlay' && <li><Button
                                className={'capture-toggle'}
                                icon={'sync'}
                                onClick={() => {
                                    setPairToggle(!pairToggle)
                                }}
                                label={pairToggle ? 'Modern' : 'Historic'}
                            /></li>
                        }
                        <li><p>{label}</p></li>
                        <li className={'push'}><Button icon={'next'} className={'next'} onClick={nextPair} /></li>
                    </ul>
                </div>
            }
            {
                menu
                    ?
                    <div className={'thumbnails comparisons h-menu'}>
                        <ul>
                            {
                                (images || []).map((imgPair, index) => {
                                    const { historic_captures={}, modern_captures={} } = imgPair || {};
                                    return (
                                        <li
                                            key={`slide_button_${index}`}
                                            onClick={(e) => {
                                                e.stopPropagation(); setSelectedIndex(index)}
                                            }
                                        >
                                            <div className={'h-menu comparison-pair'}>
                                                <ul>
                                                    <li>
                                                        <Image
                                                            scale={'thumb'}
                                                            caption={historic_captures.refImage.label}
                                                            url={historic_captures.refImage.url}
                                                        />
                                                    </li>
                                                    <li>
                                                        <Image
                                                            scale={'thumb'}
                                                            caption={modern_captures.refImage.label}
                                                            url={modern_captures.refImage.url}
                                                        />
                                                    </li>
                                                </ul>
                                            </div>
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
                                        key={`slider_img_${index}`}
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

export default Comparator;