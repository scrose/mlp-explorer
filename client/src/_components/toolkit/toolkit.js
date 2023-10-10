/*!
 * MLE.Client.Toolkit
 * File: toolkit.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 *
 * ----------
 * Description
 *
 * Main Image Alignment Tool component. The toolkit makes extensive use of the Canvas API
 * for image rendering and markup. Image transformations use the OpenCV.js
 * JavaScript libraries.
 *
 * ---------
 * Revisions
 * - 09-14-2023   Automatically close navigator on page focus
 *
 */

import {memo} from 'react';
import PanelIat from './panel/panel.toolkit';
import {MenuToolkit} from './menu.toolkit';
import {DialogToolkit} from "./dialog.toolkit";
import {useIat} from "../../_providers/toolkit.provider.client";
import {UserMessage} from "../common/message";
import {useNav} from "../../_providers/nav.provider.client";


/**
 * Canvas API image editor component.
 *
 * @public
 */

const Toolkit = () => {

    const iat = useIat();
    const nav = useNav();

    // close navigator if opened
    const _closeNav = () => {
        if (nav.toggle) nav.setToggle(false);
    }

    return <div onClick={_closeNav} >
            <DialogToolkit />
            <UserMessage className={'canvas-message'} message={iat.message} onClose={()=>{iat.setMessage(null)}} />
            <div className={'canvas-board'}>
                <PanelIat id={'panel1'} />
                <MenuToolkit />
                <PanelIat id={'panel2'} />
            </div>
        </div>;
};

export default memo(Toolkit);


