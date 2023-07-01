/*!
 * MLP.Client.Components.IAT.Uploader
 * File: uploader.iat.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React, {useEffect, useRef} from 'react';
import Editor from '../../editors/default.editor';
import {genSchema} from '../../../_services/schema.services.client';
import {createNodeRoute} from '../../../_utils/paths.utils.client';
import { useUser } from '../../../_providers/user.provider.client';
import {useIat} from "../../../_providers/iat.provider.client";
import InputSelector from "../../selectors/input.selector";
import {UserMessage} from "../../common/message";
import Canvas from "../canvas/canvas.iat";
import {scaleToFit} from "../controls/transform.iat";
import Loading from "../../common/loading";

/**
 * Upload images from IAT canvas to MLP library.
 *
 * @public
 */

export const UploaderIAT = ({ id=null, model=null, callback = () => {}, cancel = () => {} }) => {

    const user = useUser();
    const iat = useIat();

    // define image canvas layers to store image data
    const imageLayer1 = useRef(null);
    const imageLayer2 = useRef(null);

    const [message, setMessage] = React.useState(null);
    const [selectedPanelID, setSelectedPanelID] = React.useState(null);
    const [imageData, setImageData] = React.useState(null);

    // get new file type
    const fileType = String(model) === 'historic_captures' ? 'historic_images' : 'modern_images';

    /**
     * Load uploader images
     *
     * @private
     */

    useEffect(()=>{
        // load data into image layers
        console.log(iat.panel1.image, iat.panel2.image)
        imageLayer1.current.load(iat.panel1.image);
        imageLayer2.current.load(iat.panel2.image);
        // // compute scaled dimensions to fit view canvas
        // const viewDims1 = scaleToFit(
        //     iat.panel1.properties.image_dims.w,
        //     iat.panel1.properties.image_dims.h,
        //     iat.options.maxCanvasWidth,
        //     iat.options.maxCanvasHeight,
        // );
        //
        // // draw top layer view
        // renderLayer1.current.draw(imageLayer1.current.canvas(), {
        //     view: { x: 0, y: 0, w: viewDims1.w, h: viewDims1.h },
        //     source: { x: 0, y: 0, w: iat.panel1.properties.image_dims.w, h: iat.panel1.properties.image_dims.h }
        // });
        //
        // // load into image layer
        //
        // // compute scaled dimensions to fit view canvas
        // const viewDims2 = scaleToFit(
        //     iat.panel2.properties.image_dims.w,
        //     iat.panel2.properties.image_dims.h,
        //     iat.options.maxCanvasWidth,
        //     iat.options.maxCanvasHeight,
        // );
        //
        // // draw bottom layer view
        // renderLayer2.current.draw(imageLayer2.current.canvas(), {
        //     view: { x: 0, y: 0, w: viewDims2.w, h: viewDims2.h },
        //     source: { x: 0, y: 0, w: iat.panel2.properties.image_dims.w, h: iat.panel2.properties.image_dims.h }
        // });
        //
        // // set comparator properties
        // const bounds = renderLayer1.current.bounds();
        // setProperties({
        //     base_dims: comparatorDims,
        //     bounds: {
        //         top: bounds.top,
        //         left: bounds.left,
        //         w: bounds.width,
        //         h: bounds.height,
        //     },
        //     image_dims: iat.panel1.properties.image_dims,
        //     render_dims: { x: 0, y: 0, w: viewDims1.w, h: viewDims1.h }
        // });


    }, []);

    // update selected panel to load image
    const _handleCanvasToBlob = (blob) => {
        console.log(blob)
        setImageData(blob);
        setMessage({msg: `Image ready for upload!`, type: 'success'});
    }


    // update selected panel to load image
    const _handleSelectPanel = (e) => {
        const { target={} } = e || {};
        const { value='' } = target;
        setSelectedPanelID(value);
        if (!value) return;
        const {label} = iat.hasOwnProperty(value) && iat[value].properties;
        // image not loaded into panel
        if (!iat[value].image) return setMessage({msg: `No image loaded in ${label}.`, type: 'warning'});
        // create blob from selected panel canvas
        setMessage({msg: `Buffering image data from ${label}...`, type: 'info'});
        value === 'panel1'
            ? imageLayer1.current.blob(null, _handleCanvasToBlob)
            : imageLayer2.current.blob(null, _handleCanvasToBlob)

    }
    //
    // Editor = ({
    //               model,
    //               view,
    //               schema,
    //               batchType = '',
    //               reference,
    //               route,
    //               files=[],
    //               loader=null,
    //               onCancel=()=>{},
    //               onRefresh=()=>{},
    //               callback=()=>{}
    //           }) => {

    return <>
        <InputSelector
            id={'panel-selector'}
            type={'select'}
            label={'Select the Image Toolkit Panel'}
            value={selectedPanelID}
            onChange={_handleSelectPanel}
            options={[
                {value:'panel1', label:'Upload image from Left Panel'},
                {value:'panel2', label:'Upload image from Right Panel'}
            ]}
        />
        {
            !user && <UserMessage closeable={false} message={{msg: 'Upload is restricted to admin users.'}} />
        }
        {
            selectedPanelID && message && <UserMessage closeable={false} message={message} />
        }
        {
            user && imageData && selectedPanelID && iat.hasOwnProperty(selectedPanelID) &&
            <Editor
                model={fileType}
                view={'new'}
                schema={genSchema({
                    view: 'upload',
                    model: fileType,
                    user: user
                })}
                route={createNodeRoute(fileType, 'new', id)}
                onCancel={cancel}
                files={[
                    {
                        name: fileType,
                        value: imageData,
                        filename: iat[selectedPanelID].properties.filename
                    }
                ]}
                callback={callback}
            />
        }
        <Canvas
            ref={imageLayer1}
            id={`comparator_render_layer`}
            className={`layer canvas-layer-render hidden`}
            width={iat.options.maxImageWidth}
            height={iat.options.maxImageHeight}
        />
        <Canvas
            ref={imageLayer2}
            id={`comparator_render_layer`}
            className={`layer canvas-layer-render hidden`}
            width={iat.options.maxImageWidth}
            height={iat.options.maxImageHeight}
        />
        </>
};



