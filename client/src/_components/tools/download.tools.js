/*!
 * MLP.Client.Components.Tools.Downloader
 * File: exporter.tools.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from "react";
import { UserMessage } from '../common/message';
import Input from '../common/input';
import Button from '../common/button';
import Download from "../common/download";
import {useRouter} from "../../_providers/router.provider.client";
import {FilesList} from "../views/files.view";

/**
 * Image selector.
 *
 * @public
 */

// const Selector = () => {

// return <Button
//     icon={(getPref('bulk_img_download') || []).includes(id) ? 'minus_bulk' : 'add_bulk'}
//     label={!compact ? 'Add to Bulk Download' : ''}
//     title={`Add to bulk download.`}
//     onClick={(e) => {
//         e.preventDefault()
//         let bulkDownloads = getPref('bulk_img_download')
//         if (Array.isArray(bulkDownloads)) {
//             if (bulkDownloads.includes(id)) {
//                 bulkDownloads = bulkDownloads.filter(function (value) {
//                     return value !== id;
//                 });
//             } else {
//                 bulkDownloads.push(id)
//             }
//             setPref('bulk_img_download', [...new Set(bulkDownloads)])
//             console.log(bulkDownloads)
//         } else {
//             setPref('bulk_img_download', [])
//         }
//     }}
// />
//     return null
// }

/**
 * Bulk downloader
 * all historical captures, all modern captures; best available historical,
 * best available moderns; fieldnote data; station details; location images.
 *
 * @public
 */

const Downloader = ({setToggle, id}) => {

    // create dynamic data states
    const [loadedData, setLoadedData] = React.useState(null);
    const [error, setError] = React.useState(null);
    const [imageFilter, setImageFilter] = React.useState([]);
    const [message, setMessage] = React.useState(null);
    const _isMounted = React.useRef(true);
    const router = useRouter();

    // retrieve capture images for node
    // API call to retrieve node data (if not yet loaded)
    React.useEffect(() => {
        _isMounted.current = true;

        // API call for page data
        if (!error && !loadedData && id) {
            router.get(`/files/select/${id}`)
                .then(res => {
                    // update state with response data
                    if (_isMounted.current) {
                        if (res.error) return setError(res.error);
                        const { response = {} } = res || {};
                        const { data = {} } = response || {};
                        // console.log(data)
                        setLoadedData(data);
                    }
                })
                .catch(err => console.error(err),
                );
        }
        return () => {
            _isMounted.current = false;
        };
    }, [error, loadedData, setLoadedData, id, router, imageFilter]);

    /**
     * Flatten capture object to collect file IDs
     * @param images
     * @private
     */
    const _getFileIDs = (images) => {
        return [].concat.apply([], images)
            .map(img => {
                const {id=null} = img || {}
                return id
            });
    }

    /**
     * Flatten capture object to collect file names
     * @param images
     * @private
     */
    const _getFileList = (images) => {
        return [].concat.apply([], images)
            .map(img => {
                return {label: img.filename, file: img, url: img.url}
            });
    }

    /**
     * Get updated query of file IDs
     * - ids are grouped by file type
     * @private
     * @return string
     */
    const _getFileQuery = () => {
        return options
            .filter(opt => imageFilter.includes(opt.value))
            .map(opt => {return `${opt.value}=${opt.data.join('+')}`})
            .join('&');
    }

    // initialize image options for download
    const options = [
        {
            value: 'historic_images',
            label: 'All historical capture images',
            files: loadedData && loadedData.hasOwnProperty('historic_images')
                ? _getFileList(loadedData.historic_images)
                : [],
            data: loadedData && loadedData.hasOwnProperty('historic_images')
                ? _getFileIDs(loadedData.historic_images)
                : []
        },
        {
            value: 'modern_images',
            label: 'All modern capture images',
            files: loadedData && loadedData.hasOwnProperty('modern_images')
                ? _getFileList(loadedData.modern_images)
                : [],
            data: loadedData && loadedData.hasOwnProperty('modern_images')
                ? _getFileIDs(loadedData.modern_images)
                : []
        },
        // {
        //     value: 'supplemental_images',
        //     label: 'All supplemental images',
        //     files: loadedData && loadedData.hasOwnProperty('supplemental_images')
        //         ? _getFileList(loadedData.supplemental_images)
        //         : [],
        //     data: loadedData && loadedData.hasOwnProperty('supplemental_images')
        //         ? _getFileIDs(loadedData.supplemental_images)
        //         : []
        // }
    ];

    const _handleCallback = (err) => {
        err ? setMessage(err) : setToggle(false);
    }

    // Handler for image filter select all
    // - ensure image filter only includes options with data
    const _handleSelectAll = () => {
        setImageFilter(
            options
                .filter(opt => opt.data.length > 0)
                .map(opt => {return opt.value})
        );
    };

    // Handler for image filter select none
    const _handleDeselectAll = () => {
        setImageFilter([]);
    };

    // Handler for image filter selections
    const _handleSelect = (opt) => {
        // toggle inclusion of selected files
        imageFilter.includes(opt)
            ? setImageFilter(data => {return data.filter(o => o !== opt)})
            : setImageFilter(data => ([ ...data, opt ]));

        // reset form if no options selected
        // if (imageFilter.includes(opt) && imageFilter.length === 1) _handleDeselectAll()
    };

    // render download-as button
    return <fieldset className={'submit'}>
        <UserMessage message={message} closeable={false} />
        <div>
            <fieldset>
                <Input
                    key={`bulk_download_filter_option_select_none`}
                    label={'Deselect All Images'}
                    type={'checkbox'}
                    value={Array.isArray(imageFilter) && imageFilter.length === 0}
                    onChange={() => _handleDeselectAll()}
                />
                <Input
                    key={`bulk_download_filter_option_select_all`}
                    label={'Select All Images'}
                    type={'checkbox'}
                    value={Array.isArray(imageFilter) && options.filter(
                        opt => !imageFilter.includes(opt.value) && opt.data.length > 0).length === 0
                    }
                    onChange={() => _handleSelectAll()}
                />
                {
                    options.map((opt, index) => {
                        return Array.isArray(opt.data) && opt.data.length > 0 && <Input
                            key={`bulk_download_filter_option_${index}`}
                            label={opt.label}
                            type={'checkbox'}
                            value={Array.isArray(imageFilter) && imageFilter.includes(opt.value)}
                            onChange={() => _handleSelect(opt.value)}
                        />
                    })
                }
                {
                    Array.isArray(imageFilter) && imageFilter.length > 0 &&
                    <div className={'h-menu'}>
                        <ul>
                            <li>
                                <Download
                                    filename ={`mlp_download.zip`}
                                    format={'zip'}
                                    label={`Download`}
                                    route={`/files/download/raw?${_getFileQuery()}`}
                                    callback={_handleCallback}
                                />
                            </li>
                            <li>
                                <Button
                                    icon={'cancel'}
                                    label={'Cancel'}
                                    className={'cancel'}
                                    onClick={()=>{setToggle(false)}}
                                />
                            </li>
                        </ul>
                    </div>
                }
            </fieldset>
            <div>
                {
                    options
                        .filter(opt => imageFilter.includes(opt.value))
                        .map((filegroup, index) => {
                            return Array.isArray(filegroup.files) && filegroup.files.length > 0 &&
                                <div className={''} key={`download-filelist-${index}`}>
                                    <h3>{filegroup.label}</h3>
                                    <FilesList files={filegroup.files} />
                                </div>
                        })
                }
            </div>
        </div>
    </fieldset>;
}

export default Downloader;


