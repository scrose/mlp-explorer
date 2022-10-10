import {useRouter} from "../../_providers/router.provider.client";
import {useUser} from "../../_providers/user.provider.client";
import React from "react";
import {UserMessage} from "../common/message";
import {genID, sorter} from "../../_utils/data.utils.client";
import Image from "../common/image";
import Loading from "../common/loading";

// generate unique ID value for selector inputs
const keyID = genID();

/**
 * Capture comparison selector widget. Used to select a capture pair.
 *
 * @public
 * @param {String} name
 * @param value
 * @param reference
 * @param onSelect
 */

export const ComparisonEditor = ({
                                     name,
                                     value,
                                     reference,
                                     onSelect = () => {},
                                 }) => {

    const router = useRouter();
    const user = useUser();
    const _isMounted = React.useRef(false);
    const [message, setMessage] = React.useState(null);
    const [error, setError] = React.useState(false);
    const [loaded, setLoaded] = React.useState(false);

    // set capture selection states
    const [availableCaptures, setAvailableCaptures] = React.useState([]);

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
    });

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
                                <li key={`selector_${keyID}_input_${index}`}>
                                    <label
                                        className={value.includes(node.id) ? 'selected' : ''}
                                        style={{textAlign: 'center'}}
                                        key={`label_selection`}
                                        htmlFor={`selector_${keyID}_input_${index}`}
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
                                            id={`selector_${keyID}_input_${index}`}
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
                : message ? '' : <Loading/>
        }
    </>;
};