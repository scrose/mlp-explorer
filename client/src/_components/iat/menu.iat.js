/*!
 * MLP.Client.Components.Menus.Canvas
 * File: canvas.menu.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Button from '../common/button';
import { createNodeRoute } from '../../_utils/paths.utils.client';
import { genSchema, getError } from '../../_services/schema.services.client';
import Dialog from '../common/dialog';
import {
    alignImages,
    moveAt,
    moveStart,
} from './transform.iat';
import { ImageSelector } from './selector.iat';
import { UserMessage } from '../common/message';
import Comparator from '../common/comparator';
import { SaveAs } from './downloader.iat';
import Resizer from './resizer.iat';
import { deselectControlPoint, moveControlPoint, selectControlPoint } from './pointer.iat';
import { filterKeyDown } from './panel.controls.iat';
import Importer from '../tools/importer/import.tools';

/**
 * No operation.
 */

const noop = () => {
};

/**
 * Image Analysis Toolkit main menu.
 *
 * @public
 * @param panel1
 * @param panel2
 * @param setPanel1
 * @param setPanel2
 * @param image1
 * @param setImage1
 * @param image2
 * @param setImage2
 * @param setMethods
 * @param selection
 * @param dialogToggle
 * @param setDialogToggle
 * @param setMessage
 * @param options
 * @param setOptions
 * @return {JSX.Element}
 */

export const MenuIat = ({
                            panel1 = {},
                            panel2 = {},
                            setPanel1 = noop,
                            setPanel2 = noop,
                            image1 = null,
                            setImage1 = noop,
                            image2 = null,
                            setImage2 = noop,
                            setSignal1 = noop,
                            setSignal2 = noop,
                            setMethods = noop,
                            selection = {},
                            dialogToggle = null,
                            setDialogToggle = noop,
                            options = {},
                            setOptions = noop,
                        }) => {

    const [message, setMessage] = React.useState(null);

    // generate unique ID value for canvas inputs
    const menuID = Math.random().toString(16).substring(2);

    // toggle to show/hide menu panels and popup dialogs
    const [menuToggle, setMenuToggle] = React.useState('');

    /**
     * Handle errors.
     */

    const _handleError = (err) => {
        console.warn(err);
        const { msg='', type='', message=''} = err || {};
        setMessage({
            msg: msg || message || getError('default', 'canvas'),
            type: type || 'error'
        });
    };

    /**
     * Show dialog by key.
     *
     * @private
     * @return {JSX.Element}
     */

    const _showDialog = (dialog) => {
        const {
            type = '',
            id = '',
            label='',
            callback = ()=>{},
        } = dialog || {};
        return _menuDialogs.hasOwnProperty(type) && _menuDialogs[type](id, label, callback);
    };

    /**
     * Canvas menu dialogs.
     *
     * @private
     * @return {JSX.Element}
     */

    const _menuDialogs = {
        selectImage: (id, label, callback) => {
            return <Dialog
                key={`${id}_dialog_select_image`}
                title={`Select Image for ${label}`}
                callback={callback}
                setToggle={setDialogToggle}>
                <ImageSelector
                    panelID={id}
                    panelLabel={label}
                    selection={selection}
                    options={options}
                    setToggle={setDialogToggle}
                    callback={callback}
                />
            </Dialog>;
        },
        uploadImage: (id, label, callback) => {
            const properties = id === panel1.id ? panel1 : panel2;
            return <Dialog
                key={`${menuID}_dialog_upload`}
                title={`Upload Image to MLP Library`}
                setToggle={setDialogToggle}>
                <Importer
                    model={'modern_captures'}
                    view={'upload'}
                    schema={genSchema('upload', properties.file_type)}
                    route={createNodeRoute(properties.file_type, 'new', properties.owner_id)}
                    data={properties}
                    callback={callback}
                />
            </Dialog>;
        },
        saveImage: (id, label, callback) => {
            return <Dialog
                key={`${menuID}_dialog_save_image`}
                title={`Save ${label} Image Data as File`}
                setToggle={setDialogToggle}>
                <SaveAs options={options.formats}
                        setToggle={setDialogToggle}
                        callback={callback}
                />
            </Dialog>;
        },
        resize: (id, label, callback) => {
            return <Dialog
                key={`${menuID}_dialog_resize`}
                title={`Resize ${label}`}
                setToggle={setDialogToggle}>
                <Resizer
                    id={id}
                    properties={id === panel1.id ? panel1 : panel2}
                    setToggle={setDialogToggle}
                    callback={callback}
                />
            </Dialog>;
        },
        compareImages: () => {
            return <Dialog
                key={`${menuID}_dialog_compare`}
                title={`Image Comparison`}
                setToggle={setDialogToggle}>
                <Comparator images={[panel1.dataURL, panel2.dataURL]} />
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

            // [swap] set panel swap settings
            swap: () => {
                setOptions(data => ({ ...data, swap: !options.swap }));
                setSignal1('reload');
                setSignal2('reload');
            },

            // [mode] select control points on canvas
            selectPoints: () => {
                setOptions(data => ({ ...data, mode: 'select' }));
                setMethods(data => ({
                    ...data,
                    onMouseDown: selectControlPoint,
                    onMouseUp: deselectControlPoint,
                    onMouseMove: moveControlPoint,
                    onMouseOut: deselectControlPoint,
                    onKeyDown: filterKeyDown,
                }));
            },

            // [transform] image alignment
            align: () => {
                let result = alignImages(image1, image2, panel1.pts, panel2.pts, options);
                // handle errors
                if (result.error) {
                    return _handleError(result.error);
                }
                // load transformed data into Panel 2
                setImage2(result.data);
                setSignal2('reload');
            },

            // [upload] upload mastered image into library
            master: () => {
                    const properties = id === panel1.id ? panel1 : panel2;
                    return <Dialog
                        key={`${menuID}_dialog_upload`}
                        title={`Confirm Mastered Image`}
                        setToggle={setDialogToggle}>
                        <Importer
                            model={'modern_captures'}
                            view={'upload'}
                            schema={genSchema('master', properties.file_type)}
                            route={createNodeRoute(properties.file_type, 'master', properties.owner_id)}
                            data={{
                                historic_images: panel1.files_id,
                                modern_images: panel2.files_id,
                                owner_id: panel
                            }}
                            callback={_handleError}
                        />
                    </Dialog>;
            },

            // compare images in comparator overlay
            compare: () => {
                // reject if either panel is not loaded
                if (!image1 || !image2) {
                    setMessage({ msg: getError('emptyCanvas', 'canvas') });
                    return null;
                }
                // open image comparator
                setDialogToggle({ type: 'compareImages' });
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
        <UserMessage message={message} onClose={() => {
            setMessage(null);
        }} />
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
                            disabled={!image1 && !image2}
                            title={'Select control coordinates.'}
                            className={options.mode === 'select' ? 'active' : ''}
                            icon={'crosshairs'}
                            onClick={() => {
                                _filterMethods('selectPoints');
                            }}
                        />
                    </li>
                    <li>
                        <Button
                            disabled={!image1 || !image2}
                            icon={'master'}
                            label={'Align'}
                            title={'Align images using selected control points.'}
                            onClick={() => {
                                _filterMethods('align');
                            }}
                        />
                    </li>
                    <li>
                        <Button
                            disabled={!image1 || !image2}
                            icon={'upload'}
                            label={'Master'}
                            title={'Upload mastered image.'}
                            onClick={() => {
                                _filterMethods('master');
                            }}
                        />
                    </li>
                    <li>
                        <Button
                            disabled={!image1 || !image2}
                            icon={'compare'}
                            label={'Compare'}
                            title={'Compare images using overlay.'}
                            onClick={() => {
                                _filterMethods('compare');
                            }}
                        />
                    </li>
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


