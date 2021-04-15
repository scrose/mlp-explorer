/*!
 * MLP.Client.Components.Common.Canvas
 * File: canvas.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { getImageURL } from '../../_utils/image.utils.client';

/**
 * Canvas Image Viewer component
 *
 * NOTES:
 * FILE: Adapted from Image Analysis Toolkit (IAT), Mike Whitney
 *
 * @param id
 * @param dims
 * @param hidden
 * @param options
 * @param image
 * @public
 */

export const Canvas = ({
                           id='canvas',
                           dims={ x: 300, y: 300 },
                           image=null,
                           hidden=false,
                           setMessage=()=>{},
                           onClick=()=>{},
                           onMouseMove=()=>{}
}) => {

    // create DOM references
    const imgRef = React.useRef(null);
    const canvasRef = React.useRef(null);

    /**
     * Load canvas data.
     */

    React.useEffect(() => {

        // load canvas 1
        if (canvasRef.current && canvasRef.current.getContext) {
            let ctx = canvasRef.current.getContext('2d');

            // load image 1 (if available)
            if (imgRef.current) {
                imgRef.current.onload = () => {
                    ctx.drawImage(imgRef.current, 0, 0, dims.x, dims.y);
                };
            }
        }

    }, [image, dims]);

    return !hidden &&
            <div className={'canvas'}>
                <canvas
                    ref={canvasRef}
                    id={id}
                    width={dims.x}
                    height={dims.y}
                    onMouseMove={(e) => {
                        onMouseMove(e, canvasRef.current);
                    }}
                    onClick={(e) => {
                        onClick(e, canvasRef.current);
                    }}
                    onDoubleClick={() => {
                    }}
                >
                    Canvas Not Supported
                </canvas>
            }
            {
                getImageURL(image) &&
                <img ref={imgRef} src={getImageURL(image)} alt={`${id} canvas`}/>
            }
            </div>;
};

export default React.memo(Canvas);