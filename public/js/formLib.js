/* *******************************************
*  Form Initialization: Vars
********************************************** */
var cg_abs_count = 0;
var cg_choice_abs_count = {};
var reDateFormat = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
var reNetlinkID = /^[a-z0-9]+$/;
var reVotingInstructions = /<(?!\/?(b|strong|em|u|br)(?=>|\s.*>))\/?.*?>/g;
var validation = {};
validation['dept_id'] = 'Choose a sponsor department';
validation['event_title'] = 'Provide an event title';
validation['vote_start'] = 'Provide a vote start date and time';
validation['vote_end'] = 'Provide a vote end date and time';
validation['voting_form_instructions'] = 'Provide instructions for voters.';
validation['max_votes_on_form'] = 'Enter the maximum total votes for the ballot.';
validation['max_votes_in_group'] = 'Enter the maximum number of votes for this choice group.';
validation['choice_text'] = 'Provide a description of the ballot choice.';
validation['choice_group_text'] = 'Provide at least one ballot choice group.';
validation['elector_netlinks_raw'] = 'Enter the eligible voters (single Netlink ID per line).';
validation['message'] = 'The event could not be saved because of missing information or errors. \
Please review and correct the fields highlighted in red below before submitting again.';
validation['default'] = 'This field is required.';

/* *******************************************
*  General Form Choice Group/Choice Methods
********************************************** */
// Get current choice group count
function getCGCount() {
  var choiceGroups = document.getElementById('choice_groups');
  var cg_count = 0;
  for (var i = 0; i < choiceGroups.elements.length; i++) {
    // Filter for choice groups
    if (choiceGroups.elements[i].type == 'fieldset'
        && choiceGroups.elements[i].id.indexOf('choice_group') !== -1) {
      cg_count++;
    }
  }
  return cg_count;
}
// Get current choices count for given choice group ID
function getChoiceCount(cg_id) {
  var choices= document.getElementById('choices_' + cg_id);
  var choice_count = 0;
  for (var i = 0; i < choices.elements.length; i++) {
    // Filter for choice fieldsets
    if (choices.elements[i].type == 'fieldset' && choices.elements[i].id.indexOf('choice_') !== -1) {
      choice_count++;
    }
  }
  return choice_count;
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
  var formToCheck = document.getElementById('eventForm');
	// Remove validation messages
	for (var i = 0; i < formToCheck.elements.length; i++) {
		if (document.getElementById('alert_' + i)) {
      var msg = document.getElementById('alert_' + i);
			msg.parentNode.removeChild(msg);
		}
	}
  // Clear top message box
  document.getElementById('message').innerHTML = '';
}
