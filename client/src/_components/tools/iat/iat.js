/*!
 * MLP.Client.IAT
 * File: iat.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { PanelIat } from './panel.iat';
import { MenuIat } from './menu.iat';
import { createNodeRoute, getQuery } from '../../../_utils/paths.utils.client';
import { useRouter } from '../../../_providers/router.provider.client';
import { moveAt, moveStart, moveEnd } from './transform.iat';
import { UserMessage } from '../../common/message';
import { filterKeyDown, filterKeyUp } from './canvas.controls.iat';

/**
 * Default settings.
 * - default canvas dimensions
 */

const DEFAULT_DIMS_X = 450;
const DEFAULT_DIMS_Y = 400;

/**
 * Canvas API image editor component.
 *
 * @public
 */

const Iat = () => {

    const router = useRouter();
    const _isMounted = React.useRef(false);

    // canvas identifiers
    const panel1ID = 'panel1';
    const panel2ID = 'panel2';
    const panel1Label = 'Panel 1';
    const panel2Label = 'Panel 2';

    // initial inputs (optional)
    let input1 = null, input2 = null;

    const [options, setOptions] = React.useState({
        mode: 'default',
        controlPtMax: 4,
        magnifyZoom: 4,
        formats: [
            { label: 'png', value: 'image/png'},
            { label: 'jpeg', value: 'image/jpeg'},
            { label: 'tiff', value: 'image/tiff'}
        ],
        defaultX: DEFAULT_DIMS_X,
        defaultY: DEFAULT_DIMS_Y
    });

    // Panel properties
    const [panel1Data, setPanel1Data] = React.useState(initCanvas(panel1ID, input1));
    const [panel2Data, setPanel2Data] = React.useState(initCanvas(panel2ID, input2));

    // renderable image data state
    const [img1Data, setImg1Data] = React.useState(null);
    const [img2Data, setImg2Data] = React.useState(null);

    // initialize default methods for control canvas
    const [methods, setMethods] = React.useState({
        onMouseDown: moveStart,
        onMouseMove: moveAt,
        onMouseUp: moveEnd,
        onMouseOver: ()=>{},
        onKeyDown: filterKeyDown,
        onKeyUp: filterKeyUp,
    });

    // initialize error/info messages
    const [message, setMessage] = React.useState({});

    // set image selection state
    const [selection, setSelection] = React.useState([]);

    // initialize menu dialog toggle
    const [dialogToggle, setDialogToggle] = React.useState(null);

    // initialize panel pointer event data
    const [pointer1Props, setPointer1Props] = React.useState(
        {x: 0, y:0, cX: 0, cY: 0, selected: null, magnify: false});
    const [pointer2Props, setPointer2Props] = React.useState(
        {x: 0, y:0, cX: 0, cY: 0, selected: null, magnify: false});

    // initialize panel trigger event data
    const [triggerPanel1, setTriggerPanel1] = React.useState(0);
    const [triggerPanel2, setTriggerPanel2] = React.useState(0);

    // get query parameter for master option
    // - must correspond to a modern image file ID
    // const input1ImgID = getQuery('input1') || '';
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
                                    : { msg: 'Error occurred.', type: 'error' },
                            );
                        }
                        const { response = {} } = res || {};
                        const { data = {}, message = {} } = response || {};
                        setMessage(message);

                        // get capture data (if available)
                        const { historic_captures = [], modern_capture = {} } = data || {};
                        setSelection(historic_captures);
                        setPanel2Data(initCanvas(panel2ID, modern_capture));

                    }
                });
        }
        return () => {
            _isMounted.current = false;
        };
    }, [input2, input2ImgID, masterID, router, setSelection, setPanel2Data]);

    return <>
        <div className={'canvas-board'}>
            <UserMessage
                message={message}
                onClose={() => {
                    setMessage(false);
                }}
            />
            <PanelIat
                id={panel1ID}
                label={panel1Label}
                options={options}
                properties={panel1Data}
                setProperties={setPanel1Data}
                inputImage={img1Data}
                setInputImage={setImg1Data}
                trigger={triggerPanel1}
                setTrigger={setTriggerPanel1}
                pointerProps={pointer1Props}
                setPointer={setPointer1Props}
                setMessage={setMessage}
                setDialogToggle={setDialogToggle}
                onMouseUp={methods.onMouseUp}
                onMouseDown={methods.onMouseDown}
                onMouseOver={methods.onMouseOver}
                onMouseOut={methods.onMouseOut}
                onMouseMove={methods.onMouseMove}
                onClick={methods.onClick}
                onKeyDown={methods.onKeyDown}
                onKeyUp={methods.onKeyUp}
                hidden={panel1Data.hidden}
            />
            <MenuIat
                trigger1={triggerPanel1}
                setTrigger1={setTriggerPanel1}
                trigger2={triggerPanel2}
                setTrigger2={setTriggerPanel2}
                canvas1={panel1Data}
                setCanvas1={setPanel1Data}
                canvas2={panel2Data}
                setCanvas2={setPanel2Data}
                image1={img1Data}
                setImage1={setImg1Data}
                image2={img2Data}
                setImage2={setImg2Data}
                selection={selection}
                setMethods={setMethods}
                dialogToggle={dialogToggle}
                setDialogToggle={setDialogToggle}
                options={options}
                setOptions={setOptions}
            />
            <PanelIat
                id={panel2ID}
                label={panel2Label}
                options={options}
                properties={panel2Data}
                setProperties={setPanel2Data}
                trigger={triggerPanel2}
                setTrigger={setTriggerPanel2}
                pointerProps={pointer2Props}
                setPointer={setPointer2Props}
                inputImage={img2Data}
                setInputImage={setImg2Data}
                setMessage={setMessage}
                setDialogToggle={setDialogToggle}
                onClick={methods.onClick}
                onMouseUp={methods.onMouseUp}
                onMouseDown={methods.onMouseDown}
                onMouseOver={methods.onMouseOver}
                onMouseOut={methods.onMouseOut}
                onMouseMove={methods.onMouseMove}
                onKeyDown={methods.onKeyDown}
                onKeyUp={methods.onKeyUp}
                hidden={panel2Data.hidden}
            />
        </div>
    </>;
};

export default React.memo(Iat);


/**
 * Initialize input data.
 * @param canvasID
 * @param inputData
 * @return {Object} default properties
 */

export const initCanvas = (canvasID, inputData = null) => {

    // Destructure input data
    const {
        file = {},
        fileData = null,
        metadata = {},
        filename = '',
    } = inputData || {};
    const { id = '', file_type = '', file_size = 0, owner_id = '', owner_type = '' } = file || {};
    const { x_dim = 0, y_dim = 0, image_state = '' } = metadata || {};

    // define default canvas dimensions
    const defaultDims = {
        x: Math.min(x_dim, DEFAULT_DIMS_X),
        y: Math.min(y_dim, DEFAULT_DIMS_Y),
    };

    return {
        id: canvasID,
        offset: { x: 0, y: 0 },
        move: { x: 0, y: 0 },
        origin: { x: 0, y: 0 },
        hidden: false,
        dirty: false,
        base_dims: { x: DEFAULT_DIMS_X, y: DEFAULT_DIMS_Y },
        data_dims: defaultDims,
        source_dims: defaultDims,
        render_dims: { x: DEFAULT_DIMS_X, y: DEFAULT_DIMS_Y },
        files_id: id,
        owner_id: owner_id,
        owner_type: owner_type,
        filename: filename,
        file_type: file_type,
        file_size: file_size,
        image_state: image_state,
        file: fileData,
        blob: null,
        blobType: { type: 'image/png', ext: 'png' },
        blobQuality: 0.95,
        url: null,
        getURL: false,
        dataURL: null,
        pts: []
    };
};