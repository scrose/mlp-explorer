/*!
 * MLP.Client.Components.Common.Footer
 * File: footer.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import {ReactComponent as MLPLogo} from '../svg/mlpLogo.svg';

/**
 * Render .page footer
 *
 * @public
 * @return {React.Component}
 */

const Footer = () => {
    const date = new Date();
    return (
        <footer className="footer">
            <div className={'copyright h-menu'}>
                <ul>
                    <li style={{paddingLeft: '20px'}}>
                        <a href={"http://mountainlegacy.ca"} rel="noreferrer" target={'_blank'}>
                            <MLPLogo />
                        </a>
                    </li>
                    <li>
                        <p>Copyright &copy; {date.getFullYear()} Mountain Legacy Project</p>
                    </li>

                </ul>
            </div>
        </footer>
    );
}

export default React.memo(Footer);
