/*!
 * MLP.Client.Components.Menus.Item
 * File: item.menu.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { getNodeURI, redirect } from '../../_utils/paths.utils.client';
import Icon from '../common/icon';
import { useUser } from '../../_providers/user.provider.client';

/**
 * Inline menu component to edit records.
 *
 * @public
 * @param {String} id
 * @param {String} model
 * @return {JSX.Element}
 */

const ItemMenu = ({ id, model }) => {
    const user = useUser();
    return (
        <div className={'item h-menu'}>
            <ul>
                <li>
                    <button
                        title={`See data.`}
                        onClick={() => console.log('View details.')}
                    >
                        <Icon type={'down'} />
                    </button>
                </li>
                    <li>
                        <button
                            title={`View this ${model} item.`}
                            onClick={() => redirect(getNodeURI(model, 'show', id))}
                        >
                            <Icon type={'info'} />
                        </button>
                    </li>
                {user ?
                    <li>
                        <button
                            title={`Edit this ${model} item.`}
                            onClick={() => redirect(getNodeURI(model, 'edit', id))}
                        >
                            <Icon type={'edit'} />
                        </button>
                    </li> : ''
                }
                {user ?
                    <li>
                        <button
                            title={`Delete this ${model} item.`}
                            onClick={() => redirect(getNodeURI(model, 'remove', id))}
                        >
                            <Icon type={'delete'} />
                        </button>
                    </li> : ''
                }
            </ul>
        </div>
    );
};

export default ItemMenu;
