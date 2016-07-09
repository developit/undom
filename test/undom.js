import undom from '../src/undom';
import { expect } from 'chai';

describe('undom', () => {
	it('should create a Document', () => {
		let document = undom();
		expect(document).to.be.an.instanceOf(document.Document);
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

		describe('#setAttribute()', () => {
			it('should set a given named attribute', () => {
				let el = document.createElement('div');
				expect(el.attributes).to.eql([]);

				el.setAttribute('foo', 'bar');
				expect(el.attributes, 'create').to.eql([{ name:'foo', value:'bar', ns:null }]);

				el.setAttribute('foo', 'baz');
				expect(el.attributes, 'update').to.eql([{ name:'foo', value:'baz', ns:null }]);
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
	});
});
