/*!
 * MLP.Client.Components.Common.Dropdown
 * File: dropdown.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import Button from './button';

/**
 * Dropdown component.
 *
 * @param label
 * @param compact
 * @param items
 * @public
 */

const Dropdown = ({label, compact, items}) => {

    // generate unique ID value for menu items
    const menuID = Math.random().toString(16).substring(2);

    // dropdown toggle view
    const [dropdownToggle, setDropdownToggle] = React.useState(false);

    // Initialize map using reference callback to access DOM
    const dropdown = React.useCallback(domNode => {
        // create hide dropdown function
        const hideDropdown = (e) => {
            if (!domNode.contains(e.target)) {
                setDropdownToggle(false);
                document.removeEventListener('click', hideDropdown);
            }
        };
        // create event listener to close menu upon click
        if (domNode && dropdownToggle) {
            document.addEventListener('click', hideDropdown);
        } else {
            document.removeEventListener('click', hideDropdown);
        }

    }, [dropdownToggle, setDropdownToggle]);

    return <div>
        <Button
            icon={'add'}
            label={!compact ? label : ''}
            onClick={(e) => {
                e.stopPropagation()
                setDropdownToggle(true);
            }}
        />
        <div ref={dropdown} className={`v-menu dropdown${dropdownToggle ? ' active' : ''}`}>
            <ul>
                {
                    // add submenu items
                    (items || []).map((item, index) => {
                        const {label='', type='', icon='', callback=()=>{}} = item || {};
                        return (
                            type && <li key={`${menuID}_${index}`}>
                                <Button
                                    icon={icon}
                                    type={type}
                                    label={label}
                                    onClick={(e) => {
                                        callback(e);
                                        setDropdownToggle(false);
                                    }}
                                />
                            </li>
                        );
                    })
                }
            </ul>
        </div>
    </div>
}

export default Dropdown;
