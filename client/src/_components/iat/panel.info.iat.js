/*!
 * MLP.Client.Components.IAT.Canvas.Info
 * File: iat.canvas.info.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import { getModelLabel } from '../../_services/schema.services.client';
import Button from '../common/button';
import { sanitize } from '../../_utils/data.utils.client';
import React from 'react';
import { getScale, scalePoint } from './transform.iat';
import { createNodeRoute, redirect } from '../../_utils/paths.utils.client';

/**
 * Canvas info status.
 *
 * @param properties
 * @param pointer
 * @param status
 * @param setDialog
 * @param options
 * @public
 */

const PanelInfo = ({ properties, pointer, status, setDialog, options }) => {

    // compute actual cursor position in image
    const scale = getScale(properties);
    const actual = scalePoint(pointer, properties);

    return <div id={`canvas-view-${properties.id}-info`} className={'canvas-view-info'}>
        <>
            {
                status !== 'loaded'
                && status !== 'error'
                && status !== 'empty'
                && status !== 'draw'
                &&
                <div className={'canvas-status'}>
                    <Button label={`Working (${status})`} spin={true} icon={'spinner'} />
                </div>
            }
            <table>
                <tbody>
                <tr>
                    <th>File:</th>
                    <td style={{width: '75%'}} className={'h-menu'}>
                        <ul>
                            <li>
                            {
                                properties.filename ? properties.filename : 'Not Loaded'
                            }
                            </li>
                        {
                            properties.owner_id &&
                            <li className={'push'}><Button
                                icon={'show'}
                                title={'View image metadata.'}
                                label={`${ getModelLabel(properties.file_type)}`}
                                onClick={() => {setDialog({
                                    id: properties.id,
                                    label: properties.label,
                                    type: 'capture',
                                })}}
                            /><Button
                                icon={properties.owner_type}
                                title={'Go to capture.'}
                                onClick={() => {
                                    redirect(createNodeRoute(properties.owner_type, 'show', properties.owner_id))
                                }}
                            /></li>
                        }
                        </ul>
                    </td>
                </tr>
                </tbody>
            </table>
        </>
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
                <td>({actual.x}, {actual.y})</td>
            </tr>
            <tr>
                <th>Scale:</th>
                <td>1:{scale.x}</td>
                <th>Offset:</th>
                <td>({properties.render_dims.x}, {properties.render_dims.y})</td>
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
                <th>Original</th>
                <td>[{properties.original_dims.w}, {properties.original_dims.h}]</td>
            </tr>
            </tbody>
        </table>
    </div>;
};

export default PanelInfo;