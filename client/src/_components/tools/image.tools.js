/*!
 * MLP.Client.Components.Views.Aligner
 * File: canvas.view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { Canvas, initCanvas } from '../common/canvas';
import { CanvasMenu } from '../menus/canvas.menu';
import { ValidationMessage } from '../common/input';
import { createNodeRoute, getQuery } from '../../_utils/paths.utils.client';
import { useRouter } from '../../_providers/router.provider.client';
import { filterKeyPress, moveAt, moveStart } from '../../_utils/image.utils.client';

/**
 * Canvas API image editor component.
 *
 * @public
 */

const ImageTools = () => {

    const router = useRouter();
    const _isMounted = React.useRef(false);

    // canvas identifiers
    const canvas1ID = 'canvas1';
    const canvas2ID = 'canvas2';

    // initial inputs (optional)
    let input1 = null, input2 = null;

    const [options, setOptions] = React.useState({
        mode: 'default',
        controlPtMax: 4
    });

    // Canvas properties
    const [canvas1Data, setCanvas1Data] = React.useState(initCanvas(canvas1ID, input1));
    const [canvas2Data, setCanvas2Data] = React.useState(initCanvas(canvas2ID, input2));

    // Editable image data
    const [img1Data, setImg1Data] = React.useState(null);
    const [img2Data, setImg2Data] = React.useState(null);

    // initialize default methods for control canvas
    // - default mode
    const [methods, setMethods] = React.useState({
        onDragStart: moveStart,
        onDrag: moveAt,
        onKeyDown: filterKeyPress
    });

    // initialize error/info messages
    const [message, setMessage] = React.useState({});

    // set image selection state
    const [selection, setSelection] = React.useState([]);

    // initialize menu dialog toggle
    const [dialogToggle, setDialogToggle] = React.useState(null);

    // initialize error flag
    const [error, setError] = React.useState(null);

    // initialize canvas pointer event data
    const [pointer, setPointer] = React.useState({
        canvas1: { x: 0, y: 0 },
        canvas2: { x: 0, y: 0 }
    });

    // get query parameter for master option
    // - must correspond to a modern image file ID
    const input1ImgID = getQuery('input1') || '';
    const input2ImgID = getQuery('input2') || '';
    const masterID = getQuery('master') || '';

    /**
     * Load initial input image data (if requested)
     */

    React.useEffect(() => {
        _isMounted.current = true;
        // Initialize IAT from input parameters
        // - load input image (only if not currently loaded)
        // - get available historic image selection for given modern capture image
        if (masterID && !input2) {
            router.get(createNodeRoute('modern_images', 'master', masterID))
                .then(res => {
                    if (_isMounted.current) {
                        if (!res || res.error) {
                            return setMessage(
                                res.hasOwnProperty('error')
                                    ? res.error
                                    : {msg: 'Error occurred.', type:'error'}
                            );
                        }
                        const { response = {} } = res || {};
                        const { data = {}, message={} } = response || {};
                        setMessage(message);
                        // get capture data (if available)
                        const { historic_captures = [], modern_capture = {} } = data || {};
                        setSelection(historic_captures);
                        setCanvas2Data(initCanvas(canvas2ID, modern_capture));
                    }
                });
        }
        return ()=>{_isMounted.current = false;}
    }, [input2ImgID, router, setSelection, setCanvas2Data]);

    return <>
        <CanvasMessage message={message} />
        <div className={'canvas-board'}>
            <Canvas
                id={canvas1ID}
                options={options}
                setOptions={setOptions}
                properties={canvas1Data}
                setProperties={setCanvas1Data}
                inputImage={img1Data}
                setInputImage={setImg1Data}
                pointer={pointer.canvas1}
                setPointer={setPointer}
                setMessage={setMessage}
                setDialogToggle={setDialogToggle}
                onClick={methods.onClick}
                onDragStart={methods.onDragStart}
                onKeyDown={methods.onKeyDown}
                onDrag={methods.onDrag}
                hidden={canvas1Data.hidden}
            />
            <Canvas
                id={canvas2ID}
                options={options}
                setOptions={setOptions}
                properties={canvas2Data}
                setProperties={setCanvas2Data}
                inputImage={img2Data}
                setInputImage={setImg2Data}
                pointer={pointer.canvas2}
                setPointer={setPointer}
                setMessage={setMessage}
                setDialogToggle={setDialogToggle}
                onClick={methods.onClick}
                onDragStart={methods.onDragStart}
                onKeyDown={methods.onKeyDown}
                onDrag={methods.onDrag}
                hidden={canvas2Data.hidden}
            />
            <CanvasMenu
                options={options}
                setOptions={setOptions}
                canvas1={canvas1Data}
                setCanvas1={setCanvas1Data}
                canvas2={canvas2Data}
                setCanvas2={setCanvas2Data}
                image1={img1Data}
                setImage1={setImg1Data}
                image2={img2Data}
                setImage2={setImg2Data}
                selection={selection}
                setMethods={setMethods}
                dialogToggle={dialogToggle}
                setDialogToggle={setDialogToggle}
                pointer={pointer}
                setPointer={setPointer}
                setMessage={setMessage}
            />
        </div>
    </>
}

export default React.memo(ImageTools);

/**
 * Messages for canvas events.
 *
 * @public
 */

const CanvasMessage = ({message}) => {
    const {msg='', type='error'} = message || {};
    return msg && <ValidationMessage msg={[msg]} type={type} />
}