/*!
 * MLP.Client.Components.Common.Image
 * File: image.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { getNodeURI } from '../../_utils/paths.utils.client';
import { useRouter } from '../../_providers/router.provider.client';

/**
 * Defines image component.
 *
 * @public
 * @return {JSX.Element}
 */

const Image = ({ url, type='', id='', title='', label='', scale='thumb' }) => {

    const fallbackSrc = '/logo192.png';
    const router = useRouter();
    const [src, setSrc] = React.useState(url[scale]);
    const [error, setError] = React.useState(false);

    // Handler for resource loading errors.
    // - uses fallback image
    const onError = () => {
        if (!error) {
            setSrc(fallbackSrc);
            setError(true);
        }
    }

    // Handler for viewing image on click.
    const onClick = () => {
        router.update(getNodeURI(type, 'show', id));
    }

    // render image
    return (
        <figure className={scale}>
            <img
                src={src}
                alt={label || type}
                title={title || type}
                onError={onError}
                onClick={onClick}
            />
            <figcaption onClick={onClick}>
                {label || type}
            </figcaption>
        </figure>
    )

}

export default Image;
