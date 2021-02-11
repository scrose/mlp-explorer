/*!
 * MLP.Client.Components.Common.Accordion
 * File: accordion.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Icon from './icon';
import { getModelLabel } from '../../_services/schema.services.client';

/**
 * Inline vertical accordion menu component.
 * - Creates accordion containers for dependent nodes that can
 *   be toggled.
 *
 * @public
 * @return {JSX.Element}
 */

const Accordion = ({type, label, children}) => {

    // accordion toggle state
    const [toggle, setToggle] = React.useState(false);

    // render tree node
    return (
        <div className={'item-data'}>
            <div className={`accordion`}>
                <div className={`h-menu ${type}`}>
                    <ul>
                        <li key={`accordion_toggle`}>
                            <button
                                title={`Expand View.`}
                                onClick={() => {setToggle(!toggle)}}
                            >
                                {toggle ? <Icon type={'vopen'} /> : <Icon type={'vclose'} />}
                            </button>
                        </li>
                        <li key={`accordion_icon`}>
                            <button
                                title={`View ${label}.`}
                                onClick={() => {setToggle(!toggle)}}
                            >
                                <Icon type={type} /> {getModelLabel(type)}
                            </button>
                        </li>
                        <li key={`accordion_label`}>
                            <button
                                title={`Expand metadata.`}
                                onClick={() => {setToggle(!toggle)}}
                            >
                                <span>{label}</span>
                            </button>
                        </li>
                    </ul>
                </div>
                {
                    toggle ? <div className={'accordion-data'}>{children}</div> : ''
                }
            </div>
        </div>
    )
}

export default Accordion;