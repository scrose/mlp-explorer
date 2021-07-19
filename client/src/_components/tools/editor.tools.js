/*!
 * MLP.Client.Components.Tools.Selector
 * File: selector.tools.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Image from '../common/image';
import {UserMessage} from '../common/message';
import {sorter} from '../../_utils/data.utils.client';
import {useRouter} from '../../_providers/router.provider.client';
import {useUser} from '../../_providers/user.provider.client';
import {genSchema} from "../../_services/schema.services.client";
import {createNodeRoute} from "../../_utils/paths.utils.client";
import Importer from "./import.tools";
import Accordion from "../common/accordion";
import MenuEditor from "../editor/menu.editor";
import Loading from "../common/loading";

/**
 * Dependent node selector and editor widget. Used to select dependents for editor.
 *
 * @public
 * @param {Object} dependent
 * @param {Object} owner
 */

export const Dependent = ({dependent, owner}) => {

    const user = useUser();

    console.log(dependent, owner)

    // generate unique ID value for selector inputs
    const selectorID = Math.random().toString(16).substring(2);

    // destructure dependent node
    const { type='', label='', refImage = {}, node = {}, metadata = {}, dependents=[] } = dependent || {};
    const isCapture = type === 'historic_captures' || type === 'modern_captures';
    const thumbnail = isCapture ? {
        url: refImage.url,
        label: refImage.label
    } : {};

    return (
        <Accordion
            label={isCapture ? refImage.label : label}
            type={node.type}
            thumbnail={thumbnail}
            menu={<MenuEditor
                model={node.type}
                id={node.id}
                metadata={metadata}
                owner={owner}
            />}
        >
            <Importer
                view={'edit'}
                model={node.type}
                options={{
                    node: {
                        id: node.id,
                        type: node.type,
                        owner: owner
                    }
                }}
                schema={genSchema({
                    view: 'edit',
                    model: node.type,
                    user: user
                })}
                route={createNodeRoute(node.type, 'edit', node.id)}
                data={metadata}
                onCancel={() => {
                }}
                callback={(error, model, id) => {
                    console.log(error, model, id)
                }}
            />
            {
                user && Array.isArray(dependents) &&
                <>{(dependents || [])
                    .sort(sorter)
                    .map((dependent, index) => {
                        const { node = {} } = dependent || {};
                        return <Dependent
                            key={`selector_${selectorID}_input_${index}`}
                            dependent={dependent}
                            owner={{
                                id: node.owner_id,
                                type: node.owner_type
                            }}
                        />
                    })}
                </>
            }
        </Accordion>
    )
}

/**
 * Dependent node selector and editor widget. Used to select dependents for editor.
 *
 * @public
 * @param {Object} properties
 * @param callback
 */

export const DependentEditor = ({
                                    reference,
                                    onSelect = () => {
                                    },
                                    callback = () => {
                                    },
                                }) => {

    const router = useRouter();
    const user = useUser();
    const _isMounted = React.useRef(false);
    const [message, setMessage] = React.useState(null);
    const [error, setError] = React.useState(false);

    // set capture selection states
    const [currentDependents, setCurrentDependents] = React.useState([]);

    // generate unique ID value for selector inputs
    const selectorID = Math.random().toString(16).substring(2);

    /**
     * Load corresponding images for mastering (if requested)
     */

    React.useEffect(() => {
        _isMounted.current = true;

        // request captures for comparison
        if (!error && currentDependents.length === 0 && reference) {
            console.log(createNodeRoute(reference.type, 'show', reference.id))
            router.get(createNodeRoute(reference.type, 'show', reference.id))
                .then(res => {
                    if (_isMounted.current) {
                        if (!res || res.error) {
                            setError(true);
                            return res.hasOwnProperty('error')
                                ? setMessage(res.error)
                                : setMessage({msg: 'Error occurred.', type: 'error'}
                                );
                        }

                        // get capture data (if available)
                        const {response = {}} = res || {};
                        const {data = {}} = response || {};
                        const {dependents = []} = data || {};

                        // no capture data is available
                        if (dependents.length === 0) {
                            setError(true);
                            setMessage({msg: `No captures available.`, type: 'info'});
                        }

                        // selected dependents
                        setCurrentDependents(dependents);
                    }
                });
        }
        return () => {
            _isMounted.current = false;
        };
    }, [
        reference,
        user,
        router,
        setCurrentDependents,
        onSelect,
        callback,
        setMessage,
        error,
        setError
    ]);

    return <>
        {
            message && <UserMessage closeable={false} message={message}/>
        }
        {
            user && Array.isArray(currentDependents) &&
            <>{(currentDependents || [])
                .sort(sorter)
                .map((dependent, index) => {
                    return <Dependent
                        key={`selector_${selectorID}_input_${index}`}
                        dependent={dependent}
                        owner={reference}
                    />
                })}
            </>
        }
    </>;
};


/**
 * Capture comparison selector widget. Used to select a capture pair.
 *
 * @public
 * @param {String} name
 * @param value
 * @param reference
 * @param onSelect
 * @param callback
 */

export const CompareSelector = ({
                                    name,
                                    value,
                                    reference,
                                    onSelect = () => {
                                    },
                                    callback = () => {
                                    },
                                }) => {

    const router = useRouter();
    const user = useUser();
    const _isMounted = React.useRef(false);
    const [message, setMessage] = React.useState(null);
    const [error, setError] = React.useState(false);

    // set capture selection states
    const [availableCaptures, setAvailableCaptures] = React.useState([]);

    // generate unique ID value for selector inputs
    const selectorID = Math.random().toString(16).substring(2);

    /**
     * Load corresponding images for mastering (if requested)
     */

    React.useEffect(() => {
        _isMounted.current = true;

        // request captures for comparison
        if (!error && availableCaptures.length === 0 && reference) {
            router.get('/compare/' + reference.owner.id)
                .then(res => {
                    if (_isMounted.current) {
                        if (!res || res.error) {
                            setError(true);
                            return res.hasOwnProperty('error')
                                ? setMessage(res.error)
                                : setMessage({msg: 'Error occurred.', type: 'error'}
                                );
                        }

                        // get capture data (if available)
                        const {response = {}} = res || {};
                        const {data = {}} = response || {};
                        const {available = [], selected = []} = data || {};
                        const key = reference.type === 'historic_captures'
                            ? 'modern_captures'
                            : 'historic_captures';

                        // no capture data is available
                        if (available.length === 0) {
                            setError(true);
                            setMessage({msg: `No captures available.`, type: 'info'});
                        }

                        // filter available / selection captures:
                        onSelect(
                            name,
                            selected
                                .filter(capture => capture[reference.type] === reference.id)
                                .map(capture => {
                                    return capture[key];
                                })
                        );
                        setAvailableCaptures(available);
                    }
                });
        }
        return () => {
            _isMounted.current = false;
        };
    }, [
        reference,
        user,
        router,
        setAvailableCaptures,
        onSelect,
        callback,
        setMessage,
        error,
        setError
    ]);

    // add capture to selection
    const _handleSelectCapture = (captureID) => {
        if (!value.includes(captureID)) {
            onSelect(name, [...value, captureID]);
        }
    };

    // remove capture from selection
    const _handleDeselectCapture = (captureID) => {
        onSelect(name, value.filter(id => id !== captureID));
    };

    return <>
        {
            message && <UserMessage closeable={false} message={message}/>
        }
        {
            user && Array.isArray(availableCaptures) && availableCaptures.length > 0 ?
                <div className={'h-menu selector'}>
                    <ul> {(availableCaptures || [])
                        .sort(sorter)
                        .map((capture, index) => {
                            const {refImage = {}, node = {}} = capture || {};
                            return (
                                <li key={`selector_${selectorID}_input_${index}`}>
                                    <label
                                        className={value.includes(node.id) ? 'selected' : ''}
                                        style={{textAlign: 'center'}}
                                        key={`label_selection`}
                                        htmlFor={`selector_${selectorID}_input_${index}`}
                                    >
                                        <Image
                                            url={refImage.url}
                                            scale={'thumb'}
                                            title={`Select ${refImage.label || ''} for comparison.`}
                                            label={refImage.label}
                                            onClick={() => {
                                                value.includes(node.id)
                                                    ? _handleDeselectCapture(node.id)
                                                    : _handleSelectCapture(node.id);
                                            }}
                                        />
                                        <input
                                            readOnly={true}
                                            checked={value.includes(node.id)}
                                            type={'checkbox'}
                                            name={`capture_input_${index}`}
                                            id={`selector_${selectorID}_input_${index}`}
                                            value={node.id}
                                            onClick={() => {
                                                value.includes(node.id)
                                                    ? _handleDeselectCapture(node.id)
                                                    : _handleSelectCapture(node.id);
                                            }}
                                        />Compare
                                    </label>
                                </li>
                            )
                        })}
                    </ul>
                </div>
                : <Loading />
        }
    </>;
};
