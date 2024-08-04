/*!
 * MLE.Client.Components.Common.Comparator
 * File: comparator.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import Button from './button';
import Image from './image';
import Dialog from './dialog';
import { getModelLabel } from '../../_services/schema.services.client';
import Loading from "./loading";
import Slider from "./slider";
import {useWindowSize} from "../../_utils/events.utils.client";
import {createNodeRoute} from "../../_utils/paths.utils.client";
import {useRouter} from "../../_providers/router.provider.client";


/**
 * Image pair component.
 *
 * @public
 * @param {Boolean} selected
 * @param {Object} historicImage
 * @param {Object} modernImage
 * @return
 */

const ImagePair = ({
                       selected = false,
                       historicImage,
                       modernImage
                   }) => {

    const pairRef = React.useRef();

    // auto-increment slideshow
    // scroll to current top node
    React.useEffect(() => {
        if ( pairRef.current && selected) {
            pairRef.current.scrollIntoView();
        }
        return () => {};
    }, [selected]);

    return <div ref={pairRef} className={`h-menu comparison-pair ${selected ? 'active' : ''}`}>
        <ul>
            <li>
                <Image
                    scale={'thumb'}
                    caption={historicImage.label || ''}
                    url={historicImage.url || ''}
                />
            </li>
            <li>
                <Image
                    scale={'thumb'}
                    caption={modernImage.label || ''}
                    url={modernImage.url || ''}
                />
            </li>
        </ul>
    </div>

}
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
                        autoslide=null,
                        expandable=true
                    }) => {

    // selected slide state
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const [pairToggle, setPairToggle] = React.useState(false);
    const [expandImage, setExpandImage] = React.useState(false);
    const [panelWidth, setPanelWidth] = React.useState(0);
    const [panelHeight, setPanelHeight] = React.useState(0);
    let selectedImage = images[selectedIndex];
    const slidePanel = React.useRef();

    // get router
    const router = useRouter();

    // window dimensions
    const [winWidth, winHeight] = useWindowSize();

    // retrieve image metadata
    const { historic_captures={}, modern_captures={} } = selectedImage || {};
    const selectedCapture = pairToggle ? historic_captures : modern_captures;
    const { refImage={} } = selectedCapture || {};
    const { label='', file={}, url='', title='' } = refImage;
    const { file_type='', owner_id='', owner_type='' } = file;

    // create view link for selected image
    const link = createNodeRoute(owner_type, 'show', owner_id)

    // auto-increment slideshow
    React.useEffect(() => {
        const timer = autoslide ? setTimeout(() => {
            setSelectedIndex((selectedIndex + 1) % images.length);
        }, autoslide) : null;
        return () => {
            clearTimeout(timer);
        };
    }, [selectedIndex, images.length, setSelectedIndex, autoslide]);

    // panel dimensions
    React.useEffect(() => {
        if (slidePanel.current) {
            setPanelWidth(slidePanel.current.offsetWidth);
            setPanelHeight(slidePanel.current.offsetHeight);
        }
    }, [winWidth, winHeight]);

    // increment/decrement index to make slide visible
    const prevPair = () => {
        const prevIndex = (selectedIndex - 1 + images.length) % images.length;
        setSelectedIndex(prevIndex);
    };
    const nextPair = () => {
        const nextIndex = (selectedIndex + 1) % images.length
        setSelectedIndex(nextIndex);
    };

    return (
        <div className="comparator">
            <div ref={slidePanel} className={'slides'}>
                { images.length > 0 ? <Slider
                    images={[historic_captures.refImage, modern_captures.refImage]}
                    toggle={pairToggle}
                /> : <Loading /> }
                <div className={'numbertext'}>{ selectedIndex + 1 }/{images.length}</div>
                {
                    expandable &&
                    <div className={'expand-image'}><Button icon={'enlarge'} onClick={() => {
                        setExpandImage(true);
                    }}/></div>
                }
            </div>
            {
                label && <div className={'slide-menu h-menu vcentered'}>
                    <ul>
                        <li><Button icon={'prev'} className={'prev'} onClick={prevPair} /></li>
                        <li><Button
                                className={'capture-button'}
                                icon={'images'}
                                onClick={() => setPairToggle(!pairToggle)}
                                label={pairToggle ? 'Switch to Modern Capture' : 'Switch to Historic Capture'}
                            /></li>
                        <li><Button
                            title={'View Capture Details'}
                            label={label}
                            className={'capture-button'}
                            icon={pairToggle ? 'historic_captures' : 'modern_captures'}
                            onClick={()=>{router.update(link)}}
                        /></li>
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
                                            <ImagePair
                                                historicImage={historic_captures.refImage}
                                                modernImage={modern_captures.refImage}
                                                selected={index === selectedIndex}
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
                                        key={`comparator_img_${index}`}
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
                    callback={()=>{setExpandImage(null)}}
                >
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