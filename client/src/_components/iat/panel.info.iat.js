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
 * @param options
 * @public
 */

const PanelInfo = ({ properties, pointer, status, options }) => {

    // if capture image: provide link to metadata
    const router = useRouter();
    const captureRoute = createNodeRoute('modern_captures', 'show', properties.owner_id);

    // compute scales
    const eps = 0.0000000001;
    const scaleX = properties.render_dims.w > 0
        ? ((properties.image_dims.w + eps)/(properties.render_dims.w + eps)).toFixed(2)
        : 1.0;
    const scaleY = properties.render_dims.h > 0
        ? ((properties.image_dims.h + eps)/(properties.render_dims.h + eps)).toFixed(2)
        : 1.0;

    // compute offsets
    const offsetX = Math.ceil(properties.render_dims.x);
    const offsetY = Math.ceil(properties.render_dims.y);

    // compute actual cursor position in image
    const actualX = Math.ceil((pointer.x - offsetX) * scaleX);
    const actualY = Math.ceil((pointer.y - offsetY) * scaleY );

    return <div id={`canvas-view-${properties.id}-info`} className={'canvas-view-info'}>
        <div>
            {
                options.mode === 'crop' &&
                <table>
                    <tbody>
                    <tr>
                        <th>Crop Size</th>
                        <td>
                            [{ pointer.selectBox.w }, { pointer.selectBox.h }]
                        </td>
                        <td>

                        </td>
                    </tr>
                    </tbody>
                </table>
            }
            <table>
                <tbody>
                <tr>
                    <th>File</th>
                    <td>{
                            properties.filename ? properties.filename : status
                        }
                        {
                            properties.owner_id &&
                            <Button
                                icon={'captures'}
                                title={'Go to capture metadata.'}
                                label={getModelLabel(properties.file_type)}
                                onClick={() => {router.update(captureRoute);}}
                            />
                        }
                    </td>
                </tr>
                </tbody>
            </table>
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
                <th>Rendered</th>
                <td>[{properties.render_dims.w}, {properties.render_dims.h}]</td>
                <th>Image</th>
                <td>[{properties.image_dims.w}, {properties.image_dims.h}]</td>
            </tr>
            <tr>
                <th>Canvas</th>
                <td>[{properties.base_dims.w}, {properties.base_dims.h}]</td>
                <th>Source</th>
                <td>[{properties.original_dims.w}, {properties.original_dims.h}]</td>
            </tr>
            </tbody>
        </table>
    </div>;
};

export default PanelInfo;