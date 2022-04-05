/*!
 * MLP.Client.Components.Viewer.Dashboard
 * File: dashboard.viewer.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react'
import Carousel from "../common/carousel";
import {viewerGettingStarted, viewerCC, viewerWelcome} from "../content/frontpage.static";
import {useRouter} from "../../_providers/router.provider.client";
import {UserMessage} from "../common/message";
import {createNodeRoute} from "../../_utils/paths.utils.client";
import {sorter} from "../../_utils/data.utils.client";
import {schema} from '../../schema'


/**
 * Viewer dashboard component
 *
 * @public
 * @return {JSX.Element} result
 */

const DashboardViewer = () => {

    const [error, setError] = React.useState(null);
    const [images, setLoadedImages] = React.useState([]);
    const [captions, setCaptions] = React.useState([]);
    const [titles, setTitles] = React.useState([]);
    const _isMounted = React.useRef(true);

    const router = useRouter();

    // API call to retrieve random image data
    React.useEffect(() => {

        _isMounted.current = true;

        // get project showcase data
        // - defined project ID
        router.get(createNodeRoute('projects', 'show', schema.app.carousel))
            .then(res => {
                // update state with response data
                if (_isMounted.current) {
                    if (res.error) return setError(res.error);
                    const {response = {}} = res || {};
                    const {data = {}} = response || {};
                    const {dependents = {}} = data || {};

                    // sort by label
                    dependents.sort(sorter)

                    // set loaded image pairs
                    let loadedTitles = [];
                    let loadedCaptions = [];
                    setLoadedImages(dependents.map(capture =>{
                        const {refImage = {}, label='', metadata={}} = capture || {};
                        const {comments = 'comments!!'} = metadata || {};
                        loadedCaptions.push(comments);
                        loadedTitles.push(label);
                        return refImage
                    }));

                    // set loaded image pairs captions
                    setCaptions(loadedCaptions);
                    // set loaded image pairs titles
                    setTitles(loadedTitles);
                }
            })
            .catch(err => console.error(err)
            );
        return () => {
            _isMounted.current = false;
        };
    }, [setTitles, setCaptions, setLoadedImages, router]);

    return (<div style={{paddingTop: '40px'}}>
        {!error && <Carousel
                fit={'cover'}
                images={images}
                thumbnails={false}
                slideshow={true}
                autoslide={8000}
                titles={titles}
                captions={captions}
            />
        }
        <div className={'h-menu dashboard view-panel-group'}>
            { error && <UserMessage message={{msg: 'A server error has occurred.', type: 'error'}} /> }
            <ul>
                <li>
                    <div className={'view-panel purple'}>
                        { viewerGettingStarted }
                    </div>
                </li>
                <li>
                    <div className={'view-panel blue'}>
                        { viewerWelcome }
                    </div>
                </li>
                <li>
                    <div className={'view-panel pink'}>
                        { viewerCC }
                    </div>
                </li>
            </ul>
        </div>
        </div>
    );
}

export default DashboardViewer;
