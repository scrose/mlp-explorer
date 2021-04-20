/*!
 * MLP.Client.Components.Menus.Canvas
 * File: canvas.menu.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Button from '../common/button';
import Form from '../common/form';
import { createNodeRoute } from '../../_utils/paths.utils.client';
import { genSchema, getError } from '../../_services/schema.services.client';
import Dialog from '../common/dialog';
import {
    align,
    getControlPoints,
    scaleToFit,
    moveStart,
    moveAt,
} from '../../_utils/image.utils.client';
import { ImageSelector } from './selector.menu';
import { homography } from '../../_utils/matrix.utils.client';

/**
 * No operation.
 */

const noop = ()=>{};

/**
 * Canvas menu options component.
 * - Options-level toolbar menu
 * - Choices here must coordinate with the canvas tool main menu
 */

const OptionsMenu = ({option, callback=noop}) => {

    const _menus = {

        // File options
        msfile: <fieldset>
            <Button label={'Load'} />
            <Button label={'Save'} />
            <select id={'ts'} onChange={callback} disabled={true}>
                <option label={'TXT'} />
                <option label={'HTM'} />
                <option label={'PNG'} />
                <option label={'UPNG'} />
                <option label={'JPG'} />
                <option label={'TIF-8G'} />
                <option label={'TIF-8P'} />
                <option label={'TIF-24'} />
                <option label={'TIF-32'} />
                <option label={'BMP-24'} />
                <option label={'BMP-32'} />
            </select>
            <span>Projects:</span>
            <select onChange={callback} disabled={true}>
                <option value={'assi'} label={'Assiniboine'} />
                <option value={'atha'} label={'Athabasca'} />
                <option value={'atha3'} label={'Athabasca (test)'} />
                <option value={'bari'} label={'Barrier JPG'} />
                <option value={'barp'} label={'Barrier PNG'} />
                <option value={'baro'} label={'Barrier old'} />
                <option value={'barn'} label={'Barrier new'} />
                <option value={'LostCreek'} label={'Lost Creek'} />
                <option value={'LostCreekDetail'} label={'Lost Creek detail'} />
                <option value={'braz'} label={'Brazeau'} />
                <option value={'assi disabled'} />
                <option value={'pano'} label={'pano'} />
                <option value={'panf'} label={'pano (flickr)'} />
            </select>
        </fieldset>,

        // Edit Options
        msedit: <fieldset>
            <div>
                <Button label={'Drag'} />
                <Button label={'Pick'} />
                <Button label={'Poly'} />
                <Button label={'Area'} />
                <Button label={'Line'} />
                <span>drag</span>
            </div>
            <div>
                <Button label={'Delete'} />
                <Button label={'Hide'} />
                <Button label={'Back'} />
                <Button label={'Clear'} />
            </div>
            <div>
                <input type={'color'} value={'#0000ff'} onChange={callback} />
                <input type={'text'} value={'unnamed'} size={'20'} />
                <Button label={'Set'} />
            </div>
        </fieldset>,

        // Tools Options
        mstools:    <fieldset>
            <Button label={'Grid'} />
            <select id={'fs'} onChange={callback}>
                <option label={'Grey'} />
                <option label={'Clean'} />
                <option label={'Colours'} />
                <option label={'Compare'} />
                <option label={'Invert'} />
                <option label={'Flip'} />
                <option label={'Mirror'} />
                <option label={'Rotate'} />
                <option label={'Reduce'} />
                <option label={'Opaque'} />
                <option label={'FillArea'} />
                <option label={'FillCat'} />
                <option label={'GrabPoly'} />
                <option label={'GrabCat'} />
                <option label={'GrabAll'} />
                <option label={'(revert)'} />
            </select>
            <Button label={'Go'} />
            <select>
                <option label={'Count1'} />
                <option label={'Count2'} />
                <option label={'Count3'} />
            </select>
            <Button label={'Go'} />
            <div>
                <Button label={'Viewer'} />
                <Button label={'Sweep'} />
                <Button label={'Clip'} />
                <Button label={'Crop'} />
            </div>
            <div>
                <Button label={'Delete'} />
            </div>
        </fieldset>
    }

    return _menus.hasOwnProperty(option) && _menus[option];
};


/**
 * Inline menu component to edit node items.
 *
 * @public
 * @param options
 * @param setOptions
 * @param canvas1
 * @param canvas2
 * @param setCanvas1
 * @param setCanvas2
 * @param setMethods
 * @param selection
 * @param dialogToggle
 * @param setDialogToggle
 * @param setMessage
 * @return {JSX.Element}
 */

export const CanvasMenu = ({
                               options = {},
                               setOptions = noop,
                               canvas1 = {},
                               canvas2 = {},
                               setCanvas1 = noop,

                               setCanvas2 = noop,
                               setMethods = noop,
                               selection={},
                               dialogToggle = null,
                               setDialogToggle = noop,
                               setMessage = noop,
                           }) => {

    // generate unique ID value for canvas inputs
    const menuID = Math.random().toString(16).substring(2);

    // toggle to show/hide menu panels and popup dialogs
    const [menuToggle, setMenuToggle] = React.useState('');

    /**
     * Menu callback.
     *
     * @public
     * @return {JSX.Element}
     */

    const callback = (e) => {
        const { target = {} } = e || {};
        const { name = '', value = '' } = target || {};
        setOptions(data => ({ ...data, [name]: value }));
    };

    /**
     * Menu dialogs
     *
     * @return {JSX.Element}
     */

    const _menuDialogs = {
        selectImage: (id) => {
            return <Dialog
                key={`${id}_dialog_select_image`}
                title={`Select an Image`}
                setToggle={setDialogToggle}>
                <ImageSelector
                    canvasID={id}
                    selection={selection}
                    setSelected={id === canvas1.id ? setCanvas1 : setCanvas2}
                    setToggle={setDialogToggle}
                />
            </Dialog>;
        },
        align: (id) => {
            return <Dialog
                key={`${menuID}_dialog_align`}
                title={`Confirm Image Pair Alignment`}
                setToggle={setDialogToggle}>
                <Form
                    route={createNodeRoute('modern_images', 'master', id)}
                    schema={genSchema('master', 'modern_captures')}
                    model={'modern_captures'}
                    callback={() => {
                        console.log('mastered!');
                    }}
                />
            </Dialog>;
        },
        master: (id) => {
            return <Dialog
                key={`${menuID}_dialog_master`}
                title={`Confirm Image Pair Master`}
                setToggle={setDialogToggle}>
                <Form
                    route={createNodeRoute('modern_images', 'master', id)}
                    schema={genSchema('master', 'modern_captures')}
                    model={'modern_captures'}
                    callback={() => {
                        console.log('mastered!');
                    }}
                />
            </Dialog>;
        },
    };

    // show dialog popup
    const showDialog = (dialogKey) => {
        const { type = '', id = '' } = dialogKey || {};
        return _menuDialogs.hasOwnProperty(type) && _menuDialogs[type](id);
    };

    /**
     * Canvas methods filter.
     * - selects methods for given view mode.
     * -- Default:
     *
     * @return {JSX.Element}
     */

    const _filterMethods = (methodType) => {
        const _methods = {
            default: () => {
                setOptions(data => ({ ...data, mode: 'default' }));
                setMethods(data => ({ ...data,
                    onDragStart: moveStart,
                    onDrag: moveAt
                }));
            },
            selectPoints: () => {
                setOptions(data => ({ ...data, mode: 'select' }));
                setMethods(data => ({ ...data, onClick: getControlPoints }));
            },
            align: (imgData) => {
                if (!canvas1.loaded || !canvas2.loaded) {
                    return setMessage({ msg: getError('emptyCanvas', 'canvas') });
                }
                if (canvas1.pts.length < options.controlPtMax || canvas2.pts.length < options.controlPtMax) {
                    return setMessage({ msg: getError('missingControlPoints', 'canvas')});
                }
                const transform = align(canvas1, canvas2, options);
                let A = new Uint32Array( imgData.data.buffer );
                let B = new Uint32Array( dst.data.buffer );
                homography( transform, A, B, p.width, bcv1.height );
                // ctx1.putImageData(dst,0,0); // 2
                return
                setDialogToggle({type: 'align', id: canvas2.files_id });
            },
        };
        return _methods.hasOwnProperty(methodType)
            ? _methods[methodType]()
            : null;
    };

    return <>
        <div className={'canvas-menu-bar'}>
            <div id={'canvas-top-menu'} className={'h-menu'}>
                <Button label={'File'} onClick={() => {
                    setMenuToggle('msfile');
                }} />
                <Button label={'View'} onClick={() => {
                    setMenuToggle('msview');
                }} />
                <Button label={'Edit'} onClick={() => {
                    setMenuToggle('msedit');
                }} />
                <Button label={'Tools'} onClick={() => {
                    setMenuToggle('mstools');
                }} />
                <Button label={'Prefs'} onClick={() => {
                    setMenuToggle('msprefs');
                }} />
                <Button label={'All'} onClick={() => {
                    setMenuToggle('msall');
                }} />
                <Button label={'Cats'} onClick={() => {
                    setMenuToggle('mscats');
                }} />
                <Button label={'Help'} onClick={() => {
                    setMenuToggle('mshelp');
                }} />

                {/*<select id={'rs'} onChange={callback}>*/}
                {/*    <option label={'Scale'} />*/}
                {/*    <option label={'Fade'} />*/}
                {/*    <option label={'Mask'} />*/}
                {/*    <option label={'Alpha'} />*/}
                {/*    <option label={'JPG'} />*/}
                {/*    <option label={'Angle'} />*/}
                {/*</select>*/}

                {/*<input*/}
                {/*    type={'range'}*/}
                {/*    id={"rng1"}*/}
                {/*    min={0}*/}
                {/*    max={100}*/}
                {/*    value={100}*/}
                {/*    onChange={callback}*/}
                {/*    onInput={callback} />*/}
                {/*<input value={100} onChange={callback} />*/}

            </div>
            <div className={'canvas-option-controls h-menu'}>
                <ul>
                    <li>
                        <Button
                            className={options.mode === 'default' ? 'active' : ''}
                            icon={'select'}
                            onClick={() => {
                                _filterMethods('default');
                            }}
                        />
                    </li>
                    <li>
                        <Button
                            className={options.mode === 'select' ? 'active' : ''}
                            icon={'crosshairs'}
                            onClick={() => {
                                _filterMethods('selectPoints');
                            }}
                        />
                    </li>
                    <li className={'push'}><Button
                        icon={'swap'}
                        label={'Swap'}
                        title={'Swap images in canvases.'}
                        onClick={() => {
                            _filterMethods('swap');
                        }}
                    /></li>
                    <li><Button
                        icon={'master'}
                        label={'Align'}
                        title={'Align images using selected control points.'}
                        onClick={() => {
                            _filterMethods('align');
                        }}
                    /></li>
                </ul>
            </div>
            <OptionsMenu option={menuToggle} />
        </div>
        {
            showDialog(dialogToggle)
        }
    </>;
};

/**
 * Inline menu component to edit node items.
 *
 * @public
 * @param {String} id
 * @param {Object} options
 * @param {Function} setOptions
 * @param {Object} properties
 * @param {Function} setProperties
 * @param {Function} setMessage
 * @return {JSX.Element}
 */

export const CanvasControls = ({
                                   id = '',
                                   options = {},
                                   setOptions=noop,
                                   properties = {},
                                   update = noop,
                                   setMessage = noop,
                                   setDialogToggle = noop
                               }) => {

    /**
     * Canvas methods filter.
     *
     * @return {JSX.Element}
     */

    const _filterMethods = (methodType) => {
        const _methods = {
            fit: () => {
                if (properties.loaded) {
                    const dims = scaleToFit(
                        properties.source_dims.x,
                        properties.source_dims.y,
                        properties.dims.x,
                    );
                    // update canvas properties
                    update(data => ({
                        ...data,
                        offset: {x: 0, y: 0},
                        edit_dims: dims,
                        pts: [],
                        redraw: true,
                    }));
                }
            },
            expand: () => {
                if (properties.loaded)
                    // update canvas properties
                    update(data => ({
                        ...data,
                        edit_dims: properties.source_dims,
                        pts: [],
                        redraw: true,
                    }));
            },
            erase: () => {
                if (properties.loaded)
                    update(data => ({ ...data,
                        pts: [],
                        redraw: true
                    }));
            },
            load: () => {
                setDialogToggle({type: 'selectImage', id: properties.id});
            },
        };
        return (properties && Object.keys(properties).length > 0) && _methods.hasOwnProperty(methodType)
            ? _methods[methodType]()
            : null;
    };

    return <div className={'canvas-view-controls h-menu'}>
        <ul>
            <li><Button
                icon={'image'}
                title={'Load image into canvas.'}
                onClick={() => {
                    _filterMethods('load');
                }}
            /></li>
            <li><Button
                icon={'compress'}
                title={'Scale image to fit canvas.'}
                onClick={() => {
                    _filterMethods('fit');
                }}
            /></li>
            <li><Button
                icon={'enlarge'}
                title={'Show full-sized image in canvas.'}
                onClick={() => {
                    _filterMethods('expand');
                }}
            /></li>
            <li><Button
                icon={'erase'}
                title={'Erase canvas annotations.'}
                onClick={() => {
                    _filterMethods('erase');
                }}
            /></li>
        </ul>
        {/*    <Button label={'w'} />*/}
        {/*    <Button label={'H'} />*/}
        {/*    <Button label={'h'} />*/}
        {/*    <Button label={'L'} />*/}
        {/*    <Button label={'R'} />*/}
        {/*    <Button label={'U'} />*/}
        {/*    <Button label={'D'} />*/}
        {/*    <Button label={'C'} />*/}
        {/*    <Button label={'A'} />*/}
        {/*    <Button label={'F'} />*/}
        {/*</div>*/}
        {/*<div>*/}
        {/*    <option label={'Above'} />*/}
        {/*    <select onChange={callback}>*/}
        {/*        <option label={'Above'} />*/}
        {/*        <option label={'Beside'} />*/}
        {/*        <option label={'Auto'} />*/}
        {/*        <option label={'Max'} />*/}
        {/*    </select>*/}
        {/*    <select onChange={callback}>*/}
        {/*        <option label={'Show Normal'} />*/}
        {/*        <option label={'Show All'} />*/}
        {/*        <option label={'Images Only'} />*/}
        {/*        <option label={'Objects Only'} />*/}
        {/*        <option label={'All Objects'} />*/}
        {/*        <option label={'Inverted'} />*/}
        {/*    </select>*/}
    </div>;

};

