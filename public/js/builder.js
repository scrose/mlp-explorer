/*!
 * MLP.UI.Editor.Builder
 * File: /public/js/builders.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

/**
 * Create Node Builder object.
 *
 * @public
 */

function Builder() {}

/**
 * Wraps element in Node Wrapper.
 *
 * @public
 * @param {String} id
 * @return {NodeWrapper} wrapped element
 */

Builder.prototype.wrap = function(id) {
	return new NodeWrapper(id);
}

/**
 * Recursively builds html nodes using JSON object as DOM tree.
 *
 * @public
 * @param {String} id
 * @param {Object} schema
 */

Builder.prototype.build = function(id, schema) {
	const container = document.getElementById(id);
	try {
		this._build_(container, schema);
	} catch (e) {
		console.error('Node build failed.')
	}

}

/**
 * [Helper] Recursively build html nodes using JSON object as DOM schema
 *
 * @private
 * @param {Element} parent
 * @param {Object} schema
 * @param {Boolean} debug
 */

Builder.prototype._build_ = function (parent, schema, debug=false) {
	if (!schema) {
		if (debug) console.log('DOM schema is empty.');
		return document.createElement('span');
	}
	for (let prop in schema) {
		let node = Array.isArray(schema) ? schema : schema[prop];
		if (debug) console.log(Object.entries(schema).flat());
		// empty node
		if (node == null || parseInt(prop) === 0) {
			console.log('Node is empty.')
			return parent;
		}
		// set node attributes
		if (prop === 'attributes') {
			// add node attributes
			for (const att in node) {
				if (debug) console.log(' - Add attribute %s value %s to ', att, node[att], parent.nodeName);
				parent.setAttribute(att, node[att]);
			}
		} else {
			// create new node(s)
			let newNode = null;
			if (prop === 'childNodes') {
				if (!Array.isArray(node)) {
					if (debug) console.log('ChildNodes must be an array.');
					return parent;
				}
				// build and append child nodes
				const builder = this;
				node.forEach((childNode) => {
					parent.appendChild(builder._build_(null, childNode))
				});
				continue;
			} else if (prop === 'textNode') {
				// build text node
				if (debug) console.log('Text node: ' + node);
				newNode = document.createTextNode(node);
			} else {
				// default build node
				if (debug) console.log('Build: %s', prop);
				newNode = this._build_(document.createElement(prop), node);
			}
			// add node to parent node (if provided)
			if (newNode && parent) parent.appendChild(newNode);
			else parent = newNode;
		}
	}
	return parent;
}

/**
 * Create Node Wrapper object. Extends functionality of DOM JS methods.
 *
 * @public
 * @param {String} id
 */

function NodeWrapper(id) {
	this.element = document.getElementById('fs');
	if (!this.element) console.error('Element ID %s not found.', id);
}

/**
 * Add classname to element classes.
 *
 * @public
 * @param {String} className
 */

NodeWrapper.prototype.addClassname = function (className) {
	let classNameArray = this.element.className.trim().split(' ');
	if (classNameArray.indexOf(className) === -1) {
		this.element.className += ' ' + className;
		this.element.className.trim();
	}
	return this;
}

/**
 * Remove classname from element classes.
 *
 * @public
 * @param {String} className
 */

NodeWrapper.prototype.removeClassname = function (className) {
	const self = this;
	let classNameArray = this.element.className.trim().split(' ');
	self.element.className = '';
	classNameArray.forEach(function (classNameItem) {
		if (classNameItem !== className) self.element.className += classNameItem + ' ';
		self.element.className.trim();
	});
	return this;
}

/**
 * Add text node to element classes.
 *
 * @public
 * @param {String} txt
 */

NodeWrapper.prototype.addTextNode = function (txt) {
	const textNode = document.createTextNode(txt);
	this.element.appendChild(textNode);
	return this;
}

/**
 * Add child node to element.
 *
 * @public
 * @param {Element} node
 */

NodeWrapper.prototype.addNode = function (node) {
	this.element.appendChild(node);
	return this;
}

/**
 * Set attribute of element.
 *
 * @public
 * @param {String} name
 * @param {String} value
 */

NodeWrapper.prototype.setNodeAttribute = function (name, value) {
	this.element.setAttribute(name, value);
	return this;
}

/**
 * Enable input element.
 *
 * @public
 */

NodeWrapper.prototype.enableInput = function() {
	this.element.disabled = false;
	return this;
}

/**
 * Disable input element.
 *
 * @public
 */

NodeWrapper.prototype.disableInput = function() {
	this.element.disabled = true;
	return this;
}

/**
 * Create Node Builder instance.
 */

const nodeBuilder = new Builder();
