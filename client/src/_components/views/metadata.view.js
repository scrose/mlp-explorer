/*!
 * MLE.Client.Components.Views.Metadata
 * File: metadata.view.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import { genSchema, getModelLabel } from '../../_services/schema.services.client';
import {genID, humanize, sanitize} from '../../_utils/data.utils.client';
import Accordion from '../common/accordion';
import { useData } from '../../_providers/data.provider.client';
import { useUser } from '../../_providers/user.provider.client';
import FilesView from "./files.view";

// generate random key
const keyID = genID();

/**
 * Filter metadata for views/editor processing.
 *
 * @param {Object} metadata
 * @param {Object} owner
 * @param {String} filter
 * @public
 * @return {JSX.Element}
 */

export const filterAttachedMetadata = (metadata, owner, filter='comparisons') => {

    return Object.keys(metadata || {})
        .filter(key => key !== filter)
        .reduce((o, key) => {
            if (key === 'participant_groups' && !Array.isArray(metadata[key])) {
                o[key] = [];
                // separate participant groups as single attached item
                Object.keys(metadata[key] || {})
                    .sort()
                    .forEach((pgroup) => {
                        // get participant group metadata and add to attached metadata
                        const pgMetadata = {
                            id: owner.id || '',
                            label: humanize(pgroup),
                            model: key,
                            group_type: pgroup,
                            data: {
                                id: owner.id || '',
                                group_type: pgroup,
                                [pgroup]: metadata[key][pgroup].map(participant => {
                                    return {
                                        value: participant.id,
                                        label: participant.full_name,
                                    };
                                })
                            }
                        };
                        o[key].push(pgMetadata);
                    })
            }
            else o[key] = metadata[key];
            return o;
        }, {});
}

/**
 * Attached node data component.
 * - renders metadata attached to primary node
 * - default: metadata shown in table
 *
 * @public
 * @param {Object} owner
 * @param {Object} attached
 * @return {Array} components
 */

export const AttachedMetadataView = ({ owner, attached }) => {

    // iterate over attached data types
    return Object.keys(attached || {}).map(attachedModel => {
        return Array.isArray(attached[attachedModel]) && attached[attachedModel].length > 0 &&
            <Accordion
                key={`${keyID}_${attachedModel}`}
                type={attachedModel}
                label={`${getModelLabel(attachedModel, 'label')}`}
                className={attachedModel}
                open={true}
            >
                <div className={`${attachedModel}`}>
                    {
                        attached[attachedModel].map((attachedMD, index) => {
                            const { label = '', data = {} } = attachedMD || {};
                            return <MetadataView
                                    key={`${keyID}_attached_${attachedModel}_${index}`}
                                    model={attachedModel}
                                    owner={owner}
                                    label={label}
                                    metadata={data}
                                />
                        })
                    }
                </div>
            </Accordion>
    });
};

/**
 * Render item metadata (and attached metadata, files) as table component.
 *
 * @public
 * @param {String} model
 * @param {Object} metadata
 * @param {Object} node
 * @param {Object} file
 * @param {Object} attached
 * @param {Object} files
 * @return {JSX.Element}
 */

const MetadataView = ({
                          model,
                          metadata = {},
                          node = {},
                          file = {},
                          attached={},
                          files={}
                      }) => {

    const api = useData();
    const user = useUser();

    // gather the metadata
    const { group_type = '' } = metadata || {};
    // generate the model schema
    const { fieldsets = [] } = genSchema({
        view: 'show',
        model: model,
        fieldsetKey: group_type,
        user: user
    });

    // extract any attached (supplemental) metadata
    // - filter out comparisons metadata
    const attachedMetadata = filterAttachedMetadata(attached, node, 'comparisons');

    // prepare data for item table: sanitize data by render type
    const filterData = (fieldset) => {
        return Object.keys(fieldset.fields)
            .filter(key => {
                // omit hidden fields
                const { render = '' } = fieldset.fields[key] || {};
                return render !== 'hidden';
            })
            .map(fieldKey => {
                // get rendering setting from schema (if exists)
                const { render = '', reference = '', attributes = {} } = fieldset.fields[fieldKey] || {};
                const { prefix = '', suffix = '' } = attributes || {};

                // cascade data sources
                let value = (metadata || {}).hasOwnProperty(fieldKey)
                    ? metadata[fieldKey]
                    : file.hasOwnProperty(fieldKey)
                        ? file[fieldKey]
                        : node.hasOwnProperty(fieldKey)
                            ? node[fieldKey]
                            : '';

                // select options for value (if available)
                if (render === 'select' && api.options.hasOwnProperty(reference)) {
                    const selected = api.options[reference].find(opt => opt.value === value);
                    value = selected ? selected.label : value;
                }

                // multiselect list of values (if available)
                if (render === 'multiselect') {
                    return {
                        value: <ul className={'list'}>
                            {
                                metadata[group_type].map((item, index) => {
                                    const { label = '' } = item || {};
                                    return <li key={`${keyID}_${model}_${index}`}>{sanitize(label)}</li>;
                                })
                            }
                        </ul>,
                        label: fieldset.fields[fieldKey].label,
                    };
                }

                return {
                    value: sanitize(value, render, '', '', prefix, suffix),
                    label: fieldset.fields[fieldKey].label,
                };
            });
    };

    return <>
        {
            fieldsets
                .filter(fieldset => !group_type || fieldset.fields.hasOwnProperty(group_type))
                .map((fieldset, index) => {
                    return <table key={`${keyID}_${index}`} className={'item'}>
                            <thead>
                                <tr>
                                    <th colSpan={'2'}>{fieldset.legend}</th>
                                </tr>
                            </thead>
                            <tbody>
                            {
                                filterData(fieldset).map((field, index) => {
                                    return (
                                        <tr key={`${keyID}_tr_${index}`}>
                                            <th>{field.label}</th>
                                            <td>{field.value}</td>
                                        </tr>
                                    );
                                })
                            }
                            </tbody>
                        </table>;
                })
        }
        {
            Object.keys(attachedMetadata).length > 0 &&
            <AttachedMetadataView owner={node} attached={attachedMetadata} />
        }
        {
            Object.keys(files).length > 0 &&
            <FilesView key={`files_${model}_${node.id}`} owner={node} files={files} />
        }
        { (Object.keys(node).length > 0 || Object.keys(file).length > 0) &&
        <div className={'subtext'}>
            <table key={`${keyID}_node_metadata`}>
                <tbody>
                <tr>
                    <th>Created</th>
                    <td>{sanitize(node.created_at || file.created_at, 'datetime')}</td>
                </tr>
                <tr>
                    <th>Last Modified</th>
                    <td>{sanitize(node.updated_at || file.updated_at, 'datetime')}</td>
                </tr>
                </tbody>
            </table>
        </div>
        }
    </>;
};

export default MetadataView;
