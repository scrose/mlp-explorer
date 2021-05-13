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
    const {surveyors=[], surveys=[], survey_seasons=[]} = optionsData || {};

    // create filter data state
    const [filterData, setFilterData] = React.useState(data);

    // filter options by owner ID
    const filterOptions = (selectData, ownerID) => {
        return (selectData || [])
            .filter(item => parseInt(item.owner_id) === parseInt(ownerID))
    }

    // filter options by owner ID
    const onChange = (e) => {

        const {target={}} = e || {};
        const { name='', value=''} = target;

        const updates = {
            surveyors: ()=>{
                setFilterData({ surveyors: value });
            },
            surveys: ()=>{
                setFilterData(data => ({...data, surveys: value, survey_seasons: ''}));
            },
            survey_seasons: ()=>{
                setFilterData(data => ({...data, survey_seasons: value}));
            }
        }

        // update filter data state with input selection
        if (updates.hasOwnProperty(name)) updates[name]();

    }

    // filter options based on selected values
    let surveyorID = filterData.hasOwnProperty('surveyors') && filterData.surveyors;
    let surveyID = filterData.hasOwnProperty('surveys') && filterData.surveys;
    const filteredSurveys = filterOptions(surveys, surveyorID);
    const filteredSurveySeasons = filterOptions(survey_seasons, surveyID);

    return (
        <Form
            model={'stations'}
            opts={
                {
                    surveyors: surveyors,
                    surveys: filteredSurveys,
                    survey_seasons: filteredSurveySeasons
                }
            }
            init={filterData}
            schema={genSchema('mapFilter', 'stations')}
            onReset={()=>{
                setFilterData({})
            }}
            onCancel={() => {setToggle(false)}}
            onChange={onChange}
            callback={()=>{
                setData(filterData)
                setToggle(false)
            }}
            allowEmpty={true}
        />
    )
}


export default FilterNavigator;