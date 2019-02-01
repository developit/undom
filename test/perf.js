import undom from '../src/undom';
// import { expect } from 'chai';

describe('perf', () => {
	it('create', () => {
		function render() {
			const d = undom();
			d.body.appendChild(d.createElement('app-root'));
			return d;
		}

		for (let i = 0; i < 1e2; ++i) render();

		console.time('create');
		for (let i = 0; i < 1e5; ++i) render();
		console.timeEnd('create');
	});

	it('appendChild', () => {
		const d = undom();
		function render() {
			d.body.appendChild(d.createElement('app-root'));
			return d;
		}

		for (let i = 0; i < 1e2; ++i) render();

		console.time('appendChild');
		for (let i = 0; i < 1e5; ++i) render();
		console.timeEnd('appendChild');
	});

	it('insertBefore', () => {
		const d = undom();
		let prev, c=0;
		function render() {
			const p = d.createElement('app-root');
			d.body.insertBefore(p, c++%2 ? prev : null);
			prev = p;
			return d;
		}

		for (let i = 0; i < 1e2; ++i) render();

		console.time('insertBefore');
		for (let i = 0; i < 1e5; ++i) render();
		console.timeEnd('insertBefore');
	});

	it('listeners', () => {
		const d = undom();
		const l1 = () => {};
		const l2 = () => {};
		const l3 = () => {};
		const l4 = () => {};
		function render() {
			d.body.addEventListener('click', l1);
			d.body.addEventListener('click', l2);
			d.body.addEventListener('click', l3);
			d.body.addEventListener('click', l4);
			d.body.addEventListener('click', l3);
			d.body.addEventListener('click', l4);
			d.body.removeEventListener('click', l1);
			d.body.removeEventListener('click', l2);
			d.body.removeEventListener('click', l3);
			d.body.removeEventListener('click', l4);
			d.body.removeEventListener('click', l3);
			d.body.removeEventListener('click', l4);
			d.body.removeEventListener('click', l3);
			d.body.removeEventListener('click', l4);
			return d;
		}

		for (let i = 0; i < 1e2; ++i) render();

		console.time('event listeners');
		for (let i = 0; i < 1e5; ++i) render();
		console.timeEnd('event listeners');
	});
});
