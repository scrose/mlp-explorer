/*!
 * MLP.Client.Components.Common.Image
 * File: image.js
 * Copyright(c) 2021 Runtime Software Development Inc.
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
                   onDoubleClick=()=>{}
}) => {

    // image URL: with scale settings / URL string
    const [src, setSrc] = React.useState(scale ? url[scale] : url);
    const [error, setError] = React.useState(false);

    // const localURL = 'http://localhost:3001';
    // const remoteURL = 'https://explore.mountainlegacy.ca/api'

    // Handler for resource loading errors.
    // - uses fallback image
    const onError = () => {
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

    // update image source
    React.useEffect(()=> {
        if (!error) {
            // setSrc(scale && Object.keys(url).length > 0 ? url[scale].replace(localURL, remoteURL) : url);
            setSrc(scale && Object.keys(url).length > 0 ? url[scale] : url);
        }
    }, [url, setSrc, scale, error])

    // render image
    return (
        <figure className={scale}>
            <img
                src={src}
                alt={caption}
                title={title}
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
