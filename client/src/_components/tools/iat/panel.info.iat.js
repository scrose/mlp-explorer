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

const CanvasInfo = ({ panel, pointer, status }) => {

    // if capture image: provide link to metadata
    const router = useRouter();
    const captureRoute = createNodeRoute('modern_captures', 'show', panel.props.owner_id);

    return <div id={`canvas-view-${panel.id}-footer`} className={'canvas-view-info'}>
        <table>
            <tbody>
            <tr>
                <th>File</th>
                <td colSpan={3}>
                    <span>{
                        panel.props.filename ? panel.props.filename : '<Not loaded>'}</span>
                    {
                        panel.props.file_type &&
                        <span>{
                            panel.props.files_id
                                ? ` (${getModelLabel(panel.props.file_type)})`
                                : ` (${panel.props.file_type})`
                        }</span>
                    }
                    {
                        panel.props.owner_id && panel.props.owner_id &&
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
                <td>({panel.props.data_dims.x}, {panel.props.data_dims.y})</td>
                <th>Canvas</th>
                <td>({panel.props.base_dims.x}, {panel.props.base_dims.y})</td>
            </tr>
            <tr>
                <th>Origin</th>
                <td>({panel.props.origin.x}, {panel.props.origin.y})</td>
                <th>Offset</th>
                <td>({Math.floor(panel.props.offset.x)}, {Math.floor(panel.props.offset.y)})</td>
            </tr>
            <tr>
                <th>Image</th>
                <td>
                    ({panel.props.source_dims.x}, {panel.props.source_dims.y})
                </td>
                <th>Size</th>
                <td colSpan={3}>{sanitize(panel.props.file_size, 'filesize')}</td>
            </tr>
            </tbody>
        </table>
    </div>;
};

export default CanvasInfo;