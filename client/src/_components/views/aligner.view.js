/*!
 * MLP.Client.Components.Views.IAT
 * File: aligner.view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from "react";
import AlignerMenu from '../menus/aligner.menu';
import Form from '../common/form';
import { getNodeURI } from '../../_utils/paths.utils.client';

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
            <AlignerMenu data={''} />
            <Canvas dims={canvasDims} />
        </Form>
    )
}

export default React.memo(Aligner);


