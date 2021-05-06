/*!
 * MLP.Client.Components.Menus.Canvas
 * File: canvas.menu.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Button from '../../common/button';
import Form from '../../common/form';
import { createNodeRoute } from '../../../_utils/paths.utils.client';
import { genSchema, getError } from '../../../_services/schema.services.client';
import Dialog from '../../common/dialog';
import {
    alignImages,
    moveAt,
    moveStart,
} from './transform.iat';
import { ImageSelector } from '../../menus/selector.menu';
import { useUser } from '../../../_providers/user.provider.client';
import { UserMessage } from '../../common/message';
import Comparator from '../../common/comparator';
import { SaveAs } from './download.iat';
import Resizer from './resizer.iat';
import { deselectControlPoint, moveControlPoint, selectControlPoint } from './canvas.points.iat';
import { filterKeyDown } from './canvas.controls.iat';

/**
 * No operation.
 */

const noop = () => {
};

/**
 * Image Analysis Toolkit main menu.
 *
 * @public
 * @param options
 * @param setOptions
 * @param canvas1
 * @param canvas2
 * @param setCanvas1
 * @param setCanvas2
 * @param image1
 * @param setImage1
 * @param image2
 * @param setImage2
 * @param setMethods
 * @param selection
 * @param dialogToggle
 * @param setDialogToggle
 * @param setMessage
 * @return {JSX.Element}
 */

export const MenuIat = ({
                            canvas1 = {},
                            canvas2 = {},
                            setCanvas1 = noop,
                            setCanvas2 = noop,
                            image1 = null,
                            setImage1 = noop,
                            image2 = null,
                            setImage2 = noop,
                            setMethods = noop,
                            selection = {},
                            dialogToggle = null,
                            setDialogToggle = noop,
                            options = {},
                            setOptions = noop,
                        }) => {

    const [message, setMessage] = React.useState(null);
    const user = useUser();

    // generate unique ID value for canvas inputs
    const menuID = Math.random().toString(16).substring(2);

    // toggle to show/hide menu panels and popup dialogs
    const [menuToggle, setMenuToggle] = React.useState('');

    // do the canvases have capture images loaded?
    const hasCaptures = canvas1.files_id && canvas2.files_id;

    /**
     * Handle errors.
     */

    const _handleError = (err) => {
        console.warn(err);
        const msg = err.hasOwnProperty('message')
            ? err.message
            : getError('default', 'canvas');
        setMessage({ msg: msg, type: 'error' });
    };

    /**
     * Show dialog by key.
     *
     * @private
     * @return {JSX.Element}
     */

    const _showDialog = (dialogKey) => {
        const { type = '', id = '', callback=()=>{} } = dialogKey || {};
        return _menuDialogs.hasOwnProperty(type) && _menuDialogs[type](id, callback);
    };

    /**
     * Canvas menu dialogs.
     *
     * @private
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
        uploadImage: (id) => {
            return <Dialog
                key={`${menuID}_dialog_master`}
                title={`Upload Image to Library?`}
                setToggle={setDialogToggle}>
                <Form
                    init={{}}
                    route={createNodeRoute('modern_images', 'master', id)}
                    schema={genSchema('master', 'modern_images')}
                    model={'modern_captures'}
                    callback={() => {
                        console.log('mastered!');
                    }}>
                </Form>
            </Dialog>;
        },
        saveImage: (id) => {
            return <Dialog
                key={`${menuID}_dialog_save_image`}
                title={`Save Image As File`}
                setToggle={setDialogToggle}>
                <SaveAs canvasID={id}
                        setSelected={id === canvas1.id ? setCanvas1 : setCanvas2}
                        setToggle={setDialogToggle}
                        options={options.formats} />
            </Dialog>;
        },
        resize: (id) => {
            return <Dialog
                key={`${menuID}_dialog_resize`}
                title={`Resize Image / Canvas`}
                setToggle={setDialogToggle}>
                <Resizer
                    id={id}
                    setSize={id === canvas1.id ? setCanvas1 : setCanvas2}
                    props={id === canvas1.id ? canvas1 : canvas2}
                    setToggle={setDialogToggle}
                />
            </Dialog>;
        },
        compareImages: () => {
            return <Dialog
                key={`${menuID}_dialog_compare`}
                title={`Image Comparison`}
                setToggle={setDialogToggle}>
                <Comparator images={[canvas1.dataURL, canvas2.dataURL]} />
            </Dialog>;
        },
    };

    /**
     * Canvas methods filter.
     * - selects methods for given view mode.
     *
     * @private
     * @return {JSX.Element}
     */

    const _filterMethods = (methodType) => {
        const _methods = {

            // [mode] default settings
            default: () => {
                setOptions(data => ({ ...data, mode: 'default' }));
                setMethods(data => ({
                    ...data,
                    onMouseDown: moveStart,
                    onMouseMove: moveAt,
                    onMouseUp: moveStart,
                    onKeyDown: filterKeyDown,
                }));
            },

            // [mode] select control points on canvas
            selectPoints: () => {
                setOptions(data => ({ ...data, mode: 'select' }));
                setMethods(data => ({
                    ...data,
                    onMouseDown: selectControlPoint,
                    onMouseUp: deselectControlPoint,
                    onMouseMove: moveControlPoint,
                    onMouseOut: deselectControlPoint
                }));
            },

            // [transform] image alignment
            align: () => {
                let result = alignImages(image1, image2, canvas1, canvas2, options);
                if (result.error) {
                    return setMessage(result.error);
                }
                setImage2(result.data);
                setCanvas2(data => ({ ...data, dirty: true }));
            },
            // upload new mastered image to library
            upload: () => {
                setDialogToggle({ type: 'uploadImage', id: canvas2.id });
            },
            // compare images in comparator overlay
            compare: () => {

                // reject if both images are not loaded in canvas
                if (!image1 || !image2) {
                    setMessage({ msg: getError('emptyCanvas', 'canvas') });
                    return null;
                }
                // get data URL from canvas data
                setCanvas1(data => ({ ...data, getURL: true }));
                setCanvas2(data => ({ ...data, getURL: true }));

                // open image comparator
                setDialogToggle({ type: 'compareImages'});
            },
        };
        try {
            return _methods.hasOwnProperty(methodType)
                ? _methods[methodType]()
                : null;
        } catch (err) {
            _handleError(err);
        }
    };

    return <>
        <UserMessage message={message} onClose={()=>{setMessage(null)}} />
        <div className={'canvas-menu-bar'}>
            <div className={'canvas-option-controls v-menu'}>
                <ul>
                    <li>
                        <Button
                            title={'Image edit mode.'}
                            className={options.mode === 'default' ? 'active' : ''}
                            icon={'select'}
                            onClick={() => {
                                _filterMethods('default');
                            }}
                        />
                    </li>
                    <li>
                        <Button
                            title={'Select control coordinates.'}
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
                    <li><Button
                        icon={'compare'}
                        label={'Compare'}
                        title={'Compare images using comparison overlay.'}
                        onClick={() => {
                            _filterMethods('compare');
                        }}
                    /></li>
                    {
                        user && hasCaptures &&
                        <li>
                            <Button
                                title={'Upload as mastered capture image.'}
                                icon={'upload'}
                                label={'Upload'}
                                onClick={() => {
                                    _filterMethods('upload');
                                }}
                            />
                        </li>
                    }
                </ul>
            </div>
            <OptionsMenu option={menuToggle} />
        </div>
        {
            _showDialog(dialogToggle)
        }
    </>;
};

/**
 * Inline menu component to edit node items.
 *
 * @public
 * @param {Function} setMenuToggle
 * @return {JSX.Element}
 */

export const CanvasTopMenu = ({
                                  setMenuToggle = noop,
                              }) => {
    return (
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
    );
};


/**
 * Canvas menu options component.
 * - Options-level toolbar menu
 * - Choices here must coordinate with the canvas tool main menu
 */

const OptionsMenu = ({ option, callback = noop }) => {

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
        mstools: <fieldset>
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
        </fieldset>,
    };

    return _menus.hasOwnProperty(option) && _menus[option];
};


