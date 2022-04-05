/*!
 * MLP.Client.Components.Common.Image
 * File: image.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import { schema } from '../../schema';
const fallbackSrc = schema.errors.image.fallbackSrc;

/**
 * Defines image component.
 *
 * @public
 * @return {JSX.Element}
 */

const Image = ({
                   url=fallbackSrc,
                   title='',
                   caption ='',
                   scale='',
                   onClick=()=>{},
                   onDoubleClick=()=>{},
}) => {

    // fallback for null url
    if (!url) url = fallbackSrc;

    // image URL: with scale settings / URL string
    const [src, setSrc] = React.useState(url.hasOwnProperty(scale) && scale ? url[scale] : url );
    const [loaded, setLoaded] = React.useState(false );
    const [error, setError] = React.useState(false);

    // Handler for resource loading errors.
    // - uses fallback image
    const onError = () => {
        if (!error) {
            setSrc(fallbackSrc);
            setError(true);
        }
    }
    // ensure image source is valid
    React.useEffect(()=> {
        // reject invalid image source strings
        if (!src || (typeof src === 'object' && Object.keys(src).length===0)) {
            setSrc(fallbackSrc);
            setError(true);
        }
    }, [src, setSrc, setError])

    // update image source
    React.useEffect(()=> {
        if (!error) {
            // setSrc(scale && Object.keys(url).length > 0 ? url[scale].replace(localURL, remoteURL) : url);
            setSrc(url && typeof url === 'object' && scale && url.hasOwnProperty(scale) ? url[scale] : url);
        }
    }, [url, setSrc, scale, error])

    // render image
    return (
        <figure className={scale}>
            {!loaded && <span>Loading...</span>}
            <img
                src={src}
                alt={caption}
                title={title}
                onLoad={() => setLoaded(true)}
                onError={onError}
                onClick={onClick}
                onDoubleClick={onDoubleClick}
            />
            {
                caption &&
                <figcaption onClick={onClick}>
                    {caption}
                </figcaption>
            }
        </figure>
    )
}

export default Image;
