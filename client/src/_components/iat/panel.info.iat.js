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
import { off } from 'leaflet/src/dom/DomEvent';

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

    // compute scales
    const eps = 0.0000000001;
    const scaleX = properties.render_dims.x > 0
        ? ((properties.image_dims.x + eps)/(properties.render_dims.x + eps)).toFixed(2)
        : 1.0;
    const scaleY = properties.render_dims.y > 0
        ? ((properties.image_dims.y + eps)/(properties.render_dims.y + eps)).toFixed(2)
        : 1.0;

    // compute offsets
    const offsetX = Math.ceil(properties.offset.x);
    const offsetY = Math.ceil(properties.offset.y);

    // compute actual cursor position in image
    const actualX = Math.ceil((pointer.x - offsetX) * scaleX);
    const actualY = Math.ceil((pointer.y - offsetY) * scaleY );

    return <div id={`canvas-view-${properties.id}-footer`} className={'canvas-view-info'}>
        <div>
            {
                properties.owner_id && properties.owner_id &&
                <Button
                    icon={'captures'}
                    title={'Go to capture metadata.'}
                    label={getModelLabel(properties.file_type)}
                    onClick={() => {router.update(captureRoute);}}
                />
            }
            <span>{properties.filename ? properties.filename : status}</span>
        </div>
        <table>
            <tbody>
            <tr>
                <th>Type:</th>
                <td>{properties.mime_type || '-'}</td>
                <th>Size</th>
                <td colSpan={3}>{sanitize(properties.file_size, 'filesize')}</td>
            </tr>
            <tr>
                <th>Cursor:</th>
                <td>({pointer.x}, {pointer.y})</td>
                <th>Actual:</th>
                <td>({actualX}, {actualY})</td>
            </tr>
            <tr>
                <th>Scale X:</th>
                <td>1:{scaleX}</td>
                <th>Scale Y:</th>
                <td>1:{scaleY}</td>
            </tr>
            <tr>
                <th>Offset</th>
                <td>({offsetX}, {offsetY})</td>
                <th></th>
                <td></td>
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
            </tbody>
        </table>
    </div>;
};

export default PanelInfo;