/*!
 * MLP.Client.Components.Common.Tabs
 * File: tabs.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Button from './button';

/**
 * Data container for tab layout.
 *
 * @public
 * @return {JSX.Element}
 */

export const Tab = ({children}) => {

    return (
        <div className={'tab-data'}>
            {children}
        </div>
    )
}

/**
 * Tab layout.
 * - Creates tab to toggle data panels (<Tab>).
 *
 * @public
 * @return {JSX.Element}
 */

const Tabs = ({menu=[], children}) => {

    // tab toggle state
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const [items=[], _] = children;

    // use toggle icon to show state of loading
    const onToggle = (index) => {
        return index===selectedIndex ? 'vopen' : 'vclose';
    }

    return (
            <div className={`tab`}>
                <div className={`h-menu`}>
                    <ul>
                        {
                            menu.map((item, index) => {
                                const { id = '', label = '' } = item || {};
                                return <li key={`tab_${id}`}>
                                    <Button
                                        icon={onToggle(index)}
                                        title={`View ${label}.`}
                                        label={label}
                                        onClick={() => {
                                            setSelectedIndex(index);
                                        }}
                                    />
                                </li>
                            })
                        }
                    </ul>
                </div>
                {
                    items[selectedIndex]
                }
            </div>
    )
}

export default Tabs;