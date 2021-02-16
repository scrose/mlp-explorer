/*!
 * MLP.Client.Components.Views.Captures
 * File: captures.view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Item from '../common/item';
import { FilesTable } from './files.view';
import Accordion from '../common/accordion';

/**
 * Model view component.
 *
 * @public
 * @param {Object} apiData
 * @param {String} model
 * @return {JSX.Element}
 */

const CapturesView = ({data, model}) => {

    // get any available dependents
    const { files=[], type=model } = data || {};

    // render node tree
    return (
        <div className={`item`}>
            <Accordion type={'info'} label={'Metadata'}>
                <Item view={'show'} model={type} data={data} />
            </Accordion>
            <FilesTable files={files} />
        </div>
    )
}

export default CapturesView;
