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

function createEnvironment() {

function isElement(node) {
	return node.nodeType===1;
}

class Node {
	constructor(nodeType, nodeName) {
		this.nodeType = nodeType;
		this.nodeName = nodeName;
		this.childNodes = [];
	}
	get nextSibling() {
		let p = this.parentNode;
		if (p) return p.childNodes[findWhere(p.childNodes, this, true, true) + 1];
	}
	get previousSibling() {
		let p = this.parentNode;
		if (p) return p.childNodes[findWhere(p.childNodes, this, true, true) - 1];
	}
	get firstChild() {
		return this.childNodes[0];
	}
	get lastChild() {
		return this.childNodes[this.childNodes.length-1];
	}
	appendChild(child) {
		this.insertBefore(child);
		return child;
	}
	insertBefore(child, ref) {
		child.remove();
		child.parentNode = this;
		if (ref) splice(this.childNodes, ref, child, true);
		else this.childNodes.push(child);
		return child;
	}
	replaceChild(child, ref) {
		if (ref.parentNode===this) {
			this.insertBefore(child, ref);
			ref.remove();
			return ref;
		}
	}
	removeChild(child) {
		splice(this.childNodes, child, false, true);
		return child;
	}
	remove() {
		if (this.parentNode) this.parentNode.removeChild(this);
	}
}


class Text extends Node {
	constructor(text) {
		super(3, '#text');					// TEXT_NODE
		this.nodeValue = text;
	}
	set textContent(text) {
		this.nodeValue = text;
	}
	get textContent() {
		return this.nodeValue;
	}
}


class Element extends Node {
	constructor(nodeType, nodeName) {
		super(nodeType || 1, nodeName);		// ELEMENT_NODE
		this.attributes = [];
		this.__handlers = {};
		this.style = {};
	}

	get className() { return this.getAttribute('class'); }
	set className(val) { this.setAttribute('class', val); }

	get cssText() { return this.getAttribute('style'); }
	set cssText(val) { this.setAttribute('style', val); }

	get children() {
		return this.childNodes.filter(isElement);
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
		let attr = findWhere(this.attributes, createAttributeFilter(ns, name), false, false);
		if (!attr) this.attributes.push(attr = { ns, name });
		attr.value = String(value);
	}
	getAttributeNS(ns, name) {
		let attr = findWhere(this.attributes, createAttributeFilter(ns, name), false, false);
		return attr && attr.value;
	}
	removeAttributeNS(ns, name) {
		splice(this.attributes, createAttributeFilter(ns, name), false, false);
	}

	addEventListener(type, handler) {
		(this.__handlers[toLower(type)] || (this.__handlers[toLower(type)] = [])).push(handler);
	}
	removeEventListener(type, handler) {
		splice(this.__handlers[toLower(type)], handler, false, true);
	}
	dispatchEvent(event) {
		let t = event.target = this,
			c = event.cancelable,
			l, i;
		do {
			event.currentTarget = t;
			l = t.__handlers && t.__handlers[toLower(event.type)];
			if (l) for (i=l.length; i--; ) {
				if ((l[i].call(t, event) === false || event._end) && c) {
					event.defaultPrevented = true;
				}
			}
		} while (event.bubbles && !(c && event._stop) && (t=t.parentNode));
		return l!=null;
	}
}


class Document extends Element {
	constructor() {
		super(9, '#document');			// DOCUMENT_NODE
	}

	createElement(type) {
		return new Element(null, String(type).toUpperCase());
	}

	createElementNS(ns, type) {
		let element = this.createElement(type);
		element.namespace = ns;
		return element;
	}


	createTextNode(text) {
		return new Text(text);
	}
}


class Event {
	constructor(type, opts) {
		this.type = type;
		this.bubbles = !!(opts && opts.bubbles);
		this.cancelable = !!(opts && opts.cancelable);
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


/** Create a minimally viable DOM Document
 *	@returns {Document} document
 */
	function createDocument() {
	let document = new Document();
	assign(document, document.defaultView = { document, Document, Node, Text, Element, SVGElement: Element, Event });
	document.appendChild(
		document.documentElement = document.createElement('html')
	);
	document.documentElement.appendChild(
		document.head = document.createElement('head')
	);
	document.documentElement.appendChild(
		document.body = document.createElement('body')
	);
	return document;
}

	createDocument.env = createEnvironment;
	return createDocument;
}

export default createEnvironment();
