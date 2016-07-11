import {
	assign,
	toLower,
	splice,
	findWhere,
	setImmediate,
	createAttributeFilter
} from './util';

/*
const NODE_TYPES = {
	ELEMENT_NODE: 1,
	ATTRIBUTE_NODE: 2,
	TEXT_NODE: 3,
	CDATA_SECTION_NODE: 4,
	ENTITY_REFERENCE_NODE: 5,
	COMMENT_NODE: 6,
	PROCESSING_INSTRUCTION_NODE: 7,
	DOCUMENT_NODE: 9
};
*/


/** Create a minimally viable DOM Document
 *	@returns {Document} document
 */
export default function undom() {
	let observers = [],
		pendingMutations = false;

	class Node {
		constructor(nodeType, nodeName) {
			this.nodeType = nodeType;
			this.nodeName = nodeName;
			this.childNodes = [];
		}
		appendChild(child) {
			child.remove();
			child.parentNode = this;
			this.childNodes.push(child);
			if (this.children && child.nodeType===1) this.children.push(child);
			mutation(this, 'childList', { addedNodes:[child], previousSibling:this.childNodes[this.childNodes.length-2] });
		}
		insertBefore(child, ref) {
			child.remove();
			let i = splice(this.childNodes, ref, child), ref2;
			if (!ref) {
				this.appendChild(child);
			}
			else {
				if (~i && child.nodeType===1) {
					while (i<this.childNodes.length && (ref2 = this.childNodes[i]).nodeType!==1 || ref===child) i++;
					if (ref2) splice(this.children, ref, child);
				}
				mutation(this, 'childList', { addedNodes:[child], nextSibling:ref });
			}
		}
		replaceChild(child, ref) {
			if (ref.parentNode===this) {
				this.insertBefore(child, ref);
				ref.remove();
			}
		}
		removeChild(child) {
			let i = splice(this.childNodes, child);
			if (child.nodeType===1) splice(this.children, child);
			mutation(this, 'childList', { removedNodes:[child], previousSibling:this.childNodes[i-1], nextSibling:this.childNodes[i] });
		}
		remove() {
			if (this.parentNode) this.parentNode.removeChild(this);
		}
	}


	class Text extends Node {
		constructor(text) {
			super(3, '#text');					// TEXT_NODE
			this.textContent = this.nodeValue = text;
		}
	}


	class Element extends Node {
		constructor(nodeType, nodeName) {
			super(nodeType || 1, nodeName);		// ELEMENT_NODE
			this.attributes = [];
			this.children = [];
			this.__handlers = {};
		}

		setAttribute(key, value) {
			this.setAttributeNS(null, key, value);
		}
		getAttribute(key) {
			return this.getAttributeNS(null, key);
		}
		removeAttribute(key) {
			this.removeAttributeNS(null, key);
		}

		setAttributeNS(ns, name, value) {
			let attr = findWhere(this.attributes, createAttributeFilter(ns, name)),
				oldValue = attr && attr.value;
			if (!attr) this.attributes.push(attr = { ns, name });
			attr.value = String(value);
			mutation(this, 'attributes', { attributeName:name, attributeNamespace:ns, oldValue });
		}
		getAttributeNS(ns, name) {
			let attr = findWhere(this.attributes, createAttributeFilter(ns, name));
			return attr && attr.value;
		}
		removeAttributeNS(ns, name) {
			splice(this.attributes, createAttributeFilter(ns, name));
			mutation(this, 'attributes', { attributeName:name, attributeNamespace:ns, oldValue:this.getAttributeNS(ns, name) });
		}

		addEventListener(type, handler) {
			(this.__handlers[toLower(type)] || (this.__handlers[toLower(type)] = [])).push(handler);
		}
		removeEventListener(type, handler) {
			splice(this.__handlers[toLower(type)], handler, 0, true);
		}
		dispatchEvent(event) {
			let t = event.currentTarget = this,
				c = event.cancelable,
				l, i;
			do {
				l = t.__handlers[toLower(event.type)];
				if (l) for (i=l.length; i--; ) {
					if ((l[i](event)===false || event._end) && c) break;
				}
			} while (event.bubbles && !(c && event._stop) && (event.target=t=t.parentNode));
			return !event.defaultPrevented;
		}
	}


	class Document extends Element {
		constructor() {
			super(9, '#document');			// DOCUMENT_NODE
		}
	}


	class Event {
		constructor(type, opts) {
			this.type = type;
			this.bubbles = !!opts.bubbles;
			this.cancelable = !!opts.cancelable;
		}
		stopPropagation() {
			this._stop = true;
		}
		stopImmediatePropagation() {
			this._end = this._stop = true;
		}
		preventDefault() {
			this.defaultPrevented = true;
		}
	}


	function mutation(target, type, record) {
		record.target = target;
		record.type = type;

		for (let i=observers.length; i--; ) {
			let ob = observers[i],
				match = target===ob._target;
			if (!match && ob._options.subtree) {
				do {
					if ((match = target===ob._target)) break;
				} while ((target=target.parentNode));
			}
			if (match) {
				ob._records.push(record);
				if (!pendingMutations) {
					pendingMutations = true;
					setImmediate(flushMutations);
				}
			}
		}
	}

	function flushMutations() {
		pendingMutations = false;
		for (let i=observers.length; i--; ) {
			let ob = observers[i];
			if (ob._records.length) {
				ob.callback(ob.takeRecords());
			}
		}
	}

	class MutationObserver {
		constructor(callback) {
			this.callback = callback;
			this._records = [];
		}
		observe(target, options) {
			this.disconnect();
			this._target = target;
			this._options = options || {};
			observers.push(this);
		}
		disconnect() {
			this._target = null;
			splice(observers, this);
		}
		takeRecords() {
			return this._records.splice(0, this._records.length);
		}
	}


	function createElement(type) {
		return new Element(null, String(type).toUpperCase());
	}


	function createElementNS(ns, type) {
		let element = createElement(type);
		element.namespace = ns;
		return element;
	}


	function createTextNode(text) {
		return new Text(text);
	}


	function createDocument() {
		let document = new Document();
		assign(document, document.defaultView = { document, MutationObserver, Document, Node, Text, Element, Event });
		assign(document, { documentElement:document, createElement, createElementNS, createTextNode });
		document.appendChild(document.body = createElement('body'));
		return document;
	}


	return createDocument();
}
