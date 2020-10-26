/*
  ======================================================
  Mountain Legacy Project: Explorer Application
  ------------------------------------------------------
  Module:       Core.UI.Editor.Forms
  File:         public/js/build.js
  ------------------------------------------------------
  Dynamically renders HTML elements from JSON schema.
  ------------------------------------------------------
  Creator:      Spencer Rose
  Copyright:    (c) 2020 Runtime Software Development Inc.
  License:      MIT
  Version:      1.0
  Last Updated: October 28, 2020
  ======================================================
*/


/*
  ------------------------------------------------------
  DOM builder from schema
  ------------------------------------------------------
*/
// main form/inputs validation
function createNodeBuilder() {
	return {
		// Extend functionality of node methods
		extend: function (id) {
			return {
				element: document.getElementById(id),
				addClassname: function (className) {
					let classNameArray = this.element.className.trim().split(' ');
					if (classNameArray.indexOf(className) === -1) {
						this.element.className += ' ' + className;
						this.element.className.trim();
					}
					return this;
				},
				removeClassname: function (className) {
					const node = this;
					let classNameArray = this.element.className.trim().split(' ');
					node.element.className = '';
					classNameArray.forEach(function (classNameItem) {
						if (classNameItem !== className) node.element.className += classNameItem + ' ';
						node.element.className.trim();
					});
					return this;
				},
				addTextNode: function (txt) {
					const textNode = document.createTextNode(txt);
					this.element.appendChild(textNode);
					return this;
				},
				addNode(node) {
					this.element.appendChild(node);
					return this;
				},
				setNodeAttribute(name, value) {
					this.element.setAttribute(name, value);
					return this;
				},
				enableInput() {
					this.element.disabled = false;
					return this;
				},
				disableInput() {
					this.element.disabled = true;
					return this;
				}
			}
		},
		// Recursively build html nodes using JSON object as DOM tree
		build: function(containerID, schema) {
			const formContainer = document.getElementById(containerID);
			try {
				this._build_(formContainer, schema);
			} catch (e) {
				console.log('Node build failed.')
			}

		},
		// [Helper] Recursively build html nodes using JSON object as DOM nodeSchema
		_build_: function (parentNode, nodeSchema) {
			if (!nodeSchema) {
				console.log('DOM schema is empty.');
				return document.createElement('span');
			}
			for (let prop in nodeSchema) {
				let node = Array.isArray(nodeSchema) ? nodeSchema : nodeSchema[prop];
				console.log(Object.entries(nodeSchema).flat());
				// empty node
				if (node == null || parseInt(prop) === 0) {
					console.log('Node is empty.')
					return parentNode;
				}
				// set node attributes
				if (prop === 'attributes') {
					// add node attributes
					for (const att in node) {
						console.log(' - Add attribute %s value %s to ', att, node[att], parentNode.nodeName);
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
						const builder = this;
						node.forEach((childNode) => {
							parentNode.appendChild(builder._build_(null, childNode))
						});
						continue;
					} else if (prop === 'textNode') {
						// build text node
						console.log('Text node: ' + node);
						newNode = document.createTextNode(node);
					} else {
						// default build node
						console.log('Build: %s', prop);
						newNode = this._build_(document.createElement(prop), node);
					}
					// add node to parent node (if provided)
					if (newNode && parentNode) parentNode.appendChild(newNode);
					else parentNode = newNode;
				}
			}
			return parentNode;
		}
	}
}

const nodeBuilder = createNodeBuilder();
