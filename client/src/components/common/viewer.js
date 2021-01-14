import React from 'react';
import Form from './form';
import * as api from '../../services/api.services.client';
import NotFound from '../error/NotFound';
import Static from './static';
import { getStaticView, getSchema } from '../../services/schema.services.client';

/**
 * Select and render view component.
 *
 * @public
 * @param type
 * @param route
 * @param data
 * @param updater
 * @param messenger
 */

const renderView = (type, route, data, updater, messenger) => {

    // handle API-driven views
    switch(type){
        case 'empty':
            return <div className={'empty'} />;
        case 'static':
            return <Static route={route} />;
        case 'form':
            return <Form
                route={route}
                formData={data}
                messenger={messenger}
                updater={updater} />;
        case 'item':
            return <div>Item View</div>;
        case 'list':
            return <div>List View</div>;
        case 'notFound':
            return <NotFound />
        default:
            return <div className={'waiting'}>Loading Viewer...</div>
    }
}

/**
 * Messenger component.
 *
 * @public
 * @param id
 */

const Messenger = ({data}) => {
    const {type, msg} = data;
    return (
        <>
        { msg && type ? <div className={`msg ${type}`}>{msg}</div> : '' }
        </>
    )
}

/**
 * Build requested view from API data.
 *
 * @public
 * @param id
 */

const View = ({route, messenger, session}) => {

    // create dynamic view state
    const [viewData, setView] = React.useState({});
    const [viewType, setViewType] = React.useState('');

    // Get global data from API
    React.useEffect(() => {

        // static views: use router to grab component
        const staticType = getStaticView(route);
        // console.log('Static Type:', route, staticType)
        if (staticType) return setViewType('static');

        // non-static views: fetch API data and set view data in state
        api.getData(api.getRoute())
            .then(res => {
                console.log('API Response:', res)
                const {data, message, model, view} = res;
                console.log('API message:', message);

                // lookup view in schema
                const viewSchema = getSchema(view, model);
                if (viewSchema) {
                    const { type = '' } = viewSchema;
                    setView({ schema: viewSchema, data: data });
                    setViewType(type);
                    return;
                }

                // default: empty view
                messenger(message);
                setViewType('empty');
            })
    }, [setView, route, messenger]);

    return (
        <div className={'view'}>
            { renderView(viewType, route, viewData, setView, messenger) }
        </div>
    );
}


/**
 * Build viewer panel.
 *
 * @public
 */

const Viewer = ({updater}) => {

    // messenger state
    const [msgData, setMsg] = React.useState({});

    // get requested route
    const route = api.getPath();

    // render requested view
    return (
        <div className={"viewer"}>
            <Messenger data={msgData} />
            <View route={route} messenger={setMsg} updater={updater} />
        </div>
    )
};

export default Viewer;
