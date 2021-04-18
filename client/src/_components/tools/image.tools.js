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
import { getQuery } from '../../_utils/paths.utils.client';

const CanvasMessage = ({message}) => {
    const {msg='', type=''} = message || {};
    return message && <ValidationMessage msg={[msg]} type={type} />
}
/**
 * Canvas API image editor component.
 *
 * @public
 */

const ImageTools = () => {

    const canvas1ID = 'canvas1';
    const canvas2ID = 'canvas2';
    let input1 = null, input2 = null;

    const [options, setOptions] = React.useState({
        mode: 'default',
        controlPtMax: 4
    });
    const [canvas1Data, setCanvas1Data] = React.useState(initCanvas(canvas1ID, input1));
    const [canvas2Data, setCanvas2Data] = React.useState(initCanvas(canvas2ID, input2));
    const [image1Data, setImage1Data] = React.useState(input1);
    const [image2Data, setImage2Data] = React.useState(input2);
    const [methods, setMethods] = React.useState({});
    const [message, setMessage] = React.useState({});

    // load image data (if requested)
    React.useEffect(() => {
        const inputRequest = getQuery('master');
        console.log(inputRequest)
    }, []);

    // menu dialog toggle
    const [dialogToggle, setDialogToggle] = React.useState(null);

    // canvas pointer event data
    const [pointer, setPointer] = React.useState({
        canvas1: { x: 0, y: 0 },
        canvas2: { x: 0, y: 0 }
    });

    return <>
            <CanvasMenu
                options={options}
                setOptions={setOptions}
                canvas1={canvas1Data}
                setCanvas1={setCanvas1Data}
                canvas2={canvas2Data}
                setCanvas2={setCanvas2Data}
                image1={image1Data}
                setImage1={setImage1Data}
                image2={image2Data}
                setImage2={setImage2Data}
                setMethods={setMethods}
                dialogToggle={dialogToggle}
                setDialogToggle={setDialogToggle}
                pointer={pointer}
                setPointer={setPointer}
                setMessage={setMessage}
            />
            <CanvasMessage message={message} />
            <div className={'canvas-board'}>
                <Canvas
                    id={canvas1ID}
                    options={options}
                    setOptions={setOptions}
                    properties={canvas1Data}
                    setProperties={setCanvas1Data}
                    pointer={pointer.canvas1}
                    setPointer={setPointer}
                    setMessage={setMessage}
                    setDialogToggle={setDialogToggle}
                    onClick={methods.onClick}
                    hidden={canvas1Data.hidden}
                />
                <Canvas
                    id={canvas2ID}
                    options={options}
                    setOptions={setOptions}
                    properties={canvas2Data}
                    setProperties={setCanvas2Data}
                    pointer={pointer.canvas2}
                    setPointer={setPointer}
                    setMessage={setMessage}
                    setDialogToggle={setDialogToggle}
                    onClick={methods.onClick}
                    hidden={canvas2Data.hidden}
                />
            </div>
    </>
}

export default React.memo(ImageTools);


