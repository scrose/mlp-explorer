/*!
 * MLP.Client.Components.Common.Comparator
 * File: comparator.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Image from './image';
import Button from './button';

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

    // debug
    image1.url={ medium: 'http://localhost:3001/resources/versions/medium_f8jTu1VYYFDr_n56cHFLt4ECtXiSFP4Vh2LnZ0tB8ZI514wU.jpeg' }
    image2.url={ medium: 'http://localhost:3001/resources/versions/medium_0JQnZa1kTDiggCY4oILwza8eDjKXI7V3G4SkavpWndblqdQr.jpeg' }

    // slider state
    const [slideInit, setSlideInit] = React.useState(false);
    const [imgWidth, setImgWidth] = React.useState(0);
    let sliding = false;

    // image DOM references
    const img1Ref = React.useRef();
    const img2Ref = React.useRef();

    // slider DOM reference: element controls display of overlay
    const sliderRef = React.useRef();

    // intialize slider button
    React.useEffect(() => {}, [])

    // prepare slider
    function slideReady() {
        if (!slideInit && sliderRef.current && img1Ref.current) {

            setSlideInit(true);

            /* Get the width and height of the img element */
            let w = img1Ref.current.offsetWidth;
            let h = img1Ref.current.offsetHeight;
            setImgWidth(w);

            /* Set the width of the img element to 50%: */
            img1Ref.current.style.width = (w / 2) + 'px';

            /* Position the slider in the middle: */
            sliderRef.current.style.top = (h / 2) - (sliderRef.current.offsetHeight / 2) + 'px';
            sliderRef.current.style.left = (w / 2) - (sliderRef.current.offsetWidth / 2) + 'px';
        }

    }

    function slideFinish() {}

    function getPos(e) {

        // get image boundary dimensions / positions
        let rect = img1Ref.current.getBoundingClientRect() // abs. size of element

        // scale mouse coordinates after they have been adjusted to be relative to element
        return Math.max(
                Math.min(
                    Math.floor((e.clientX - rect.left)), imgWidth
                ), 0)
    }

    function slideMove(e) {
        /* If the slider is no longer clicked, exit this function: */
        if (!sliding) return false;
        /* Get the cursor's x position: */
        let pos = getPos(e);
        /* Prevent the slider from being positioned outside the image: */
        if (pos < 0) pos = 0;
        if (pos > imgWidth) pos = imgWidth;
        /* Execute a function that will resize the overlay image according to the cursor: */
        slide(pos);
    }

    function slide(x) {
        /* Resize the image: */
        img1Ref.current.style.width = x + "px";
        /* Position the slider: */
        sliderRef.current.style.left = img1Ref.current.offsetWidth - (sliderRef.current.offsetWidth / 2) + "px";
    }

    return <div className={'comparator'}>
        <div
            className={`comparator-container`}
            onMouseEnter={slideReady}
            onMouseLeave={slideFinish}
            onMouseUp={(e) => {sliding=false}}
            onMouseMove={slideMove}
        >
        {
            <div
                className={`comparator-slider`}
                ref={sliderRef}
                onTouchStart={() => {sliding=true}}
                onTouchMove={slideMove}
                onTouchEnd={(e) => {e.preventDefault(); }}
                onMouseDown={() => {sliding=true}}
            >
                <Button icon={'slide'} />
            </div>
        }
        {
            image1 &&
            <div ref={img1Ref} className="comparator-img overlay">
                <Image
                    url={image1.url}
                    title={image1.label}
                    label={image1.label}
                    scale={'medium'}
                />
            </div>
        }
        {
            image2 &&
            <div ref={img2Ref} className="comparator-img">
                <Image
                    url={image2.url}
                    title={image2.label}
                    label={image2.label}
                    scale={'medium'}
                />
            </div>
        }
        </div>
    </div>
}

export default Comparator;