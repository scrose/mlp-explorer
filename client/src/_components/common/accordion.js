/*!
 * MLP.Client.Components.Common.Accordion
 * File: accordion.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { createNodeRoute } from '../../_utils/paths.utils.client';
import { useRouter } from '../../_providers/router.provider.client';
import Button from './button';

/**
 * Inline vertical accordion menu component.
 * - Creates accordion containers for dependent nodes that can
 *   be toggled.
 *
 * @public
 * @return {JSX.Element}
 */

const Accordion = ({
                       type='',
                       label='',
                       id='',
                       open=false,
                       menu=null,
                       hasDependents=false,
                       children=null
                   }) => {

    // accordion toggle state
    const [toggle, setToggle] = React.useState(open);
    const router = useRouter();

    // toggle accordion data
    const onClick = () => {
        setToggle(!toggle);
    }

    return <div className={`accordion ${type}`}>
        <div className={`h-menu`}>
            <ul>
                {
                    (hasDependents || children) &&
                        <li key={`accordion_toggle`}>
                            <Button
                                icon={toggle ? 'vopen' : 'vclose'}
                                title={toggle ? 'Collapse' : 'Expand'}
                                onClick={onClick}
                            />
                        </li>
                }
                {
                    type && children &&
                        <li key={`accordion_icon`}>
                            <Button
                                icon={type}
                                title={toggle ? 'Collapse' : 'Expand'}
                                onClick={onClick} />
                        </li>
                }
                {
                    label &&
                        <li key={`accordion_label`}>
                            <Button
                                title={`Go to ${label}.`}
                                onClick={() => {
                                    id
                                        ? router.update(createNodeRoute(type, 'show', id))
                                        : setToggle(!toggle)
                                }}
                                label={label}
                            />
                        </li>
                }
                {
                    menu && <li key={`accordion_menu`} className={'accordion-menu'}>{ menu }</li>
                }
            </ul>
        </div>
        {
            toggle &&
            <div className={`accordion-data ${toggle ? 'open' : ''}`}>
                <>{children}</>
            </div>
        }
    </div>
}

export default Accordion;