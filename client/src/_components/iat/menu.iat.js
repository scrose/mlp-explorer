/*!
 * MLP.Client.Components.Menus.Canvas
 * File: canvas.menu.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import Button from '../common/button';
import { genSchema, getError } from '../../_services/schema.services.client';
import Dialog from '../common/dialog';
import {
    scaleToMatch,
} from './transform.iat';
import { ImageSelector } from './selector.iat';
import Slider from '../common/slider';
import { SaveAs } from './downloader.iat';
import Resizer from './resizer.iat';
import { deselectControlPoint, moveControlPoint, selectControlPoint } from './pointer.iat';
import { filterKeyDown } from './panel.controls.iat';
import { MasterImage } from './master.iat';
import { useUser } from '../../_providers/user.provider.client';
import { cropBound, cropEnd, cropStart } from './cropper.iat';
import MetadataView from '../views/metadata.view';
import { alignImages } from './aligner.iat';
import { moveAt, moveEnd, moveStart } from './panner.iat';
import { createNodeRoute } from '../../_utils/paths.utils.client';
import Editor from '../editors/default.editor';

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
 * @param setSignal1
 * @param setSignal2
 * @param setMethods
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
                            // setImage1 = noop,
                            image2 = null,
                            setImage2 = noop,
                            setSignal1 = noop,
                            setSignal2 = noop,
                            setMethods = noop,
                            setMessage = noop,
                            dialogToggle = null,
                            setDialogToggle = noop,
                            options = {},
                            setOptions = noop,
                        }) => {

    // generate unique ID value for canvas inputs
    const menuID = Math.random().toString(16).substring(2);
    const user = useUser();

    /**
     * Handle errors.
     */

    const _handleError = (err) => {
        const { msg='', type='', message=''} = err || {};
        console.warn(msg || message);
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

    const _handleDialog = (dialog) => {
        const {
            type = '',
            id = '',
            label='',
            data=null,
            callback = ()=>{},
        } = dialog || {};
        return _menuDialogs.hasOwnProperty(type) ? _menuDialogs[type](id, label, callback, data) : <></>;
    };

    /**
     * Cancel menu request.
     *
     * @private
     * @return {JSX.Element}
     */

    const _handleCancel = function (e, id) {
        // set status signal for panel as loaded or empty
        id === panel1.id
            ? (panel1.file ? setSignal1('loaded') : setSignal1('empty'))
            : id === panel2.id
                ? (panel2.file ? setSignal2('loaded') : setSignal2('empty'))
                : noop();
        // close dialog
        setDialogToggle(null);
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
                title={`Load Image for ${label}`}
                callback={_handleCancel.bind(null, id)}
            >
                <ImageSelector
                    properties={id === panel1.id ? panel1 : panel2}
                    otherProperties={id === panel1.id ? panel2 : panel1}
                    options={options}
                    callback={(data)=>{
                        setDialogToggle(null);
                        callback(data);
                    }}
                />
            </Dialog>;
        },
        uploadImage: (id) => {
            const panel = id === panel1.id ? panel1 : panel2;
            return <Dialog
                key={`${id}_dialog_upload`}
                title={`Upload Image to MLP Library`}
                callback={_handleCancel.bind(null, id)}
            >
                <Editor
                    model={panel.file_type}
                    view={'upload'}
                    schema={genSchema({ view:'upload', model:panel.file_type, user: user })}
                    route={createNodeRoute(panel.file_type, 'new', panel.owner_id)}
                    onCancel={() => {setDialogToggle(null)}}
                    files={[
                        {
                            name: panel.file_type,
                            value: panel.blob,
                            filename: panel.filename
                        }
                    ]}
                    callback={() => {
                        // console.log(err, model, id);
                        setDialogToggle(null);
                    }}
                />
            </Dialog>;
        },
        masterImage: (id, label, callback) => {
            return <Dialog
                        key={`${id}_dialog_master`}
                        title={`Confirm Mastered Image`}
                        callback={_handleCancel.bind(null, id)}
                    >
                        <MasterImage
                            panel1={panel1}
                            panel2={panel2}
                            setToggle={setDialogToggle}
                            callback={callback}
                        />
                    </Dialog>;
        },
        saveImage: (id, label, callback) => {
            return <Dialog
                key={`${menuID}_dialog_save_image`}
                title={`Save ${label} Image Data as File`}
                callback={_handleCancel.bind(null, id)}>
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
                callback={_handleCancel.bind(null, id)}>
                <Resizer
                    id={id}
                    properties={id === panel1.id ? panel1 : panel2}
                    setToggle={setDialogToggle}
                    options={options}
                    callback={callback}
                />
            </Dialog>;
        },
        compareImages: () => {
            return <Dialog
                key={`${menuID}_dialog_compare`}
                title={`Image Comparison`}
                callback={()=>{setDialogToggle(null)}}
            >
                <Slider
                    canvasHeight={500}
                    canvasWidth={680}
                    images={[panel1.dataURL, panel2.dataURL]}
                    onStop={()=>{setDialogToggle(null)}}
                />
            </Dialog>;
        },
        capture: (id) => {
            const panel = id === panel1.id ? panel1 : panel2;
            const owner = {
                owner_id: panel.owner_id,
                owner_type: panel.owner_type
            }
            const metadata = {
                filename: panel.filename,
                mimetype: panel.mime_type,
                file_size: panel.file_size,
                x_dim: panel.original_dims.w,
                y_dim: panel.original_dims.h,
                image_state: panel.image_state
            }
            return <Dialog
                key={`panel_info_dialog_capture`}
                title={`Image Info: ${panel.filename}`}
                callback={()=>{setDialogToggle(null)}}>
                <MetadataView
                    metadata={metadata}
                    model={panel.file_type}
                    owner={owner}
                />
            </Dialog>
        }
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
                    onMouseUp: moveEnd,
                    onMouseOut: moveEnd,
                    onKeyDown: filterKeyDown,
                }));
                // clear panel markup
                setSignal1('clear');
                setSignal2('clear');
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
                // clear panel markup
                setSignal1('clear');
                setSignal2('clear');
            },

            // [mode] crop image
            cropper: () => {
                setOptions(data => ({ ...data, mode: 'crop' }));
                setMethods(data => ({
                    ...data,
                    onMouseDown: cropStart,
                    onMouseUp: cropEnd,
                    onMouseMove: cropBound,
                    onMouseOut: cropEnd,
                    onKeyDown: filterKeyDown,
                }));
                // clear panel markup
                setSignal1('clear');
                setSignal2('clear');
            },

            // [master] upload mastered images to MLP library
            master: () => {
                // confirm that dimensions are equal
                if (
                    panel1.image_dims.w !== panel2.image_dims.w ||
                    panel1.image_dims.h !== panel2.image_dims.h ) {
                    return _handleError({
                        msg: getError('mismatchedDims', 'canvas')
                    });
                }
                // signal to generate data URLs and blobs for upload
                setSignal1('data');
                setSignal2('data');
                setSignal1('blob');
                setSignal2('blob');
                setDialogToggle({
                    type: 'masterImage',
                    callback: _handleError
                });
            },

            // [transform] image alignment
            align: () => {
                let result = alignImages(image1, image2, panel1, panel2, options);
                // handle errors
                if (result.error) {
                    return _handleError(result.error);
                }
                // load transformed data into Panel 2
                setImage2(result.data);
                setSignal2('reload');
            },

            // [transform] scale images to same width
            match: () => {
                if (panel1.image_dims.w === panel2.image_dims.w) return;
                if (panel1.image_dims.w > panel2.image_dims.w) {
                    scaleToMatch(panel2, panel1, setPanel2, setPanel1);
                }
                else {
                    scaleToMatch(panel1, panel2, setPanel1, setPanel2);
                }
                setSignal1('render');
                setSignal2('render');
            },

            // compare images in comparator overlay
            compare: () => {
                // reject if either panel is not loaded
                if (!image1 || !image2) {
                    setMessage({ msg: getError('emptyCanvas', 'canvas') });
                    return null;
                }
                // load data URLs
                setSignal1('data');
                setSignal2('data');
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
        <div className={'canvas-menu-bar'}>
            <div className={'canvas-option-controls v-menu'}>
                <ul>
                    <li>
                        <Button
                            disabled={!image1 && !image2}
                            title={'Image edit mode.'}
                            className={options.mode === 'default' ? 'active' : ''}
                            icon={'select'}
                            label={'Select'}
                            onClick={() => {
                                // clear messages
                                setMessage(null);
                                _filterMethods('default');
                            }}
                        />
                    </li>
                    <li>
                        <Button
                            disabled={!image1 && !image2}
                            title={'Crop image.'}
                            label={'Crop'}
                            className={options.mode === 'crop' ? 'active' : ''}
                            icon={'crop'}
                            onClick={() => {
                                // clear messages
                                setMessage(null);
                                _filterMethods('cropper');
                            }}
                        />
                    </li>
                    <li>
                        <Button
                            disabled={!image1 || !image2}
                            title={'Select control coordinates.'}
                            label={'Mark'}
                            className={options.mode === 'select' ? 'active' : ''}
                            icon={'crosshairs'}
                            onClick={() => {
                                // clear messages
                                setMessage(null);
                                _filterMethods('selectPoints');
                            }}
                        />
                    </li>
                    <li>
                        <Button
                            disabled={!image1 || !image2}
                            icon={'compress'}
                            label={'Match'}
                            title={'Resize image widths to match.'}
                            onClick={() => {
                                // clear messages
                                setMessage(null);
                                _filterMethods('match');
                            }}
                        />
                    </li>
                    <li>
                        <Button
                            disabled={!image1 || !image2}
                            icon={'overlay'}
                            label={'Compare'}
                            title={'Compare images using overlay.'}
                            onClick={() => {
                                // clear messages
                                setMessage(null);
                                _filterMethods('compare');
                            }}
                        />
                    </li>
                    <li>
                        <Button
                            disabled={!image1 || !image2}
                            icon={'align'}
                            label={'Align'}
                            title={'Align images using selected control points.'}
                            onClick={() => {
                                // clear messages
                                setMessage(null);
                                _filterMethods('align');
                            }}
                        />
                    </li>
                    <li>
                        <Button
                            disabled={!user || !image1 || !image2}
                            label={'Master'}
                            title={'Upload mastered images.'}
                            onClick={() => {
                                // clear messages
                                setMessage(null);
                                _filterMethods('master');
                            }}
                        />
                    </li>
                </ul>
            </div>
        </div>
        {
            _handleDialog(dialogToggle)
        }
    </>;
};


