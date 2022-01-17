/*!
 * MLP.Client.Components.Navigation.Page
 * File: page.menu.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Button from '../common/button';

/**
 * Inline menu component to edit node items.
 *
 * @public
 * @param {Object} data
 * @return {JSX.Element}
 */

const PageMenu = ({total, hasNext, hasPrev, onPrev, onNext}) => {

    return <div className={'pagination'}>
        {
            total > 0 &&
            <Button
                icon={'prev'}
                label={'Previous Page'}
                className={hasPrev ? 'prev' : 'inactive'}
                onClick={() => {
                    if (hasPrev) {onPrev()}
                }
                }
            />
        }
        {
            total > 0 &&
            <Button
                icon={'next'}
                type={'rightAlign'}
                className={hasNext ? 'next' : 'inactive'}
                label={'Next Page'}
                onClick={() => {
                    if (hasNext) {onNext()}
                }
                }
            />
        }
    </div>
};

export default PageMenu;