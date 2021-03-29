/*!
 * MLP.Client.Components.Navigator.Filter
 * File: filter.navigator.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Form from '../common/form';
import { genSchema } from '../../_services/schema.services.client';

/**
 * Navigator filter component.
 *
 * @public
 * @return {JSX.Element}
 */

function FilterNavigator({data, setData, optionsData, setToggle}) {

    // get filter options
    const {options={}} = optionsData || {};
    const {surveyors_id={}, surveys_id={}, survey_seasons_id={}} = options || {};

    // create filter data state
    const [filterData, setFilterData] = React.useState(data);

    // filter options by owner ID
    const filterOptions = (selectData, ownerID) => {
        return selectData.filter(item => parseInt(item.owner_id) === parseInt(ownerID))
    }

    // filter options by owner ID
    const onChange = (e) => {

        const {target={}} = e || {};
        const { name='', value=''} = target;

        // update filter data state with input selection
        setFilterData(data => ({...data, [name]: value}));
    }

    // get selected values
    let surveyorID = filterData.hasOwnProperty('surveyors_id')
        ? filterData.surveyors_id
        : '';
    let surveyID = filterData.hasOwnProperty('surveys_id')
        ? filterData.surveys_id
        : '';

    return (
        <Form
            model={'stations'}
            opts={
                {
                    options: {
                        surveyors_id: surveyors_id,
                        surveys_id: filterOptions(surveys_id, surveyorID),
                        survey_seasons_id: filterOptions(survey_seasons_id, surveyID),
                    }
                }
            }
            init={filterData}
            schema={genSchema('filter', 'stations')}
            reset={()=>{setFilterData({})}}
            onChange={onChange}
            callback={()=>{
                setData(filterData)
                setToggle(false)}
            }
        />
    )
}


export default FilterNavigator;