/*!
 * MLP.Client.Components.Views.Captures
 * File: captures.view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { FilesGallery } from './files.view';
import { sorter } from '../../_utils/data.utils.client';

/**
 * Model view component.
 *
 * @public
 * @param {Array} captures
 * @param captureType
 * @param {String} fileType
 * @return {JSX.Element}
 */

const CapturesView = ({captures, fileType}) => {

    // filter files to select viewable images
    const filterCaptures = () => {
        return (captures || [])
            .filter(capture =>
                capture &&
                capture.hasOwnProperty('files')
                && capture.files.hasOwnProperty(fileType)
                && Object.keys(capture.files).length > 0
            )
            .reduce((o, capture, index) => {

                // get field notes photo reference as capture label
                const {metadata={}} = capture || {};
                const {fn_photo_reference=''} = metadata || {};
                const files = capture.files[fileType];

                // conditionally filter capture files by image state
                const cMaster = files
                    .find(file => file.metadata.image_state === 'master');
                const cInterim = files
                    .find(file => file.metadata.image_state === 'interim');
                const cRaw = files
                    .find(file => file.metadata.image_state === 'raw');
                const cGridded = files
                    .find(file => file.metadata.image_state === 'gridded');
                const cMisc = files
                    .find(file => file.metadata.image_state === 'misc');
                const c = cMaster || cInterim || cRaw || cGridded || cMisc || {};

                // label file by capture photo reference
                if (c != null) {
                    c.label = fn_photo_reference ? fn_photo_reference : `Capture ${index}`;
                    // add to image capture list
                    o.push(c);
                }
                return o;
            }, [])
            .sort(sorter)
    }

    // captures thumbnail gallery
    const filteredCaptures = filterCaptures();
    return (
        filteredCaptures.length > 0 &&
        <div className={`captures`}>
            <FilesGallery files={filteredCaptures} />
        </div>
    )
}

export default CapturesView;
