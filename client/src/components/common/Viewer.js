import React from 'react';
import Form from './Form';
import schema from '../../schema';
import * as api from '../../services/api.services.client';
import * as utils from '../../utils/router.utils.client';

/**
 * Build messages container.
 *
 * @public
 * @param id
 */

const Messenger = ({msg}) => {
    const {type, text} = msg;
    return (
        <div className={`msg ${type}`}>{text}</div>
    )
}


/**
 * Build viewer panel.
 *
 * @public
 * @param params
 */

const Viewer = () => {

    const [viewData, setViewData] = React.useState({});

    // Get global data from API
    React.useEffect(() => {
        api.fetchData(utils.getRoute())
            .then(data => {
                console.log('Fetched Data:', data);
                const { view, model, attributes, message } = data;
                setViewData({ view, model, attributes, message });
            })
            .catch(err => {
                setViewData({ err });
                console.error('Fetch Error:', err)
            });
    }, []);

    const { view, model, attributes, message } = viewData;

    // initialize viewer input data
    const filteredData = _initData(view, model, attributes);

    // wait on API fetch
    if ( !filteredData )
        return (<div>Loading Viewer...</div>)

    // Is the requested view a form?
    const isForm = filteredData.type === 'form';

    console.log('Form?', isForm)

    // render requested view
    return (
        <div className={"viewer"}>
            {message ? <Messenger msg={message} /> : null}
            {
                isForm
                ? <Form msg={message} formData={filteredData} />
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

   console.log('Initialize viewer data:', view, model, attributes)

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
