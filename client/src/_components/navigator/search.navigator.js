/*!
 * MLP.Client.Components.Navigator.Search
 * File: search.navigator.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react'
import { useRouter } from '../../_providers/router.provider.client';
import Button from '../common/button';
import { createNodeRoute } from '../../_utils/paths.utils.client';
import { genID, sanitize } from '../../_utils/data.utils.client';
import { getModelLabel } from '../../_services/schema.services.client';
import Accordion from "../common/accordion";
import {useWindowSize} from "../../_utils/events.utils.client";

/**
 * Generate unique key.
 */

const keyID = genID();

/**
 * Search navigator component.
 *
 * @public
 * @param {Array} filter
 * @param {int} limit
 * @param {int} offset
 * @param hidden
 * @return
 */

const SearchNavigator = ({filter=[], limit=5, offset=0, hidden=true}) => {

    const router = useRouter();

    // create search data state
    const [searchQuery, setSearchQuery] = React.useState('');
    const [searchTerms, setSearchTerms] = React.useState([]);
    const [searchResults, setSearchResults] = React.useState(null);
    const [searchOffset, setSearchOffset] = React.useState(offset);

    // error flag
    const [error, setError] = React.useState(null);

    // window dimensions
    const [winWidth, winHeight] = useWindowSize();

    // update query string value
    const updateQuery = (e) => {

        const {target={}} = e || {};
        const { value=''} = target;

        // reset search offset
        setSearchOffset(0);

        // update filter data state with input selection
        setSearchQuery(value);
    }

    // submit main search query
    const _handleSubmit = () => {

        const params = {
            q: searchQuery,
            offset: searchOffset,
            limit: limit
        }

        if (!error) {
            // send search query to API
            router.get('/search', params)
                .then(res => {
                    if (res.error) return setError(res.error);
                    const { response = {} } = res || {};
                    const { data = {} } = response || {};
                    const { terms = [], results = {} } = data || {};
                    console.log(terms, results)

                    // ensure data is an array
                    if (Object.keys(results).length > 0 && Array.isArray(terms)) {
                        setSearchResults(results);
                        setSearchTerms(terms);
                    }
                });
        }
    };

    // filter options by owner ID
    const _handleGetMore = (model, offset) => {

        const params = {
            q: searchQuery,
            offset: offset,
            limit: limit,
            filter: [model]
        }

        if (!error) {
            // send search query to API
            router.get('/search', params)
                .then(res => {
                    if (res.error) return setError(res.error);
                    const { response = {} } = res || {};
                    const { data = {} } = response || {};
                    const { results = {} } = data || {};

                    const newResults = Object.keys(results).reduce((o, key) => {
                        o[key].push(...results[key]);
                        return o;
                    }, searchResults);

                    // add additional results to search results
                    setSearchResults(JSON.parse(JSON.stringify(newResults)));
                });
        }
    };

    // extract an excerpt from the search results item
    const getExcerpt = (str, index) => {

        let blurb;

        // create regex to match any query terms
        let re = new RegExp(
            `(?:.{56}|.{0,56})(${searchTerms.join('|')})(?:.{56}|.{0,56})`, 'i'
        );

        // match instance of query keywords in returned text
        let excerpt = str.match(re);

        // highlight search terms in excerpt
        if (Array.isArray(excerpt) && excerpt.length > 0) {
            blurb = excerpt[0];
            // remove partial words from start and end of excerpt
            const startIndex = blurb.indexOf(' ');
            const endIndex = blurb.lastIndexOf(' ');
            blurb = startIndex < endIndex ? blurb.substring(startIndex, endIndex) : blurb;

            // Find and highlight search terms in excerpt
            searchTerms.forEach(term => {
                blurb = blurb.replace(
                    new RegExp(term + '(?!([^<]+)?<)', 'gi'),
                    '~~~~SPLIT~~~~$&~~~~SPLIT~~~~');
            });
            blurb = blurb.split('~~~~SPLIT~~~~');
            blurb = blurb.map((txt, index) => {
                const key = `hi_term_${searchTerms.join('_').substring(0, 10)}${index}`;
                if (txt.match(new RegExp(`${searchTerms.join('|')}`, 'gi')))
                    return <b key={key}>{txt}</b>;
                return txt;
            })
        }
        return blurb;
    }

    return <div
        className="search"
        style={{
            display: hidden ? ' none' : ' block',
            height: ( winHeight - 140 ) + 'px'
        }}>
        <div className="search-input">
            <input
                className={'search-query'}
                type={'search'}
                id={'searchbar'}
                name={'q'}
                aria-label={'Search the site content.'}
                placeholder={'Search..'}
                onChange={updateQuery}
                onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.keyCode === 13) {
                        _handleSubmit();
                    }
                }}
            />
            <Button
                icon={'search'}
                className={'search-button'}
                onClick={_handleSubmit}
            />
        </div>
        <div className={'search-results'}>
            <h3>{searchTerms.length > 0 ? `Search Results for '${searchTerms.join(' ')}'` : ''}</h3>
        {
            (Object.keys(searchResults || {}))
                .filter(model => searchResults[model].length > 0)
                .map((model, index) => {
                    return <Accordion
                        type={model}
                        label={`${getModelLabel(model, 'label')}: ${searchResults[model][0].total} Results Found`}
                        key={`search_results_${model}_${index}`}>
                        <div>
                            {
                                searchResults[model].map((item, index) => {
                                    const {id = '', type = '', last_modified = '', blurb = ''} = item || {};
                                    const excerpt = getExcerpt(blurb, index);
                                    return <div key={`${keyID}_searchresults_${index}`} className={'search-item'}>
                                        <h4 onClick={() => {
                                            router.update(createNodeRoute(type, 'show', id))
                                        }}>
                                            {getModelLabel(item.type)}: {sanitize(item.heading)}
                                        </h4>
                                        <div className={'subtext'}>
                                            Last Modified: {sanitize(last_modified, 'date')}
                                        </div>
                                        {
                                            excerpt && <p><em>...&#160;{excerpt}&#160;...</em></p>
                                        }
                                    </div>
                                })
                            }
                        </div>
                        {
                            searchResults[model].length < searchResults[model][0].total &&
                            <Button
                                label={'See More Results'}
                                onClick={() => {
                                    _handleGetMore(model, searchResults[model].length)
                                }}
                            />
                        }
                    </Accordion>
                })
        }</div>
    </div>
}

export default SearchNavigator;