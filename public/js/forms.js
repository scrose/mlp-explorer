/*
  ======================================================
  Mountain Legacy Project: Explorer Application
  ------------------------------------------------------
  Module:       Core.UI.Editor.Form.Validation
  File:         public/js/forms.js
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

const validationMessages = {
	success: 'Valid',
	Email: {
		success: 'OK',
		error: 'Not a valid email address.'
	},
	isPassword: {
		success: 'OK',
		error: 'Minimum eight and maximum 10 characters, at least one uppercase letter,\n' +
			'\t// one lowercase letter, one number and one special character'
	}
}

const fieldValidators = {
	isEmpty: function(data) {
		console.log('if empty.');
	},
	// format: user@example.com
	isEmail: function(email) {
		return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:[.][a-zA-Z0-9-]+)*$/.test(email);
	},
	// format: Minimum eight and maximum 10 characters, at least one uppercase letter,
	// one lowercase letter, one number and one special character
	isPassword: function(password) {
		return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,10}$/.test(password);
	}
}

const formValidator = {
	attachHandlers: function (params) {
		const validator = this;
		const inputs = document.getElementById(params.id).elements;
		if (!inputs) return;
		// Iterate over the form controls
		for (var i = 0; i < inputs.length; i++) {
			const inputName = inputs[i].getAttribute('name') || null;
			// initialize element in DOM
			validator.init(inputName);
			if (inputName && inputs[i].nodeName === "INPUT") {
				if (inputs[i].addEventListener) { // Modern browsers
					const validators = params.fields[inputName] || null;
					if (validators) {
						inputs[i].addEventListener('input', function (e) {
							try {
								validators.forEach(
									function (check) {
										if (validator.apply(check, e)) validator.message(inputName, check, 'success');
										}
									);
							} catch (err) {
								e.preventDefault();
								console.log(err);
							}
						});
						inputs[i].addEventListener('change', function (e) {
							try {
								validators.forEach(
									function (check) {
										if (!validator.apply(check, e)) {
											validator.message(inputName, check, 'error');
										}
									}
								);
							} catch (err) {
								e.preventDefault();
								console.log(err);
							}
						});

					}
				} else if (inputs[i].attachEvent) { // IE v. < 8.0
					inputs[i].attachEvent('onsubmit', validateEventForm);
				}
			}
		}
	},
	// apply field validation
	apply: function (check, e) {
		return fieldValidators[check](e.target.value);
	},
	// initialize field validation message container
	init: function (inputName) {
		let parentNode = document.getElementById('label_' + inputName);
		if (parentNode) {
			const msgNode = document.createElement("SPAN");
			msgNode.setAttribute('class', 'validation')
			msgNode.setAttribute('id', 'msg_' + inputName);
			parentNode.appendChild(msgNode);
			console.log('added')
		}
	},
	message: function (inputName, check, validationType) {
		let msgNode = nodeUtils('msg_' + inputName).addClassname(validationType);
		console.log(msgNode)
		let msg = validationMessages[check];
		if (msgNode && msg) {
			const textNode = document.createTextNode(msg);
			msgNode.element.appendChild(textNode);
		}
	}
}

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