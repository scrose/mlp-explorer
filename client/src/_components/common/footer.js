/*!
 * MLP.Client.Components.Common.Footer
 * File: footer.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';

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
            <div className={'copyright'}>
                <p>Copyright &copy; {date.getFullYear()} Mountain Legacy Project</p>
            </div>
        </footer>
    );
}

export default React.memo(Footer);
