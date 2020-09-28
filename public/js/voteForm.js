/* *******************************************
*  Form Initialization: Vars
*  NOTE: inherits functions from eventForm.js
********************************************** */

validation['empty'] = 'You must select at least one choice to submit the form.';
validation['empty_not_spoiled'] = 'You must either select at least one choice or check the \'spoil ballot\' checkbox.';
validation['vote_failed'] = 'Your ballot could not be submitted because of errors or omissions. Please review \
 the following notifications before re-submitting your vote.';

/* *******************************************
*  Form Initialization: Bindings
********************************************** */
// Add event listener to submit button
function bindVoteForm() {
  var formToCheck = document.getElementById('voteForm');
  var message = document.getElementById('message');
  // Save Draft button
  if (formToCheck.addEventListener){ // Modern browsers
  		formToCheck.addEventListener('submit', function(e) {
        try {
          var isValid = validateVoteForm();
          if (!isValid) {e.preventDefault();}
        } catch(err) {
          e.preventDefault();
          message.innerHTML = '<div class="alert">An error occurred: ' + err + '</div>';
        }
  	});
  } else if (formToCheck.attachEvent){ // IE v. < 8.0
  		formToCheck.attachEvent('onsubmit', validateEventForm);
  }
  // Bind spoiled ballot checkbox (if exists)
  var spoiledBallot = document.getElementById('is_spoiled');
  if (spoiledBallot !== null) {
    if (spoiledBallot.addEventListener){ // Modern browsers
        spoiledBallot.addEventListener('click', function(e) {spoilToggle(e);});
    } else if (spoiledBallot.attachEvent){ // IE v. < 8.0
        spoiledBallot.attachEvent('onclick', function(e) {spoilToggle(e);})
    }
  }
  // Bind choice checkboxes to event listeners
  var choices = getBallotChoices();
  for (var i = 0; i < choices.length; i++) {
    if (choices[i].addEventListener){ // Modern browsers
        choices[i].addEventListener('click', function(e) {validateChoice(e);});
    } else if (choices[i].attachEvent){ // IE v. < 8.0
        choices[i].attachEvent('onclick', function(e) {validateChoice(e);})
    }
  }
}
// Initialize form if exists
if (document.getElementById('voteForm')) {bindVoteForm();}


/* *******************************************
*  Form Validation
********************************************** */

// Validate checkbox selection
function validateChoice(e) {
  spoilToggle(e);
  clearVoteValidation();
  var isValid = false;
  var choiceID = e.target.id;
  var cgIndex = choiceID.match(/(\d+)/)[1];
  var cgID = 'choices_' + cgIndex;
  var cgTitle = document.getElementById('legend_choice_group_' + cgIndex).textContent;
  var maxVotesOnForm = document.getElementById('max_votes_on_form').value;
  var votesOnForm = getFormVoteCount();
  var maxVotesInChoiceGroup = getMaxVotesInGroup(cgIndex);
  var votesInChoiceGroup = getChoiceGroupVoteCount(cgID);

  // Check if total number of votes cast > maximum
  if (votesInChoiceGroup > maxVotesInChoiceGroup) {
    var msg = "You have selected " + parseInt(votesInChoiceGroup - 1) + " choice(s) in the '" + cgTitle + "' section. ";
    msg += "The maximum allowable in that section is " + maxVotesInChoiceGroup;
    showValidation(choiceID, 0, msg);
  } else if (votesOnForm > maxVotesOnForm) {
    showValidation(choiceID, 0, "You have selected a total of " + parseInt(votesOnForm - 1) + " choice(s). The maximum allowable total is " + maxVotesOnForm + ".\n");
  } else {
    isValid = true;
  }
  if (!isValid) {
    e.preventDefault();
    e.stopPropagation();
  }
  return isValid;
}


/*
invoked by "spoil ballot" checkbox to unselect all other checkboxes on the ballot
so that voter cannot have both a candidate/choice selected and the Spoil option selected
*/
function spoilToggle(e) {
  clearVoteValidation();
  // Ensure spoiled ballot is available
  if (document.getElementById('is_spoiled') !== null) {
    if (e.target.id == 'is_spoiled') {
      var choices = getBallotChoices();
      for (var i = 0; i < choices.length; i++) {
        choices[i].checked = false;
      }
    } else {
      var spoiledBallot = document.getElementById('is_spoiled');
      spoiledBallot.checked = false;
    }
  }
}

  /*
  invoked by submit button on ballot (vote.php)
  */
  function validateVoteForm() {
    var formToCheck = document.getElementById('voteForm');
    var isEmpty = true;
    var isValid = false;
    var hasSpoilCheckbox = document.getElementById('is_spoiled') ? true : false;
    var isSpoiled = hasSpoilCheckbox ? document.getElementById('is_spoiled').checked : false;

    clearVoteValidation();
    // Check if ballot empty but not spoiled
    var choices = getBallotChoices();
    for (var i = 0; i < choices.length; i++) {
      if (choices[i].checked) {isEmpty = false;}
    }
    // Empty with unchecked spoiled ballot
    if (isEmpty && hasSpoilCheckbox && !isSpoiled) {
      showValidation('message', 0, validation['empty_not_spoiled'], parent=false);
    // Empty without spoiled ballot checkbox
    } else if (isEmpty && !hasSpoilCheckbox) {
      showValidation('message', 1, validation['empty'], parent=false);
    } else {
      isValid = true;
    }
    // Show top validation result
    if (!isValid) {
        showValidation('message', 2, parent=false)
    }
    return isValid;
  }

  // Clear validation messages
  function clearVoteValidation() {
    var formToCheck = document.getElementById('voteForm');
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

  /* *******************************************
  *  Utility Functions
  ********************************************** */

  // Returns array of choice elements
  function getBallotChoices() {
    var choices = [];
    var choiceGroups = document.getElementById('choice_groups');
    for (var i = 0; i < choiceGroups.elements.length; i++) {
      // Filter for choice groups
      if (choiceGroups.elements[i].type == 'fieldset' && choiceGroups.elements[i].id.indexOf('choice_group') !== -1) {
        var cg = choiceGroups.elements[i];
        for (var j = 0; j < cg.elements.length; j++) {
          // Filter for choices
          if (cg.elements[j].type == 'checkbox' && cg.elements[j].id.indexOf('choice_count_') !== -1) {
            choices.push(cg.elements[j]);
          }
        }
      }
    }
    return choices;
  }

  // Returns array of maximum votes per group
  function getMaxVotesInGroup(cgIndex) {
    var maxVotes = document.getElementById('max_votes_in_group_' + cgIndex);
    return maxVotes !== null ?  maxVotes.value : 0;
  }

  // Returns total number of current votes in choice group
  function getChoiceGroupVoteCount(cgID) {
    var voteCount = 0;
    var cg = document.getElementById(cgID);
    for (var i = 0; i < cg.elements.length; i++) {
      if (cg.elements[i].type == 'checkbox' && cg.elements[i].checked === true) {
        voteCount++;
      }
    }
    return voteCount;
  }

  // Returns total number of current votes on form
  function getFormVoteCount() {
    var voteCount = 0;
    var choices = getBallotChoices();
    for (var i = 0; i < choices.length; i++) {
      if (choices[i].type == 'checkbox' && choices[i].checked === true) {
        voteCount++;
      }
    }
    return voteCount;
  }
