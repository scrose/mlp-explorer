/*!
 * MLP.Client.Components.View.Comparisons
 * File: comparisons.view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Dialog from '../common/dialog';
import { useRouter } from '../../_providers/router.provider.client';
import CapturesView from './captures.view';
import Button from '../common/button';
import Slider from '../common/comparator';

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

    console.log(captures)

    const [historic, modern] = captures || [];
    const historicImage = typeof historic.files.historic_images != null
        ? historic.files.historic_images.find(img => img.metadata.image_state === 'master') : {};
    const modernImage = typeof historic.files.modern_images != null
        ? modern.files.modern_images.find(img => img.metadata.image_state === 'master') : {};

    console.log(historicImage, modernImage)

    return <Slider images={[historicImage, modernImage]} />;

};

/**
 * Render metadata capture image comparisons component.
 *
 * @public
 */

const ComparisonsView = ({data = {}, callback = () => {} }) => {

    const router = useRouter();

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

    const { id = '', historic_capture = {}, modern_capture = {} } = data || {};

    return <>
        { showDialog() }
        <div className={'comparisons-item'}>
            <div className={'h-menu'}>
                <CapturesView
                    captures={[historic_capture]}
                    fileType={'historic_images'}
                />
                <CapturesView
                    captures={[modern_capture]}
                    fileType={'modern_images'}
                />
            </div>
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
