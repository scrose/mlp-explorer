/*!
 * MLP.Client.Components.Common.Accordion
 * File: accordion.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { getModelLabel } from '../../_services/schema.services.client';
import { getNodeURI } from '../../_utils/paths.utils.client';
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
                       type,
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

    // use toggle icon to show state of loading
    const onToggle = () => {
        return toggle ? 'vopen' : 'vclose';
    }

    const onClick = () => {
        setToggle(!toggle);
    }

    // render tree node
    return (
        <div className={'item-data'}>
            <div className={`accordion`}>
                <div className={`h-menu ${type}`}>
                    <ul>
                        {
                            hasDependents
                                ? <li key={`accordion_toggle`}>
                                    <Button
                                        icon={onToggle()}
                                        title={`Expand this item.`}
                                        onClick={() => {
                                            setToggle(!toggle);
                                        }}
                                    />
                                </li>
                                : ''
                        }
                        {
                            type && children ?
                                <li key={`accordion_icon`}>
                                    <Button icon={type} onClick={onClick} />
                                </li>
                                : ''
                        }
                        {
                            type || label ?
                                <li key={`accordion_label`}>
                                <Button
                                    title={`Go to ${label}.`}
                                    onClick={() => {
                                        id
                                            ? router.update(getNodeURI(type, 'show', id))
                                            : setToggle(!toggle)
                                    }}
                                    label={`
                                            ${getModelLabel(type)}
                                            ${label && getModelLabel(type) ? ': ' : ''}
                                            ${label}
                                        `}
                                />
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
                <div className={`accordion-data ${toggle ? 'open' : ''}`}>
                    {
                        toggle ? <div>{children}</div>: ''
                    }
                </div>
            </div>
        </div>
    )
}

export default Accordion;