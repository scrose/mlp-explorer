/* *******************************************
*  Event Form Initialization: Bindings
********************************************** */
// Add event listener to submit button
function bindEventForm() {
  var formToCheck = document.getElementById('eventForm');
  var message = document.getElementById('message');
  // Save Draft button
  if (formToCheck.addEventListener){ // Modern browsers
  		formToCheck.addEventListener('submit', function(e) {
        try {
          var isValid = validateEventForm();
          if (!isValid) {e.preventDefault();}
        } catch(err) {
          e.preventDefault();
          message.innerHTML = '<div class="info">An error occurred: ' + err + '</div>';
        }
  	});
  } else if (formToCheck.attachEvent){ // IE v. < 8.0
  		formToCheck.attachEvent('onsubmit', validateEventForm);
  }
  // Reset Button
  if (formToCheck.addEventListener){ // Modern browsers
  		formToCheck.addEventListener('reset', clearValidation);
  } else if (formToCheck.attachEvent){ // IE v. < 8.0
  		formToCheck.attachEvent('onreset', clearValidation);
  }
  // Bind add choice group button to event listener
  var cg_add_btn = document.getElementById('btn_add_choice_group');
  if (cg_add_btn.addEventListener){ // Modern browsers
      cg_add_btn.addEventListener('click', function(e) {addChoiceGroup();});
  } else if (cg_add_btn.attachEvent){ // IE v. < 8.0
      cg_add_btn.attachEvent('onclick', function(e) {addChoiceGroup();})
  }
  // Bind choice group/choice buttons to event listeners
  cg_abs_count = getCGCount();
  for (var i = 1; i <= cg_abs_count; i++) {
      bindChoiceGroup(i);
  }
}
// Initialize form if exists
if (document.getElementById('eventForm')) {bindEventForm();}


// Bind Choice Group buttons to event listeners
function bindChoiceGroup(cg_id) {
  var cg = document.getElementById('choices_' + cg_id);
  // Bind add choices button for choice group
  var choice_add_btn = document.getElementById('btn_add_choices_' + cg_id);
  if (choice_add_btn.addEventListener){ // Modern browsers
      choice_add_btn.addEventListener('click', function(e) {addChoice(cg_id);});
  } else if (ele.attachEvent){ // IE v. < 8.0
      choice_add_btn.attachEvent('onclick', function(e) {addChoice(cg_id);})
  }
  // Bind delete choicee group button
  var del_cg_btn = document.getElementById('btn_del_cg_' + cg_id);
  if (del_cg_btn.addEventListener){ // Modern browsers
      del_cg_btn.addEventListener('click', function(e) {deleteChoiceGroup(cg_id);});
  } else if (ele.attachEvent){ // IE v. < 8.0
      del_cg_btn.attachEvent('onclick', function(e) {deleteChoiceGroup(cg_id);})
  }
  // Iterate & bind choice fieldsets to associated buttons
  cg_choice_abs_count[cg_id] = getChoiceCount(cg_id);
  for (var i = 1; i <= cg_choice_abs_count[cg_id]; i++) {
      bindChoice(cg_id, i);
  }
  enableChoiceDelete(cg_id);
  enableChoiceGroupDelete(cg_id);
}
// Bind delete choice button to event listener
function bindChoice(cg_id, choice_id) {
  // Bind delete choice buttons
  var choice_del_btn = document.getElementById('btn_del_choice_' + cg_id + '_' + choice_id);
  if (choice_del_btn.addEventListener){ // Modern browsers
      choice_del_btn.addEventListener('click', function(e) {deleteChoice(cg_id, choice_id);});
  } else if (ele.attachEvent){ // IE v. < 8.0
      choice_del_btn.attachEvent('onclick', function(e) {deleteChoice(cg_id, choice_id);})
  }
}


/* *******************************************
*  Event Form Choice Group/Choice Methods
********************************************** */
function addChoiceGroup() {
  clearValidation();
  var cg_id = ++cg_abs_count;
  var cgs = document.getElementById('choice_groups');
  var new_cg = buildNode(null, newChoiceGroup(cg_id));
  cgs.appendChild(new_cg);
  var cgset = document.getElementById('choices_' + cg_id);
  var new_choice = buildNode(null, newChoice(cg_id, 1));
  cgset.appendChild(new_choice);
  bindChoiceGroup(cg_id);
  enableChoiceDelete(cg_id);
  enableChoiceGroupDelete(cg_id);
}

function addChoice(cg_id) {
  clearValidation();
  var choice_id = ++cg_choice_abs_count[cg_id]
  var cg = document.getElementById('choices_' + cg_id);
  var new_choice = buildNode(null, newChoice(cg_id, choice_id));
  cg.appendChild(new_choice);
  bindChoice(cg_id, choice_id);
  enableChoiceDelete(cg_id);
}

// Delete Choice (single choice group option)
function deleteChoice(cg_id, choice_id) {
  var remove_node = document.getElementById('choice_' + cg_id + '_' + choice_id);
  remove_node.parentNode.removeChild(remove_node);
  enableChoiceDelete(cg_id);
}

// Delete Choice Group
function deleteChoiceGroup(cg_id) {
  var remove_node = document.getElementById('choice_group_' + cg_id);
  remove_node.parentNode.removeChild(remove_node);
  enableChoiceGroupDelete(cg_id);
}

// Disable/Enable deletion of choices
function enableChoiceDelete(cg_id) {
  // Disable delete of single element
  if (getChoiceCount(cg_id) == 1) {
    var del_choice_btn = document.querySelector('input[id^=\"btn_del_choice_' + cg_id + '\"]');
    del_choice_btn.disabled = true;
  } else {
    var choices= document.getElementById('choices_' + cg_id);
    for (var i = 0; i < choices.elements.length; i++) {
      // Filter for delete choice buttons
      if (choices.elements[i].id.indexOf('btn_del_choice_') !== -1) {
        choices.elements[i].disabled = false;
      }
    }
  }
}
// Disable/Enable deletion of choice groups
function enableChoiceGroupDelete() {
  // Disable delete of single element
  if (getCGCount() == 1) {
    var del_choice_btn = document.querySelector('input[id^=\"btn_del_cg_"]');
    del_choice_btn.disabled = true;
  } else {
    var cgs= document.getElementById('choice_groups');
    for (var i = 0; i < cgs.elements.length; i++) {
      // Filter for delete choice group buttons
      if (cgs.elements[i].id.indexOf('btn_del_cg_') !== -1) {
        cgs.elements[i].disabled = false;
      }
    }
  }
}
// JSON dom tree for Choice Group HTML
function newChoiceGroup(cg_id) {
  let tree =
    {'fieldset' : {
      attributes : {
        class : 'inner',
        id : 'choice_group_' + cg_id,
      },
      children : [
          {'input' : {
              attributes : {
                type : 'hidden',
                name : 'choice_group[' + cg_id + '][choice_group_id]',
                value : 0,
              },
          }},
          {'legend' : {
              attributes : {
                id : 'legend_choice_group_' + cg_id,
              },
              text_node: 'Choice Group ' + cg_id,
          }},
          {'fieldset' : {
            children : [
              {'div' : {
                children : [
                  {'label' : {
                    attributes : {
                      for : 'choice_group_text_' + cg_id,
                    },
                    text_node: 'Ballot Description'
                  }},
                  {'input' : {
                    attributes : {
                      type : 'text',
                      maxlength : 250,
                      placeholder : 'Enter title or description.',
                      id : 'choice_group_text_' + cg_id,
                      name : 'choice_group[' + cg_id + '][choice_group_text]',
                      value : '',
                    },
                  }},
                ]
              }},
              {'div' : {
                children : [
                  {'label' : {
                    attributes : {
                      for : 'voting_form_instructions' + cg_id,
                    },
                    text_node: 'Maximum Number of Votes'
                  }},
                  {'input' : {
                    attributes : {
                      type : 'number',
                      min : 1,
                      max : 30,
                      id : 'max_votes_in_group_' + cg_id,
                      name : 'choice_group[' + cg_id + '][max_votes_in_group]',
                      value : 1,
                    }
                  }}
                ]
              }}
            ]
          }},
          {'fieldset' : {
            attributes : {
              id : 'choices_' + cg_id,
            },
            children : [
              {'legend' : {
                text_node : 'Ballot Choices',
              }}
            ]
          }},
          {'div' : {
            attributes : {
              style : 'clear:both',
            },
          }},
          {'input' : {
            attributes : {
              type : 'button',
              id : 'btn_add_choices_' + cg_id,
              name : 'btn_add_choices_' + cg_id,
              value : 'Add Ballot Choice',
            }
          }},
          {'input' : {
            attributes : {
              type : 'button',
              id : 'btn_del_cg_' + cg_id,
              name : 'btn_del_cg_' + cg_id,
              value : 'Delete Choice Group',
            },
          }}
        ]
      }};
  return tree;
}

// JSON dom tree for Choice Group HTML
function newChoice(cg_id, choice_id) {
  return {
    'fieldset' : {
      attributes : {
        class : 'inner',
        id : 'choice_' + cg_id + '_' + choice_id,
      },
      children : [
        {input : {
          attributes : {
            type : 'hidden',
            name : 'choice_group[' + cg_id + '][choices][' + choice_id + '][choice_id]',
            value : 0,
          },
        }},
        {label : {
          attributes : {
            for : 'choice_text_' + cg_id + '_' + choice_id,
          },
          text_node: 'Option ' + choice_id,
        }},
        {input : {
          attributes : {
            type : 'text',
            maxlength : 125,
            placeholder : 'Enter choice text [up to 125 characters]',
            id : 'choice_text_' + cg_id + '_' + choice_id,
            name : 'choice_group[' + cg_id + '][choices][' + choice_id + '][choice_text]',
            value : '',
          }
        }},
        {input : {
          attributes : {
            type : 'button',
            id : 'btn_del_choice_' + cg_id + '_' + choice_id,
            name : 'btn_del_choice_' + cg_id + '_' + choice_id,
            value : 'Delete',
          },
        }}
      ]
    }};
}

// Build node using JSON object as DOM tree
function buildNode(node, tree) {
  for (var n in tree) {
    var new_node = null;
    if (node == null) {
      node = buildNode(document.createElement(n), tree[n]);
    } else if (n == 'attributes') {
        for (var att in tree[n]) {
          // console.log('Attribute: ' + att + ':' + tree[n][att]);
          node.setAttribute(att, tree[n][att]);
        }
    } else if (n == 'text_node') {
        // console.log('text node: ' + tree[n]);
        new_node = document.createTextNode(tree[n]);
        node.appendChild(new_node);
    } else if (n == 'children') {
       for (var i = 0; i < tree[n].length; i++) {
         // console.log('child node: ' + tree[n][i]);
         new_node = buildNode(null, tree[n][i]);
         node.appendChild(new_node);
       }
    } else {
        new_node = buildNode(document.createElement(n), tree[n]);
        node.appendChild(new_node);
    }
  }
  return node;
}


/* *******************************************
*  Event Form Validation
********************************************** */
function validateEventForm() {
	var formToCheck = document.getElementById('eventForm');
	var isValid = true;
	var valueToCheck = null;
	var maxVotesOnForm = 0;
	var startDate = null;

	clearValidation(formToCheck);
	// Iterate form elements
	for (var i = 0; i < formToCheck.elements.length; i++) {
		var el = formToCheck[i];
		// Check for empty required inputs
		if ((el.type !== 'fieldset') && (el.id) && (el.value === null || el.value.length === 0)) {
			showValidation(el.id, index=i);
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
