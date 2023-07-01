/*!
 * MLP.Client.Tools.IAT.Canvas
 * File: canvas.iat.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React, {forwardRef, useRef, useImperativeHandle, useEffect} from 'react';

/**
 * Image Analysis Toolkit: Canvas component
 */

const Canvas = forwardRef(function Canvas(props, ref) {

    const canvasRef = useRef(null);
    const {onKeyDown, onKeyUp} = props || {};

    // add event listener for key events
    useEffect(()=>{
        if (onKeyDown && onKeyDown) {
            document.addEventListener('keydown', onKeyDown);
            document.addEventListener('keyup', onKeyUp);
            return () => {
                document.removeEventListener("keydown", onKeyDown);
                document.removeEventListener("keyup", onKeyUp);
            };
        }
    }, [onKeyDown, onKeyUp])

    useImperativeHandle(ref, () => {
        const context = canvasRef.current.getContext('2d', { willReadFrequently: true });
        return {
            load: (image) => {

                if (!image) return;

                // load image data to image canvas
                canvasRef.current.width = image.width;
                canvasRef.current.height = image.height;

                // draw image to canvas
                if (image instanceof HTMLImageElement)
                    context.drawImage(image, 0, 0, image.width, image.height);
                else context.putImageData(image, 0, 0);
            },
            putImageData: (imageData, dims) => {

                /**
                 * Loads image data to canvas
                 * Note: Image size sets new data canvas dimensions
                 *
                 * @public
                 */

                // destructure dimensions
                const {x, y, w, h} = dims || {};

                // put image to canvas
                context.putImageData(imageData, x || 0, y || 0, 0, 0, w || imageData.width, h || imageData.height);
            },
            draw: (image, dims) => {

                /**
                 * Redraws image data to canvas
                 * Note: Scale sets new data canvas dimensions
                 * - dx
                 *   The x-axis coordinate in the destination canvas at which to place the top-left
                 *   corner of the source image.
                 * - dy
                 *   The y-axis coordinate in the destination canvas at which to place the top-left
                 *   corner of the source image.
                 * - dWidth
                 *   The width to draw the image in the destination canvas. This allows scaling of the
                 *   drawn image. If not specified, the image is not scaled in width when drawn.
                 * - dHeight
                 *   The height to draw the image in the destination canvas. This allows scaling of
                 *   the drawn image. If not specified, the image is not scaled in height when drawn.
                 *
                 * @public
                 */

                if (!image) return;

                // clear, resize and render image data to canvas
                const {source, view} = dims || {};
                context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                // set canvas dimensions
                // canvasRef.current.width = view && view.w || canvasRef.current.width;
                // canvasRef.current.height = view && view.h || canvasRef.current.height;
                // draw source image to canvas
                context.drawImage(
                    image,
                    source && source.x || view && view.x || 0,
                    source && source.y || view && view.y || 0,
                    source && source.w || image.width,
                    source && source.h || image.height,
                    view && view.x,
                    view && view.y,
                    view && view.w,
                    view && view.h
                );
            },
            canvas: () => {
                return canvasRef.current;
            },
            context: () => {
                return context;
            },
            clear: () => {
                context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            },
            dims: () => {
                return {w: canvasRef.current.width, h: canvasRef.current.height};
            },
            bounds: () => {
                return canvasRef.current.getBoundingClientRect();
            },
            data: () => {
                return canvasRef.current.toDataURL('image/jpeg', 1.0);
            },
            getImageData: () => {
                return context.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
            },
            blob: (image, callback) => {
                // if image data is provided, load to canvas and convert to blob
                if (image) {
                    if (image instanceof HTMLImageElement)
                        context.drawImage(image, 0, 0, image.width, image.height);
                    else context.putImageData(image, 0, 0);
                }
                return canvasRef.current.toBlob(callback);
            },
            alpha: (alpha) => {
                // set canvas opacity
                canvasRef.current.style.opacity = alpha;
            }
        };
    }, []);

    return <canvas {...props} ref={canvasRef} />;
});

export default Canvas;
