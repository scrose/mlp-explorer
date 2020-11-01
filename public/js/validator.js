/*
  ======================================================
  Mountain Legacy Project: Explorer Application
  ------------------------------------------------------
  Module:       Core.UI.Editor.Form.Validation
  File:         public/js/validator.js
  ------------------------------------------------------
  Dynamically renders forms from JSON schema.
  ------------------------------------------------------
  Creator:      Spencer Rose
  Copyright:    (c) 2020 Runtime Software Development Inc.
  License:      MIT
  Version:      1.0
  Last Updated: October 18, 2020
  ======================================================
*/

/*
  ------------------------------------------------------
  Form Validator
  ------------------------------------------------------
*/

// field validation messages
function createFormValidatorMessenger() {
	return {
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
			error: 'Passwords must have a minimum eight and maximum 10 characters, at least one uppercase letter,\n' +
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
		},
		// initialize field validation message container
		init: function (inputName) {
			let parentNode = document.getElementById('label_' + inputName);
			if (parentNode) {
				const msgNode = document.createElement("SPAN");
				msgNode.setAttribute('class', 'validation')
				msgNode.setAttribute('id', 'msg_' + inputName);
				parentNode.appendChild(msgNode);
			}
		},
		// add validation message to input
		message: function (inputName, check, response) {
			let msgNode = nodeBuilder.extend('msg_' + inputName);
			if (msgNode.element) {
				msgNode.addClassname(response);
				let msg = this[check][response];
				if (msgNode && msg) {
					msgNode.element.innerHTML = msg;
				}
			}
		},
		// add validation message to input
		clear: function (inputName) {
			let msgNode = document.getElementById('msg_' + inputName);
			if (msgNode) msgNode.innerHTML = '';
		}
	}
}

// main form/inputs validation
function createFormValidator() {
	return {
		checklist: {},
		form: {},
		submit: {},
		messenger: createFormValidatorMessenger(),
		// initialize event listeners for form inputs
		init: function (params) {
			this.form = document.getElementById(params.id);
			// abort if form is empty
			if (!this.form.elements) return;
			// validation checklist (abort validation if empty)
			if (this.isEmpty(params.checklist)) return;

			this.checklist = params.checklist;
			// disable submit button until form is valid
			this.submit = nodeBuilder.extend('submit_' + params.id).addClassname('disabled').disableInput();

			// add form listener
			const validator = this;
			this.form.addEventListener('input', function (e) {
				if (validator.checkAll()) {
					validator.submit.enableInput();
					validator.submit.removeClassname('disabled');
				} else {
					validator.submit.disableInput();
					validator.submit.addClassname('disabled');
				}
			});

			// add listeners for each form input in checklist
			for (const field in this.checklist) {
				const input = document.getElementById(field);
				// only proceed with existing inputs
				if (!input) continue;
				const fieldChecklist = this.checklist[field];
				// initialize validation messenger
				this.messenger.init(field);

				// validate fields with preset values
				if ( this.getValue(field) ) {
					this.validate(input, fieldChecklist);
				}

				// add event listeners to triggerable fields (inputs)
				if (field && input.nodeName === "INPUT") {
					if (input.addEventListener) { // Modern browsers
						this.addHandlers('input', input, fieldChecklist);
					} else if (input.attachEvent) { // IE v. < 8.0
						// this.inputs[i].attachEvent('onsubmit', validateEventForm);
					}
				}
				// add event listeners to triggerable fields (select)
				if (field && input.nodeName === "SELECT") {
					// do initial validation
				}
			}
		},
		validate: function (input, fieldChecklist) {
			let validator = this;
			const inputName = input.getAttribute('name');
			try {
				fieldChecklist.complete = true;
				validator.messenger.clear(inputName);
				fieldChecklist.handlers.forEach(function (handler) {
					if (!validator.check(handler, validator.getValue(inputName)) && fieldChecklist.complete) {
							validator.messenger.message(inputName, handler, 'error');
							fieldChecklist.complete = false;
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
		},
		addHandlers: function (eventType, input, fieldChecklist) {
			let validator = this;
			const inputName = input.getAttribute('name');
			input.addEventListener(eventType, function (e) {
				try {
					fieldChecklist.complete = true;
					validator.messenger.clear(inputName);
					fieldChecklist.handlers.forEach(function (handler) {
						if (!validator.check(handler, e) && fieldChecklist.complete) {
							validator.messenger.message(inputName, handler, 'error');
							fieldChecklist.complete = false;
						}
					});
				} catch (err) {
					e.preventDefault();
					console.log(err);
				}
			});
		},
		getValue: function(inputName) {
			const field = document.getElementById(inputName);
			return (field.nodeName === 'INPUT') ? field.value :
				(field.nodeName === 'SELECT') ? field.options[field.selectedIndex].text : null;
		},
		isSelected: function (value) {
			return !!value;
		},
		isRequired: function (value) {
			return !!value;
		},
		// format: user@example.com
		isEmail: function (value) {
			return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+$/.test(value);
		},
		// format: Minimum eight and maximum 10 characters, at least one uppercase letter,
		// one lowercase letter, one number and one special character
		isPassword: function (value) {
			return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,10}$/.test(value);
		},
		// format: Minimum eight and maximum 10 characters, at least one uppercase letter,
		// one lowercase letter, one number and one special character
		isRepeatPassword: function (value) {
			const password = document.getElementById('password');
			return password.value === value;
		},
		isEmpty: function (obj) {
			for(var prop in obj) {
				if(obj.hasOwnProperty(prop)) {
					return false;
				}
			}
			return JSON.stringify(obj) === JSON.stringify({});
		},
		// apply single field validation handler
		check: function (check, e) {
			try {
				const value = (e.target) ? e.target.value : e;
				return this[check](value);
			} catch (err) {
				console.log(e, check, err)
			}
		},
		// check all validation checklists are completed for the form
		checkAll: function () {
			console.log(this.checklist)
			for (const field in this.checklist) {
				console.log(field, this.checklist[field].complete)
				if (!this.checklist[field].complete) return false;
			}
			return true;
		}
	}
}
// create validator object
const formValidator = createFormValidator();












/*
  ------------------------------------------------------
  Form Data Validation
  ------------------------------------------------------
*/


// apply validation
function validate(formID) {
	let f = document.getElementById(formID);
	var isValid = true;
	var valueToCheck = null;
	var maxVotesOnForm = 0;
	var startDate = null;

	clearValidation(f);

	// Iterate form elements
	for (const el in f.elements) {
		// Check for empty required inputs
		if ((el.type !== 'fieldset') && (el.id) && (el.value === null || el.value.length === 0)) {
			// showValidation(el.id, index=i);
			isValid = false;
		}
		else {
			// Validate other input parameters
			switch (el.id) {
				case 'vote_start':
	  			if (!(reDateFormat.test(el.value))) {
						showValidation(el.id, i, 'Correct syntax (yyyy-mm-dd hh:mm:ss) for vote start');
						isValid = false;
					} else {
						startDate = el.value;
					}
	  			break;
				case 'vote_end':
					if (!(reDateFormat.test(el.value))) {
						showValidation('vote_end', i, 'Correct syntax (yyyy-mm-dd hh:mm:ss) for vote end');
						isValid = false;
					} else if (el.value <= startDate) {
						showValidation(el.id, i, 'The vote start date/time must happen before the vote end date/time.');
						isValid = false;
					}
					break;
				case 'voting_form_instructions':
					// strip HTML tags
					el.value = el.value.replace(reVotingInstructions,'');
					break;
				case 'max_votes_on_form':
					maxVotesOnForm = valueToCheck;
					break;
				case 'max_votes_in_group':
					if (valueToCheck > maxVotesOnForm) {
						showValidation(el.id, i, 'The max votes on ballot must be less than the total max votes in choice groups.');
						isValid = false;
					}
					break;
				case 'electors':
          invalidID = validateNetlinkIDs(el.value);
					if (invalidID) {
            showValidation(el.id, i, msg='Invalid or duplicate Netlink ID: Review voter ID ' + invalidID);
            isValid = false;
          };
					break;
			}
		}
	}
	// Show top validation result
	if (!isValid) {
			showValidation('message', 0, parent=false);
	}
	return isValid;
}

// Validate Netlink IDs
function validateNetlinkIDs(netlinkIDs) {
	var ids = netlinkIDs.split('\n');
  var uniqueIDs = [];
	for (var i=0; i<ids.length; i++) {
    // Check for valid Netlink ID
		if ((ids[i].length < 2 || ids[i].length > 20)||(!reNetlinkID.test(ids[i]))) {
			return ids[i];
		}
    // Check for duplicates (return duplicate ID)
    if(uniqueIDs[ids[i]] === undefined) {
        uniqueIDs[ids[i]] = 1;
    } else {
        return ids[i];
    }
	}
	return null;
}


// Show form validation message
function showValidation(id, index, msgOption='', parent=true) {
	// Extract ID stem as hash index of validation message
	var key = id.replace(/([_]\d+)?([_]\d+)/,'');
	// Select appropriate message
	var message = validation[key] ?  validation[key] : validation['default'];
	message = msgOption.length > 0 ? document.createTextNode(msgOption) : document.createTextNode(message);
	// Create new message element
	var el = document.createElement('div');
	el.appendChild(message);
	var validation_class = id == 'message' ? 'alert' : 'validation';
	el.setAttribute('class', validation_class);
	el.setAttribute('id', 'alert_' + index);
	// Append as sibling or child element to input field
	if (parent === true) {document.getElementById(id).parentNode.insertBefore(el, document.getElementById(id));}
	else {document.getElementById(id).appendChild(el);}
	if (id == 'message') {document.getElementById('top').scrollIntoView(true);}
}

// Clear validation messages
function clearValidation() {
	var f = document.getElementById('eventForm');
	// Remove validation messages
	for (var i = 0; i < f.elements.length; i++) {
		if (document.getElementById('alert_' + i)) {
			var msg = document.getElementById('alert_' + i);
			msg.parentNode.removeChild(msg);
		}
	}
	// Clear top message box
	document.getElementById('message').innerHTML = '';
}