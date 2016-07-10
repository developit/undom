
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
			let i = this.childNodes.indexOf(ref);
			if (~i) this.childNodes.splice(i, 0, child);
			if (this.children && child.nodeType===1) {
				while (i<this.childNodes.length && this.childNodes[i].nodeType!==1) i++;
				if (i<this.childNodes.length) {
					this.children.splice(this.children.indexOf(this.childNodes[i]), 0, child);
				}
			}
		}
		removeChild(child) {
			let i = this.childNodes.indexOf(child);
			if (~i) this.childNodes.splice(i, 1);
			if (this.children && child.nodeType===1) {
				i = this.children.indexOf(child);
				if (~i) this.children.splice(this.children.indexOf(child), 1);
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
			name = String(name).toLowerCase();
			value = String(value);
			let attr = this.attributes.filter( o => o.ns===ns && o.name===name )[0];
			if (!attr) this.attributes.push({ ns, name, value });
			else attr.value = value;
		}
		getAttributeNS(ns, name) {
			let attr = this.attributes.filter( o => o.ns===ns && o.name===name )[0];
			return attr && attr.value;
		}
		removeAttributeNS(ns, name) {
			for (let i=this.attributes.length; i--; ) {
				if (this.attributes[i].ns===ns && this.attributes[i].name===name) {
					this.attributes.splice(i, 1);
					return;
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
