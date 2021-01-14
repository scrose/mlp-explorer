import React from 'react';
import Form from './form';
import * as api from '../../services/api.services.client';
import NotFound from '../error/NotFound';
import { getStaticView, getSchema, getViewType } from '../../services/schema.services.client';
import { useMsg } from '../../context/msg.context.client';
import Dashboard from '../user/dashboard';
import Login from '../user/login';
import Logout from '../user/logout';
import { postData } from '../../services/api.services.client';
import { useUser } from '../../context/user.context.client';

/**
 * Render non-static view component.
 *
 * @public
 * @param { route, viewType, viewData, callback }
 * @return {React.Component}
 */

const renderView = ({ route, viewType, viewData, callback=postData }) => {

    const viewComponents = {
        'empty': () => <div className={'empty'} />,
        'form': () => <Form route={route} props={viewData} callback={callback} />,
        'item': () => <div>Item View</div>,
        'list': () => <div>List View</div>,
        "dashboard": () => <Dashboard />,
        "login": () => <Login />,
        "logout": () => <Logout />,
        'notFound': () => <NotFound />
    };

    return viewComponents.hasOwnProperty(viewType)
        ? viewComponents[viewType]()
        : <div className={'waiting'}>Loading Viewer...</div>
}

/**
 * Messenger component.
 *
 * @public
 */

const Messenger = () => {
    const messenger = useMsg();
    console.log('Message:', messenger.data)
    const {msg, type} = messenger.data;
    return (
        <>
        { msg && type ? <div className={`msg ${type}`}>{msg}</div> : '' }
        </>
    )
}

/**
 * Build requested view from API data.
 *
 * @param {String} route
 * @public
 */

const View = ({route}) => {

    // create dynamic view state
    const [viewData, setView] = React.useState({});
    const [viewType, setViewType] = React.useState('');
    const messenger = useMsg();
    const user = useUser();
    const { token=null } = user;

    // Get global data from API
    React.useEffect(() => {

        // non-static views: fetch API data and set view data in state
        api.getData(route, token)
            .then(res => {
                console.log('API Response:', res)
                const { view, model, data, message } = res;

                // lookup view in schema
                setView({
                    schema: getSchema(view, model),
                    data: data,
                    model: model
                });
                setViewType(getViewType(view));

                // post message
                messenger.setMessage(message);

            })
    }, [setView, setViewType, viewType, messenger]);

    // select default callback for view
    const callback = postData;

    return (
        <div className={'view'}>
            { renderView({ route, viewType, viewData, callback }) }
        </div>
    );
}


/**
 * Build viewer panel.
 *
 * @public
 */

const Viewer = () => {

    // get requested route
    const route = api.getPath();

    // static views: use router to grab component
    const staticType = getStaticView(route);

    return (
        <div className={"viewer"}>
            <Messenger />
            { staticType ? renderView({viewType: staticType}) : <View route={route} /> }
        </div>
    )
};

export default Viewer;
