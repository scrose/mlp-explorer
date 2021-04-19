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
import { createNodeRoute } from '../../_utils/paths.utils.client';
import { genID, sanitize } from '../../_utils/data.utils.client';
import { getModelLabel } from '../../_services/schema.services.client';
import PageMenu from '../menus/page.menu';

/**
 * Generate unique key.
 */

const keyID = genID();

/**
 * Search navigator component.
 *
 * @public
 * @param {Object} filter
 * @param {int} limit
 * @param {int} offset
 * @return
 */

const SearchNavigator = ({filter=null, limit=10, offset=0}) => {

    const router = useRouter();

    // create search data state
    const [searchQuery, setSearchQuery] = React.useState('');
    const [searchTerms, setSearchTerms] = React.useState([]);
    const [searchResults, setSearchResults] = React.useState(null);
    const [searchOffset, setSearchOffset] = React.useState(offset);

    // handle previous page request
    const onPrev = () => {
        const delta = searchOffset - limit;
        setSearchOffset(delta);
        onSubmit();
    }

    // handle next page request
    const onNext = () => {
        const delta = searchOffset + limit;
        setSearchOffset(delta);
        onSubmit();
    }

    // update query string value
    const updateQuery = (e) => {

        const {target={}} = e || {};
        const { value=''} = target;

        // reset search offset
        setSearchOffset(0);

        // update filter data state with input selection
        setSearchQuery(value);
    }

    // filter options by owner ID
    const onSubmit = () => {
        const params = {
            q: searchQuery,
            offset: searchOffset,
            limit: limit
        }
        router.get('/search', params)
            .then(res => {
                const { data={} } = res || {};
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

    // get page / total results count
    const pageCount = Array.isArray(searchResults) ? searchResults.length : 0;
    const resultsCount = Array.isArray(searchResults) && pageCount > 0 ? searchResults[0].total : 0;
    const hasNext = resultsCount >= searchOffset + limit;
    const hasPrev = 0 < searchOffset;

    return (
        <>
        <Form
            allowEmpty={true}
            callback={onSubmit}
        >
            <div className="search">
                <input
                    className={'search-query'}
                    type={'search'}
                    id={'searchbar'}
                    name={'q'}
                    aria-label={'Search the site content.'}
                    placeholder={'Search..'}
                    onChange={updateQuery}
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
                        Array.isArray(searchResults) && searchTerms.length > 0
                            ? `Searched for '${searchTerms.join(' ')}'. Results found: ${resultsCount}`
                            : ''
                    }
                </h3>
                <PageMenu
                    total={pageCount}
                    hasPrev={hasPrev}
                    hasNext={hasNext}
                    onPrev={onPrev}
                    onNext={onNext}
                />
                <ol start={searchOffset + 1}>
                {
                    (searchResults || []).map((item, index) => {
                        const {id='', type='', last_modified='', blurb='' } = item || {};
                        return <li key={`${keyID}_searchresults_${index}`} className={'search-item'}>
                            <h4 onClick={()=>{router.update(createNodeRoute(type, 'show', id))}}>
                                {getModelLabel(item.type)}: {sanitize(item.heading, 'date')}
                            </h4>
                            <div className={'subtext'}>
                                Last Modified: {sanitize(last_modified, 'date')}
                            </div>
                            <p>...&#160;{getExcerpt(blurb, index)}&#160;...</p>
                        </li>
                    })
                }
                </ol>
                <PageMenu
                    total={pageCount}
                    hasPrev={hasPrev}
                    hasNext={hasNext}
                    onPrev={onPrev}
                    onNext={onNext}
                />
            </div>
        </Form>
        </>
    )
}

export default React.memo(SearchNavigator);