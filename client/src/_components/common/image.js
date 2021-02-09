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

const Image = ({ url, scale='thumb', title='', name='', label='' }) => {

    const fallbackSrc = '/logo192.png'

    const [src, setSrc] = React.useState(url);
    const [error, setError] = React.useState(false);

    const onError = () => {
        if (!error) {
            setSrc(fallbackSrc);
            setError(true);
        }
    }

    // render image
    return (
        <figure>
            <img
                src={src}
                className={scale}
                alt={label || name}
                title={title || name}
                onError={onError}
            />
            <figcaption>{label || name}</figcaption>
        </figure>
    )

}

export default Image;
