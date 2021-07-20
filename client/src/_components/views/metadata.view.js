/*!
 * MLP.Client.Components.Common.MetadataView
 * File: metadata.view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { genSchema, getDependentTypes, getModelLabel } from '../../_services/schema.services.client';
import { genID, sanitize } from '../../_utils/data.utils.client';
import Button from '../common/button';
import Accordion from '../common/accordion';
import MenuEditor from '../editor/menu.editor';
import { useData } from '../../_providers/data.provider.client';
import { useUser } from '../../_providers/user.provider.client';

// generate random key
const keyID = genID();

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

export const MetadataAttached = ({ owner, attached }) => {
    const attachedViews = {
        participant_groups: (data) => {
            return Object.keys(data || {})
                .sort()
                .map((pgroup, index) => {
                    // get participant group ID
                    const pgrp = data[pgroup].find(pg => pg !== null);
                    const { pg_id = '' } = pgrp || {};
                    return <MetadataView
                        key={`${keyID}_${pgroup}_${index}`}
                        model={'participant_groups'}
                        owner={owner}
                        view={'attachItem'}
                        metadata={
                            {
                                id: pg_id,
                                group_type: pgroup,
                                [pgroup]: data[pgroup].map(participant => {
                                    return {
                                        value: participant.id,
                                        label: participant.full_name,
                                    };
                                }),
                            }
                        }
                        menu={true}
                    />;
                });
        },
        default: (mdData, model) => {
            const { label = '', data = {} } = mdData || {};
            return <MetadataView
                key={`${keyID}_${model}_${label}_metadata`}
                view={'attachItem'}
                model={model}
                owner={owner}
                label={label}
                metadata={data}
                menu={true}
            />;
        },
    };

    // iterate over attached data types
    return Object.keys(attached || {}).map(attachedModel => {
        return Array.isArray(attached[attachedModel]) && attached[attachedModel].length > 0 &&
            <Accordion
                key={`${keyID}_${attachedModel}`}
                type={attachedModel}
                label={`${getModelLabel(attachedModel, 'label')}`}
                menu={<MenuEditor
                        model={attachedModel}
                        id={owner && owner.hasOwnProperty('id') ? owner.id : ''}
                        view={'attach'}
                        owner={owner}
                        dependents={[attachedModel]}
                    />}
            >
                <div className={`${attachedModel}`}>
                    {
                        attached[attachedModel].map((attachedMD, index) => {
                            return <div key={`${keyID}_attached_md_${index}`}>
                                {
                                    attachedViews.hasOwnProperty(attachedModel)
                                        ? attachedViews[attachedModel](attachedMD)
                                        : attachedViews.default(attachedMD, attachedModel)
                                }
                                </div>;
                        })
                    }
                </div>
            </Accordion>
    });
};

/**
 * Render item table component.
 *
 * @public
 * @param {String} model
 * @param {Object} owner
 * @param {Object} metadata
 * @param {String} view
 * @param {String} label
 * @param {Object} node
 * @param {Object} file
 * @param {Boolean} menu
 * @return {JSX.Element}
 */

const MetadataView = ({
                          model,
                          owner = null,
                          metadata = {},
                          view = 'show',
                          label = '',
                          node = {},
                          file = {},
                          menu = false,
                      }) => {

    const api = useData();
    const user = useUser();

    // gather the metadata
    const { id = null, nodes_id = null, group_type = '' } = metadata || {};
    const { fieldsets = [] } = genSchema({ view: 'show', model: model, fieldsetKey: group_type, user: user});
    const itemID = id || nodes_id || '';

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
                let value = metadata.hasOwnProperty(fieldKey)
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
                                    return (
                                        <li key={`${keyID}_${model}_${index}`}>
                                            {sanitize(label)}
                                        </li>
                                    );
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
                .filter(fieldset =>
                    !group_type
                    || fieldset.fields.hasOwnProperty(group_type),
                )
                .map((fieldset, index) => {
                    return <table key={`${keyID}_${index}`} className={'item'}>
                        <thead>
                        <tr>
                            <th colSpan={'2'}>
                                <div className={`h-menu`}>
                                    <ul>
                                        <li><Button label={fieldset.legend} /></li>
                                        {
                                            menu && <li className={'editor-menu push'}>
                                                <MenuEditor
                                                    id={itemID}
                                                    model={model}
                                                    owner={owner}
                                                    view={view}
                                                    label={label}
                                                    metadata={metadata}
                                                    dependents={getDependentTypes(model)}
                                                />
                                            </li>
                                        }
                                    </ul>
                                </div>
                            </th>
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
        { (Object.keys(node).length > 0 || Object.keys(file).length > 0) &&
        <div style={{textAlign: 'right'}} className={'subtext'}>
            <table className={'right-aligned'} key={`${keyID}_node_metadata`}>
                <tbody>
                <tr>
                    <th>Created</th>
                    <td>{sanitize(node.created_at || file.created_at, 'datetime')}</td>
                </tr>
                <tr>
                    <th>Last Modified</th>
                    <td>{sanitize(node.created_at || file.created_at, 'datetime')}</td>
                </tr>
                </tbody>
            </table>
        </div>
        }
    </>;
};

export default MetadataView;
