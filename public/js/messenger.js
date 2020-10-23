/*
  ======================================================
  Mountain Legacy Project: Explorer Application
  ------------------------------------------------------
  Module:       Core.UI.Editor.Forms
  File:         public/js/validator.js
  ------------------------------------------------------
  Dynamically renders forms from JSON schema.
  ------------------------------------------------------
  Creator:      Spencer Rose
  Copyright:    (c) 2020 Runtime Software Development Inc.
  License:      MIT
  Version:      1.0
  Last Updated: October 7, 2020
  ======================================================
*/


/*
  ------------------------------------------------------
  Extension wrapper for DOM node
  ------------------------------------------------------
*/
// main form/inputs validation
function createMessenger(containerID) {
	return {
		builder: createNodeBuilder(),
		node: this.builder.extend(containerID),
		// Extend functionality of node methods
		create: function (msg) {
			this.builder.build(containerID, msg)
			this.container.appendChild;
		}
	}
}
