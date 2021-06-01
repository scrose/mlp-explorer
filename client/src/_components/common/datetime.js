/*!
 * MLP.Client.Components.Common.Datetime
 * File: datetime.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Flatpickr from 'react-flatpickr';

/**
 * Build datepicker widget using Flatpickr module.
 * - Reference: https://github.com/haoxins/react-flatpickr
 *
 * @public
 * @param value
 * @param name
 * @param filter
 * @param onChange
 */

export const DateTimeSelector = ({ value, name, filter = 'datetime', onChange=()=>{} }) => {
    const [date, setDate] = React.useState(value ? new Date(value) : null);
    const dateSelectors = {
        datetime: <Flatpickr
            name={name}
            options={{
                altInput: true,
                dateFormat: 'Z',
            }}
            data-enable-time={true}
            value={date}
            onChange={(selectedDates, dateStr, instance) => {
                const e = {target: {name: name, value: dateStr}};
                setDate(selectedDates);
                onChange(e);
            }} />,
        date: <Flatpickr
            name={name}
            options={{
                altInput: true,
                dateFormat: 'Y-m-d',
                altFormat: 'F d, Y',
            }}
            data-enable-time={false}
            value={date}
            onChange={(selectedDates, dateStr, instance) => {
                const e = {target: {name: name, value: dateStr}};
                setDate(selectedDates);
                onChange(e);
            }} />,
        time: <Flatpickr
            name={name}
            options={{
                altInput: true,
                dateFormat: 'H:i:s',
                altFormat: 'H:i:ss',
                noCalendar: true,
            }}
            data-enable-time={true}
            value={date}
            onChange={(selectedDates, dateStr, instance) => {
                const e = {target: {name: name, value: dateStr}};
                setDate(selectedDates);
                onChange(e);
            }} />,
    };
    return <>
        {
            dateSelectors.hasOwnProperty(filter)
                ? dateSelectors[filter]
                : dateSelectors.default
        }
    </>;
};

export default DateTimeSelector;