/*!
 * MLP.Client.Components.Viewer.Dashboard
 * File: dashboard.viewer.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react'
import Carousel from "../common/carousel";
import {viewerGettingStarted, viewerIAT, viewerWelcome} from "../content/dashboard.static";
import {useRouter} from "../../_providers/router.provider.client";
import { createRoute } from "../../_utils/paths.utils.client";


/**
 * Viewer dashboard component
 *
 * @public
 * @return {JSX.Element} result
 */

const DashboardViewer = () => {

    const [error, setError] = React.useState(null);
    const [images, setLoadedImages] = React.useState([]);
    const _isMounted = React.useRef(true);

    const router = useRouter();

    // API call to retrieve random image data
    React.useEffect(() => {

        _isMounted.current = true;

        // generate random file IDs
        function genRandID(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
        }
        const maxID = 8000;
        let ids = [];
        while(ids.length < 5){
            const r = genRandID(1, maxID);
            if (ids.indexOf(r) === -1) ids.push(r);
        }
        const route = createRoute('/compare/filter', { ids: ids });

        router.get(route)
            .then(res => {
                // update state with response data
                if (_isMounted.current) {

                    if (res.error) return setError(res.error);

                    // destructure image data
                    const {response = {}} = res || {};
                    let {data = {}} = response || {};
                    const imgData = data.results.reduce( (o, pair) => {
                        o.push(pair.historic_capture.refImage);
                        o.push(pair.modern_capture.refImage);
                        return o;
                    }, []);
                    console.log(imgData);

                    // set loaded image pairs
                    setLoadedImages(imgData);
                }
            })
            .catch(err => console.error(err)
            );
        return () => {
            _isMounted.current = false;
        };
    }, [setLoadedImages, router]);


    return (<>
        <Carousel
            fit={'cover'}
            images={images}
            menu={false}
            autoslide={4000}
            captions={[]}
        />
        <div className={'h-menu dashboard view-panel-group'}>
            <ul>
                <li>
                    <div className={'view-panel purple'}>
                        { viewerGettingStarted }
                    </div>
                </li>
                <li>
                    <div className={'view-panel pink'}>
                        { viewerIAT }
                    </div>
                </li>
                <li>
                    <div className={'view-panel blue'}>
                        { viewerWelcome }
                    </div>
                </li>
            </ul>
        </div>
        </>
    );
}

export default DashboardViewer;
