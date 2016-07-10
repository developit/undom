# undom

[![NPM](https://img.shields.io/npm/v/undom.svg?style=flat)](https://www.npmjs.org/package/undom)
[![travis-ci](https://travis-ci.org/developit/undom.svg?branch=master)](https://travis-ci.org/developit/undom)

### **Minimally viable DOM Document implementation**

> Need a bare-bones HTML DOM where you don't have one? If you want the DOM but not a parser, this might be for you.
>
> `1kb` and works in Node and browsers.


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
