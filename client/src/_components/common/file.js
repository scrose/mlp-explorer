/*!
 * MLP.Client.Components.Common.File
 * File: file.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Loading from './loading';
import Button from './button';

/**
 * Defines file component.
 *
 * @public
 * @return {JSX.Element}
 */

const File = ({ uri='/logo192.png', type='image', scale='thumb', title='', alt='' }) => {



    // file components indexed by render type
    const renders = {
        image: () => <img
            src={uri}
            className={`${type} ${scale}`}
            alt={alt}
            title={title}
            onError={() => {
                return <img alt={'Not Available'} src={'/logo192.png'} />;
            }}
        />,
        metadata: () => <Button
            icon={type}
            label={title}
            title={title}
        />
    }

    // render file view
    return (
        <div className={type}>
            { renders.hasOwnProperty(type) ? renders[type]() : <Loading/> }
        </div>
    )

}

export default File;
