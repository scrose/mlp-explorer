/*!
 * MLP.Client.Components.Common.Comparator
 * File: comparator.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Button from './button';
import { schema } from '../../schema';
import Loading from './loading';
import { UserMessage } from './message';

/**
 * Image comparator component.
 *
 * @public
 * @param {Array} images
 * @param {float} width
 * @return {JSX.Element}
 */

const Comparator = ({images=[], scale=1.0}) => {

    // input image data
    const [image1, image2] = images || [];

    // error status
    const [message, setMessage] = React.useState(null);

    // loading status
    const [status, setStatus] = React.useState(0);
    const [loaded1, setLoaded1] = React.useState(false);
    const [loaded2, setLoaded2] = React.useState(false);

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
        const imgWidth = canvas1Ref.current.width;
        /* If the slider is no longer clicked, exit this function: */
        if (!sliding) return false;
        // get image boundary dimensions / positions
        const rect = panel1Ref.current.getBoundingClientRect();
        // scale mouse coordinates after they have been adjusted to be relative to element
        let pos = Math.max(
            Math.min(
                Math.floor((e.clientX - rect.left)), imgWidth
            ), 0);
        /* Prevent the slider from being positioned outside the image: */
        if (pos < 0) pos = 0;
        if (pos > imgWidth) pos = imgWidth;
        /* Execute a function that will resize the overlay image according to the cursor: */
        _slide(pos);
    }

    /* Position the slider and resize panel */
    function _slide(x) {
        panel1Ref.current.style.width = x + 'px';
        sliderRef.current.style.left = x - (sliderRef.current.offsetWidth / 2) + "px";
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
            const url1 =  image1 && image1.hasOwnProperty('url')
                ? image1.url.medium : image1;
            const url2 =  image2 && image2.hasOwnProperty('url')
                ? image2.url.medium : image2;

            // load image 1 (overlay)
            img1.onerror = () => {setMessage({msg: 'Image 1 loading error.', type: 'error'})}
            img1.onload = function() {

                const w1 = img1.naturalWidth * scale;
                const h1 = img1.naturalHeight * scale;

                /* Initialize the width of overlay image to 50%: */
                canvas1.width = w1;
                canvas1.height = h1;
                ctx1.drawImage(img1, 0, 0, w1, h1);
                panel1.style.width = (w1 / 2) + 'px';
                panel1.style.height = h1 + 'px';

                /* Position the slider in the middle: */
                slider.style.top = (h1 / 2) - (slider.offsetHeight / 2) + 'px';
                slider.style.left = (w1 / 2) - (slider.offsetWidth / 2) + 'px';

                setLoaded1(true);

            };
            img1.src = url1;

            // load image 2 (underlay)
            img2.onerror = () => {setMessage({msg: 'Image 2 loading error.', type: 'error'})}
            img2.onload = function() {

                const w2 = img2.naturalWidth * scale;
                const h2 = img2.naturalHeight * scale;

                /* Initialize the width of overlay image to 50%: */
                canvas2.width = w2;
                canvas2.height = h2;
                ctx2.drawImage(img2, 0, 0, w2, h2);
                panel2.style.width = w2 + 'px';
                panel2.style.height = h2 + 'px';

                setLoaded2(true);
            };
            img2.src = url2;
        }
        return () => { _isMounted.current = false }
    }, [
        image1,
        image2,
        scale,
        status,
        setStatus,
        loaded1,
        setLoaded1,
        loaded2,
        setLoaded2
    ]);

    return <div className={'comparator'}>
        <UserMessage
            message={message}
            onClose={() => {
                setMessage(false);
            }}
        />
        <div
            className={`comparator-container`}
            onMouseLeave={_slideFinish}
            onMouseUp={() => {sliding=false}}
            onMouseMove={_slideMove}
        >
            <div
                className={`comparator-slider`}
                ref={sliderRef}
                onTouchStart={() => {sliding=true}}
                onTouchMove={_slideMove}
                onTouchEnd={(e) => {e.preventDefault()}}
                onMouseDown={() => {sliding=true}}
            >
                { status === 2 ? <Button icon={'slide'} /> : <Loading /> }
            </div>
            <div ref={panel1Ref} className={"comparator-img overlay"}>
                <canvas ref={canvas1Ref} />
            </div>
            <div ref={panel2Ref} className={"comparator-img"}>
                <canvas ref={canvas2Ref} />
            </div>
            <img
                ref={img1Ref}
                crossOrigin={'anonymous'}
                src={schema.errors.image.fallbackSrc}
                alt={label1}
            />
            <img
                ref={img2Ref}
                crossOrigin={'anonymous'}
                src={schema.errors.image.fallbackSrc}
                alt={label2}
            />
        </div>
    </div>
}

export default Comparator;