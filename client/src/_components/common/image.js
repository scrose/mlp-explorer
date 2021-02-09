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

const Image = ({ uri='', scale='thumb', title='', alt='' }) => {

    const fallbackSrc = '/logo192.png'

    const [src, setSrc] = React.useState(uri);
    const [error, setError] = React.useState(false);

    const onError = () => {
        if (!error) {
            setSrc(fallbackSrc);
            setError(true);
        }
    }

    // render image
    return (
        <img
            src={src}
            className={scale}
            alt={alt}
            title={title}
            onError={onError}
        />
    )

}

export default Image;
