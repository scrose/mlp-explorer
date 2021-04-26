/*!
 * MLP.Client.Components.Common.Input
 * File: input.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react'
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_green.css";
import { getModelLabel } from '../../_services/schema.services.client';
import { convertCoordDMS, sorter } from '../../_utils/data.utils.client';
import Icon from './icon';
import Button from './button';
import Message from './message';

const noop = ()=>{};

/**
 * Build datepicker widget using Pikaday module.
 *
 * @public
 * @param value
 * @param name
 * @param filter
 */

const DateTimeSelector = ({value, name, filter='datetime'}) => {
    const [date, setDate] = React.useState(value ? new Date(value) : new Date());
    const dateSelectors = {
        datetime: <Flatpickr
            name={name}
            options={{
                altInput: true,
                dateFormat: 'Z'
            }}
            data-enable-time={true}
            value={date}
            onChange={(newDate) => {setDate(newDate)}} />,
        date: <Flatpickr
            name={name}
            options={{
                altInput: true,
                dateFormat: 'Y-m-d',
                altFormat: 'F d, Y'
            }}
            data-enable-time={false}
            value={date}
            onChange={(newDate) => {setDate(newDate)}} />,
        time: <Flatpickr
            name={name}
            options={{
                altInput: true,
                dateFormat: 'H:i:s',
                altFormat: 'H:i:ss',
                noCalendar: true
            }}
            data-enable-time={true}
            value={date}
            onChange={(newDate) => {setDate(newDate)}} />
    }
    return <>
        {
            dateSelectors.hasOwnProperty(filter)
                ? dateSelectors[filter]
                : dateSelectors.default
        }
        </>
}

/**
 * Build autocomplete widget as component.
 *
 * @public
 */

const Autocomplete = ({}) => {
    // variables
    const people = ['john doe', 'maria', 'paul', 'george', 'jimmy'];
    let results = [];

    // functions
    function autocomplete(val) {
        let people_return = [];

        for (let i = 0; i < people.length; i++) {
            if (val === people[i].slice(0, val.length)) {
                people_return.push(people[i]);
            }
        }

        return people_return;
    }

    // events
    // input.onkeyup = function(e) {
    //     const input_val = this.value; // updates the variable on each ocurrence
    //
    //     if (input_val.length > 0) {
    //         let people_to_show = [];
    //
    //         const autocomplete_results = document.getElementById("autocomplete-results");
    //         autocomplete_results.innerHTML = '';
    //         people_to_show = autocomplete(input_val);
    //
    //         for (i = 0; i < people_to_show.length; i++) {
    //             autocomplete_results.innerHTML += '<li>' + people_to_show[i] + '</li>';
    //
    //         }
    //         autocomplete_results.style.display = 'block';
    //     } else {
    //         let people_to_show = [];
    //         autocomplete_results.innerHTML = '';
    //     }
    // }
}

/**
 * Build multiselect widget.
 *
 * @public
 * @param id
 * @param name
 * @param selected
 *
 * @param required
 * @param disabled
 * @param options
 * @param onChange
 */

const MultiSelect = ({id, name, label, selected, required, disabled, options, onSelect}) => {

    // create selection list references
    const unselectedRef = React.useRef(null);
    const selectedRef = React.useRef(null);

    // prepare options data for multiselect input
    const getUnselectedOpts = () => {
        return options
            .sort(sorter)
            .map(opt => {
                const {value='', label=''} = opt || {};
                return <option
                    key={`${id}_${name}_${value}`}
                    id={`${id}_${name}_${value}`}
                    name={`${name}_${value}`}
                    value={value || ''}
                    disabled={(selected || []).some(item => parseInt(item.value) === parseInt(opt.value))}
                >{label}</option>;
            });
    }

    // generate option elements from selection list
    const getSelectedOpts = () => {
        return (selected || [])
            .sort(sorter)
            .map(opt => {
                const {value='', label=''} = opt || {};
                return <option
                    key={`${id}_${name}_${value}`}
                    id={`${id}_${name}_${value}`}
                    name={`${name}_${value}`}
                    value={value || ''}
                >{label}</option>;
            });
    }

    // generate hidden elements from selection list
    const getHiddenOpts = () => {
        return (selected || [])
            .map((opt, index) => {
                const {value=''} = opt || {};
                return <Input
                        type={'hidden'}
                        key={`${id}_${name}_${value}`}
                        id={`${id}_${name}_${value}`}
                        name={`${name}[${index}]`}
                        value={value || ''}
                        />;
            });
    }

    // add item to selection
    const selectOption = (e) => {
        e.preventDefault();

        // move chosen unselected opts to selected list
        updateSelect([...unselectedRef.current.options]
            .filter(opt => opt.selected || (selected || []).some(
                selectedOpt => String(selectedOpt.value) === String(opt.value))
            ));
    }

    // remove item from selection
    const deselectOption = (e) => {
        e.preventDefault();

        // get options chosen to be deselected
        updateSelect([...selectedRef.current.options]
            .filter(opt => !opt.selected));
    }

    // reset selection with initialization data
    const reset = (e) => {
        e.preventDefault();
        updateSelect([]);
    }

    // update data state for field
    const updateSelect = (options) => {
        // update data state
        onSelect(
            name,
            options.map(opt => {
                return {
                    label: opt.label,
                    value: opt.value,
                };
            })
        );
    }

    return <div className={'multiselect'}>
        <div>
            <select
                ref={unselectedRef}
                id={id}
                name={'unselectedOptions'}
                onChange={noop}
                multiple={true}
                placeholder={label}
            >
                { getUnselectedOpts() }
            </select>
        </div>
        <div className={'multiselect-controls'}>
            <Button
                icon={'prev'}
                onClick={deselectOption}
            />
            <Button
                icon={'undo'}
                onClick={reset} />
            <Button
                icon={'next'}
                onClick={selectOption} />
        </div>
        <div>
            <select
                ref={selectedRef}
                id={id}
                name={'selectedOptions'}
                onChange={noop}
                required={required}
                multiple={true}
            >
                { getSelectedOpts() }
            </select>
            { getHiddenOpts() }
        </div>
    </div>
}

/**
 * Build input help text (error messages). Only prints
 * first message to window.
 *
 * @public
 * @param error
 */

export const ValidationMessage = ({msg, type=''}) => {
    const container = React.useRef(null);
    // scroll to position of message in form
    React.useEffect(() => {
        container.current.scrollIntoView();
    }, [container])
    return  <div ref={container} className={`validation ${type ? type : ''}`}>
        <span>{msg.length > 0 ? msg[0] : ''}</span>
    </div>
}

/**
 * Form input component.
 *
 * <input type="hidden">
 * <input type="button">
 * <input type="checkbox">
 * <input type="date">
 * <input type="email">
 * <input type="file" [multiple]>
 * <input type="image">
 * <input type="month">
 * <input type="number">
 * <input type="password">
 * <input type="radio">
 * <input type="text">
 * <textarea>
 * <input type="url">
 * <select>
 */

export const Input = ({
                          id,
                          type,
                          name,
                          label='',
                          value='',
                          files=[],
                          min=0,
                          prefix='',
                          suffix='',
                          error=null,
                          reference='',
                          required=false,
                          readonly=false,
                          multiple=false,
                          disabled=false,
                          ariaLabel='',
                          options=null,
                          onMultiselect=noop,
                          onChange=noop,
                          onSelect=noop,
                          onDrop=noop,
                          onDragLeave=noop
                      }) => {

    // input conditional states
    const [autoClick, setAutoClick] = React.useState(true);

    // create event listener for file input
    const ref = React.useCallback((domNode) => {
        if (domNode)
            domNode.addEventListener("click", function (e) {
                if (domNode) {
                    domNode.click();
                }
            }, false);
    }, []);

    // append unique ID value for input
    id = `${name}_${id}`;

    /**
     * Input constructors for different render types.
     *
     * @private
     * @return {Function} input constructor
     */

    const _inputElements = {

        hidden: () => {
            return <input
                readOnly={true}
                type={"hidden"}
                id={id}
                name={name}
                value={value || ''}
                required={required}
            />
        },

        text: () => {
            return <input
                type={"text"}
                id={id}
                name={name}
                value={value || ''}
                required={required}
                onChange={onChange}
                aria-label={ariaLabel}
            />
        },

        autocomplete: () => {
            return <Autocomplete
                     id={id}
                     name={name}
                     value={value || ''}
                     required={required}
                     onChange={onChange}
                     aria-label={ariaLabel}
            />;
        },

        smallText: () => {
            return <input
                className={'short'}
                type={"text"}
                id={id}
                name={name}
                value={value || ''}
                required={required}
                onChange={onChange}
                aria-label={ariaLabel}
            />
        },

        textarea: () => {
            return <textarea
                id={id}
                name={name}
                value={value || ''}
                required={required}
                onChange={onChange}
                aria-label={ariaLabel}
            />
        },

        checkbox: () => {
            const isChecked = (value && value === true);
            return <input
                type={'checkbox'}
                id={id}
                name={name}
                checked={isChecked}
                required={required}
                onChange={onChange}
                aria-label={ariaLabel}
            />
        },

        int: () => {
            return <>
                <input
                    type={"number"}
                    placeholder={0}
                    step={1}
                    id={id}
                    name={name}
                    value={value || ''}
                    required={required}
                    onChange={onChange}
                    aria-label={ariaLabel} />
            </>
        },

        float: () => {
            return <>
                <input
                    type={"number"}
                    placeholder={0.000}
                    min={min}
                    step={'any'}
                    id={id}
                    name={name}
                    value={value || ''}
                    required={required}
                    onChange={onChange}
                    aria-label={ariaLabel} />
            </>
        },

        year: () => {
            return <input
                type={"number"}
                placeholder={new Date().getFullYear()}
                min={1800}
                max={new Date().getFullYear()}
                id={id}
                name={name}
                value={value || ''}
                required={required}
                onChange={onChange}
                aria-label={ariaLabel}
            />
        },

        coord: () => {
            return <>
                <input
                    type={"number"}
                    step={'any'}
                    min={name==='lat' ? -85 : -180}
                    max={name==='lat' ? 85 : 180}
                    id={id}
                    name={name}
                    value={value || ''}
                    required={required}
                    onChange={onChange}
                    aria-label={ariaLabel} />
                <span>{convertCoordDMS(value)}</span>
            </>
        },

        date: () => {
            return <DateTimeSelector
                    name={name}
                    value={value || ''}
                    filter={'date'} />
        },

        datetime: () => {
            return <DateTimeSelector
                    name={name}
                    value={value || ''}
                    filter={'datetime'}
                />
        },

        time: () => {
            return <DateTimeSelector
                name={name}
                value={value || ''}
                filter={'time'}
            />
        },

        email: () => {
            return <input
                type={"email"}
                id={id}
                name={name}
                value={value || ''}
                required={required}
                onChange={onChange}
                aria-label={ariaLabel}
            />
        },

        password: () => {
            return <input
                readOnly={autoClick}
                type={"password"}
                autoComplete="chrome-off"
                id={id}
                name={name}
                value={value || ''}
                required={required}
                onChange={onChange}
                onClick={()=>{setAutoClick(false)}}
                onFocus={()=>{setAutoClick(false)}}
            />
        },

        select: () => {
            // prepare options data for select input
            const opts = options
                .sort(sorter)
                .map(opt => {
                const {value='', label=''} = opt || {};
                return <option
                    key={`${id}_${name}_${value}`}
                    id={`${id}_${name}_${value}`}
                    name={`${name}_${value}`}
                    value={value || ''}>{label}</option>;
            });

            return <select
                id={id}
                name={name}
                disabled={disabled || options.length === 0}
                onChange={onChange}
                onSelect={onSelect}
                value={value || ''}
                required={required}
            >
                <option
                    key={`default_${id}_${name}`}
                    id={`default_${id}_${name}`}
                    name={`default_${id}_${name}`}
                    value={''}
                >
                    Select a {getModelLabel(reference)}...
                </option>
                { opts }
            </select>
        },


        multiselect: () => {
            return <MultiSelect
                id={id}
                name={name}
                selected={value}
                label={label}
                required={required}
                disabled={disabled}
                options={options}
                onChange={onChange}
                onSelect={onMultiselect}
            />
        },

        file: () => {
            const handleDragEnter = (e) => {
                e.stopPropagation();
                e.preventDefault();
            };
            const handleDragOver = (e) => {
                e.stopPropagation();
                e.preventDefault();
            };
            return <>
                <label
                    key={`label_${name}`}
                    className={'file-upload'}
                    htmlFor={id}
                    onDrop={onDrop}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={onDragLeave}>
                    <input
                        ref={ref}
                        type={"file"}
                        id={id}
                        name={name}
                        required={required}
                        onChange={onChange}
                        multiple={multiple}
                    />

                    <Icon type={'upload'} />&#160;
                    <span>{multiple ? 'Attach Multiple Files' : 'Attach File'}</span>
                    <div>{files.join(', ')}</div>
                </label>
            </>
        }
    }

    // get input element
    const input = _inputElements.hasOwnProperty(type)
        ?   _inputElements[type]()
        :   <Message message={'Loading Error'} level={'error'} closeable={false} />

    return type !== 'hidden' && type !== 'file'
        ?   <>
            <label key={`label_${name}`} htmlFor={id}>
                <span className={'label-text'}>{label}</span>
                <span className={'units'}>{prefix}</span>
                {input}
                <span className={'units'}>{suffix}</span>
            </label>
            { Array.isArray(error) && error.length > 0 && <ValidationMessage msg={error}/> }
        </>
        :   <>
            {input}
            { Array.isArray(error) && error.length > 0 && <ValidationMessage msg={error}/> }
        </>;
};

export default Input;
