/*!
 * MLP.Client.Components.Views.Captures
 * File: captures.view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { FilesList } from './files.view';
import { getFileLabel } from '../../_services/schema.services.client';

/**
 * Model view component.
 *
 * @public
 * @param {Object} captures
 * @return {JSX.Element}
 */

const CapturesView = ({data}) => {

    // filter files to select viewable images
    const filterCaptures = () => {
        return data
            .reduce((o, capture) => {
                // console.log('Capture:', capture.data, capture.files)
                // conditionally filter capture files by image state
                const cMaster = capture.files
                    .find(file => file.data.image_state === 'master');
                const cInterim = capture.files
                    .find(file => file.data.image_state === 'interim');
                const cRaw = capture.files
                    .find(file => file.data.image_state === 'raw');
                const cMisc = capture.files
                    .find(file => file.data.image_state === 'misc');
                const c = cMaster || cInterim || cRaw || cMisc;

                // label file by capture photo reference
                c['label'] = capture.data.fn_photo_reference || getFileLabel(c);

                // add to image capture list
                o.push(c);
                return o;
            }, [])
            .sort(function(a, b){
                // sort captures by photo reference number
                return a.label.localeCompare(b.label);
            })
    }

    // render node tree
    return (
        <div className={`captures`}>
            <FilesList files={filterCaptures()} />
        </div>
    )
}

export default CapturesView;
