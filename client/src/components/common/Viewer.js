import React from 'react';
import Form from './Form';
import schema from '../../schema';
import * as api from '../../services/api.services.client';
import * as utils from '../../utils/router.utils.client';
import { getUserSession, setUserSession, useUserContext } from '../../services/user.services.client';

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

    const [viewData, setViewData] = React.useState({});
    const [msgData, setMsgData] = React.useState({});

    // component mounted flag
    const isMountedRef = React.useRef(false);

    // Get global data from API
    React.useEffect(() => {
        console.warn('Getting View')
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
                    console.log('Viewer session:', user, data)
                    if (user) setUserSession(user);

                    // Set message (if provided)
                    if (message) {
                        setMsgData({ msg: message.msg, type: message.type });
                    }
                }
                return () => isMountedRef.current = false;
            })
    }, [setViewData, setMsgData]);

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
            { msgData != null && Object.keys(msgData).length > 0 ? <Messenger message={msgData} /> : null }
            {
                isForm
                ? <Form
                        model={model}
                        action={filteredData.action}
                        legend={filteredData.legend}
                        fields={filteredData.fields}
                        messenger={[msgData, setMsgData]}
                    />
                : <div>Data View</div>
            }
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

    const session = useUserContext();

    // Handle form data
    if (schema.hasOwnProperty(view)) {
        const viewSchema = schema[view];

        // lookup model in form schema view (or select default)
        const modelSchema = viewSchema.hasOwnProperty(model)
            ? viewSchema[model]
            : viewSchema.default;

        // lookup field labels for model (default schema)
        const labels = schema.labels[model];

        console.log('User Session:', session, getUserSession())

        // create form input elements based on schema
        const fields =
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
                            : modelSchema.field.render[attributes[key].type].render,
                        value: attributes[key].value || ''
                    };
                });

        // return schema data for requested form
        return {
            type: 'form',
            name: model,
            action: {
                method: viewSchema.attributes.method,
                url: viewSchema.attributes.submit.url,
                label: viewSchema.attributes.submit.label,
            },
            legend: viewSchema.attributes.label,
            fields: fields
        };
    }
    return null;
}

export default Viewer;
