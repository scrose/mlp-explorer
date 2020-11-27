/*!
 * MLP.UI.Editor.Form.Validator
 * File: /public/js/validate.utils.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

/**
 * Create Validator object.
 *
 * @public
 */

function Validator() {
	// get error messenger
	this.messenger = new ValidatorMessenger();
}

/**
 * Initialize Validator.
 *
 * @private
 * @param {Object} params
 */

Validator.prototype.init = function (params) {
	try {
		this.form = document.getElementById(params.id);
		// abort(error) if form does not exist
		if (!this.form) throw new Error('Form not found.');
		// abort(error) form is empty
		if (!this.form.elements) throw new Error('Form is empty.');
		// abort if checklist is empty
		if (Object.keys(params.checklist).length === 0) return;
		this.checklist = params.checklist;
		// disable submit button until form is valid
		this.submit = nodeBuilder.wrap('submit_' + params.id).addClassname('disabled').disableInput();

		// add form event listener
		const self = this;
		this.form.addEventListener('input', function (e) {
			if (self.checkAll()) {
				self.submit.enableInput();
				self.submit.removeClassname('disabled');
			} else {
				self.submit.disableInput();
				self.submit.addClassname('disabled');
			}
		});

		// add listeners for each form input in checklist
		for (const field in this.checklist) {
			const input = document.getElementById(field);
			const fieldChecklist = this.checklist[field];
			// only proceed with non-empty inputs/checklists
			if (!input || !fieldChecklist) continue;

			// initialize validation messenger
			this.messenger.init(field);

			// validate fields with preset values
			if (this.getValue(field)) {
				this.validate(input, fieldChecklist);
			}

			// add event listeners to triggerable fields (inputs)
			if (field && input.nodeName === "INPUT") {
				if (input.addEventListener) { // Modern browsers
					this.addHandlers('input', input, fieldChecklist);
				} else if (input.attachEvent) { // IE v. < 8.0
					// Not supported
					console.error('Validator does not support IE v. < 8.0.')
				}
			}

			// add event listeners to triggerable fields (select)
			if (field && input.nodeName === "SELECT") {
				// do initial validation
			}
		}
	} catch (err) {
		console.error(err);
	}
}

/**
 * Add event handlers to validator.
 *
 * @private
 * @param {String} eventType
 * @param {Object} input
 * @param {Object} fieldChecklist
 */

Validator.prototype.addHandlers = function (eventType, input, fieldChecklist) {
	let self = this;
	const inputName = input.getAttribute('name');
	input.addEventListener(eventType, function (e) {
		try {
			fieldChecklist.complete = true;
			self.messenger.clear(inputName);
			fieldChecklist.handlers.forEach(function (handler) {
				if (!self.check(handler, e) && fieldChecklist.complete) {
					self.messenger.message(inputName, handler, 'error');
					fieldChecklist.complete = false;
				}
			});
		} catch (err) {
			e.preventDefault();
			console.log(err);
		}
	});
};

/**
 * Validate single field checklist.
 *
 * @private
 * @param {Object} input
 * @param {Object} checklist
 */

Validator.prototype.validate = function (input, checklist) {
	let self = this;
	const inputName = input.getAttribute('name');
	try {
		checklist.complete = true;
		self.messenger.clear(inputName);
		checklist.handlers.forEach(function (handler) {
			if (!self.check(handler, self.getValue(inputName)) && checklist.complete) {
				self.messenger.message(inputName, handler, 'error');
				checklist.complete = false;
			}
		});
		if (this.checkAll()) {
			this.submit.enableInput();
			this.submit.removeClassname('disabled');
		} else {
			this.submit.disableInput();
			this.submit.addClassname('disabled');
		}
	} catch (err) {
		console.log(err);
	}
}

/**
 * Get value from form input.
 *
 * @private
 * @param {String} inputName
 * @return {String} field value
 */

Validator.prototype.getValue = function(inputName) {
	const field = document.getElementById(inputName);
	return (field.nodeName === 'INPUT') ? field.value :
		(field.nodeName === 'SELECT') ? field.options[field.selectedIndex].text : null;
};

/**
 * Validate selected input (i.e. options dropdown).
 *
 * @private
 * @param {String} value
 * @return {Boolean} validation result
 */

Validator.prototype.isSelected = function (value) {
	return !!value;
}

/**
 * Validate required input.
 *
 * @private
 * @param {String} value
 * @return {Boolean} validation result
 */

Validator.prototype.isRequired = function (value) {
	return !!value;
}

/**
 * Validate email address.
 *
 * @private
 * @param {String} value
 * @return {Boolean} validation result
 */

Validator.prototype.isEmail = function (value) {
	return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+$/.test(value);
}

/**
 * Validate password value. Uses format: Minimum eight and maximum
 * 10 characters, at least one uppercase letter, one lowercase letter,
 * one number and one special character
 *
 * @private
 * @param {String} value
 * @return {Boolean} validation result
 */

Validator.prototype.isPassword = function (value) {
	return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/.test(value);
}

/**
 * Validate that repeat password matches password.
 *
 * @private
 * @param {String} value
 * @return {Boolean} validation result
 */

Validator.prototype.isRepeatPassword = function (value) {
	const password = document.getElementById('password');
	return password.value === value;
}

/**
 * Validate that input object is empty.
 *
 * @private
 * @param {Object} obj
 * @return {Boolean} validation result
 */

Validator.prototype.isEmpty = function (obj) {
	for(var prop in obj) {
		if(obj.hasOwnProperty(prop)) {
			return false;
		}
	}
	return JSON.stringify(obj) === JSON.stringify({});
},
// apply single field validation handler

	/**
	 * Apply validation function to event value.
	 *
	 * @private
	 * @param {Function} check
	 * @param {Event} e
	 * @return {Boolean} validation result
	 *
	 */

	Validator.prototype.check = function (check, e) {
		try {
			const value = (e.target) ? e.target.value : e;
			return this[check](value);
		} catch (err) {
			console.error('Validation for %s:%s failed. \n%s', e, check, err)
		}
		return false;
	}

/**
 * Check whether all validation checklists are completed.
 *
 * @private
 * @return {Boolean} validation result
 */

Validator.prototype.checkAll = function () {
	try {
		for (const field in this.checklist) {
			if (!this.checklist[field].complete) return false;
		}
	} catch (err) {
		console.error('Checklist failed.', err);
	}
	return true;
}


/**
 * Create Validator Messenger object.
 *
 * @private
 */

function ValidatorMessenger() {
	this.messages = {
		success: 'Valid',
		isRequired: {
			success: '',
			error: 'This field is required.'
		},
		isEmail: {
			success: 'OK',
			error: 'Not a valid email address.'
		},
		isPassword: {
			success: 'OK',
			error: 'Passwords must have a minimum eight and maximum 20 characters, at least one uppercase letter,\n' +
				'\t one lowercase letter, one number and one special character'
		},
		isValidForm: {
			success: 'OK',
			error: 'Form not valid.'
		},
		isRepeatPassword: {
			success: 'OK',
			error: 'Passwords do not match.'
		},
		default: {
			success: 'OK',
			error: 'Field is invalid.'
		}
	};
}

/**
 * Initialize Validator Messenger.
 *
 * @private
 * @param {String} inputName
 */

ValidatorMessenger.prototype.init = function (inputName) {
	let parentNode = document.getElementById('label_' + inputName);
	if (parentNode) {
		const msgNode = document.createElement("SPAN");
		msgNode.setAttribute('class', 'validation')
		msgNode.setAttribute('id', 'msg_' + inputName);
		parentNode.appendChild(msgNode);
	}
}

/**
 * Add validation message for input.
 *
 * @private
 * @param {String} inputName
 * @param {Function} check
 * @param {String} className
 */

ValidatorMessenger.prototype.message = function (inputName, check, className) {
	let msgNode = nodeBuilder.wrap('msg_' + inputName);
	if (msgNode.element) {
		msgNode.addClassname(className);
		let msg = this.messages[check][className];
		if (msgNode && msg) {
			msgNode.element.innerHTML = msg;
		}
	}
}

/**
 * Clear validation message.
 *
 * @private
 * @param {String} inputName
 */

ValidatorMessenger.prototype.clear = function (inputName) {
	let msgNode = document.getElementById('msg_' + inputName);
	if (msgNode) msgNode.innerHTML = '';
}

/**
 * Create Validator instance.
 */

const formValidator = new Validator();
