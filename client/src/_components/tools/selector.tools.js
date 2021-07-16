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

/**
 * Capture selector widget. Used to select a capture pair.
 *
 * @public
 * @param {Object} properties
 * @param callback
 */

export const CompareSelector = ({
                                    name,
                                    value,
                                    reference,
                                    onSelect = () => {},
                                    callback = () => {},
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
            user && Array.isArray(availableCaptures) &&
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
        }
    </>;
};
