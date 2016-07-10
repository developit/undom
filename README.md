# undom

[![NPM](https://img.shields.io/npm/v/undom.svg?style=flat)](https://www.npmjs.org/package/undom)
[![travis-ci](https://travis-ci.org/developit/undom.svg?branch=master)](https://travis-ci.org/developit/undom)

### **Minimally viable DOM Document implementation**

> Need a bare-bones HTML DOM where you don't have one? If you want the DOM but not a parser, this might be for you.
>
> `1kb` and works in Node and browsers.


[**JSFiddle Demo:**](https://jsfiddle.net/developit/4qv3v6r3/) Rendering [preact](https://github.com/developit/preact/) components into an undom Document.


---


## Project Goals

Undom aims to find a sweet spot between size/performance and utility. The goal is to provide the simplest possible implementation of a DOM Document, such that libraries relying on the DOM can run in places where there isn't one available.

The intent to keep things as simple as possible means undom lacks some DOM features like HTML parsing & serialization, Web Components, etc. These features can be added through additional libraries.


---


## Installation

Via npm:

`npm install --save undom`


---


## Require Hook

In CommonJS environments, simply import `undom/register` to patch the global object with a singleton Document.

```js
require('undom/register');

// now you have a DOM.
document.createElement('div');
```


---


## Usage

```js
// import the library:
import undom from 'undom';

let document = undom();

let foo = document.createElement('foo');
foo.appendChild(document.createTextNode('Hello, World!'));
document.body.appendChild(foo);
```


---


## Recipe: Serialize to HTML

One task `undom` doesn't handle for you by default is HTML serialization.  A proper implementation of this would be cumbersome to maintain and would rely heavily on getters and setters, which limits browser support.  Below is a simple recipe for serializing an `undom` Element (Document, etc) to HTML.


#### Small & in ES2015:

```js
Element.prototype.toString = el => this.nodeType===3 ? enc(this.textContent) : (
	'<'+this.nodeName.toLowerCase() + this.attributes.map(attr).join('') + '>' +
	this.childNodes.map(serialize).join('') + '</'+this.nodeName.toLowerCase()+'>'
);
let attr = a => ` ${a.name}="${enc(a.value)}"`;
let enc = s => s.replace(/[&'"<>]/g, a => `&#${a};`);
```


#### ES3 Version

This also does pretty-printing.

```js
function serialize(el) {
	if (el.nodeType===3) return el.textContent;
	var name = String(el.nodeName).toLowerCase(),
		str = '<'+name,
		c, i;
	for (i=0; i<el.attributes.length; i++) {
		str += ' '+el.attributes[i].name+'="'+el.attributes[i].value+'"';
	}
	str += '>';
	for (i=0; i<el.childNodes.length; i++) {
		c = serialize(el.childNodes[i]);
		if (c) str += '\n\t'+c.replace(/\n/g,'\n\t');
	}
	return str + (c?'\n':'') + '</'+name+'>';
}

function enc(s) {
	return s.replace(/[&'"<>]/g, function(a){ return `&#${a};` });
}
```
