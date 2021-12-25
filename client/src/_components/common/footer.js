/*!
 * MLP.Client.Components.Common.Footer
 * File: footer.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import {getInfo} from "../../_services/schema.services.client";
import {MLPLogo} from "./logo";

/**
 * Render .page footer
 *
 * @public
 * @return {JSX.Element}
 */

const Footer = () => {
    const date = new Date();
    return <footer className="footer">
            <div className={'copyright h-menu'}>
                <ul>
                    <li>
                        <p>Copyright &copy; {date.getFullYear()} Mountain Legacy Project</p>
                    </li>
                    <li className={'push'} style={{paddingRight: '20px'}}>
                        <a href={getInfo().mlp_url} rel="noreferrer" target={'_blank'}>
                            <MLPLogo colour={'black'} />
                        </a>
                    </li>
                </ul>
            </div>
        </footer>
}

export default React.memo(Footer);
