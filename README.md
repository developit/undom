# undom

[![NPM](https://img.shields.io/npm/v/undom.svg?style=flat)](https://www.npmjs.org/package/undom)
[![travis-ci](https://travis-ci.org/developit/undom.svg?branch=master)](https://travis-ci.org/developit/undom)

### **Minimally viable DOM Document implementation**

> Need a bare-bones HTML DOM where you don't have one? If you want the DOM but not a parser, this might be for you.
>
> `1kb` and works in Node and browsers.


---


## Installation

Via npm:

`npm install --save undom`


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
