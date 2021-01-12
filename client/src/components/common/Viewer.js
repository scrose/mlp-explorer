import React from 'react';
import Form from './Form';
import schema from '../../schema';
import * as api from '../../services/api.services.client';


/**
 * Select and render view component.
 *
 * @public
 * @param type
 * @param params
 */

const renderView = (type, params={}) => {

    const {name, action, label, fields, data, messenger} = params;

    switch(type){
        case 'form':
            return <Form
                name={name}
                action={action}
                legend={label}
                fields={fields}
                messenger={messenger} />;
        case 'item':
            return <div>Item View</div>;
        case 'list':
            return <div>List View</div>;
        default: return <div>No data</div>
    }
}

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
 * Build requested view from API data.
 *
 * @public
 * @param id
 */

const View = ({updater, params, messenger}) => {

    const { model, view, data } = params;

    // lookup view in schema
    if ( !schema.hasOwnProperty(view) )
        return (<div className={'waiting'}>Loading Viewer...</div>);

    const viewSchema = schema[view];
    const { type, method, label } = viewSchema.attributes;
    const action = {method: method, legend: label};
    const { name, attributes } = model;

    // lookup model in form schema view (or select default)
    const modelSchema = viewSchema.hasOwnProperty(name)
        ? viewSchema[name]
        : viewSchema.default;

    // lookup field labels for model (default schema)
    const labels = schema.labels[name];

    // create renderable elements based on schema:
    // selects render type based on schema or
    // (if omitted in schema) default based on data type.
    const fields =
        Object.keys(modelSchema)
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

    return (
        <div className={'view'}>
            { renderView(type, {name, action, label, fields, data, messenger}) }
        </div>
    );
}


/**
 * Build viewer panel.
 *
 * @public
 */

const Viewer = () => {

    const [viewData, setView] = React.useState({});
    const [msgData, setMsg] = React.useState({});

    // component mounted flag
    const isMountedRef = React.useRef(false);

    // Get global data from API
    React.useEffect(() => {

        // get requested route
        const url = api.getRoute();

        // fetch API data
        api.getData(url)
            .then(res => {
                // set view and message data in state
                const { model, view, data, message } = res;
                setView({ model, view, data });
                console.log(message)
                setMsg(message);
            })
    }, [setView, setMsg]);

    // render requested view
    return (
        <div className={"viewer"}>
            { msgData != null && Object.keys(msgData).length > 0
                ? <Messenger message={msgData} />
                : null }
            <View updater={setView} params={viewData} messenger={setMsg} />
        </div>
    )
};

export default Viewer;
