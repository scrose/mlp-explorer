/*!
 * MLP.Client.Components.Nodes.Filter
 * File: filter.view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from "react";
import { genID } from '../../../_utils/data.utils.client';
import MetadataView from '../../views/metadata.view';
import { getModelLabel } from '../../../_services/schema.services.client';
import Accordion from '../../common/accordion';
import PageMenu from '../../menus/page.menu';
import { useRouter } from '../../../_providers/router.provider.client';
import { createRoute } from '../../../_utils/paths.utils.client';

/**
 * Generate unique key.
 */

const keyID = genID();

/**
 * Filtered items component.
 *
 * @public
 * @param {Array} items
 * @return {JSX.Element}
 */

const FilterTools = ({data}) => {

    let {query='', offset=0, limit=10, results=[], count=0} = data || {};
    limit = parseInt(String(limit));
    offset = parseInt(String(offset))

    const router = useRouter();

    // create search data state
    const [searchOffset, setSearchOffset] = React.useState(offset);

    // handle previous page request
    const onPrev = () => {
        const updatedOffset = searchOffset - limit
        setSearchOffset(updatedOffset);
        console.log(searchOffset, updatedOffset, limit)
        const params = {
            ids: query,
            offset: updatedOffset,
            limit: limit
        }
        router.update(createRoute('/filter', params));
    }

    // handle next page request
    const onNext = () => {
        const updatedOffset = limit + searchOffset
        setSearchOffset(updatedOffset);
        console.log(searchOffset, updatedOffset, limit)
        const params = {
            ids: query,
            offset: updatedOffset,
            limit: limit
        }
        router.update(createRoute('/filter', params));
    }

    // prepare item data for list
    // - set render option for each item data field
    // - return complete node item for each list element
    const filterItems = () => {

        return results.map((item, index) => {

            const {node={}, metadata={}, label=''} = item || {};

            return  <li key={`${keyID}_item_${index}`}>
                        <Accordion
                            type={node.type}
                            id={node.id}
                            label={`${getModelLabel(node.type)}: ${label}`}
                        >
                            <MetadataView model={node.type} metadata={metadata} />
                        </Accordion>
                    </li>
        });
    }

    const hasNext = count >= searchOffset + limit;
    const hasPrev = 0 < searchOffset;

    return <>
        <h3>
            {
                results.length > 0 &&`Results found: ${count}`
            }
        </h3>
        <PageMenu
            total={count}
            hasPrev={hasPrev}
            hasNext={hasNext}
            onPrev={onPrev}
            onNext={onNext}
        />
        {
            count > 0
            ? <ol className={'items'} start={offset + 1}>
                {
                    filterItems()
                }
            </ol>
            : <p>No Results.</p>
        }
        <PageMenu
            total={count}
            hasPrev={hasPrev}
            hasNext={hasNext}
            onPrev={onPrev}
            onNext={onNext}
        />
    </>
}

export default FilterTools;
