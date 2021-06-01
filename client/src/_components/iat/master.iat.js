/*!
 * MLP.Client.Components.IAT.Master
 * File: master.iat.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Importer from '../tools/import.tools';
import { genSchema } from '../../_services/schema.services.client';
import Comparator from '../common/comparator';
import MetadataView from '../views/metadata.view';
import { createNodeRoute } from '../../_utils/paths.utils.client';

/**
 * Image selector widget.
 *
 * @public
 * @param {String} panelID
 * @param setToggle
 * @param callback
 */

export const MasterImage = ({
                                  panel1,
                                  panel2,
                                  setToggle = () => {},
                                  callback = () => {},
                              }) => {

    console.log(panel1, panel2)

    // prepare capture metadata
    const historicMetadata = {
        capture: 'Historic',
        mime_type: panel1.mime_type,
        filename: panel1.filename,
        width: panel1.image_dims.w,
        height: panel1.image_dims.h
    }
    const modernMetadata = {
        capture: 'Modern',
        mime_type: panel2.mime_type,
        filename: panel2.filename,
        width: panel2.image_dims.w,
        height: panel2.image_dims.h
    }

    return <>
        <div className={'h-menu centered'}>
            <ul>
                <li key={'master_comparator'}>
                    <Comparator images={[panel1.dataURL, panel2.dataURL]} onStop={()=>{setToggle(null)}} />
                </li>
                <li key={'master_images_import'}>
                    <MetadataView model={'master_images'} metadata={historicMetadata} />
                    <MetadataView model={'master_images'} metadata={modernMetadata} />
                    <Importer
                        model={'modern_images'}
                        view={'master'}
                        schema={genSchema('master', 'modern_images')}
                        route={createNodeRoute(panel1.file_type, 'master', panel1.files_id)}
                        onCancel={() => {setToggle(null)}}
                        data={{
                            historic_capture: panel1.owner_id,
                            modern_capture: panel2.owner_id,
                        }}
                        files={[
                            {
                                name: 'historic_images',
                                value: panel1.blob,
                                filename: panel1.filename
                            },
                            {
                                name: 'modern_images',
                                value: panel2.blob,
                                filename: panel2.filename
                            }
                            ]}
                        callback={(err, model, id) => {
                            console.log(err, model, id);
                            setToggle(null)
                        }}
                    />
                </li>
            </ul>
        </div>
        </>
};



