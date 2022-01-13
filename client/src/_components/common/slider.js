/*!
 * MLP.Client.Components.Common.Slider
 * File: slider.js
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
 * Image slider component.
 *
 * @public
 * @param {Array} images
 * @param {number} width
 * @return
 */

const Slider = ({ images = [], scale = 1.0, canvasWidth = 600, canvasHeight = 500 }) => {

    // input image data
    const [image1, image2] = images || [];

    // warning/error messages
    const [message, setMessage] = React.useState(null);

    // loading status
    const [status, setStatus] = React.useState(0);
    const [loaded1, setLoaded1] = React.useState(false);
    const [loaded2, setLoaded2] = React.useState(false);
    const [imgOverlayWidth, setImgOverlayWidth] = React.useState(0);
    const [imgOffset, setImgOffset] = React.useState(0);

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

    function _slideFinish() {}

    function _slideMove(e) {
        /* If the slider is no longer clicked, exit this function: */
        if (!sliding) return false;
        // get image boundary dimensions / positions
        const rect = canvas1Ref.current.getBoundingClientRect();

        // scale mouse coordinates after they have been adjusted to be relative to element
        // - Prevent the slider from being positioned outside the image.
        let x = Math.max(Math.min(Math.floor(e.clientX - rect.left), imgOverlayWidth ), 0) ;

        /* Execute a function that will resize the overlay image according to the cursor: */
        panel1Ref.current.style.width = x + 'px';
        sliderRef.current.style.left = x + imgOffset - (sliderRef.current.offsetWidth / 2) + 'px';
    }

    // trigger redraw of canvas
    React.useEffect(() => {
        setStatus(0);
    }, [images, setStatus]);

    // initialize image sources
    // - (1) data URLs
    // - (2) URLs
    React.useEffect(() => {

        _isMounted.current = true;

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
                canvas1.width = canvasWidth * scale;
                canvas1.height = canvasHeight * scale;
                const {w, h} = scaleToFit(img1.naturalWidth, img1.naturalHeight, canvas1.width, canvas1.height);
                // compute dx offset needed to centre image on canvas
                const offset1 = (canvas1.width - w) / 2;
                setImgOffset(offset1);
                // store scaled image width
                setImgOverlayWidth(w);

                /* Initialize the width of overlay image to 50%: */
                ctx1.drawImage(img1, 0, 0, w, h);
                panel1.style.width = (w / 2) + 'px';
                panel1.style.height = h + 'px';
                panel1.style.left = offset1 + 'px';

                /* Position the slider in the middle: */
                slider.style.top = (canvas1.height / 2) - (slider.offsetHeight / 2) + 'px';
                slider.style.left = (canvas1.width / 2) - (slider.offsetWidth / 2) + 'px';

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
                canvas2.width = canvasWidth * scale;
                canvas2.height = canvasHeight * scale;
                const {w, h} = scaleToFit(img2.naturalWidth, img2.naturalHeight, canvas2.width, canvas2.height);
                const offset2 = (canvas2.width - w) / 2;

                ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
                ctx2.drawImage(img2, 0, 0, img2.naturalWidth, img2.naturalHeight, offset2, 0, w, h);
                panel2.style.width = canvas2.width + 'px';
                panel2.style.height = h + 'px';

                setLoaded2(true);
            };
            img2.src = url2;
        }
        return () => {
            _isMounted.current = false;
        };
    }, [
        imgOverlayWidth,
        setImgOverlayWidth,
        imgOffset,
        setImgOffset,
        loaded1,
        loaded2,
        setLoaded1,
        setLoaded2,
        status,
        setStatus,
        canvasWidth,
        canvasHeight,
        image1,
        image2,
        scale
    ]);

    return <>
        <UserMessage
            closeable={true}
            message={message}
            onClose={() => {
                setMessage(false);
            }}
        />
        <div className={'slider'}>
            <div
                className={`slider-container`}
                onMouseLeave={_slideFinish}
                onMouseUp={() => {
                    sliding = false;
                }}
                onMouseMove={_slideMove}
            >
                <div
                    className={`slider-button`}
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
                        loaded1 && loaded2
                            ? <Button icon={'slide'} />
                            :   <Loading overlay={false} />
                    }
                </div>
                <div ref={panel1Ref} className={'slider-img overlay'}>
                    <canvas ref={canvas1Ref} />
                </div>
                <div ref={panel2Ref} className={'slider-img'}>
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

export default Slider;