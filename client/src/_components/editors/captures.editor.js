/*!
 * MLP.Client.Components.Editors.Captures
 * File: captures.editor.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import Image from '../common/image';
import {genID, groupBy} from '../../_utils/data.utils.client';
import {genSchema, getModelLabel} from "../../_services/schema.services.client";
import Accordion from "../common/accordion";
import EditorMenu from "../menus/editor.menu";
import {createNodeRoute} from "../../_utils/paths.utils.client";
import Editor from "./default.editor";
import {useUser} from "../../_providers/user.provider.client";
import {useRouter} from "../../_providers/router.provider.client";
import {UserMessage} from "../common/message";

// generate unique ID value for selector inputs
const keyID = genID();

/**
 * Capture editor widget. Used to view and edit multiple captures.
 *
 * @public
 * @param {Object} owner
 */


export const CapturesEditor = ({owner}) => {

    const user = useUser();
    const router = useRouter();

    const [selected, setSelected] = React.useState(null);
    const [dependents, setDependents] = React.useState({});
    const [error, setError] = React.useState(null);
    const [loaded, setLoaded] = React.useState(false);
    const [message, setMessage] = React.useState(null);

    // collect any captures as separate dependents
    let captureGroups = { historic_captures: [], modern_captures: [], unsorted_captures: [] };

    const _isMounted = React.useRef(true);
    const _editBox = React.createRef();

    // handle captures edit refresh
    const _handleRefresh = () => {
        setLoaded(false);
    }

    // handle captures edit cancel
    const _handleCancel = () => {
        setSelected(null);
    }

    // handle toggle selection of capture to open editor
    const _handleSelection = function (id) {
        setSelected(selected !== id ? id : null);
        _editBox.current.scrollIntoView();
    }

    /**
     * Load captures data
     */

    React.useEffect(() => {
        _isMounted.current = true;
        // request captures for comparison
        if (_isMounted.current && !loaded && !error && owner) {
            router.get(createNodeRoute(owner.type, 'show', owner.id))
                .then(res => {
                    if (_isMounted.current) {
                        if (!res || res.error) {
                            setError(true);
                            return res.hasOwnProperty('error')
                                ? setMessage(res.error)
                                : setMessage({msg: 'Error occurred.', type: 'error'});
                        }

                        // get capture data (if available)
                        const {response = {}} = res || {};
                        const {data = {}} = response || {};
                        const {dependents = [], files = {}, attached = {}} = data || {};
                        setLoaded(true);

                        // no dependent data available
                        if (
                            dependents.length === 0
                            && Object.keys(files).length === 0
                            && Object.keys(attached).length === 0) {
                            setMessage({msg: `No dependent nodes found.`, type: 'info'});
                        }

                        // group dependent nodes by model type
                        setDependents(groupBy(dependents, 'type'));
                    }
                });
        }
        return () => {
            _isMounted.current = false;
        };
    }, [loaded, error, owner, router]);


    // selected dependents / files / attached metadata
    // - omit comparisons from attached metadata
    // add sorted modern captures tabbed items
    if (dependents.hasOwnProperty('modern_captures')) {
        // filter unsorted captures
        captureGroups.unsorted_captures.push(...dependents.modern_captures.filter(capture => {
            return capture.status === 'unsorted'
        }));
        // filter sorted modern captures
        captureGroups.modern_captures = dependents.modern_captures.filter(capture => {
            return capture.status !== 'unsorted'
        });
    }

    // sort historic captures into sorted/unsorted
    if (dependents.hasOwnProperty('historic_captures')) {
        // filter unsorted captures
        captureGroups.unsorted_captures.push(...dependents.historic_captures.filter(capture => {
            return capture.status === 'unsorted'
        }));
        // filter sorted captures
        captureGroups.historic_captures = dependents.historic_captures.filter(capture => {
            return capture.status !== 'unsorted'
        });
    }

    return <>
        {
            message && <UserMessage closeable={false} message={message}/>
        }
        {
            Object.keys(captureGroups)
                .filter(captureType => captureGroups[captureType].length > 0)
                .map((captureType, index) => {
                const captures = captureGroups[captureType];
                return <Accordion
                    key={`capture_editor_${keyID}_${captureType}_${index}`}
                    type={captureType}
                    label={getModelLabel(captureType, 'label')}
                >
                    <div className={'h-menu'}>
                        <ul>
                            {
                                captures.map((capture, index) => {
                                    const {type = '', refImage = null, node = {}} = capture || {};
                                    const {id = ''} = node || {};
                                    return <li key={`capture_editor_${keyID}_${type}_${index}`}>
                                        <Image
                                            url={refImage.url}
                                            scale={'thumb'}
                                            title={`Select ${refImage.label || ''} for comparison.`}
                                            caption={refImage.label}
                                            onClick={() => {
                                                _handleSelection(id)
                                            }}
                                        />
                                    </li>
                                })
                            }
                        </ul>
                    </div>
                    <div ref={_editBox}>
                        {
                            captures.map((capture, index) => {
                                const {type = '', refImage = null, node = {}, metadata = {}} = capture || {};
                                const {id = '', owner_id = '', owner_type = ''} = node || {};
                                return <div key={`capture_editor_${keyID}_${type}_${index}`}>{
                                    selected === id &&
                                    <Accordion
                                        className={'capture-editor'}
                                        open={true}
                                        type={type}
                                        label={refImage.label}
                                        menu={<EditorMenu
                                            className={'centered'}
                                            model={type}
                                            id={id}
                                            owner={{id: owner_id, type: owner_type}}
                                            metadata={metadata}
                                            visible={['show', 'remove']}
                                        />}
                                    >
                                        <Editor
                                            view={'edit'}
                                            model={type}
                                            reference={{
                                                node: {
                                                    id: id,
                                                    type: type,
                                                    owner: {id: owner_id, type: owner_type},
                                                }
                                            }}
                                            schema={genSchema({
                                                    view: 'edit',
                                                    model: type,
                                                    fieldsetKey: '',
                                                    user: user
                                                }
                                            )}
                                            route={createNodeRoute(type, 'edit', id)}
                                            onRefresh={_handleRefresh}
                                            onCancel={_handleCancel}
                                        />
                                    </Accordion>
                                }
                                </div>
                            })
                        }
                    </div>
                </Accordion>
            })
        }</>
};
