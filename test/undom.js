import undom from '../src/undom';
import chai, { expect } from 'chai';
import { spy } from 'sinon';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);

describe('undom', () => {
	it('should create a Document', () => {
		let document = undom();
		expect(document).to.be.an.instanceOf(document.Document);
	});

	it('should create a valid Document tree', () => {
		let document = undom();
		let html = document.documentElement;

		expect(html).to.be.an.instanceOf(document.Element);
		expect(html).to.have.property('nodeName', 'HTML');

		expect(document.head).to.be.an.instanceOf(document.Element);
		expect(document.head).to.have.property('nodeName', 'HEAD');
		expect(document.head).to.have.property('parentNode', html);

		expect(document.body).to.be.an.instanceOf(document.Element);
		expect(document.body).to.have.property('nodeName', 'BODY');
		expect(document.body).to.have.property('parentNode', html);
	});

	describe('createElement()', () => {
		let document = undom();

		it('should create an Element', () => {
			expect(document.createElement('div')).to.be.an.instanceOf(document.Element);
		});

		it('should generate correct nodeNames', () => {
			expect(document.createElement('div')).to.have.property('nodeName', 'DIV');
			expect(document.createElement('section')).to.have.property('nodeName', 'SECTION');
			expect(document.createElement('span')).to.have.property('nodeName', 'SPAN');
			expect(document.createElement('foo-bar')).to.have.property('nodeName', 'FOO-BAR');
			expect(document.createElement('Foo:bar')).to.have.property('nodeName', 'FOO:BAR');
		});

		it('should generate correct nodeTypes', () => {
			expect(document.createElement('div'), 'div').to.have.property('nodeType', 1);
			expect(document.createElement('section'), 'span').to.have.property('nodeType', 1);
			expect(document.createElement('span'), 'span').to.have.property('nodeType', 1);
		});
	});

	describe('Element', () => {
		let document = undom();

		describe('#appendChild', () => {
			it('should set parentNode', () => {
				let child = document.createElement('span');
				let parent = document.createElement('div');
				parent.appendChild(child);
				expect(child).to.have.property('parentNode', parent);
			});

			it('should insert into .children / .childNodes', () => {
				let child = document.createElement('span');
				let parent = document.createElement('div');

				parent.appendChild(child);
				expect(parent).to.have.property('childNodes').that.deep.equals([child]);
				expect(parent).to.have.property('children').that.deep.equals([child]);
				expect(child).to.have.property('parentNode', parent);

				parent.appendChild(child);
				expect(parent, 're-append').to.have.property('childNodes').that.deep.equals([child]);
				expect(parent, 're-append').to.have.property('children').that.deep.equals([child]);
				expect(child, 're-append').to.have.property('parentNode', parent);
			});

			it('should remove child from any current parentNode', () => {
				let child = document.createElement('span');
				let parent1 = document.createElement('div');
				let parent2 = document.createElement('div');

				parent1.appendChild(child);
				expect(parent1.childNodes).to.eql([child]);
				expect(child).to.have.property('parentNode', parent1);

				parent2.appendChild(child);
				expect(child, 'switch parentNode').to.have.property('parentNode', parent2);
				expect(parent1.childNodes, 'old parent').to.eql([]);
				expect(parent2.childNodes, 'new parent').to.eql([child]);
			});
		});

		describe('#replaceChild()', () => {
			it('should replace a child', () => {
				let parent = document.createElement('div');
				let child1 = document.createElement('child1');
				let child2 = document.createElement('child2');
				let child3 = document.createElement('child3');
				let child4 = document.createElement('child4');
				parent.appendChild(child1);
				parent.appendChild(child2);
				parent.appendChild(child3);

				expect(parent).to.have.property('childNodes').eql([child1, child2, child3]);
				expect(parent).to.have.property('children').eql([child1, child2, child3]);

				parent.replaceChild(child4, child2);

				expect(parent).to.have.property('childNodes').eql([child1, child4, child3]);
				expect(parent).to.have.property('children').eql([child1, child4, child3]);
			});
		});

		describe('#setAttribute()', () => {
			it('should set a given named attribute', () => {
				let el = document.createElement('div');
				expect(el.attributes).to.eql([]);

				el.setAttribute('foo', 'bar');
				expect(el.attributes, 'create').to.eql([{ name: 'foo', value: 'bar', ns: null }]);

				el.setAttribute('foo', 'baz');
				expect(el.attributes, 'update').to.eql([{ name: 'foo', value: 'baz', ns: null }]);
			});

			it('should stringify values', () => {
				let el = document.createElement('div');
				el.setAttribute('a', 1);
				el.setAttribute('b', {});
				expect(el.attributes[0].value).to.equal('1');
				expect(el.attributes[1].value).to.equal('[object Object]');
			});
		});

		describe('#getAttribute()', () => {
			it('should return a stored attribute value', () => {
				let el = document.createElement('div');
				el.setAttribute('a', 'b');
				expect(el.getAttribute('a')).to.equal('b');
				el.setAttribute('a', 'c');
				expect(el.getAttribute('a')).to.equal('c');
			});

			it('should return undefined for missing attribute', () => {
				let el = document.createElement('div');
				expect(el.getAttribute('a')).to.equal(undefined);
			});
		});

		describe('#addEventListener', () => {
			it('should append listener to event list', () => {
				let el = document.createElement('div');

				expect(el.__handlers).to.eql({});

				let fn = () => {};
				el.addEventListener('type', fn);
				expect(el.__handlers).to.eql({ type: [fn] });
			});

			it('should allow duplicates', () => {
				let el = document.createElement('div');
				let fn = () => {};
				el.addEventListener('type', fn);
				el.addEventListener('type', fn);
				expect(el.__handlers).to.eql({ type: [fn, fn] });
			});

			it('should normalize type', () => {
				let el = document.createElement('div');
				let fn = () => {};
				el.addEventListener('TYPE', fn);
				el.addEventListener('TyPe', fn);
				el.addEventListener('type', fn);
				expect(el.__handlers).to.eql({ type: [fn, fn, fn] });
			});
		});

		describe('#removeEventListener', () => {
			it('should remove existing listeners', () => {
				let el = document.createElement('div');
				let fn = () => {};
				el.addEventListener('type', fn);

				el.removeEventListener('type', fn);
				expect(el.__handlers).to.eql({ type: [] });
			});

			it('should normalize type', () => {
				let el = document.createElement('div');
				let fn = () => {};
				el.addEventListener('type', fn);
				el.addEventListener('type', fn);
				el.addEventListener('type', fn);

				el.removeEventListener('TYPE', fn);
				el.removeEventListener('TyPe', fn);
				el.removeEventListener('type', fn);
				expect(el.__handlers).to.eql({ type: [] });
			});

			it('should remove only one listener at a time', () => {
				let el = document.createElement('div');
				let fn = () => {};
				el.addEventListener('type', fn);
				el.addEventListener('type', fn);

				el.removeEventListener('type', fn);
				expect(el.__handlers).to.eql({ type: [fn] });

				el.removeEventListener('type', fn);
				expect(el.__handlers).to.eql({ type: [] });
			});
		});

		describe('#dispatchEvent()', () => {
			it('should invoke matched listener', () => {
				let event = { type: 'foo', cancelable: true, bubbles: true };
				let el = document.createElement('div');
				let fn = spy();
				let fn2 = spy();
				el.addEventListener('foo', fn);
				el.addEventListener('bar', fn2);
				el.dispatchEvent(event);

				expect(fn).to.have.been.calledOnce;
				expect(fn2).not.to.have.been.called;
			});

			it('should invoke multiple listeners', () => {
				let event = { type: 'foo', cancelable: true, bubbles: true };
				let el = document.createElement('div');
				let fn = spy();
				el.addEventListener('foo', fn);
				el.addEventListener('foo', fn);
				el.addEventListener('foo', fn);
				el.dispatchEvent(event);

				expect(fn).to.have.been.calledThrice;
			});

			it('should bubble if enabled', () => {
				let event = new document.defaultView.Event('foo', { cancelable: true, bubbles: true });
				let child = document.createElement('div');
				let parent = document.createElement('div');
				parent.appendChild(child);

				child.addEventListener('foo', child.fn = spy());
				parent.addEventListener('foo', parent.fn = spy());
				child.dispatchEvent(event);

				expect(child.fn).to.have.been.calledOnce;
				expect(parent.fn).to.have.been.calledOnce;

				child.fn.resetHistory();
				parent.fn.resetHistory();
				parent.dispatchEvent(event);
				expect(child.fn).not.to.have.been.called;

				child.fn.resetHistory();
				parent.fn.resetHistory();
				event.bubbles = false;
				child.addEventListener('foo', e => e._stop = true );
				child.dispatchEvent(event);
				expect(parent.fn).not.to.have.been.called;
			});

			it('should return `found`', () => {
				let el = document.createElement('div');
				let el2 = document.createElement('div');
				el.addEventListener('foo', () => {});

				expect(el.dispatchEvent(new document.defaultView.Event('foo'))).to.equal(true);
				expect(el2.dispatchEvent(new document.defaultView.Event('foo'))).to.equal(false);
			});

			it('preventDefault() should set defaultPrevented', () => {
				let event = new document.defaultView.Event('foo', { cancelable: true, bubbles: true });
				let el = document.createElement('div');
				let parent = document.createElement('div');
				parent.appendChild(el);
				let fn = spy(e => { e.preventDefault(); });
				let parentFn = spy(e => { e.preventDefault(); });
				el.addEventListener('foo', fn);
				parent.addEventListener('foo', parentFn);

				el.dispatchEvent(event);

				expect(fn).to.have.been.calledOnce;
				expect(parentFn).to.have.been.calledOnce;
				expect(parentFn.firstCall.args[0]).to.have.property('defaultPrevented', true);
			});
		});
	});
});
