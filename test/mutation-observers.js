import undom from '../src/undom';
import chai, { expect } from 'chai';
import { spy } from 'sinon';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);

describe('MutationObserver', () => {
	let { document, MutationObserver } = undom().defaultView;

	describe('childList', () => {
		it('should monitor appendChild', done => {
			let fn = spy();
			let observer = new MutationObserver(fn);

			let parent = document.createElement('div');

			let prev = document.createElement('skip-me');
			parent.appendChild(prev);

			observer.observe(parent);

			let el = document.createElement('div');
			parent.appendChild(el);

			// MutationObserver is async, and I'm lazy.
			setTimeout( () => {
				expect(fn).to.have.been.calledOnce;
				expect(fn.firstCall.args).to.eql([
					[
						{
							type: 'childList',
							target: parent,
							addedNodes: [el],
							previousSibling: prev
						}
					]
				]);
				done();
			}, 10);
		});

		it('should batch', done => {
			let fn = spy();
			let observer = new MutationObserver(fn);

			let parent = document.createElement('div');
			observer.observe(parent);

			let el = document.createElement('div');
			parent.appendChild(el);

			let el2 = document.createElement('div');
			parent.appendChild(el2);

			// MutationObserver is async, and I'm lazy.
			setTimeout( () => {
				expect(fn).to.have.been.calledOnce;
				expect(fn.firstCall.args).to.eql([
					[
						{
							type: 'childList',
							target: parent,
							addedNodes: [el],
							previousSibling: undefined
						},
						{
							type: 'childList',
							target: parent,
							addedNodes: [el2],
							previousSibling: el
						}
					]
				]);
				done();
			}, 10);
		});
	});

	describe('attributes', () => {
		it('should observe new attributes', done => {
			let fn = spy();
			let observer = new MutationObserver(fn);

			let el = document.createElement('div');
			observer.observe(el);

			el.setAttribute('foo', 'bar');

			el.setAttributeNS('http://www.w3c.org/1999/xlink', 'href', '//hello');

			// MutationObserver is async, and I'm lazy.
			setTimeout( () => {
				expect(fn).to.have.been.calledOnce;
				expect(fn.firstCall.args).to.eql([
					[
						{
							type: 'attributes',
							target: el,
							attributeName: 'foo',
							attributeNamespace: null,
							oldValue: undefined
						},
						{
							type: 'attributes',
							target: el,
							attributeName: 'href',
							attributeNamespace: 'http://www.w3c.org/1999/xlink',
							oldValue: undefined
						}
					]
				]);
				done();
			}, 10);
		});

		it('should observe changed attributes', done => {
			let fn = spy();
			let observer = new MutationObserver(fn);

			let el = document.createElement('div');
			el.setAttribute('foo', 'bar');
			el.setAttributeNS('http://www.w3c.org/2000/svg', 'viewBox', '0 0 1 1');

			observer.observe(el);

			el.setAttribute('foo', 'asdf');
			el.setAttributeNS('http://www.w3c.org/2000/svg', 'viewBox', '1 1 2 2');

			// MutationObserver is async, and I'm lazy.
			setTimeout( () => {
				expect(fn).to.have.been.calledOnce;
				expect(fn.firstCall.args).to.eql([
					[
						{
							type: 'attributes',
							target: el,
							attributeName: 'foo',
							attributeNamespace: null,
							oldValue: 'bar'
						},
						{
							type: 'attributes',
							target: el,
							attributeName: 'viewBox',
							attributeNamespace: 'http://www.w3c.org/2000/svg',
							oldValue: '0 0 1 1'
						}
					]
				]);
				done();
			}, 10);
		});
	});
});
