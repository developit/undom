
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
	function assign(obj, props) {
		for (let i in props) obj[i] = props[i];
	}

	function toLower(str) {
		return String(str).toLowerCase();
	}

	function createAttributeFilter(ns, name) {
		return o => o.ns===ns && o.name===toLower(name);
	}

	function splice(arr, item, add) {
		let i = arr ? findWhere(arr, item, true) : -1;
		if (~i) add ? arr.splice(i, 0, add) : arr.splice(i, 1);
		return i;
	}

	function findWhere(arr, fn, returnIndex) {
		let i = arr.length;
		while (i--) if (typeof fn==='function' ? fn(arr[i]) : arr[i]===fn) break;
		return returnIndex ? i : arr[i];
	}


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
			if (child.nodeType===1) {
				while (i<this.childNodes.length && (ref = this.childNodes[i]).nodeType!==1) i++;
				if (ref) splice(this.children, ref, child);
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
				}
			}
		}
	}


	class Document extends Element {
		constructor() {
			super(9, '#document');			// DOCUMENT_NODE
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
		assign(document, {
			Document, Node, TextNode, Element,
			createElement, createElementNS, createTextNode
		});
		document.documentElement = document;
		document.appendChild(document.body = document.createElement('body'));
		return document;
	}

	return createDocument();
}
