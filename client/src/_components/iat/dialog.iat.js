/*!
 * MLP.Client.Components.IAT.Dialog
 * File: dialog.iat.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React, {useRef} from 'react';
import Dialog from '../common/dialog';
import { ImageOpener } from './loaders/opener.iat';
import { SaveAs } from './loaders/downloader.iat';
import Resizer from './controls/resizer.iat';
import MetadataView from '../views/metadata.view';
import { useIat } from '../../_providers/iat.provider.client';
import {genID} from "../../_utils/data.utils.client";
import {Comparator} from "./controls/comparator.iat";

/**
 * No operation.
 */

const noop = () => {
};

/**
 * Image Analysis Toolkit dialog selector.
 *
 * @public
 * @return {JSX.Element}
 */

export const DialogIat = () => {

    // generate unique ID value for canvas inputs
    const menuID = genID();

    // get providers
    const iat = useIat();

    /**
     * Handle errors.
     */

    // const _handleError = (err) => {
    //     const { msg='', type='', message=''} = err || {};
    //     console.warn(msg || message);
    //     iat.setMessage({
    //         msg: msg || message || getError('default', 'canvas'),
    //         type: type || 'error'
    //     });
    // };

    /**
     * Show dialog.
     *
     * @private
     * @return {JSX.Element}
     */

    const _handleDialog = () => {
        const {
            type = '',
            id = '',
            label='',
            data=null,
            callback=()=>{},
        } = iat.dialog || {};
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
        id === iat.panel1.id
            ? (iat.panel1.file ? iat.setStatus1('loaded') : iat.setStatus1('empty'))
            : id === iat.panel2.id
                ? (iat.panel2.file ? iat.setStatus2('loaded') : iat.setStatus2('empty'))
                : noop();
        // close dialog
        iat.setDialog(null);
    };

    /**
     * IAT menu dialogs.
     *
     * @private
     * @return {JSX.Element}
     */

    const _menuDialogs = {
        loadImage: (id, label, callback) => {
            return <Dialog
                key={`${id}_dialog_select_image`}
                title={`Load Image for ${label}`}
                callback={()=>{_handleCancel(null, id)}}
            >
                <ImageOpener
                    id={id}
                    options={iat.options}
                    callback={(data)=>{
                        iat.setDialog(null);
                        callback(data);
                    }}
                    cancel={()=>{_handleCancel(null, id)}}
                />
            </Dialog>;
        },
        saveImage: (id, label, callback) => {
            return <Dialog
                key={`${menuID}_dialog_save_image`}
                title={`Save ${label} Image Data as File`}
                callback={()=>{_handleCancel(null, id)}}
            >
                <SaveAs callback={callback} />
            </Dialog>;
        },
        resize: (id, label, callback) => {
            return <Dialog
                key={`${menuID}_dialog_resize`}
                title={`Resize ${label}`}
                callback={()=>{_handleCancel(null, id)}}
            >
                <Resizer id={id} callback={callback} />
            </Dialog>;
        },
        compare: () => {
            return <Dialog
                key={`${menuID}_dialog_compare`}
                title={`Image Comparator`}
                callback={()=>{iat.setDialog(null)}}
            >
                <Comparator />
            </Dialog>;
        },
        capture: (id) => {
            const panel = id === iat.panel1.id ? iat.panel1 : iat.panel2;
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
                callback={()=>{iat.setDialog(null)}}>
                <MetadataView
                    metadata={metadata}
                    model={panel.file_type}
                    owner={owner}
                />
            </Dialog>
        }
    };

    return <>
        { _handleDialog() }
    </>;
};


