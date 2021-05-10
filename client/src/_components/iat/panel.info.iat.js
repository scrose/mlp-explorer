/*!
 * MLP.Client.Components.IAT.Canvas.Info
 * File: iat.canvas.info.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import { useRouter } from '../../_providers/router.provider.client';
import { createNodeRoute } from '../../_utils/paths.utils.client';
import { getModelLabel } from '../../_services/schema.services.client';
import Button from '../common/button';
import { sanitize } from '../../_utils/data.utils.client';
import React from 'react';

/**
 * Canvas info status.
 *
 * @param properties
 * @param pointer
 * @param status
 * @public
 */

const PanelInfo = ({ properties, pointer, status }) => {

    // if capture image: provide link to metadata
    const router = useRouter();
    const captureRoute = createNodeRoute('modern_captures', 'show', properties.owner_id);

    return <div id={`canvas-view-${properties.id}-footer`} className={'canvas-view-info'}>
        <table>
            <tbody>
            <tr>
                <th>File</th>
                <td colSpan={3}>
                    {
                        properties.owner_id && properties.owner_id &&
                        <Button
                            icon={'captures'}
                            title={'Go to capture metadata.'}
                            label={getModelLabel(properties.file_type)}
                            onClick={() => {router.update(captureRoute);}}
                        />
                    }
                    <span>{properties.filename ? properties.filename : 'Not Loaded'}</span>
                </td>
            </tr>
            <tr>
                <th>Status:</th>
                <td>{status}</td>
                <th>Cursor:</th>
                <td>({pointer.x}, {pointer.y})</td>
            </tr>
            <tr>
                <th>Origin</th>
                <td>({properties.origin.x}, {properties.origin.y})</td>
                <th>Offset</th>
                <td>({Math.floor(properties.offset.x)}, {Math.floor(properties.offset.y)})</td>
            </tr>
            <tr>
                <th>Resized</th>
                <td>[{properties.render_dims.x}, {properties.render_dims.y}]</td>
                <th>Image</th>
                <td>[{properties.image_dims.x}, {properties.image_dims.y}]</td>
            </tr>
            <tr>
                <th>Canvas</th>
                <td>[{properties.base_dims.x}, {properties.base_dims.y}]</td>
                <th>Source</th>
                <td>[{properties.source_dims.x}, {properties.source_dims.y}]</td>
            </tr>
            <tr>
                <th>File Type</th>
                <td>{properties.file_type}</td>
                <th>Size</th>
                <td colSpan={3}>{sanitize(properties.file_size, 'filesize')}</td>
            </tr>
            </tbody>
        </table>
    </div>;
};

export default PanelInfo;