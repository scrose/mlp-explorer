/*!
 * MLP.Client.Components.Menus.Item
 * File: item.menu.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { getRoot } from '../../_utils/paths.utils.client';
import Icon from '../common/icon';

/**
 * Inline menu component to edit records.
 *
 * @public
 * @param {String} id
 * @param {String} model
 * @return {JSX.Element}
 */

const ItemMenu = ({id, model}) => {
    return (
        <div className={"item h-menu"}>
            <ul>
                <li>
                    <a title={`View ${model}.`} href={`${getRoot()}/${model}/${id}`}>
                        <Icon type={"info"} />
                    </a>
                </li>
                <li>
                    <a title={`Edit ${model} data.`} href={`${getRoot()}/${model}/${id}/edit`}>
                        <Icon type={"edit"} />
                    </a>
                </li>
                <li>
                    <a title={`Delete ${model} record.`} href={`${getRoot()}/${model}/${id}/remove`}>
                        <Icon type={"delete"} />
                    </a>
                </li>
            </ul>
        </div>
    )
}

export default ItemMenu;
