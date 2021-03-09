/*!
 * MLP.Client.Components.Common.Accordion
 * File: accordion.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Icon from './icon';
import { getModelLabel } from '../../_services/schema.services.client';
import { getNodeURI, redirect } from '../../_utils/paths.utils.client';
import { capitalize } from '../../_utils/data.utils.client';
import { useRouter } from '../../_providers/router.provider.client';

/**
 * Inline vertical accordion menu component.
 * - Creates accordion containers for dependent nodes that can
 *   be toggled.
 *
 * @public
 * @return {JSX.Element}
 */

const Accordion = ({type, label='', id='', open=false, menu=null, children}) => {

    // accordion toggle state
    const [toggle, setToggle] = React.useState(open);

    const router = useRouter();

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
                        {
                            type ?
                                <li key={`accordion_icon`}>
                                    <button
                                        title={`View ${label}.`}
                                        onClick={() => {setToggle(!toggle)}}
                                    >
                                        <Icon type={type}/>
                                    </button>
                                </li>
                                : ''
                        }
                        {
                            type ?
                                <li key={`accordion_label`}>
                                <button
                                    title={`Go to ${label}.`}
                                    onClick={() => {
                                        id
                                            ? router.update(getNodeURI(type, 'show', id))
                                            : setToggle(!toggle)
                                    }}
                                >
                                    {getModelLabel(type)}
                                    {label && getModelLabel(type) ? ': ' : ''}
                                    {label}
                                </button>
                            </li>
                                : ''
                        }
                        {
                            menu
                                ? <li key={`accordion_menu`} className={'accordion-menu'}>{ menu }</li>
                                : ''
                        }
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