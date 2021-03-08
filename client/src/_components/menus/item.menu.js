/*!
 * MLP.Client.Components.Menus.Item
 * File: item.menu.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { getNodeURI, redirect } from '../../_utils/paths.utils.client';
import { useUser } from '../../_providers/user.provider.client';
import { useRouter } from '../../_providers/router.provider.client';
import { genSchema, getModelLabel, getNodeLabel } from '../../_services/schema.services.client';
import Alert from '../common/alert';
import Dialog from '../common/dialog';
import Importer from '../views/importer.view';
import Item from '../common/item';

/**
 * Inline menu component to edit records.
 *
 * @public
 * @param {String} data
 * @return {JSX.Element}
 */

const ItemMenu = ({ item, model, dependent, id, options }) => {

    const { data=null } = item || {};
    const user = useUser();
    const router = useRouter();

    console.log('Item Menu', getNodeLabel(data), model, dependent, id, data)

    return (
        <div className={'item h-menu'}>
            <ul>
                {
                    id && model && data ?
                    <li key={'show'}>
                        <Dialog
                            icon={'show'}
                            title={`${getModelLabel(model)} Metadata.`}
                            children={
                                <Item model={model} data={data} view={'show'} />
                            }
                        />
                    </li> : ''
                }
                { user && id && model && data ?
                    <li key={'edit'}>
                        <Dialog
                            icon={'edit'}
                            title={`Edit ${getModelLabel(model)} Metadata.`}
                            children={
                                <Importer
                                    model={model}
                                    callback={router.post}
                                    schema={genSchema('edit', model)}
                                />
                            }
                        />
                    </li> : ''
                }
                { user && id && model && data ?
                    <li key={'remove'}>
                        <Alert
                            icon={'delete'}
                            title={`Delete ${model} record?`}
                            description={
                                <div>
                                    <p>Please confirm the deletion of {getModelLabel(model)}:</p>
                                    <p><b>{getNodeLabel(item)}</b></p>
                                    <p>Note that any dependent nodes for this record will also be deleted.</p>
                                </div>
                            }
                            callback={() => {router.remove(data)}}
                        />
                    </li> : ''
                }
                { user && model && id && dependent ?
                    <li key={'add'}>
                        <Dialog
                            icon={'add'}
                            title={`Add new ${getModelLabel(dependent)}.`}
                            children={
                                <Importer
                                    view={'add'}
                                    model={dependent}
                                    options={options}
                                    schema={genSchema('add', dependent)}
                                    route={getNodeURI(dependent, 'new', id)}
                                    callback={() => {
                                        redirect(getNodeURI(model, 'show', id));
                                    }}
                                />
                            }
                        />
                    </li> : ''
                }
            </ul>
        </div>
    );
};

export default ItemMenu;
