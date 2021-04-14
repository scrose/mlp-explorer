/*!
 * MLP.Client.Components.View.Options
 * File: options.view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { getModelLabel } from '../../_services/schema.services.client';
import Dialog from '../common/dialog';
import { getNodeURI, redirect } from '../../_utils/paths.utils.client';
import { useRouter } from '../../_providers/router.provider.client';
import Table from '../common/table';
import EditorMenu from '../menus/editor.menu';
import Input from '../common/input';

/**
 * Render metadata options component.
 * - initialized with global options API data
 * - additions/edits/deletions in the dialog are refreshed in the
 *   global options after closing.
 *
 * @public
 */

const OptionsView = ({
                         type='options',
                         setToggle=()=>{},
                         callback=()=>{}
}) => {

    const router = useRouter();

    // initialize option data
    const [options, setOptions] = React.useState({});
    const [selectedIDs, setSelectedIDs] = React.useState({});
    const [optionData, setOptionData] = React.useState({});
    const excludedOpts = ['image_states'];

    // generate unique ID value for form inputs
    const menuID = Math.random().toString(16).substring(2);

    /**
     * Refresh available options from API.
     *
     * @public
     * @param optType
     * @param uri
     */

    const _refreshOptions = React.useCallback(() => {
        router.get(`/${type}`)
            .then(res => {
                const { data={} } = res || {};
                setOptions(data);
            })
            .catch(err => console.error(err));
    }, [type, router])

    /**
     * Refresh options data state upon rendering.
     *
     * @public
     * @param optType
     * @param uri
     */

    React.useEffect(() => {
        _refreshOptions();
    }, [_refreshOptions]);

    /**
     * Refresh options data state.
     *
     * @public
     * @param optType
     * @param uri
     */

    const _refresh = (optType, uri) => {
        router.get(uri)
            .then(res => {
                const { data={} } = res || {};
                setOptionData(optData => ({...optData, [optType]: data}));
            })
            .catch(err => console.error(err));
    }

    /**
     * Input on-change handler. Updates references state.
     *
     * @public
     * @param {Object} e
     */

    const _handleChange = e => {
        const {target={}} = e || {};
        const { name='', value='' } = target;
        e.persist();

        // update state of option selection
        setSelectedIDs(data => ({...data, [name]: value}));

        // get option data from selected ID
        const {id=''} = options.hasOwnProperty(name)
            ? options[name].find(opt => String(opt.value) === String(value)) || {}
            : {};

        // refresh data
        _refresh(name, getNodeURI(name, 'show', id));
    }

    // filter options for table rows
    const _filterRows = () => {
        return Object.keys(options)
            .filter(optType => !excludedOpts.includes(optType))
            .map(optType => {
            // get selected option ID
            const selectedOptionData = optionData.hasOwnProperty(optType) ? optionData[optType] : {};
            const { id='' } =  selectedOptionData || {};
            const selected = selectedIDs.hasOwnProperty(optType) ? selectedIDs[optType] : '';

            return {
                option: getModelLabel(optType),
                select: <Input
                            value={selected || ''}
                            id={`${menuID}_select`}
                            name={optType}
                            options={options[optType]}
                            type={'select'}
                            onChange={_handleChange}
                        />,
                edit:   <EditorMenu
                            id={id}
                            view={'options'}
                            model={optType}
                            metadata={selectedOptionData}
                            callback={()=>{
                                // update state of option selection
                                setSelectedIDs(data => ({...data, [optType]: null}));
                                _refreshOptions();
                                _refresh(optType, getNodeURI(optType, 'show', id));
                            }}
                        />
            };
        });
    }

    // table rows, columns
    const rows = _filterRows();
    const cols = [
        { name: 'option', label: 'Option' },
        { name: 'select', label: 'Selection' },
        { name: 'edit', label: 'Edit' }
        ];

    return <>
        <Dialog
            title={'Manage Metadata Options'}
            setToggle={setToggle}
            callback={()=>{redirect(router.route)}}
        >
            <Table className={'options'} rows={rows} cols={cols} />
        </Dialog>
    </>
}

export default React.memo(OptionsView);
