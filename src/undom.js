import {
	assign,
	toLower,
	splice,
	findWhere,
	createAttributeFilter
} from './util.js';

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

	// Internal helpers that live off the classes (fixes #35): the public
	// methods below delegate to these instead of calling each other, so
	// spying on a public method only observes explicit calls — like the
	// real DOM, which never calls its own public methods internally.
	function insert(parent, child, ref) {
		removeNode(child);
		child.parentNode = parent;
		if (ref) splice(parent.childNodes, ref, child, true);
		else parent.childNodes.push(child);
		return child;
	}

	function remove(parent, child) {
		splice(parent.childNodes, child, false, true);
		return child;
	}

	function removeNode(node) {
		if (node.parentNode) remove(node.parentNode, node);
	}

	function setAttr(element, ns, name, value) {
		let attr = findWhere(element.attributes, createAttributeFilter(ns, name), false, false);
		if (!attr) element.attributes.push(attr = { ns, name });
		attr.value = String(value);
	}

	function getAttr(element, ns, name) {
		let attr = findWhere(element.attributes, createAttributeFilter(ns, name), false, false);
		return attr && attr.value;
	}

	function removeAttr(element, ns, name) {
		splice(element.attributes, createAttributeFilter(ns, name), false, false);
	}

	function newElement(type) {
		return new Element(null, String(type).toUpperCase());
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
			return insert(this, child);
		}
		insertBefore(child, ref) {
			return insert(this, child, ref);
		}
		replaceChild(child, ref) {
			if (ref.parentNode===this) {
				insert(this, child, ref);
				remove(this, ref);
				return ref;
			}
		}
		removeChild(child) {
			return remove(this, child);
		}
		remove() {
			removeNode(this);
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
			setAttr(this, null, key, value);
		}
		getAttribute(key) {
			return getAttr(this, null, key);
		}
		removeAttribute(key) {
			removeAttr(this, null, key);
		}

		setAttributeNS(ns, name, value) {
			setAttr(this, ns, name, value);
		}
		getAttributeNS(ns, name) {
			return getAttr(this, ns, name);
		}
		removeAttributeNS(ns, name) {
			removeAttr(this, ns, name);
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
			return newElement(type);
		}

		createElementNS(ns, type) {
			let element = newElement(type);
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
		insert(document,
			document.documentElement = document.createElement('html')
		);
		insert(document.documentElement,
			document.head = document.createElement('head')
		);
		insert(document.documentElement,
			document.body = document.createElement('body')
		);
		return document;
	}

	createDocument.env = createEnvironment;
	return createDocument;
}

export default createEnvironment();
