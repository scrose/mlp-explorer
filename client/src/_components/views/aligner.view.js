/*!
 * MLP.Client.Components.Views.IAT
 * File: aligner.view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from "react";
import CanvasMenu from '../menus/canvas.menu';
import Form from '../common/form';
import { getNodeURI } from '../../_utils/paths.utils.client';
import { getCaptureLabel, getFileLabel } from '../../_services/schema.services.client';
import Image from '../common/image';
import { useData } from '../../_providers/data.provider.client';
import Button from '../common/button';

/**
 * Capture image selector
 *
 * @public
 * @param {Array} captures
 */

const CaptureSelector = ({ captures }) => {

    const [imageIndex, setImageIndex] = React.useState(0);
    const [captureIndex, setCaptureIndex] = React.useState(0);
    const [tabIndex, setTabIndex] = React.useState(0);

    // destructure selected capture
    const selectedCapture = captures[tabIndex];
    const {node={}, files={}} = selectedCapture || {};
    const {historic_images=[]} = files || {};

    return <fieldset>
        <legend>Select Historic Captures</legend>
        <div className={`tab`}>
            <div className={`h-menu`}>
                <ul>
                    {
                        captures.map((capture, index) => {
                            const { node={} } = capture || {};
                            return <li key={`tab_${node.id}`}>
                                <Button
                                    className={index===captureIndex ? 'active' : ''}
                                    icon={tabIndex===index ? 'vopen' : 'vclose'}
                                    title={`View ${getCaptureLabel(capture)}.`}
                                    label={getCaptureLabel(capture)}
                                    onClick={() => {
                                        setTabIndex(index);
                                    }}
                                />
                            </li>
                        })
                    }
                </ul>
            </div>
            <div key={`tab_data_${node.id}`} className={'tab-data'}>
                <div className={'gallery h-menu capture-selector'}>
                    <ul>
                        {
                            historic_images.map(imgData => {
                                const { file = {}, url = {} } = imgData || {};
                                return (
                                    <li
                                        key={`capture_gallery_file_${file.id || ''}`}
                                    >
                                        <label key={`label_captures`} htmlFor={file.id}>
                                            <input
                                                readOnly={true}
                                                checked={imageIndex === file.id}
                                                type={'radio'}
                                                name={'historic_captures'}
                                                id={file.id}
                                                value={file.id}
                                                onClick={() => {
                                                    setImageIndex(file.id);
                                                    setCaptureIndex(tabIndex)
                                                }}>
                                            </input>
                                            <Image
                                                url={url}
                                                title={`Select ${file.filename || ''}.`}
                                                label={getFileLabel(file)}
                                                onClick={() => {
                                                    setImageIndex(file.id);
                                                    setCaptureIndex(tabIndex)
                                                }}
                                            />
                                        </label>
                                    </li>
                                )
                            })
                        }
                    </ul>
                </div>
            </div>
        </div>
    </fieldset>
}

/**
 * IAT (Image Analysis Toolkit) wrapper.
 *
 * NOTES:
 * FILE: Adapted from iat.html
 *
 * @param image1
 * @param image2
 * @public
 */

const Canvas = ({dims}) => {
    return  <div className={'image-canvas'}>
        <h5>Image Editor</h5>
        <CanvasMenu data={''} />
        <canvas id={'image-canvas-left'} />
        <canvas id={'image-canvas-right'} />
    </div>

}

/**
 * Image aligner wrapper.
 *
 * @param data
 * @param schema
 * @param callback
 * @public
 */

const Aligner = ({data, schema={}, callback}) => {

    const api = useData();
    const {historic_captures=[]} = api.options || [];

    // destructure image data
    const {file={}, metadata={}, url={}} = data || {};
    const {id=''} = file || {};

    // set canvas dimensions
    const [canvasDims, setCanvasDims] = React.useState({
        canvas1Width: 0.5,
        canvas2Width: 0.0,
        canvas3Width: 0.5
    });

    return (
        <Form route={getNodeURI('modern_images', 'master', id)}
              schema={schema}
              model={'modern_captures'}
              callback={callback}>
            <CaptureSelector captures={historic_captures} />
            <Canvas dims={canvasDims} />
        </Form>
    )
}

export default React.memo(Aligner);


