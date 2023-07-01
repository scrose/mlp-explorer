/*!
 * MLP.Client.IAT
 * File: iat.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import {memo} from 'react';
import PanelIat from './panel/panel.iat';
import {MenuIat} from './menu.iat';
import {DialogIat} from "./dialog.iat";
import {useIat} from "../../_providers/iat.provider.client";
import {UserMessage} from "../common/message";


/**
 * Canvas API image editor component.
 *
 * @public
 */

const Iat = () => {

    const iat = useIat();

    return <>
            <DialogIat />
            { iat.message && <UserMessage message={iat.message}/> }
            <MenuIat />
            <div className={'canvas-board'}>
                <PanelIat id={'panel1'} />
                <PanelIat id={'panel2'} />
            </div>
        </>;
};

export default memo(Iat);


