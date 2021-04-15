/*!
 * MLP.Client.Components.Common.Tabs
 * File: tabs.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Button from './button';

/**
 * Tab layout.
 * - Creates tab to toggle data panels (<Tab>).
 *
 * @public
 * @return {JSX.Element}
 */

const Tabs = ({menu=[], data=[], highlight=null}) => {

    // tab toggle state
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const selectedCapture = data[selectedIndex];

    // use toggle icon to show state of loading
    const onToggle = (index) => {
        return index===selectedIndex ? 'expand' : 'collapse';
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
                                        className={highlight===index ? 'active' : ''}
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
                <div className={'tab-data'}>
                    {selectedCapture}
                </div>
            </div>
    )
}

export default Tabs;