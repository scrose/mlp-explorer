/*!
 * MLP.Client.Components.Editors.Attached
 * File: attached.editor.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import {UserMessage} from '../common/message';
import {genID} from '../../_utils/data.utils.client';
import {useRouter} from '../../_providers/router.provider.client';
import {getModelLabel} from "../../_services/schema.services.client";
import {createNodeRoute} from "../../_utils/paths.utils.client";
import Accordion from "../common/accordion";
import EditorMenu from "../menus/editor.menu";
import MetadataView, {filterAttachedMetadata} from "../views/metadata.view";
import Loading from "../common/loading";
import {useUser} from "../../_providers/user.provider.client";

// generate unique ID value for selector inputs
const keyID = genID();

/**
 * Attached node data component.
 * - renders metadata attached to primary node
 * - default: metadata shown in table
 *
 * @public
 * @param {Object} owner
 * @param {Object} model
 * @return {JSX.Element}
 */

export const AttachedMetadataEditor = ({owner}) => {

    const router = useRouter();
    const user = useUser();

    const _isMounted = React.useRef(false);
    const [currentAttached, setCurrentAttached] = React.useState({});
    const [message, setMessage] = React.useState([]);
    const [error, setError] = React.useState(false);
    const [loaded, setLoaded] = React.useState(false);

    /**
     * Load attached metadata for owner
     */

    React.useEffect(() => {
        _isMounted.current = true;
        const {type = '', id = '', groupType=''} = owner || {};

        // request captures for comparison
        if (id && !error && owner) {
            router.get(createNodeRoute(type, 'show', id, groupType))
                .then(res => {
                    if (_isMounted.current) {
                        if (!res || res.error) {
                            setError(true);
                            return res && res.hasOwnProperty('error')
                                ? setMessage(res.error)
                                : setMessage({msg: 'Error occurred.', type: 'error'});
                        }

                        // get capture data (if available)
                        const {response = {}} = res || {};
                        const {data = {}} = response || {};
                        const {attached = {}, node={}} = data || {};

                        // set attached metadata
                        // - omit comparisons from attached metadata
                        // - individuate participant groups as separate attached item
                        setCurrentAttached(filterAttachedMetadata(attached, node, 'comparisons'));
                        setLoaded(true);
                    }
                })
        }
        return () => {
            _isMounted.current = false;
        };
    }, [error, owner, router]);

    // iterate over attached data types
    return <>
        {
            message && <UserMessage closeable={false} message={message}/>
        }
        {
            user && loaded
                ? Object.keys(currentAttached || {}).map(attachedModel => {
                return Array.isArray(currentAttached[attachedModel]) && currentAttached[attachedModel].length > 0 &&
                    <Accordion
                        key={`attached_${keyID}_${attachedModel}`}
                        type={attachedModel}
                        label={`${getModelLabel(attachedModel, 'label')}`}
                        className={attachedModel}
                        menu={<EditorMenu
                            visible={['new']}
                            label={getModelLabel(attachedModel, 'label')}
                            model={attachedModel}
                            owner={owner}
                        />}
                    >
                        <div className={`${attachedModel}`}>
                            {
                                currentAttached[attachedModel].map((attachedMD, index) => {
                                    const {model='', label = '', data = {}} = attachedMD || {};
                                    const {id = ''} = data || {};
                                    return <div key={`${keyID}_attached_metadata_${model}_${index}`} className={'h-menu'}>
                                        <EditorMenu
                                            className={'right-aligned'}
                                            visible={['edit', 'show', 'remove']}
                                            label={getModelLabel(model, 'label')}
                                            model={attachedModel}
                                            id={id}
                                            owner={owner}
                                            metadata={data}
                                        />
                                        <MetadataView model={attachedModel} label={label} owner={owner} metadata={data} />
                                    </div>
                                })
                            }
                        </div>
                    </Accordion>
            }) : <Loading label={'Loading Attached Metadata...'} />
        }
    </>;
};
