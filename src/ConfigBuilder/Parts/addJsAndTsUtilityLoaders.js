/**
 * Created by Martin Neundorfer on 19.09.2018.
 * For LABOR.digital
 */
const path = require('path');
module.exports = function addJsAndTsUtilityLoaders(entry, context, withComponentLoader, additionalPolyfills) {
	let loaders = [
		{
			'loader': path.resolve(context.dir.controller, './WebpackLoaders/EntryPointPolyfillPrependLoader.js'),
			'options': {
				'entry': entry,
				'polyfills': context.callPluginMethod('filterJsPolyfills', [
					[
						'core-js/fn/promise',
						'core-js/fn/set',
						'core-js/fn/map',
						'core-js/fn/object/assign',
						'core-js/fn/object/entries',
						'core-js/fn/object/keys',
						'core-js/fn/array/from'
					].concat(additionalPolyfills), context])
			}
		}
	];

	if (withComponentLoader === true) {
		loaders.unshift({
			'loader': path.resolve(context.dir.controller, './WebpackLoaders/ComponentLoader.js')
		});
	}

	context.webpackConfig.module.rules.push({
		'test': /\.js$|\.ts$|\.tsx$/,
		'enforce': 'pre',
		'use': loaders
	});
};