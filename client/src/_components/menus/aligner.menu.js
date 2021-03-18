/*!
 * MLP.Client.Components.Menus.IAT
 * File: aligner.menu.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Button from '../common/button';

/**
 * Menu callback
 *
 * @public
 * @return {JSX.Element}
 */

const cbk = () => {

}

/**
 * Inline menu component to edit node items.
 *
 * @public
 * @param {Object} data
 * @return {JSX.Element}
 */

const AlignerMenu = ({data}) => {

    const [menuToggle, setMenuToggle] = React.useState(null);

    // declare message variables
    let canvasX=0, canvasY=0,
        imageH=0, imageW=0,
        originX=0, originY=0,
        pointerX=0, pointerY=0,
        moveX=0, moveY=0;

    // Options-level toolbar menu
    // Choices here must coordinate with code in corresponding JS file
    const optionsMenus = {
        // File options
        msfile: <fieldset>
            <Button label={'Load'} />
            <Button label={'Save'} />
            <select id={'ts'} onChange={cbk}>
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
            <select onChange={cbk}>
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
            <span>({canvasX},{canvasY})</span>
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
                <select onChange={cbk}>
                    <option label={'1'} />
                    <option label={'2'} />
                    <option label={'3'} />
                </select>
                <select onChange={cbk}>
                    <option label={'Above'} />
                    <option label={'Beside'} />
                    <option label={'Auto'} />
                    <option label={'Max'} />
                </select>
                <select onChange={cbk}>
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
                <input type={'color'} value={'#0000ff'} onChange={cbk} />
                <input type={'text'} value={'unnamed'} size={'20'} />
                <Button label={'Set'} />
            </div>
        </fieldset>,

        // Tools Options
        mstools: <fieldset>
            <Button label={'Grid'} />
            <select id={'fs'} onChange={cbk}>
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
                <Button label={'Align'} />
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
                <select id={'rs'} onChange={cbk}>
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
                    onChange={cbk}
                    onInput={cbk} />
                <input value={100} onChange={cbk} />

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
        </div>
    )
};

export default AlignerMenu;