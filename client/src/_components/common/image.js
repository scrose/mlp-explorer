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
                   fit='contain',
                   onClick=()=>{},
                   onDoubleClick=()=>{}
}) => {

    // image URL: with scale settings / URL string
    const [src, setSrc] = React.useState(scale ? url[scale] : url);
    const [error, setError] = React.useState(false);

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

    // render image
    return (
        <figure className={scale}>
            <img
                style={{objectFit: fit}}
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
