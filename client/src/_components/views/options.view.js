/*!
 * MLP.Client.Components.View.Options
 * File: options.view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { getModelLabel } from '../../_services/schema.services.client';
import Dialog from '../common/dialog';
import { createNodeRoute, redirect } from '../../_utils/paths.utils.client';
import { useRouter } from '../../_providers/router.provider.client';
import Table from '../common/table';
import EditorMenu from '../menus/editor.menu';
import Input from '../common/input';
import { useMessage } from '../../_providers/message.provider.client';

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
    const msg = useMessage();
    const _isMounted = React.useRef(false);

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
        _isMounted.current = true;
        router.get(`/${type}`)
            .then(res => {
                if (_isMounted.current) {
                    // destructure API data for options
                    const { response = {} } = res || {};
                    const { data = {} } = response || {};
                    setOptions(data);
                }
            })
            .catch(err => console.error(err));
        return ()=>{_isMounted.current = false}
    }, [type, router, msg])

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
     * Refresh data state.
     *
     * @public
     * @param optType
     * @param uri
     */

    const _refresh = (optType, uri) => {
        router.get(uri)
            .then(res => {
                // destructure API data for options
                const { response = {} } = res || {};
                const { data = {}, message={} } = response || {};
                msg.setMessage(message);
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
        _refresh(name, createNodeRoute(name, 'show', id));
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
                                _refresh(optType, createNodeRoute(optType, 'show', id));
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
