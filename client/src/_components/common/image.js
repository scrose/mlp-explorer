/*!
 * MLP.Client.Components.Common.Image
 * File: image.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';

/**
 * Defines image component.
 *
 * @public
 * @return {JSX.Element}
 */

const Image = ({
                   url='',
                   title='',
                   label='',
                   scale='thumb',
                   onClick=()=>{},
                   onDoubleClick=()=>{}
}) => {

    const fallbackSrc = '/logo192.png';
    const [src, setSrc] = React.useState(url[scale]);
    const [error, setError] = React.useState(false);

    // Handler for resource loading errors.
    // - uses fallback image
    const onError = (err) => {
        if (!error) {
            setSrc(fallbackSrc);
            setError(true);
        }
    }

    React.useEffect(()=> {
        if (!src) {
            setSrc(fallbackSrc);
            setError(true);
        }
    }, [src, setSrc, setError])

    // render image
    return (
        <figure className={scale}>
            <img
                src={src}
                alt={label}
                title={title}
                onError={onError}
                onClick={onClick}
                onDoubleClick={onDoubleClick}
            />
            {
                label &&
                <figcaption onClick={onClick}>
                    {label}
                </figcaption>
            }
        </figure>
    )
}

export default Image;
