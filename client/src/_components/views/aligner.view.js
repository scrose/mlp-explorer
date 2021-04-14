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
import Image from '../common/image';
import Button from '../common/button';
import Accordion from '../common/accordion';

/**
 * Capture image selector
 *
 * @public
 * @param {Array} captures
 * @param imageIndex
 * @param setImageIndex
 */

const CaptureSelector = ({
                             captures,
                             setSelected=()=>{},
}) => {

    const [tabIndex, setTabIndex] = React.useState(0);
    const [imageIndex, setImageIndex] = React.useState(0);
    const [captureIndex, setCaptureIndex] = React.useState(0);

    // destructure selected capture
    const selectedCapture = captures[tabIndex];
    const {node={}, files={}} = selectedCapture || {};
    const {historic_images=[]} = files || {};

    return <Accordion label={'Select Historic Image'} type={'historic_images'} open={true}>
            <div className={`tab h-menu`}>
                <div className={`v-menu`}>
                    <ul>
                        {
                            captures.map((capture, index) => {
                                const { node={}, label='' } = capture || {};
                                return <li key={`tab_${node.id}`}>
                                    <Button
                                        className={index===captureIndex ? 'active' : ''}
                                        icon={tabIndex===index ? 'vopen' : 'vclose'}
                                        title={`View ${label}.`}
                                        label={label}
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
                                    const { file = {}, url = {}, label='' } = imgData || {};
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
                                                        setCaptureIndex(tabIndex);
                                                        setSelected(imgData);
                                                    }}>
                                                </input>
                                                <Image
                                                    url={url}
                                                    title={`Select ${file.filename || ''}.`}
                                                    label={label}
                                                    onClick={() => {
                                                        setImageIndex(file.id);
                                                        setCaptureIndex(tabIndex);
                                                        setSelected(imgData);
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
    </Accordion>
}

/**
 * IAT (Image Analysis Toolkit) wrapper.
 *
 * NOTES:
 * FILE: Adapted from iat.html
 *
 * @param dims
 * @param image1
 * @param image2
 * @public
 */

const Canvas = ({dims, image1, image2}) => {

    const imgSrc1 = typeof image1.url != 'undefined' ? image1.url.medium : '';
    const imgSrc2 = typeof image2.url != 'undefined' ? image2.url.medium : '';

    // create DOM references
    const imgRef1 = React.useRef();
    const canvas1Ref = React.useRef();
    const imgRef2 = React.useRef();
    const canvas2Ref = React.useRef();

    React.useEffect(() => {
        if (imgRef1.current && canvas1Ref.current && canvas1Ref.current.getContext) {
            let ctx = canvas1Ref.current.getContext('2d');
            imgRef1.current.onload = () =>
            {
                ctx.drawImage(imgRef1.current, 0, 0);
            }
        }

        if (imgRef2.current && canvas2Ref.current && canvas2Ref.current.getContext) {
            let ctx = canvas2Ref.current.getContext('2d');
            imgRef2.current.onload = () =>
            {
                ctx.drawImage(imgRef2.current, 0, 0);
            }
        }
    }, [image1, image2]);

    return  <div className={'image-editor'}>
        <h5>Image Editor</h5>
        <CanvasMenu data={''} />
        <div className={'image-canvas'}>
            <canvas
                ref={canvas1Ref}
                id={'image-canvas-left'}
                width={dims.canvas1.w}
                height={dims.canvas1.h}>
                Canvas Not Supported
            </canvas>
            {
                imgSrc1 &&
                <img ref={imgRef1} src={imgSrc1} alt={'Left Canvas'} />
            }
            <canvas
                ref={canvas2Ref}
                id={'image-canvas-right'}
                width={dims.canvas2.w}
                height={dims.canvas2.h}>
                Canvas Not Supported
            </canvas>
            {
                imgSrc2 &&
                <img ref={imgRef2} src={imgSrc2} alt={'Right Canvas'} />
            }
        </div>
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

    const [selectedImage, setSelectedImage] = React.useState({});
    const {modern_capture={}, historic_captures=[]} = data || [];

    // destructure image data
    const {file={}} = modern_capture || {};
    const {id=''} = file || {};

    // set canvas dimensions
    const [canvasDims, setCanvasDims] = React.useState({
        canvas1: {w: 300, h: 300},
        canvas2: {w: 300, h: 300},
    });

    return <>
        <CaptureSelector
            captures={historic_captures}
            setSelected={setSelectedImage}
        />
        <Canvas
            dims={canvasDims}
            image1={selectedImage}
            image2={modern_capture}
        />
        <Form
            route={getNodeURI('modern_images', 'master', id)}
            schema={schema}
            model={'modern_captures'}
            callback={callback}
        />
    </>
}

export default React.memo(Aligner);


