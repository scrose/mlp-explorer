/*!
 * MLP.Client.Components.Common.Tabs
 * File: tabs.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import Button from './button';

/**
 * Tab layout.
 * - Creates tab to toggle data panels (<Tab>).
 * - Input Data Format:
 *   {[ID]: { label: <LABEL>, data: <CONTENT>}, ... }
 *
 * @public
 * @return {JSX.Element}
 */

const Tabs = ({
                  items = [],
                  defaultTab = 0,
                  className = '',
                  orientation = 'vertical',
              }) => {

    // selected tab state
    const [selectedTabID, setSelectedTabID] = React.useState(defaultTab);

    // highlight selected tab (via classname)
    const onToggle = (id) => {
        return orientation === 'vertical'
            ? id === selectedTabID ? 'hclose' : 'hopen'
            : id === selectedTabID ? 'hopen' : 'hclose'
    };

    // select view orientation
    const tabOrientation = orientation === 'vertical' ? 'h-menu' : 'v-menu';
    const menuOrientation = orientation === 'vertical' ? 'v-menu' : 'h-menu';

    return (
        <div className={`tab ${tabOrientation} ${className}`}>
            <ul>
                <li className={`tab-menu ${menuOrientation}`}>
                    <ul>
                        {
                            items.map((item, id) => {
                                const { label = '' } = item || {};
                                return <li key={`tab_${id}`}>
                                    <Button
                                        disabled={!item.data}
                                        className={selectedTabID === id ? 'active' : ''}
                                        icon={onToggle(id)}
                                        title={`View ${label}.`}
                                        label={label}
                                        onClick={() => {
                                            setSelectedTabID(id);
                                        }}
                                    />
                                </li>;
                            })
                        }
                    </ul>
                </li>
                <li className={`tab-data ${orientation}`}>
                    {
                        items.hasOwnProperty(selectedTabID)
                            ? items[selectedTabID].data || ''
                            : ''
                    }
                </li>
            </ul>
        </div>
    );
};

export default Tabs;