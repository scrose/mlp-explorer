/*
  ======================================================
  Mountain Legacy Project: Explorer Application
  ------------------------------------------------------
  Module:       Core.UI.Editor.Forms
  File:         public/js/forms.js
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


// Recursively build HTML5 using JSON object as DOM tree
function buildNode(parentNode, tree) {
	if (!tree) {
		console.log('DOM tree is empty.');
		return document.createElement('span');
	}
	for (let prop in tree) {
		let node = Array.isArray(tree) ? tree : tree[prop];
		console.log(Object.entries(tree).flat());
		// empty node
		if (node == null || parseInt(prop) === 0) {
			console.log('Node is empty.')
			return parentNode;
		}


		if (prop === 'attributes') {
			// add node attributes
			for (const att in node) {
				console.log(' - Add attribute: %s[%s] to %s', att, prop, node[att]);
				parentNode.setAttribute(att, node[att]);
			}
		} else {
			// create new node(s)
			let newNode = null;
			if (prop === 'childNodes') {
				if (!Array.isArray(node)) {
					console.log('ChildNodes must be an array.');
					return parentNode;
				}
				// build and append child nodes
				// console.log('Processing child nodes of %s: ', node);
				node.forEach((childNode) => {
					parentNode.appendChild(buildNode(null, childNode))
				});
				continue;
			} else if (prop === 'textNode') {
				// build text node
				console.log('Text node: ' + node);
				newNode = document.createTextNode(node);
			} else {
				// default build node
				console.log('Build: %s', prop);
				newNode = buildNode(document.createElement(prop), node);
			}
			// add node to parent node (if provided)
			if (newNode && parentNode) parentNode.appendChild(newNode);
			else parentNode = newNode;
		}
	}
	return parentNode;
}
