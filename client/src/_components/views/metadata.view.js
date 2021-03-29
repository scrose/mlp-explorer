/*!
 * MLP.Client.Components.Common.MetadataView
 * File: metadata.view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { genSchema, getModelLabel } from '../../_services/schema.services.client';
import { genID, sanitize } from '../../_utils/data.utils.client';
import NodeMenu from '../menus/node.menu';
import Button from '../common/button';
import CapturesView from './captures.view';
import Accordion from '../common/accordion';

const keyID = genID();

/**
 * Attached node data component.
 * - renders metadata attached to primary node
 * - default: metadata shown in table
 * - comparisons: side-by-side thumbnails
 *
 * @public
 * @param {Object} attached
 * @return {Array} components
 */

export const MetadataAttached = ({ attached }) => {

        const attachedViews = {
            comparisons: (data) => {
                const { historic_capture = {}, modern_capture = {} } = data || {};
                return <div className={'comparison h-menu'}>
                    <CapturesView
                        captures={[historic_capture]}
                        fileType={'historic_images'}
                    />
                    <CapturesView
                        captures={[modern_capture]}
                        fileType={'modern_images'}
                    />
                </div>;
            },
            participant_groups: (data) => {
                return Object.keys(data || {}).map((pgroup) => {
                    return <div key={`${keyID}_${pgroup}`} className={'participants'}>
                        <h5>{getModelLabel(pgroup)}</h5>
                        <ul>
                            {
                                data[pgroup].map(participant => {
                                    console.log(participant)
                                    const { id='', given_names = '', last_name = '' } = participant || {};
                                    return (
                                        <li key={`${keyID}_participant_${id}`}>
                                            {given_names} {last_name}
                                        </li>
                                    );
                                })
                            }
                        </ul>
                    </div>;
                })
            },
            default: (data, model) => {
                return <MetadataView
                    model={model}
                    metadata={data}
                    menu={true}
                />;
            },
        }

        return Object.keys(attached || {}).map(attachedModel => {
            if (attached[attachedModel].length > 0) {
                console.log(attached[attachedModel])
                // include attached metadata
                return <Accordion
                    key={`${keyID}_${attachedModel}`}
                    type={attachedModel}
                    label={`${getModelLabel(attachedModel, 'label')}`}
                >
                    <div className={`${attachedModel} h-menu`}>
                        {
                            attached[attachedModel].map((attachedMD, index) => {
                                return <div key={`${keyID}_${attachedModel}_${index}`}>
                                    {
                                        attachedViews.hasOwnProperty(attachedModel)
                                            ? attachedViews[attachedModel](attachedMD)
                                            : attachedViews.default(attachedMD, attachedModel)
                                    }
                                </div>;
                            })
                        }
                    </div>
                </Accordion>;
            }
        });

};

/**
 * Render item table component.
 *
 * @public
 * @param {String} model
 * @param {Object} metadata
 * @param {Object} node
 * @param {Object} file
 * @param menu
 * @return {JSX.Element}
 */

const MetadataView = ({
                      model,
                      metadata={},
                      node={},
                      file={},
                      menu=false
}) => {

    // generate main schema
    const { fieldsets=[] }  = genSchema('show', model);
    const {id=null, nodes_id=null} = metadata || {};
    const itemID = id || nodes_id || '';

    // prepare data for item table: sanitize data by render type
    const filterData = (fieldset) => {
        return Object.keys(fieldset.fields)
            .map(key => {

                // get rendering setting from schema (if exists)
                const { render='' } = fieldset.fields[key] || {};

                // cascade data sources
                const value = metadata.hasOwnProperty(key)
                    ? metadata[key]
                    : file.hasOwnProperty(key)
                        ? file[key]
                        : node.hasOwnProperty(key)
                            ? node[key]
                            : ''
                return {
                    value: sanitize( value, render),
                    label: fieldset.fields[key].label
                }
            });
    };

    return <>
        {
            fieldsets
                .filter(fieldset => fieldset.hasOwnProperty('legend') && fieldset.legend)
                .map((fieldset, index) => {
                    return <table key={`${keyID}_${index}`} className={'item'}>
                        <thead>
                            <tr>
                                <th colSpan={'2'}>
                                    <div className={`h-menu`}>
                                        <ul>
                                            <li><Button label={fieldset.legend} /></li>
                                            <li className={'accordion-menu'}>{
                                                menu
                                                    ? <NodeMenu
                                                        model={model}
                                                        id={itemID}
                                                        label={`${getModelLabel(model)} Metadata`}
                                                        metadata={metadata}
                                                    />
                                                    : ''
                                            }</li>
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
                    </table>
                })
        }
    </>
}

export default MetadataView
