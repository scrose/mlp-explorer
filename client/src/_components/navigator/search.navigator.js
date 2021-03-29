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
import { genID, sanitize } from '../../_utils/data.utils.client';
import { getModelLabel } from '../../_services/schema.services.client';

/**
 * Generate unique key.
 */

const keyID = genID();

/**
 * Search navigator component.
 *
 * @public
 * @return
 */

const SearchNavigator = ({filter, limit=10, offset=0}) => {

    console.log(offset, limit)

    const router = useRouter();

    // create search data state
    const [searchQuery, setSearchQuery] = React.useState('');
    const [searchTerms, setSearchTerms] = React.useState([]);
    const [searchResults, setSearchResults] = React.useState([]);
    const [searchOffset, setSearchOffset] = React.useState(offset);

    // filter options by owner ID
    const onChange = (e) => {

        const {target={}} = e || {};
        const { name='', value=''} = target;

        // update filter data state with input selection
        setSearchQuery(data => ({...data, [name]: value}));
    }

    // filter options by owner ID
    const onSubmit = () => {

        console.log(searchOffset)

        router.get(`/search?${serialize(searchQuery)}&offset=${searchOffset}&limit=${limit}`)
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
    const getExcerpt = (str, index) => {

        let blurb = [];

        // create regex to match any query terms
        let re = new RegExp(
            `(?:.{56}|.{0,56})(${searchTerms.join('|')})(?:.{56}|.{0,56})`, 'i'
        );

        // match instance of query keywords in returned text
        let excerpt = str.match(re);

        // insert bold text to highlight query term
        if (Array.isArray(excerpt) && excerpt.length > 0) {
            const term = excerpt[1];
            const strArray = excerpt[0].split(term);
            blurb.push(strArray[0]);
            blurb.push(<b key={`${keyID}_search_hl_${index}`}>{term}</b>);
            blurb.push(strArray[1]);
        }
        return blurb;
    }

    // get results count
    const resultsCount = searchResults.length > 0
        ? searchResults[0].total
        : 0;

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
            <div className={'search-results'}>
                <h3>
                    {
                        searchTerms.length > 0
                            ? `Results Found: ${resultsCount}`
                            : ''
                    }
                </h3>
                {
                    (searchResults || []).map((item, index) => {
                        const {id='', type='', last_modified='', blurb='' } = item || {};
                        return <div key={`${keyID}_searchresults_${index}`} className={'search-item'}>
                            <h4 onClick={()=>{router.update(getNodeURI(type, 'show', id))}}>
                                {getModelLabel(item.type)}: {sanitize(item.heading, 'date')}
                                <div className={'subtext'}>
                                    Last Modified: {sanitize(last_modified, 'date')}
                                </div>
                            </h4>
                            <p>...{getExcerpt(blurb, index)}...</p>
                        </div>
                    })
                }
                <div>
                    {
                        searchTerms.length > 0
                        &&
                        <Button
                            type={'submit'}
                            label={'Next Page'}
                            onClick={() => {
                                setSearchOffset(searchOffset + 10);
                                onSubmit();
                            }
                            }
                        />
                    }
                </div>
            </div>
        </Form>
        </>
    )
}

export default React.memo(SearchNavigator);