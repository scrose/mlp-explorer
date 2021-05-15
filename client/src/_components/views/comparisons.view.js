/*!
 * MLP.Client.Components.View.Comparisons
 * File: comparisons.view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Dialog from '../common/dialog';
import Button from '../common/button';
import { FilesList } from './files.view';
import Comparator from '../common/comparator';

/**
 * Render metadata capture image comparison overlay component.
 *
 * @public
 */

const ComparisonOverlay = ({
                               captures = {},
                               callback = () => {
                               },
                           }) => {

    const [historic, modern] = captures || [];
    const historicImage = typeof historic.files.historic_images != null
        ? historic.files.historic_images.find(img => img.metadata.image_state === 'master') : {};
    const modernImage = typeof historic.files.modern_images != null
        ? modern.files.modern_images.find(img => img.metadata.image_state === 'master') : {};

    return <Comparator images={[historicImage, modernImage]} />;

};

/**
 * Render metadata capture image comparisons component.
 *
 * @public
 */

const ComparisonsView = ({data = {}, callback = () => {} }) => {

    // toggle to dhow/hide popup dialogs
    const [dialogToggle, setDialogToggle] = React.useState('');
    const [comparison, setComparison] = React.useState([]);

    const comparisonDialogs = {
        overlay: <Dialog title={'Overlay'} setToggle={setDialogToggle}>
            <ComparisonOverlay captures={comparison} />
        </Dialog>,
        remaster: <Dialog title={'Remaster'} setToggle={setDialogToggle}>
            Remaster
        </Dialog>
    };

    // show dialog popup
    const showDialog = () => {
        return comparisonDialogs.hasOwnProperty(dialogToggle)
            ? comparisonDialogs[dialogToggle]
            : '';
    };

    const { historic_capture = {}, modern_capture = {} } = data || {};

    // check if capture has no files
    const hasMissingFiles = (
        modern_capture.hasOwnProperty('files')
        && Object.keys(modern_capture.files).length === 0
    ) || (
        historic_capture.hasOwnProperty('files')
        && Object.keys(historic_capture.files).length === 0
    )

    return <>
        { showDialog() }
        <div className={`comparisons-item${hasMissingFiles ? ' missing' : ''}`}>
            <FilesList
                files={[historic_capture.refImage, modern_capture.refImage]}
            />
            <div className={'h-menu'}>
                <ul>
                    <li>
                        <Button
                            icon={'overlay'}
                            label={'View Overlay'}
                            onClick={() => {
                                setDialogToggle('overlay');
                                setComparison([historic_capture, modern_capture])
                            }}
                        />
                    </li>
                    {
                        hasMissingFiles &&
                        <li>
                            <Button
                                className={'msg warning'}
                                icon={'warning'}
                                label={'Missing Image'}
                                onClick={() => {
                                }}
                            />
                        </li>
                    }
                    {/*<li>*/}
                    {/*    <Button*/}
                    {/*        icon={'master'}*/}
                    {/*        label={'Remaster'}*/}
                    {/*        onClick={() => {*/}
                    {/*            setDialogToggle('remaster');*/}
                    {/*        }}*/}
                    {/*    /></li>*/}
                </ul>
            </div>
        </div>
    </>;
};

export default React.memo(ComparisonsView);
