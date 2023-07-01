/*!
 * MLP.Client.Components.Selectors.IAT
 * File: selector.iat.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import Tabs from "../../common/tabs";
import {UploaderIAT} from "./uploader.iat";
import {CaptureLoaderIat} from "./capture.loader.iat";
import {useUser} from "../../../_providers/user.provider.client";
import Table from "../../common/table";

/**
 * Image selector widget. Used to select an image
 * - from the MLP library via the API to load into IAT
 * - from IAT canvase to upload to MLP library
 *
 *  * - Input columns (cols) must be object of form:
 *   [...{name: <column name>, label: <column label>}]
 * - Input rows (rows) must be object of form:
 *   [...{[name]: {...[column name]: <row data>}]
 *
 * @public
 * @param {Object} properties
 * @param {Function} callback
 * @param {Function} cancel
 * @return {JSX.Element}
 */

export const SelectorIat = ({id=null, model=null, callback = ()=>{}, cancel=()=>{}}) => {

    const user = useUser();
    const _tabs = [{
        label: `Load in Toolkit`,
        data: <CaptureLoaderIat id={id} callback={callback} cancel={cancel}/>,
    }];

    // Upload restricted to admin users
    if (user) _tabs.push({
        label: `Upload to Library`,
        data: <UploaderIAT id={id} model={model} callback={callback} cancel={cancel} />,
    });

    return <>
        <Tabs orientation={'horizontal'} items={_tabs} />
    </>
}


