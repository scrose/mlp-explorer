/*!
 * MLP.Client.Components.IAT.Canvas.Info
 * File: iat.canvas.info.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */
import { useRouter } from '../../../_providers/router.provider.client';
import { createNodeRoute } from '../../../_utils/paths.utils.client';
import { getModelLabel } from '../../../_services/schema.services.client';
import Button from '../../common/button';
import { sanitize } from '../../../_utils/data.utils.client';
import React from 'react';

/**
 * Canvas info status.
 *
 * @param properties
 * @param pointer
 * @param status
 * @public
 */

const CanvasInfo = ({ properties, pointer, status }) => {
    const router = useRouter();
    const captureRoute = createNodeRoute('modern_captures', 'show', properties.owner_id);
    return <div id={`canvas-view-${properties.id}-footer`} className={'canvas-view-info'}>
        {
            properties.filename && properties.file_type &&
            <table>
                <tbody>

                </tbody>
            </table>
        }
        <table>
            <tbody>
            <tr>
                <th>File</th>
                <td colSpan={3}>
                    <span>{
                        properties.filename ? properties.filename : '<Not loaded>'}</span>
                    {
                        properties.file_type &&
                        <span>{
                            properties.files_id
                                ? ` (${getModelLabel(properties.file_type)})`
                                : ` (${properties.file_type})`
                        }</span>
                    }
                    {
                        properties.owner_id && properties.owner_id &&
                        <Button icon={'captures'} onClick={() => {
                            router.update(captureRoute);
                        }} />
                    }
                </td>
            </tr>
            <tr>
                <th>Status:</th>
                <td>{status}</td>
                <th>Cursor:</th>
                <td>({pointer.x}, {pointer.y})</td>
            </tr>
            <tr>
                <th>Edit</th>
                <td>({properties.data_dims.x}, {properties.data_dims.y})</td>
                <th>Canvas</th>
                <td>({properties.base_dims.x}, {properties.base_dims.y})</td>
            </tr>
            <tr>
                <th>Origin</th>
                <td>({properties.origin.x}, {properties.origin.y})</td>
                <th>Offset</th>
                <td>(
                    {Math.floor(properties.offset.x).toFixed(2)},
                    {Math.floor(properties.offset.y).toFixed(2)}
                    )
                </td>
            </tr>
            <tr>
                <th>Image</th>
                <td>
                    ({properties.source_dims.x}, {properties.source_dims.y})
                </td>
                <th>Size</th>
                <td colSpan={3}>{sanitize(properties.file_size, 'filesize')}</td>
            </tr>
            </tbody>
        </table>
    </div>;
};

export default CanvasInfo;