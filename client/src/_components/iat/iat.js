/*!
 * MLP.Client.IAT
 * File: iat.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import { PanelIat } from './panel.iat';
import { MenuIat } from './menu.iat';
import { createNodeRoute, getQuery } from '../../_utils/paths.utils.client';
import { useRouter } from '../../_providers/router.provider.client';
import { UserMessage } from '../common/message';
import { filterKeyDown, filterKeyUp } from './panel.controls.iat';
import { loadImageData } from './loader.iat';
import { addNode } from '../../_services/session.services.client';
import { moveAt, moveEnd, moveStart } from './panner.iat';

/**
 * Default settings.
 * - default canvas dimensions
 */

const DEFAULT_DIMS_W = 450;
const DEFAULT_DIMS_H = 400;

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

    // global panel options
    const [options, setOptions] = React.useState({
        mode: 'default',
        controlPtMax: 4,
        magnifyZoom: 3,
        ptrRadius: 20,
        swap: false,
        maxCanvasWidth: 600,
        maxCanvasHeight: 600,
        minCanvasWidth: 400,
        minCanvasHeight: 400,
        maxImageWidth: 20000,
        maxImageHeight: 20000,
        minImageWidth: 100,
        minImageHeight: 100,
        formats: [
            { label: 'png', value: 'image/png'},
            { label: 'jpeg', value: 'image/jpeg'},
            { label: 'tiff', value: 'image/tiff'}
        ],
        blobQuality: 0.95,
        defaultW: DEFAULT_DIMS_W,
        defaultH: DEFAULT_DIMS_H,
        status: ['empty', 'load', 'render', 'draw', 'clear', 'data', 'reset', 'loading', 'loaded', 'save', 'error']
    });

    // loading status state
    const [signal1, setSignal1] = React.useState('empty');
    const [signal2, setSignal2] = React.useState('empty');

    // Panel properties
    const [panel1Data, setPanel1Data] = React.useState(initPanel(panel1ID, panel1Label, input1));
    const [panel2Data, setPanel2Data] = React.useState(initPanel(panel2ID, panel2Label, input2));

    // renderable image data state
    const [img1Data, setImg1Data] = React.useState(null);
    const [img2Data, setImg2Data] = React.useState(null);

    // initialize default methods for control canvas
    const [methods, setMethods] = React.useState({
        onMouseDown: moveStart,
        onMouseMove: moveAt,
        onMouseUp: moveEnd,
        onMouseOut: moveEnd,
        onKeyDown: filterKeyDown,
        onKeyUp: filterKeyUp,
    });

    // initialize error/info messages
    const [message, setMessage] = React.useState(null);

    // initialize menu dialog toggle
    const [dialogToggle, setDialogToggle] = React.useState(null);

    // get query parameter for input file ID
    // - must correspond to a file ID
    // - must correspond to a file type
    const input1FileID = getQuery('input1') || '';
    const input1TypeID = getQuery('type1') || '';
    const input2FileID = getQuery('input2') || '';
    const input2TypeID = getQuery('type2') || '';

    /**
     * Load initial input image data (if requested)
     */

    React.useEffect(() => {

        _isMounted.current = true;

        // load panel with API-downloaded image data
        const _loader = (
            inputTypeID,
            inputFileID,
            panelID,
            panelLabel,
            setPanelData,
            setImgData,
            setSignal) => {

            setSignal('loading');

            // Response callback
            const _callback = (response) => {
                if (_isMounted.current) {
                    const {
                        error = null,
                        data = null,
                        props = null,
                    } = response || {};
                    if (error || response.hasOwnProperty('message')) {
                        if (error && error.hasOwnProperty('msg')) console.warn(error.msg);
                        setMessage(error);
                        setSignal('error');
                        return;
                    }
                    // update Panel 2 state (reserved for modern capture images)
                    if (data) {
                        setImgData(data)
                    }
                    if (props) {
                        setPanelData(data => (
                            Object.keys(props).reduce((o, key) => {
                                o[key] = props[key];
                                return o;
                            }, data)),
                        );
                        setSignal('load');
                    }
                }
            };

            router.get(createNodeRoute(inputTypeID, 'show', inputFileID))
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
                        const { data = {}, message = {}, path = {} } = response || {};
                        setMessage(message);

                        // store node path to file in navigator
                        Object.keys(path)
                            .filter(key => path[key].hasOwnProperty('node'))
                            .forEach(key => addNode(path[key].node.id));

                        // download image to panel data state
                        loadImageData(initPanel(panelID, panelLabel, data), _callback)
                            .catch(_callback);
                    }
                });
        }

        // Initialize IAT from input parameters
        // - load input image (only if not currently loaded)
        if (signal1 === 'empty' && _isMounted.current && input1FileID && !input1) {
            _loader(input1TypeID,
                input1FileID,
                panel1ID,
                panel1Label,
                setPanel1Data,
                setImg1Data,
                setSignal1
            );
        }
        if (signal2 === 'empty' && _isMounted.current && input2FileID && !input2) {
            _loader(input2TypeID,
                input2FileID,
                panel2ID,
                panel2Label,
                setPanel2Data,
                setImg2Data,
                setSignal2
            );
        }
        return () => {
            _isMounted.current = false;
        };
    }, [
        router,
        input1,
        input1TypeID,
        input1FileID,
        setPanel1Data,
        setSignal1,
        signal1,
        input2,
        input2TypeID,
        input2FileID,
        setPanel2Data,
        setSignal2,
        signal2
    ]);

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
                signal={signal1}
                setSignal={setSignal1}
                setInputImage={setImg1Data}
                otherProperties={panel2Data}
                setMessage={setMessage}
                setDialogToggle={setDialogToggle}
                onMouseUp={methods.onMouseUp}
                onMouseDown={methods.onMouseDown}
                onMouseOut={methods.onMouseOut}
                onMouseMove={methods.onMouseMove}
                onKeyDown={methods.onKeyDown}
                onKeyUp={methods.onKeyUp}
                hidden={panel1Data.hidden}
            />
            <MenuIat
                panel1={panel1Data}
                setPanel1={setPanel1Data}
                setSignal1={setSignal1}
                panel2={panel2Data}
                setSignal2={setSignal2}
                setPanel2={setPanel2Data}
                image1={img1Data}
                setImage1={setImg1Data}
                image2={img2Data}
                setImage2={setImg2Data}
                setMethods={setMethods}
                dialogToggle={dialogToggle}
                setDialogToggle={setDialogToggle}
                options={options}
                setOptions={setOptions}
                message={message}
                setMessage={setMessage}
            />
            <PanelIat
                id={panel2ID}
                label={panel2Label}
                options={options}
                signal={signal2}
                setSignal={setSignal2}
                properties={panel2Data}
                setProperties={setPanel2Data}
                inputImage={img2Data}
                setInputImage={setImg2Data}
                otherProperties={panel1Data}
                setMessage={setMessage}
                setDialogToggle={setDialogToggle}
                onMouseUp={methods.onMouseUp}
                onMouseDown={methods.onMouseDown}
                onMouseOut={methods.onMouseOut}
                onMouseMove={methods.onMouseMove}
                onKeyDown={methods.onKeyDown}
                onKeyUp={methods.onKeyUp}
                hidden={panel2Data.hidden}
            />
        </div>
    </>;
};

export default Iat;


/**
 * Initialize IAT panel properties.
 * @param panelID
 * @param panelLabel
 * @param inputData
 * @return {Object} default properties
 */

export const initPanel = (panelID, panelLabel='', inputData = null) => {

    // Destructure input data
    const {
        file = {},
        fileData = null,
        metadata = {},
        filename = '',
        url=''
    } = inputData || {};
    const { id = '', file_type = '', file_size = 0, owner_id = '', owner_type = '' } = file || {};
    const { image_state = '', mime_type='' } = metadata || {};
    const  {medium=''} = url || {};

    return {
        id: panelID,
        label: panelLabel,
        hidden: false,
        bounds: {},
        original_dims: { w: 0, h: 0 },
        image_dims: { w: 0, h: 0 },
        base_dims: { w: DEFAULT_DIMS_W, h: DEFAULT_DIMS_H },
        source_dims: { x: 0, y: 0, w: 0, h: 0 },
        render_dims: { x: 0, y: 0, w: 0, h: 0 },
        files_id: id,
        owner_id: owner_id,
        owner_type: owner_type,
        filename: filename,
        mime_type: mime_type,
        file_type: file_type,
        file_size: file_size,
        image_state: image_state,
        file: fileData,
        url: medium,
        lowResDataURL: null,
        dataURL: null,
        blob: null,
        pts: [],
        other_panel: false
    };
};