/*!
 * MLP.Client.Components.Views.Aligner
 * File: canvas.view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Accordion from '../common/accordion';
import { Canvas } from '../common/canvas';
import CanvasMenu from '../menus/canvas.menu';

/**
 * Canvas API image editor component.
 *
 * @param input1
 * @param input2
 * @public
 */

const CanvasView = ({input1=null, input2=null}) => {

    console.log(input1, input2)

    const [options, setOptions] = React.useState({
        canvas1: {
            dims: { x: 300, y: 300 },
            hidden: false,
        },
        canvas2: {
            dims: { x: 300, y: 300 },
            hidden: false,
        }
    });
    const [image1, setImage1] = React.useState({});
    const [image2, setImage2] = React.useState({});
    const [methods, setMethods] = React.useState({});
    const [message, setMessage] = React.useState({});

    return <>
        <Accordion label={'Canvas Menu'} type={'menu'} open={false}>
            <CanvasMenu
                options={options}
                setOptions={setOptions}
                image1={image1}
                setImage1={setImage1}
                image2={image2}
                setImage2={setImage2}
                setMethods={setMethods}
                setMessage={setMessage}
            />
        </Accordion>
        {
            message && Object.keys(message).length > 0 &&
            <div className={`msg ${message.type}`}>
                <span>{message}</span>
            </div>
        }
        <Accordion label={'Canvas Editor'} type={'edit'} open={true}>
            <div className={'canvas-board'}>
                <Canvas
                    id={'canvas1'}
                    dims={options.canvas1.dims}
                    image={image1}
                    methods={methods.canvas1}
                    setMessage={setMessage}
                    hidden={options.canvas1.hidden}
                />
                <Canvas
                    id={'canvas2'}
                    dims={options.canvas2.dims}
                    image={image2}
                    methods={methods.canvas2}
                    setMessage={setMessage}
                    hidden={options.canvas2.hidden}
                />
            </div>
        </Accordion>
    </>
}

export default React.memo(CanvasView);


