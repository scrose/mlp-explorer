/*!
 * MLP.Client.Components.Views.Dashboard
 * File: dashboard.view.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react'
import Carousel from "../common/carousel";
import {viewerWelcome} from "../content/frontpage.static";
import {useRouter} from "../../_providers/router.provider.client";
import {UserMessage} from "../common/message";
import {MLPLogo} from "../common/logo";
import {schema} from "../../schema";


/**
 * Viewer dashboard component
 *
 * @public
 * @return {JSX.Element} result
 */

const DashboardView = () => {

    const [error, setError] = React.useState(null);
    const [images, setLoadedImages] = React.useState([]);
    const [captions, setCaptions] = React.useState([]);
    const [titles, setTitles] = React.useState([]);
    const _isMounted = React.useRef(true);

    const router = useRouter();

    // API call to retrieve random image data
    React.useEffect(() => {

        _isMounted.current = true;

        if (!error && images.length === 0) {

            // get project showcase data
            // - defined project ID
            router.get('/showcase')
                .then(res => {
                    // update state with response data
                    if (_isMounted.current) {
                        if (res.error) return setError(res.error);
                        const {response = {}} = res || {};
                        const {data = {}} = response || {};

                        const sorter = function(a, b) {
                            try {
                                return a.metadata.fn_photo_reference
                                    .localeCompare(
                                        b.metadata.fn_photo_reference, undefined, { numeric: true, sensitivity: 'base' }
                                    );
                            } catch (err) {
                                console.error(err);
                            }
                        }

                        // sort by label
                        data.sort(sorter);

                        // set loaded image pairs
                        let loadedTitles = [];
                        let loadedCaptions = [];
                        let loadedLinks = [];
                        setLoadedImages(data.map(capture => {
                            const {refImage = {}, label = '', metadata = {}} = capture || {};
                            const {comments = '', digitization_location=''} = metadata || {};
                            console.log(data, comments)
                            loadedCaptions.push(comments);
                            loadedTitles.push(label);
                            loadedLinks.push(digitization_location);
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
        }
    });

    return <>
        <div className={'heading h-menu'}>
            <ul style={{flex: ''}}>
                <li>
                    <div className={'logo'}><MLPLogo colour={'#EEEEEE'} /></div>
                </li>
                <li><h1>{schema.app.title}</h1></li>
            </ul>
        </div>
        <div style={{paddingTop: '20px'}}>
            {!error && <Carousel
                fit={'cover'}
                images={images}
                thumbnails={false}
                slideshow={true}
                autoslide={8000}
                titles={titles}
                captions={captions}
                links={[]}
            />
            }
            <div className={'dashboard'}>
                { error && <UserMessage message={{msg: 'A server error has occurred.', type: 'error'}} /> }
                <div className={'view-panel'}>
                    { viewerWelcome }
                </div>
            </div>
        </div>
    </>;
}

export default DashboardView;
