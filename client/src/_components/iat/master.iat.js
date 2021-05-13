/*!
 * MLP.Client.Components.IAT.Master
 * File: master.iat.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Importer from '../tools/import.tools';
import { genSchema } from '../../_services/schema.services.client';
import { createNodeRoute } from '../../_utils/paths.utils.client';
import Comparator from '../common/comparator';
import MetadataView from '../views/metadata.view';
import Button from '../common/button';

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
                                  file,
                                  setToggle = () => {},
                                  callback = () => {},
                              }) => {

    // get file metadata
    const { value='' } = file || {};
    const { type='' } = value || {};

    // prepare capture metadata
    const historicMetadata = {
        capture: 'Historic',
        filename: panel1.filename,
        width: panel1.image_dims.x,
        height: panel1.image_dims.y
    }
    const modernMetadata = {
        capture: 'Modern',
        mime_type: type,
        filename: panel2.filename,
        width: panel2.image_dims.x,
        height: panel2.image_dims.y
    }

    return <>
        <div className={'h-menu centered'}>
            <ul>
                <li key={'master_comparator'}>
                    <Comparator images={[panel1.dataURL, panel2.dataURL]} />
                </li>
                <li key={'master_historic'}>
                    <MetadataView model={'master_images'} metadata={historicMetadata} />
                    <MetadataView model={'master_images'} metadata={modernMetadata} />
                    <Importer
                        model={'modern_images'}
                        view={'master'}
                        schema={genSchema('master', 'modern_images')}
                        route={createNodeRoute('modern_images', 'master', panel2.files_id)}
                        onCancel={() => {setToggle(null)}}
                        data={{
                            historic_files_id: panel1.files_id,
                        }}
                        files={[{
                            name: 'modern_images',
                            value: file,
                            filename: panel2.filename
                        }]}
                        callback={(err, model, id) => {console.log(err, model, id); setToggle(null)}}
                    />
                </li>
            </ul>
        </div>
        </>
};



