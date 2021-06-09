/*!
 * MLP.Client.Components.Common.Autocomplete
 * File: autocomplete.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';

/**
 * Build autocomplete widget as component.
 *
 * @public
 */

export const Autocomplete = ({options}) => {
    // variables
    const people = ['john doe', 'maria', 'paul', 'george', 'jimmy'];
    //let results = [];

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

    return <>{options}</>

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
};

export default Autocomplete;