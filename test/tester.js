/*!
 * MLP.Core.Tests.Tester
 * File: /test/tester.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */


/**
 * Create Tester class to add and run unit tests.
 *
 * @public
 */
function Tester() {
    this.tests = {}
    this.results = {}
    // set up optional callback
    this.cb = (label) => {
        let self = this
        return function (...args) {
            self.results[label] = args
            console.log('\n --- Start %s callback ---', label)
            if (!args || args.length === 0) {
                console.log('\n\t No arguments.')
            }
            else if (typeof args === "object") {
                Object.entries(args).forEach(
                    ([key, arg]) => {
                        console.log('\n\t %s: %s', key, arg)
                    }
                )
            }
            else {
                console.log('\n\t Args: %s', args)
            }
            console.log('\n --- End callback ---\n')
        }
    }
}

/**
 * Add test to tester.
 *
 * @param {function} fn – function to run
 * @public
 */

Tester.prototype.add = function (label, fn, args, expected) {

    // update callback
    let self = this
    args.forEach(function(arg, index) {
        if (arg === self.cb)
            this[index] = self.cb(label);
    }, args);

    // create new test
    this.tests[label] = {
        label: label,
        fn: fn,
        args: args,
        expected: expected,
        output: null,
        result: false,
        response: null,
    }
    console.log('Test %s added.', label)
}

/**
 * Run unit test with given parameters.
 *
 * @param {object} args – function parameters
 * @public
 */

Tester.prototype.run = function (id, timeout=0) {
    let self = this
    setTimeout(function () {
        console.log('\nRunning test %s', id)
        let test = self.tests[id]
        const output = test.fn(...test.args)
        test.output = output ? output : null
        test.result = test.output === test.expected
        return this
    }, timeout)
}

/**
 * Run unit test with given parameters.
 *
 * @param {object} args – function parameters
 * @public
 */

Tester.prototype.print = function (timeout=0) {
    let self = this
    setTimeout(function () {
        console.log('\nResults: %s', self.results)
    }, timeout)
}

module.exports = Tester