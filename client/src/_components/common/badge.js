/*!
 * MLP.Client.Components.Common.Button
 * File: footer.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Icon from './icon';
import Button from './button';

/**
 * Render HTML badge element.
 *
 * @public
 * @return {JSX.Element}
 */

const Badge = ({
                    label='',
                    title,
                    icon,
                    size='lg',
                    className='',
}) => {

    return <Button
            title={title}
            label={label}
            className={`badge ${ className }`}
            icon={icon} size={'lg'}
            size={size}
            onClick={() => {}}
        />
}

export default Badge;
