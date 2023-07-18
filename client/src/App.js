/*!
 * MLE.Client.App
 * File: App.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import { useUser } from './_providers/user.provider.client';
import { useRouter } from './_providers/router.provider.client';
import UnavailableError from './_components/error/unavailable.error';
import { getPref, setPref} from "./_services/session.services.client";
import BannerMenu from "./_components/menus/banner.menu";
import BoundaryError from "./_components/error/boundary.error";
import Navigator from "./_components/navigator/navigator";
import VisitorView from "./_components/views/visitor.view";
import EditorView from "./_components/views/editor.view";
import ViewerMenu from "./_components/menus/viewer.menu";
import BreadcrumbMenu from "./_components/menus/breadcrumb.menu";
import Button from "./_components/common/button";
import {useNav} from "./_providers/nav.provider.client";
import {useWindowSize} from "./_utils/events.utils.client";
import DialogSelector from "./_components/selectors/dialog.selector";
import Loading from "./_components/common/loading";
import {useAuth} from "./_providers/auth.provider.client";
import {useIat} from "./_providers/toolkit.provider.client";
import Tooltip from "./_components/common/tooltip";

/**
 * Core client application component.
 *
 * @public
 */

export default function App() {

    const router = useRouter();
    const user = useUser();
    const nav = useNav();
    const auth = useAuth();
    const iat = useIat();

    // create reference to navigator panels and resize slider
    const mainRef = React.useRef();
    const panel2Ref = React.useRef();
    const panel1Ref = React.useRef();
    const sliderRef = React.useRef();

    // create reference to panel resizer
    let sliding = false;
    const minWidth = 400;
    const maxWidth = 700;
    const thresholdWidth = 1000;
    const sliderVerticalOffset = 52;
    let slideInit = 0;

    // Addresses: Can't perform a React state update on unmounted component.
    const _isMounted = React.useRef(false);

    // window dimensions
    const [winWidth, winHeight] = useWindowSize();

    // initialize/reset panel widths
    React.useEffect(() => {
        _isMounted.current = true;

        if (
            _isMounted.current
            && sliderRef.current
            && panel1Ref.current
            && panel2Ref.current
        ) {
            if (winWidth > thresholdWidth) {
                /* Initialize full-sized panel layout */
                const navWidth = getPref('navWidth') || minWidth;
                sliderRef.current.style.top = sliderVerticalOffset + 'px';
                sliderRef.current.style.left = (navWidth - sliderRef.current.offsetWidth / 2) + 'px';
                panel1Ref.current.style.width = navWidth + 'px';
                panel2Ref.current.style.width = nav.toggle ? (winWidth - navWidth) + 'px' : winWidth + 'px';
                // reset navigator toggle
                if (nav.offCanvas) {
                    nav.setToggle(true);
                    setPref('navToggle', true);
                }
                nav.setOffCanvas(false);
            }
            else if (iat && Object.keys(iat).length > 0) {
                // set navigation to off-canvas is IAT mode
                if (nav.offCanvas) {
                    nav.setToggle(true);
                    setPref('navToggle', true);
                }
                nav.setOffCanvas(false);
            }
            else {
                /* Initialize compact panel layout */
                if (!nav.offCanvas) {
                    nav.setToggle(false);
                    setPref('navToggle', false);
                }
                nav.setOffCanvas(true);
                panel1Ref.current.style.width = minWidth + 'px';
                panel2Ref.current.style.width = winWidth + 'px';
            }
        }

        return () => {_isMounted.current = false;}
    }, [nav, iat, winWidth, winHeight]);

    /* Initialize panel resize */
    function _resizeStart(e) {
        sliding = true;
        slideInit = e.pageX;
    }

    /* Position the slider and resize panel */
    function _resizeEnd() {
        sliding = false;
        nav.setResize(true);
        setPref('navWidth', panel1Ref.current.offsetWidth);
        setPref('viewWidth', panel2Ref.current.offsetWidth);
    }

    /* Position the slider and resize panel */
    function _resize(e) {
        /* If the slider is no longer clicked, exit this function: */
        if (!sliding) return false;

        /* Compute amount to resize */
        const mainRect = mainRef.current.getBoundingClientRect();
        const panel1Rect = panel1Ref.current.getBoundingClientRect();
        const panelWidth = Math.max( Math.min( panel1Rect.width - ( slideInit - e.pageX ), maxWidth), minWidth );

        /* Resize panels */
        panel1Ref.current.style.width = `${ panelWidth }px`;
        panel2Ref.current.style.width = mainRect.width - panelWidth + 'px';
        /* Set new position of slider */
        sliderRef.current.style.left = `${ panelWidth - sliderRef.current.offsetWidth / 2 }px`;

        /* Set new slider init */
        slideInit = e.pageX;
    }

    return router.online
        ? <div className={"page"}>
            { auth.processing && <Loading overlay={true} /> }
            <DialogSelector/>
            <Tooltip />
            <BannerMenu/>
            <ViewerMenu/>
            <div
                style={{
                    display: nav.toggle && !nav.offCanvas ? 'block' : 'none',
                }}
                className={`resizer`}
                ref={sliderRef}
                onMouseDown={_resizeStart}
                onMouseUp={_resizeEnd}
                onMouseLeave={_resizeEnd}
                onMouseMove={_resize}
                onTouchStart={_resizeStart}
                onTouchEnd={_resizeEnd}
                onTouchMove={_resize}
            ><Button icon={'arrows'} size={'2x'} title={'Resize Navigation Panel'} />
            </div>
            <BreadcrumbMenu/>
            <main>
                <div className={'main'} ref={mainRef}>
                    <BoundaryError>
                        <div
                            ref={panel1Ref}
                            id={'navigator-panel'}
                            style={{ display: nav.toggle ? 'block' : 'none'}}
                            className={nav.offCanvas ? 'off-canvas' : ''}
                        >
                            <Navigator />
                        </div>
                    </BoundaryError>
                    <BoundaryError>
                        <div
                            ref={panel2Ref}
                            id={'viewer-panel'}
                        >
                            {
                                user ? <EditorView/> : <VisitorView/>
                            }
                        </div>
                    </BoundaryError>
                </div>
            </main>
        </div>
        : <UnavailableError/>
}