/*!
 * MLP.Client.Components.Tools.Editor
 * File: selector.tools.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import Image from '../common/image';
import {UserMessage} from '../common/message';
import {sorter} from '../../_utils/data.utils.client';
import {useRouter} from '../../_providers/router.provider.client';
import {useUser} from '../../_providers/user.provider.client';
import {genSchema, getDependentTypes, getModelLabel} from "../../_services/schema.services.client";
import {createNodeRoute} from "../../_utils/paths.utils.client";
import Importer from "./import.tools";
import Accordion from "../common/accordion";
import EditorMenu from "../menus/editor.menu";
import Loading from "../common/loading";
import {FilesTable} from "../views/files.view";
import {CaptureImagesTable} from "../views/capture.view";
import {MetadataAttached} from "../views/metadata.view";

/**
 * Dependent node selector and editor widget. Used to select dependents for editor.
 *
 * @public
 * @param {Object} nodes
 * @param {Object} owner
 * @param label
 */

export const DependentNodes = ({nodes, owner, ownerLabel=''}) => {

    const user = useUser();

    // generate unique ID value for selector inputs
    const selectorID = Math.random().toString(16).substring(2);

    // destructure dependent node
    const { type='', label='', refImage = {}, node = {}, metadata = {}, dependents=[] } = nodes || {};
    const isCapture = type === 'historic_captures' || type === 'modern_captures';
    const thumbnail = isCapture ? {
        url: refImage.url,
        label: refImage.label
    } : {};

    return (
        <Accordion
            label={`${getModelLabel(node.type)} : ${isCapture ? refImage.label : label} (${ownerLabel})`}
            type={node.type}
            thumbnail={thumbnail}
            menu={<EditorMenu
                model={node.type}
                id={node.id}
                metadata={metadata}
                owner={owner}
                dependents={getDependentTypes(node.type)}
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
                callback={(error, model, id) => {
                    console.log(error, model, id)
                }}
            />
            {
                user && Array.isArray(dependents) &&
                <>{(dependents || [])
                    .sort(sorter)
                    .map((dependent, index) => {
                        const { node = {}, label='' } = dependent || {};
                        return (
                            <div key={`selector_${selectorID}_input_${node.id}_${index}`}>
                                <DependentNodes
                                    nodes={dependent}
                                    owner={{
                                        id: node.owner_id,
                                        type: node.owner_type
                                    }}
                                    ownerLabel={label}
                                />
                                {/*<DependentFiles files={files} owner={node} />*/}
                            </div>
                        )
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
 * @param {Object} dependent
 * @param {Object} owner
 */

export const DependentFiles = ({files, owner}) => {

    // generate unique ID value for selector inputs
    const selectorID = Math.random().toString(16).substring(2);

    return (
        Object.keys(files)
            .map((fileKey, index) => {
                return <Accordion
                    key={`selector_${selectorID}_files_${fileKey}_${index}`}
                    label={getModelLabel(fileKey, 'label')}
                    open={true}
                    type={fileKey}
                    menu={<EditorMenu
                        dependents={[fileKey]}
                        id={owner.id}
                        model={owner.type}
                    />}
                >
                    {
                        fileKey !== 'modern_images' && fileKey !== 'historic_images'
                            ? <FilesTable files={files[fileKey]} owner={owner}/>
                            : <CaptureImagesTable files={files[fileKey]} owner={owner} type={fileKey}/>
                    }
                </Accordion>
            })
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
    const [loaded, setLoaded] = React.useState(false);
    const [error, setError] = React.useState(false);

    // set capture selection states
    const [currentDependents, setCurrentDependents] = React.useState([]);
    const [currentFiles, setCurrentFiles] = React.useState([]);
    const [currentAttached, setCurrentAttached] = React.useState([]);
    const [label, setLabel] = React.useState('');

    // generate unique ID value for selector inputs
    const selectorID = Math.random().toString(16).substring(2);

    /**
     * Load corresponding images for mastering (if requested)
     */

    React.useEffect(() => {
        _isMounted.current = true;

        // request captures for comparison
        if (!loaded && !error && reference) {
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
                        const {dependents = [], files={}, attached={}, label=''} = data || {};
                        setLoaded(true);

                        // no dependent data available
                        if (
                            dependents.length === 0
                            && Object.keys(files).length === 0
                            && Object.keys(attached).length === 0) {
                            setMessage({msg: `No dependent nodes found.`, type: 'info'});
                        }

                        // selected dependents / files / attached metadata
                        // - omit comparisons from attached metadata
                        setCurrentDependents(dependents);
                        setCurrentFiles(files);
                        setCurrentAttached(
                            Object.keys(attached)
                                .filter(key => key !== 'comparisons')
                                .reduce((o, key) => {
                                    o[key] = attached[key];
                                    return o;
                                }, {})
                        );
                        setLabel(label);
                    }
                });
        }
        return () => {
            _isMounted.current = false;
        };
    }, [
        loaded,
        setLoaded,
        reference,
        user,
        router,
        setCurrentDependents,
        setCurrentAttached,
        setCurrentFiles,
        setLabel,
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
            <>
                {
                    (currentDependents || [])
                    .sort(sorter)
                    .map((dependentNodes, index) => {
                        return <DependentNodes
                            key={`editor_${selectorID}_dependents_${index}`}
                            nodes={dependentNodes}
                            owner={reference}
                            ownerLabel={label}
                        />
                    })
                }
            </>
        }
        {
            user && Object.keys(currentAttached).length > 0 &&
            <MetadataAttached owner={reference} attached={currentAttached} />
        }
        {
            user && Object.keys(currentFiles).length > 0 &&
            <DependentFiles files={currentFiles} owner={reference} />
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
    const [loaded, setLoaded] = React.useState(false);

    // set capture selection states
    const [availableCaptures, setAvailableCaptures] = React.useState([]);

    // generate unique ID value for selector inputs
    const selectorID = Math.random().toString(16).substring(2);

    /**
     * Load available and selected captures.
     */

    React.useEffect(() => {
        _isMounted.current = true;

        // request captures for comparison
        if (!error && !loaded && reference) {
            router.get('/compare/' + reference.owner.id)
                .then(res => {
                    if (_isMounted.current) {

                        // handle response errors
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
                        setLoaded(true);
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
        setLoaded,
        setAvailableCaptures,
        onSelect,
        callback,
        setMessage,
        error,
        setError,
        loaded,
        name
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
                                            caption={refImage.label}
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
                : message ? '' : <Loading />
        }
    </>;
};
