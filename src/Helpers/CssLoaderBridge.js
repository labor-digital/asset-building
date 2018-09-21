/**
 * Created by Martin Neundorfer on 19.09.2018.
 * For LABOR.digital
 */
const storage = new Map();

module.exports = class CssLoaderBridge {

	static setDefinitionForStylesheet(stylesheet, source, urlItems, importItems){
		if(typeof urlItems === 'undefined' || !Array.isArray(urlItems)) urlItems = [];
		if(typeof importItems === 'undefined' || !Array.isArray(importItems)) importItems = [];

		storage.set(stylesheet, {
			'source': source,
			'map': undefined,
			'exports': {},
			'importItems': importItems,
			'importItemRegExpG': /___CSS_LOADER_BRIDGE_IMPORT___([0-9]+)___/g,
			'importItemRegExp': /___CSS_LOADER_BRIDGE_IMPORT___([0-9]+)___/,
			'urlItems': urlItems,
			'urlItemRegExpG': /___CSS_LOADER_BRIDGE_URL___([0-9]+)___/g,
			'urlItemRegExp': /___CSS_LOADER_BRIDGE_URL___([0-9]+)___/
		});
	}

	static getDefinitionForStylesheet(stylesheet){
		return storage.get(stylesheet);
	}
};