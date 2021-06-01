/*!
 * MLP.Client.Components.Common.Comparator
 * File: comparator.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { schema } from '../../schema';
import Loading from './loading';
import { UserMessage } from './message';
import { scaleToFit } from '../iat/transform.iat';
import Button from './button';

/**
 * Image comparator maximum dimensions.
 */

const COMPARATOR_MAX_WIDTH = 800;
const COMPARATOR_MAX_HEIGHT = 500;

/**
 * Image comparator component.
 *
 * @public
 * @param {Array} images
 * @param {float} width
 * @return {JSX.Element}
 */

const Comparator = ({ images = [], scale = 1.0, onStop=()=>{} }) => {

    // input image data
    const [image1, image2] = images || [];

    // error status
    const [message, setMessage] = React.useState(null);

    // loading status
    const [status, setStatus] = React.useState(0);
    const [loaded1, setLoaded1] = React.useState(false);
    const [loaded2, setLoaded2] = React.useState(false);
    const [img1W, setImg1W] = React.useState(0);

    // slider state
    let sliding = false;

    // mounted status
    const _isMounted = React.useRef(false);

    // panel DOM references
    const panel1Ref = React.useRef();
    const panel2Ref = React.useRef();
    const canvas1Ref = React.useRef();
    const canvas2Ref = React.useRef();

    // image DOM references
    const img1Ref = React.useRef();
    const img2Ref = React.useRef();

    // slider DOM reference: element controls display of overlay
    const sliderRef = React.useRef();

    // Image labels
    const label1 = image1 && image1.hasOwnProperty('label') ? image1.label : 'Image 1';
    const label2 = image2 && image2.hasOwnProperty('label') ? image2.label : 'Image 2';

    function _slideFinish() {
    }

    function _slideMove(e) {
        /* If the slider is no longer clicked, exit this function: */
        if (!sliding) return false;
        // get image boundary dimensions / positions
        const rect = canvas1Ref.current.getBoundingClientRect();
        // scale mouse coordinates after they have been adjusted to be relative to element
        // - Prevent the slider from being positioned outside the image.
        let pos = Math.max(Math.min(Math.floor((e.clientX - rect.left)), img1W ), 0);

        /* Execute a function that will resize the overlay image according to the cursor: */
        _slide(pos);
    }

    /* Position the slider and resize panel */
    function _slide(x) {
        panel1Ref.current.style.width = x + 'px';
        sliderRef.current.style.left = x - (sliderRef.current.offsetWidth / 2) + 'px';
    }

    // initialize image sources
    // - (1) data URLs
    // - (2) URLs
    React.useEffect(() => {
        _isMounted.current = true;

        if (loaded1 && loaded2) setStatus(2);

        if (
            _isMounted.current
            && image1
            && image2
            && panel1Ref.current
            && panel2Ref.current
            && img1Ref.current
            && img2Ref.current
            && status === 0
        ) {

            setStatus(1);

            const img1 = img1Ref.current;
            const img2 = img2Ref.current;
            const panel1 = panel1Ref.current;
            const panel2 = panel2Ref.current;
            const canvas1 = canvas1Ref.current;
            const canvas2 = canvas2Ref.current;
            const ctx1 = canvas1.getContext('2d');
            const ctx2 = canvas2.getContext('2d');
            const slider = sliderRef.current;

            // set data urls for images
            const url1 = image1 && image1.hasOwnProperty('url')
                ? image1.url.medium : image1;
            const url2 = image2 && image2.hasOwnProperty('url')
                ? image2.url.medium : image2;

            // load image 1 (overlay)
            img1.onerror = () => {
                setMessage({ msg: 'Error: Image could not be loaded.', type: 'error' });
                img1.src = schema.errors.image.fallbackSrc;
            };
            img1.onload = function() {

                // compute scaled canvas dimensions and scale image to fit
                canvas1.width = COMPARATOR_MAX_WIDTH * scale;
                canvas1.height = COMPARATOR_MAX_HEIGHT * scale;
                const {w, h} = scaleToFit(img1.naturalWidth, img1.naturalHeight, canvas1.width, canvas1.height);

                // store scaled image width
                setImg1W(w);

                /* Initialize the width of overlay image to 50%: */
                ctx1.drawImage(img1, 0, 0, w, h);
                panel1.style.width = (w / 2) + 'px';
                panel1.style.height = h + 'px';

                /* Position the slider in the middle: */
                slider.style.top = (h / 2) - (slider.offsetHeight / 2) + 'px';
                slider.style.left = (w / 2) - (slider.offsetWidth / 2) + 'px';

                setLoaded1(true);

            };
            img1.src = url1;

            // load image 2 (underlay)
            img2.onerror = () => {
                setMessage({ msg: 'Error: Image could not be loaded.', type: 'error' });
                img2.src = schema.errors.image.fallbackSrc;
            };
            img2.onload = function() {

                // compute scaled canvas dimensions and scale image to fit
                canvas2.width = COMPARATOR_MAX_WIDTH * scale;
                canvas2.height = COMPARATOR_MAX_HEIGHT * scale;
                const {w, h} = scaleToFit(img2.naturalWidth, img2.naturalHeight, canvas2.width, canvas2.height);

                ctx2.drawImage(img2, 0, 0, w, h);
                panel2.style.width = w + 'px';
                panel2.style.height = h + 'px';

                setLoaded2(true);
            };
            img2.src = url2;
        }
        return () => {
            _isMounted.current = false;
        };
    }, [
        image1,
        image2,
        scale,
        status,
        setStatus,
        loaded1,
        setLoaded1,
        loaded2,
        setLoaded2,
    ]);

    return <>
        <UserMessage
            message={message}
            onClose={() => {
                setMessage(false);
            }}
        />
        <div className={'comparator'}>
            <div
                className={`comparator-container`}
                onMouseLeave={_slideFinish}
                onMouseUp={() => {
                    sliding = false;
                }}
                onMouseMove={_slideMove}
            >
                <div
                    className={`comparator-slider`}
                    ref={sliderRef}
                    onTouchStart={() => {
                        sliding = true;
                    }}
                    onTouchMove={_slideMove}
                    onTouchEnd={(e) => {
                        e.preventDefault();
                    }}
                    onMouseDown={() => {
                        sliding = true;
                    }}
                >
                    {
                        status === 2
                            ? <Button icon={'slide'} />
                            : <div className={'centered'}><Loading /></div>
                    }
                </div>
                <div ref={panel1Ref} className={'comparator-img overlay'}>
                    <canvas ref={canvas1Ref} />
                </div>
                <div ref={panel2Ref} className={'comparator-img'}>
                    <canvas ref={canvas2Ref} />
                </div>
                <img
                    style={{ 'display': 'none' }}
                    ref={img1Ref}
                    crossOrigin={'anonymous'}
                    src={schema.errors.image.fallbackSrc}
                    alt={label1}
                />
                <img
                    style={{ 'display': 'none' }}
                    ref={img2Ref}
                    crossOrigin={'anonymous'}
                    src={schema.errors.image.fallbackSrc}
                    alt={label2}
                />
            </div>
        </div>
    </>;
};

export default Comparator;