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
import { genID } from '../../_utils/data.utils.client';
import { useRouter } from '../../_providers/router.provider.client';

/**
 * Render metadata capture image comparisons component.
 *
 * @public
 */

const ComparisonsView = ({
                             data = {}, callback = () => {
    },
                         }) => {

    const keyID = genID();
    const router = useRouter();

    // toggle to dhow/hide popup dialogs
    const [dialogToggle, setDialogToggle] = React.useState('');
    const [comparison, setComparison] = React.useState([]);
    const [historicImage=null, modernImage=null] = comparison || [];

    return <>
        {
            historicImage && modernImage && dialogToggle === 'overlay' &&
            <Dialog title={'Overlay'} setToggle={setDialogToggle}>
                <Comparator images={[historicImage, modernImage]} />
            </Dialog>
        }
        <div className={'comparisons h-menu'}>
            <ul>
                {
                    // map the captures to file comparisons
                    data.map((comparisonPair, index) => {

                        // destructure image pair for each comparison
                        const {
                            historic_image = {},
                            historic_image_id = '',
                            modern_image,
                            modern_image_id = '',
                        } = comparisonPair || {};

                        return <li key={`${keyID}_comparison_${index}`}>
                            <div className={`comparisons-item`}>
                                <FilesList files={[historic_image, modern_image]} />
                                <div className={'h-menu'}>
                                    <ul>
                                        <li>
                                            <Button
                                                icon={'overlay'}
                                                label={'View Overlay'}
                                                onClick={() => {
                                                    setDialogToggle('overlay');
                                                    setComparison([historic_image, modern_image]);
                                                }}
                                            />
                                        </li>
                                        <li>
                                            <Button
                                                icon={'align'}
                                                label={'Remaster'}
                                                onClick={() => {
                                                    // launch IAT tool for mastering by loading images into panels
                                                    // - Historic: Panel 1 / Modern: Panel 2
                                                    router.update(`/iat?input1=${historic_image_id}&type1=historic_images&input2=${modern_image_id}&type2=modern_images`);
                                                }}
                                            /></li>
                                    </ul>
                                </div>
                            </div>
                        </li>;
                    })
                }
            </ul>
        </div>
    </>;
};

export default React.memo(ComparisonsView);
