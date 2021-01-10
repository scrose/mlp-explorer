import React from 'react';
import Form from './Form';
import Dashboard from '../user/Dashboard'
import schema from '../../schema';
import * as api from '../../services/api.services.client';
import * as utils from '../../utils/router.utils.client';
import ErrorBoundary from './ErrorBoundary';
import { getUserSession, setUserSession } from '../../services/session.services.client'

/**
 * Build messages container.
 *
 * @public
 * @param id
 */

const Messenger = ({message}) => {
    const {type, msg} = message;
    return (
        <div className={`msg ${type}`}>{msg}</div>
    )
}


/**
 * Build viewer panel.
 *
 * @public
 */

const Viewer = () => {

    const [userData, setUserData] = React.useState(getUserSession());
    const [viewData, setViewData] = React.useState({});
    const [msgData, setMsgData] = React.useState({});

    // component mounted flag
    const isMountedRef = React.useRef(false);

    // Get global data from API
    React.useEffect(() => {
        isMountedRef.current = true;

        // get requested route
        const url = utils.getRoute();

        // fetch API data
        api.getData(url)
            .then(data => {
                const { view, model, attributes, message, user } = data;

                if (isMountedRef.current) {
                    setViewData({ view, model, attributes });

                    // Set user session data
                    if (user) {
                        setUserData(user);
                    }

                    // Set message (if provided)
                    if (message) {
                        setMsgData({ msg: message.msg, type: message.type });
                    }
                }
                return () => isMountedRef.current = false;
            })
    }, [setViewData, setUserData, setMsgData]);

    // update user session data
    React.useEffect(() => {setUserSession(userData);}, [userData]);

    const { view, model, attributes } = viewData;

    // initialize viewer input data
    const filteredData = _initData(view, model, attributes);

    // wait on API fetch
    if ( !filteredData )
        return (<div>Loading Viewer...</div>)

    // Is the requested view a form?
    const isForm = filteredData.type === 'form';

    // render requested view
    return (

        <div className={"viewer"}>
            <ErrorBoundary>
            { msgData != null && Object.keys(msgData).length > 0 ? <Messenger message={msgData} /> : null }
            {
                isForm
                ? <Form
                        messages={[msgData, setMsgData]}
                        model={model}
                        action={filteredData.action}
                        legend={filteredData.legend}
                        inputs={filteredData.inputs}
                        references={filteredData.references} />
                : <div>Data View</div>
            }
            </ErrorBoundary>
        </div>
    )
};

/**
 * Initialize input data for viewer.
 *
 * @public
 * @param attributes
 * @param model
 * @param view
 * @return {Object} formData
 */

function _initData(view, model, attributes) {

    // Handle form data
    if (schema.hasOwnProperty(view)) {
        const viewSchema = schema[view];

        // lookup model in form schema view (or select default)
        const modelSchema = viewSchema.hasOwnProperty(model)
            ? viewSchema[model]
            : viewSchema.default;

        // lookup field labels for model (default schema)
        const labels = schema.labels[model];

        // create form input elements based on schema
        const formInputs =
            Object.keys(modelSchema)
                // .filter(key => {
                //     return modelSchema[key].hasOwnProperty('restrict')
                //         ? !modelSchema[key].restrict || modelSchema[key].restrict.includes(restrict)
                //         : false;
                // })
                .map(key => {
                    return {
                        name: key,
                        label: labels[key],
                        type: modelSchema[key].hasOwnProperty('render')
                            ? modelSchema[key].render
                            : modelSchema.field.render[attributes[key].type].render
                    };
                });

        // input value/error references
        const references = formInputs
            .reduce((obj, item) => {
                obj[item.name] = {
                    value: attributes[item.name].value,
                    error: ''
                }
                return obj
            }, {});

        // return schema data for requested form
        return {
            type: 'form',
            model: model,
            action: {
                method: viewSchema.attributes.method,
                url: viewSchema.attributes.submit.url,
                label: viewSchema.attributes.submit.label,
            },
            legend: viewSchema.attributes.label,
            inputs: formInputs,
            references: references
        };
    }
    return null;
}

export default Viewer;
