/*!
 * MLP.Client.Components.Menus.IAT
 * File: canvas.menu.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Button from '../common/button';
import Accordion from '../common/accordion';
import Image from '../common/image';
import Form from '../common/form';
import { getNodeURI } from '../../_utils/paths.utils.client';
import { genSchema } from '../../_services/schema.services.client';
import Dialog from '../common/dialog';
import { alignImages } from '../../_utils/image.utils.client';

/**
 * Inline menu component to edit node items.
 *
 * @public
 * @param {Object} options
 * @param setOptions
 * @param image1
 * @param image2
 * @param setImage1
 * @param setImage2
 * @param setMessage
 * @return {JSX.Element}
 */

const CanvasMenu = ({
                        options={},
                        setOptions=()=>{},
                        image1=null,
                        image2=null,
                        setImage1=()=>{},
                        setImage2=()=>{},
                        setMessage=()=>{},
}) => {

    // generate unique ID value for form inputs
    const menuID = Math.random().toString(16).substring(2);

    // toggle to show/hide menu panels and popup dialogs
    const [menuToggle, setMenuToggle] = React.useState('');
    const [dialogToggle, setDialogToggle] = React.useState('');

    /**
     * Menu callback.
     *
     * @public
     * @return {JSX.Element}
     */

    const callback = (e) => {
        const {target={}} = e || {};
        const {name='', value=''} = target || {};
        console.log(name, value)
        setOptions(data => ({...data, [name]: value}));
    }

    // destructure input options
    const {
        canvasX = 0, canvasY = 0,
        imageH = 0, imageW = 0,
        originX = 0, originY = 0,
        pointerX = 0, pointerY = 0,
        moveX = 0, moveY = 0,
        controlPoints = [],
        selectorData=[]
    } = options || {};

    /**
     * Menu dialogs
     *
     * @return {JSX.Element}
     */

    const _menuDialogs = {
        captureSelect: () => {
            return <Dialog
                key={`${menuID}_dialog_select_capture`}
                title={`Select an Historic Image`}
                setToggle={setDialogToggle}>
                <CaptureSelector
                    captures={selectorData}
                    setSelected={setImage1}
                />
            </Dialog>
        },
        align: (id) => {
            return <Dialog
                key={`${menuID}_dialog_master`}
                title={`Confirm Image Pair Alignment`}
                setToggle={setDialogToggle}>
                <Form
                    route={getNodeURI('modern_images', 'master', id)}
                    schema={genSchema('master', 'modern_captures')}
                    model={'modern_captures'}
                    callback={()=>{console.log('mastered!')}}
                />
            </Dialog>
        }
    }

    // show dialog popup
    const showDialog = (type) => {
        return _menuDialogs.hasOwnProperty(dialogToggle)
            ? _menuDialogs[dialogToggle]
            : ''
    }

    // canvas state
    const [points, setPoints] = React.useState([]);

    /**
     * Canvas methods filter.
     *
     * @return {JSX.Element}
     */

    const _filterMethods = (methodType) => {
        const _methods = {
            align: () => {
                if (!image2) setMessage
                alignImages(image1, image2, controlPoints)
            }
        }
        return _methods.hasOwnProperty(methodType)
            ? _methods[methodType]()
            : null;
    }


    // Options-level toolbar menu
    // Choices here must coordinate with code in corresponding JS file
    const optionsMenus = {
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

        // View Options
        msview: <fieldset>
            <b>Canvas:</b>
            <span>({canvasX}, {canvasY})</span>
            <div>
                <Button label={'W'} />
                <Button label={'w'} />
                <Button label={'H'} />
                <Button label={'h'} />
            </div>
            <div>
                <Button label={'L'} />
                <Button label={'R'} />
                <Button label={'U'} />
                <Button label={'D'} />
            </div>
            <div>
                <Button label={'C'} />
                <Button label={'A'} />
                <Button label={'F'} />
            </div>
            <div>
                <b>Display</b>
                <select name={'nCanvases'} onChange={callback}>
                    <option value={1} label={'1'} />
                    <option value={1} label={'2'} />
                </select>
                <select onChange={callback}>
                    <option label={'Above'} />
                    <option label={'Beside'} />
                    <option label={'Auto'} />
                    <option label={'Max'} />
                </select>
                <select onChange={callback}>
                    <option label={'Show Normal'} />
                    <option label={'Show All'} />
                    <option label={'Images Only'} />
                    <option label={'Objects Only'} />
                    <option label={'All Objects'} />
                    <option label={'Inverted'} />
                </select>
            </div>
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
                <Button label={'Align'} onClick={()=>{setMode('align')}} />
                <Button label={'Clip'} />
                <Button label={'Crop'} />
            </div>
            <div>
                <Button label={'Delete'} />
            </div>
        </fieldset>,

        // Preferences Options
        msprefs: <fieldset>
            <label>Path<input id={'mspath'} type={'checkbox'} value={'path'} /></label>
            <label>CORS:<input id={'cr'} type={'checkbox'} value={'cr'} /></label>
            <label>BMP<input id={'bm'} type={'checkbox'} value={'bm'} /></label>
            <label>Chrome<input id={'gc'} type={'checkbox'} value={'gc'} /></label>
            <label>Constrain<input id={'co'} type={'checkbox'} value={'co'} /></label>
            <label>Smooth<input id={'sm'} type={'checkbox'} defaultChecked={true} value={'sm'} /></label>
            <label>Mousewheel<input id={'mw'} type={'checkbox'} defaultChecked={true} value={'mw'} /></label>
        </fieldset>,


        mscats: {},
        mshelp: {},
        msswap: {},
        msfit: {}
    }

    return (
        <div className={'iat-menu'}>
            <fieldset id={'iat-menu-1'}>
                <Button label={'File'} onClick={()=>{setMenuToggle('msfile')}} />
                <Button label={'View'} onClick={()=>{setMenuToggle('msview')}} />
                <Button label={'Edit'} onClick={()=>{setMenuToggle('msedit')}} />
                <Button label={'Tools'} onClick={()=>{setMenuToggle('mstools')}} />
                <Button label={'Prefs'} onClick={()=>{setMenuToggle('msprefs')}} />
                <Button label={'All'} onClick={()=>{setMenuToggle('msall')}} />
                <Button label={'Cats'} onClick={()=>{setMenuToggle('mscats')}} />
                <Button label={'Help'} onClick={()=>{setMenuToggle('mshelp')}} />
                <Button label={'Swap'} onClick={()=>{setMenuToggle('msswap')}} />
                <Button label={'Fit'} onClick={()=>{setMenuToggle('msfit')}} />
                <select id={'rs'} onChange={callback}>
                    <option label={'Scale'} />
                    <option label={'Fade'} />
                    <option label={'Mask'} />
                    <option label={'Alpha'} />
                    <option label={'JPG'} />
                    <option label={'Angle'} />
                </select>

                <input
                    type={'range'}
                    id={"rng1"}
                    min={0}
                    max={100}
                    value={100}
                    onChange={callback}
                    onInput={callback} />
                <input value={100} onChange={callback} />

            </fieldset>
            <div id={'iat-menu-1'}>
                <ul>
                    <li key={'ms-img'}>
                        <b>Image:</b> <span>({imageW},{imageH})</span>
                    </li>
                    <li key={'ms-origin'}>
                        <b>Origin:</b> <span>({originX},{originY})</span>
                    </li>
                    <li key={'ms-pointer'}>
                        <b>Pointer:</b> <span>({pointerX},{pointerY})</span>
                    </li>
                    <li key={'ms-move'}>
                        <b>Move:</b> <span>({moveX},{moveY})</span>
                    </li>
                </ul>
            </div>
            {
                optionsMenus[menuToggle]
            }
            {
                optionsMenus[menuToggle]
            }
        </div>
    )
};

export default CanvasMenu;

/**
 * Capture image selector
 *
 * @public
 * @param {Array} captures
 * @param {Function} setSelected
 */

export const CaptureSelector = ({
                                    captures,
                                    setSelected = () => {
                                    },
                                }) => {

    const [tabIndex, setTabIndex] = React.useState(0);
    const [imageIndex, setImageIndex] = React.useState(0);
    const [captureIndex, setCaptureIndex] = React.useState(0);

    // destructure selected capture
    const selectedCapture = captures[tabIndex];
    const { node = {}, files = {} } = selectedCapture || {};
    const { historic_images = [] } = files || {};

    return <Accordion label={'Select Historic Image'} type={'historic_images'} open={true}>
        <div className={`tab h-menu`}>
            <div className={`v-menu`}>
                <ul>
                    {
                        captures.map((capture, index) => {
                            const { node = {}, label = '' } = capture || {};
                            return <li key={`tab_${node.id}`}>
                                <Button
                                    className={index === captureIndex ? 'active' : ''}
                                    icon={tabIndex === index ? 'collapse' : 'expand'}
                                    title={`View ${label}.`}
                                    label={label}
                                    onClick={() => {
                                        setTabIndex(index);
                                    }}
                                />
                            </li>;
                        })
                    }
                </ul>
            </div>
            <div key={`tab_data_${node.id}`} className={'tab-data'}>
                <div className={'gallery h-menu capture-selector'}>
                    <ul>
                        {
                            historic_images.map(imgData => {
                                const { file = {}, url = {}, label = '' } = imgData || {};
                                return (
                                    <li
                                        key={`capture_gallery_file_${file.id || ''}`}
                                    >
                                        <label
                                            className={imageIndex === file.id ? 'active' : ''}
                                            key={`label_captures`}
                                            htmlFor={file.id}
                                        >
                                            <input
                                                readOnly={true}
                                                checked={imageIndex === file.id}
                                                type={'radio'}
                                                name={'historic_captures'}
                                                id={file.id}
                                                value={file.id}
                                                onClick={() => {
                                                    setImageIndex(file.id);
                                                    setCaptureIndex(tabIndex);
                                                    setSelected(imgData);
                                                }}>
                                            </input>
                                            <Image
                                                url={url}
                                                title={`Select ${file.filename || ''}.`}
                                                label={label}
                                                onClick={() => {
                                                    setImageIndex(file.id);
                                                    setCaptureIndex(tabIndex);
                                                    setSelected(imgData);
                                                }}
                                            />
                                        </label>
                                    </li>
                                );
                            })
                        }
                    </ul>
                </div>
            </div>
        </div>
    </Accordion>;
};