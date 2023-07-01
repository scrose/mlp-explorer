/*!
 * MLP.Client.Tools.IAT.useCanvas
 * File: useCanvas.iat.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import { useRef, useEffect } from 'react'

/**
 * Image Toolkit: Canvas hook
 */

const useCanvas = (draw, options={}) => {

    const canvasRef = useRef(null);

    useEffect(() => {

        const canvas = canvasRef.current
        const context = canvas.getContext(options.context || '2d')

        const render = () => {
            draw(context)
        }
        render()
        return () => {}
    }, [draw])
    return canvasRef
}
export default useCanvas
