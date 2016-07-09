import path from 'path';
import fs from 'fs';
import buble from 'rollup-plugin-buble';
// import babel from 'rollup-plugin-babel';

let pkg = JSON.parse(fs.readFileSync('./package.json'));

export default {
	entry: pkg['jsnext:main'],
	dest: pkg.main,
	sourceMap: path.resolve(pkg.main),
	moduleName: pkg.amdName,
	format: 'umd',
	exports: 'default',
	useStrict: false,
	plugins: [
		buble({
			objectAssign: 'assign'
		})
		// babel({
		// 	babelrc: false,
		// 	comments: false,
		// 	exclude: 'node_modules/**',
		// 	presets: [
		// 		'es2015-minimal-rollup',
		// 		'stage-0'
		// 	],
		// 	plugins: [
		// 		'transform-object-assign'
		// 	]
		// })
	]
};
