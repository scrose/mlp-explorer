/*!
 * MLP.Client.Components.Navigator.Filter
 * File: filter.navigator.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import Form from '../common/form';
import { genSchema } from '../../_services/schema.services.client';
import { useNav } from "../../_providers/nav.provider.client";
import {useData} from "../../_providers/data.provider.client";

/**
 * Navigator filter component.
 *
 * @public
 * @return {JSX.Element}
 */

function FilterMapNavigator() {

    const nav = useNav();
    const api = useData();

    // get filter options
    const { surveyors=[], surveys=[], survey_seasons=[] } = api.options || {};

    // create filter data state
    const [filterData, setFilterData] = React.useState(nav.filter);

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
            schema={genSchema({ view:'mapFilter', model:'stations'})}
            onReset={()=>{
                setFilterData({})
            }}
            onCancel={() => {nav.setDialog(null)}}
            onChange={onChange}
            callback={()=>{
                nav.setFilter(filterData)
                nav.setDialog(null)
            }}
            allowEmpty={true}
        />
    )
}


export default FilterMapNavigator;