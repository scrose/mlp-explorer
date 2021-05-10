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
 * @return {JSX.Element}
 */

const Comparator = ({images=[]}) => {

    // input image data
    const [image1, image2] = images || [];

    // error status
    const [message, setMessage] = React.useState(null);

    // loading status
    const [loading1, setLoading1] = React.useState(true);
    const [loading2, setLoading2] = React.useState(true);

    // slider state
    const [imgWidth, setImgWidth] = React.useState(0);
    let sliding = false;

    // mounted status
    const _isMounted = React.useRef(false);

    // panel DOM references
    const panel1Ref = React.useRef();
    const panel2Ref = React.useRef();

    // image DOM references
    const img1Ref = React.useRef();
    const img2Ref = React.useRef();

    // slider DOM reference: element controls display of overlay
    const sliderRef = React.useRef();

    // Image labels
    const label1 = image1 && image1.hasOwnProperty('label') ? image1.label : 'Image 1';
    const label2 = image2 && image2.hasOwnProperty('label') ? image2.label : 'Image 2';

    function _slideFinish() {}

    function _getPos(e) {

        // get image boundary dimensions / positions
        let rect = panel1Ref.current.getBoundingClientRect() // abs. size of element

        // scale mouse coordinates after they have been adjusted to be relative to element
        return Math.max(
            Math.min(
                Math.floor((e.clientX - rect.left)), imgWidth
            ), 0)
    }

    function _slideMove(e) {
        /* If the slider is no longer clicked, exit this function: */
        if (!sliding) return false;
        /* Get the cursor's x position: */
        let pos = _getPos(e);
        /* Prevent the slider from being positioned outside the image: */
        if (pos < 0) pos = 0;
        if (pos > imgWidth) pos = imgWidth;
        /* Execute a function that will resize the overlay image according to the cursor: */
        _slide(pos);
    }

    function _slide(x) {
        /* Resize the image: */
        panel1Ref.current.style.width = x + "px";
        /* Position the slider: */
        sliderRef.current.style.left = panel1Ref.current.offsetWidth - (sliderRef.current.offsetWidth / 2) + "px";
    }

    // initialize image sources
    // - (1) data URLs
    // - (2) URLs
    React.useEffect(() => {
        _isMounted.current = true;

        if (
            _isMounted.current
            && image1
            && image2
            && img1Ref.current
            && img2Ref.current
        ) {

            const img1 = img1Ref.current;
            const img2 = img2Ref.current;
            const panel1 = panel1Ref.current;

            const slider = sliderRef.current;

            // initialize slider to panel dimensions
            function _slideReady() {

                /* Get the width and height of the img element */
                let w = img1.offsetWidth;
                let h = img1.offsetHeight;
                setImgWidth(w);

                /* Set the width of the img element to 50%: */
                panel1.style.width = (w / 2) + 'px';

                /* Position the slider in the middle: */
                slider.style.top = (h / 2) - (slider.offsetHeight / 2) + 'px';
                slider.style.left = (w / 2) - (slider.offsetWidth / 2) + 'px';

            }
            _slideReady();

            const url1 =  image1 && image1.hasOwnProperty('url')
                ? image1.url.medium : image1;
            const url2 =  image2 && image2.hasOwnProperty('url')
                ? image2.url.medium : image2;

            img1.src = url1;
            img1.onerror = () => {setMessage({msg: 'Image 1 loading error.', type: 'error'})}
            img1.onload = function() {
                _slideReady();
                if (_isMounted.current) setLoading1(false);
            };
            img2.src = url2;
            img2.onerror = () => {setMessage({msg: 'Image 2 loading error.', type: 'error'})}
            img2.onload = function() {
                _slideReady();
                if (_isMounted.current) setLoading2(false);
            };
        }
        return () => { _isMounted.current = false }
    }, [image1, image2, setImgWidth]);

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
            { !loading1 && !loading2 ? <Button icon={'slide'} /> : <Loading overlay={true} /> }
        </div>
        {
            <div ref={panel1Ref} className="comparator-img overlay">
                <img
                    ref={img1Ref}
                    crossOrigin={'anonymous'}
                    src={schema.errors.image.fallbackSrc}
                    alt={label1}
                />
            </div>
        }
        {
            <div ref={panel2Ref} className="comparator-img">
                <img
                    ref={img2Ref}
                    crossOrigin={'anonymous'}
                    src={schema.errors.image.fallbackSrc}
                    alt={label2}
                />
            </div>
        }
        </div>
    </div>
}

export default Comparator;