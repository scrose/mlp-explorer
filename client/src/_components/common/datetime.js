/*!
 * MLP.Client.Components.Common.Datetime
 * File: datetime.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Flatpickr from 'react-flatpickr';

/**
 * Build datepicker widget using Pikaday module.
 *
 * @public
 * @param value
 * @param name
 * @param filter
 */

export const DateTimeSelector = ({ value, name, filter = 'datetime' }) => {
    const [date, setDate] = React.useState(value ? new Date(value) : new Date());
    const dateSelectors = {
        datetime: <Flatpickr
            name={name}
            options={{
                altInput: true,
                dateFormat: 'Z',
            }}
            data-enable-time={true}
            value={date}
            onChange={(newDate) => {
                setDate(newDate);
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
            onChange={(newDate) => {
                setDate(newDate);
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
            onChange={(newDate) => {
                setDate(newDate);
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