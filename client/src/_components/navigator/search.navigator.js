/*!
 * MLP.Client.Components.Navigator.Search
 * File: search.navigator.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react'
import { useRouter } from '../../_providers/router.provider.client';
import Button from '../common/button';
import Form from '../common/form';
import { getNodeURI, serialize } from '../../_utils/paths.utils.client';
import { sanitize } from '../../_utils/data.utils.client';
import { getModelLabel } from '../../_services/schema.services.client';

/**
 * Search navigator component.
 *
 * @public
 * @return
 */

const SearchNavigator = ({filter}) => {

    const router = useRouter();

    // create search data state
    const [searchQuery, setSearchQuery] = React.useState('');
    const [searchTerms, setSearchTerms] = React.useState([]);
    const [searchResults, setSearchResults] = React.useState([]);

    // filter options by owner ID
    const onChange = (e) => {

        const {target={}} = e || {};
        const { name='', value=''} = target;

        // update filter data state with input selection
        setSearchQuery(data => ({...data, [name]: value}));
    }

    // filter options by owner ID
    const onSubmit = () => {

        console.log(serialize(searchQuery))

        router.get(`/search?${serialize(searchQuery)}`)
            .then(res => {
                const {data=[]} = res || {};
                const {query=[], results=[]} = data || {};
                // ensure data is an array
                if (Array.isArray(results) && Array.isArray(query)) {
                    setSearchResults(results);
                    setSearchTerms(query);
                }
            });
    };

    // extract an excerpt from the search results item
    const getExcerpt = (str) => {

        const {q=''} = searchQuery || {};
        let blurb = [];

        // convert to alpha-numeric chars + spaces only
        q.replace(/[^0-9a-z ]/gi, '');

        // create regex to match any query terms
        let re = new RegExp(
            `(?:.{56}|.{0,56})(${q.replaceAll(' ', '|')})(?:.{56}|.{0,56})`
        );

        // match instance of query keywords in returned text
        let excerpt = str.match(re);

        // insert bold text to highlight query term
        if (Array.isArray(excerpt) && excerpt.length > 0) {
            const term = excerpt[1];
            const strArray = excerpt[0].split(term);
            blurb.push(strArray[0]);
            blurb.push(<b>{term}</b>);
            blurb.push(strArray[1]);
        }
        return blurb;

    }

    return (
        <>
        <Form callback={onSubmit}>
            <div className="search">
                <input
                    className={'search-query'}
                    type={'search'}
                    id={'searchbar'}
                    name={'q'}
                    aria-label={'Search the site content.'}
                    placeholder={'Search..'}
                    onChange={onChange}
                />
                <Button
                    icon={'search'}
                    type={'submit'}
                    className={'search-button'}
                />
            </div>
        </Form>
        <div className={'search-results'}>
            <h3>{
                    searchResults.length > 0
                    ? `Results Found: ${searchResults.length}`
                    : ''
            }
            </h3>
            {
                (searchResults || []).map((item, index) => {
                    const {id='', type='', heading='', last_modified='', blurb='' } = item || {};
                    return <div key={item.id} className={'search-item'}>
                        <h4 onClick={()=>{router.update(getNodeURI(type, 'show', id))}}>
                            {getModelLabel(item.type)}: {sanitize(item.heading, 'date')}
                            <div className={'subtext'}>
                                Last Modified: {sanitize(last_modified, 'date')}
                            </div>
                        </h4>
                        <p>...{getExcerpt(blurb)}...</p>
                    </div>
                })
            }
        </div>
        </>
    )
}

export default React.memo(SearchNavigator);