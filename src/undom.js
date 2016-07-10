import {
	assign,
	toLower,
	splice,
	findWhere,
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
		}
		insertBefore(child, ref) {
			child.remove();
			let i = splice(this.childNodes, ref, child);
			if (!ref) this.appendChild(child);
			else if (~i && child.nodeType===1) {
				while (i<this.childNodes.length && (ref = this.childNodes[i]).nodeType!==1 || ref===child) i++;
				if (ref) splice(this.children, ref, child);
			}
		}
		replaceChild(child, ref) {
			if (ref.parentNode===this) {
				this.insertBefore(child, ref);
				ref.remove();
			}
		}
		removeChild(child) {
			splice(this.childNodes, child);
			if (child.nodeType===1) splice(this.children, child);
		}
		remove() {
			if (this.parentNode) this.parentNode.removeChild(this);
		}
	}


	class TextNode extends Node {
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
			let attr = findWhere(this.attributes, createAttributeFilter(ns, name));
			if (!attr) this.attributes.push(attr = { ns, name });
			attr.value = String(value);
		}
		getAttributeNS(ns, name) {
			let attr = findWhere(this.attributes, createAttributeFilter(ns, name));
			return attr && attr.value;
		}
		removeAttributeNS(ns, name) {
			splice(this.attributes, createAttributeFilter(ns, name));
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


	function createElement(type) {
		return new Element(null, String(type).toUpperCase());
	}


	function createElementNS(ns, type) {
		let element = createElement(type);
		element.namespace = ns;
		return element;
	}


	function createTextNode(text) {
		return new TextNode(text);
	}


	function createDocument() {
		let document = new Document();
		assign(document, document.defaultView = { document, Document, Node, TextNode, Element, Event });
		assign(document, { documentElement:document, createElement, createElementNS, createTextNode });
		document.appendChild(document.body = createElement('body'));
		return document;
	}


	return createDocument();
}
