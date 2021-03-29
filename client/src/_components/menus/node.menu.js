/*!
 * MLP.Client.Components.Menus.Node
 * File: node.menu.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { getNodeURI, redirect } from '../../_utils/paths.utils.client';
import { useUser } from '../../_providers/user.provider.client';
import { useRouter } from '../../_providers/router.provider.client';
import { genSchema, getModelLabel } from '../../_services/schema.services.client';
import Alert from '../common/alert';
import Dialog from '../common/dialog';
import Importer from '../views/importer.view';
import MetadataView from '../views/metadata.view';
import Button from '../common/button';
import IAT from '../views/aligner.view';

/**
 * Inline menu component to edit node items.
 *
 * @public
 * @param {Object} node
 * @param {String} model
 * @param {String} dependent
 * @param {String} id
 * @return {JSX.Element}
 */

const NodeMenu = ({
                      model,
                      id,
                      metadata,
                      label='',
                      dependent,
}) => {

    const user = useUser();
    const router = useRouter();

    // dialog toggle
    const [dialogToggle, setDialogToggle] = React.useState(null);

    return (
        <div className={'item h-menu'}>
            <ul>
                {
                    id && model && metadata ?
                    <li key={'show'}>
                        <Button
                            icon={'show'}
                            title={`View ${getModelLabel(model)} metadata.`}
                            onClick={() => {setDialogToggle('show')}}
                        />
                        {
                            dialogToggle === 'show'
                                ?   <Dialog
                                        title={`${getModelLabel(model)} Metadata`}
                                        setToggle={setDialogToggle}
                                    >
                                        <MetadataView model={model} metadata={metadata} />
                                    </Dialog>
                                : ''
                        }
                    </li> : ''
                }
                {
                    user && id && model === 'modern_images' && metadata ?
                        <li key={'master'}>
                            <Button
                                icon={'master'}
                                title={`Master ${getModelLabel(model)}.`}
                                onClick={() => {setDialogToggle('master')}}
                            />
                            {
                                dialogToggle === 'master'
                                    ? <Dialog
                                        title={`Master ${getModelLabel(model)}`}
                                        setToggle={setDialogToggle}
                                    >
                                        <IAT
                                            image1={metadata}
                                            image2={metadata}
                                            callback={() => { console.log('upload image here!!');
                                            }}
                                        />
                                    </Dialog>
                                    : ''
                            }
                        </li> : ''
                }
                {
                    user && id && model && metadata ?
                        <li key={'edit'}>
                            <Button
                                icon={'edit'}
                                title={`Edit ${getModelLabel(model)}.`}
                                onClick={() => {setDialogToggle('edit')}}
                            />
                            {
                                dialogToggle === 'edit'
                                    ? <Dialog
                                        title={`Edit ${getModelLabel(model)}`}
                                        setToggle={setDialogToggle}
                                    >
                                        <Importer
                                            view={'edit'}
                                            model={model}
                                            data={metadata}
                                            schema={genSchema('edit', model)}
                                            route={getNodeURI(model, 'edit', id)}
                                            callback={() => {
                                                redirect(getNodeURI(model, 'show', id));
                                            }}
                                        />
                                    </Dialog>
                                    : ''
                            }
                        </li> : ''
                }
                { user && id && model ?
                    <li key={'remove'}>
                        <Button
                            icon={'delete'}
                            title={`Delete ${getModelLabel(model)}.`}
                            onClick={() => {setDialogToggle('remove')}}
                        />
                        {
                            dialogToggle === 'remove' ?
                            <Alert
                                title={`Delete ${getModelLabel(model)} ${label} record?`}
                                setToggle={setDialogToggle}
                                description={
                                    <>
                                        <p>Please confirm the deletion of {getModelLabel(model)}:</p>
                                        <p><b>{label}</b></p>
                                        <p>Note that any dependent nodes for this record will also be deleted.</p>
                                    </>
                                }
                                callback={() => {
                                    router.remove(model, id);
                                }}
                            /> : ''
                        }
                    </li> : ''
                }
                {
                    user && model && id && dependent ?
                        <li key={'add'}>
                            <Button
                                icon={'add'}
                                type={model}
                                title={`Add new ${getModelLabel(dependent)}`}
                                onClick={() => {setDialogToggle('add')}}
                            />
                            {
                                dialogToggle === 'add'
                                    ? <Dialog
                                        title={`Add New ${getModelLabel(dependent)}`}
                                        setToggle={setDialogToggle}
                                        >
                                        <Importer
                                            view={'new'}
                                            model={dependent}
                                            schema={genSchema('new', dependent)}
                                            route={getNodeURI(dependent, 'new', id)}
                                            callback={() => {
                                                redirect(getNodeURI(model, 'show', id));
                                            }}
                                        />
                                    </Dialog>
                                    : ''
                            }
                        </li> : ''
                }
            </ul>
        </div>
    );
};

export default NodeMenu;
