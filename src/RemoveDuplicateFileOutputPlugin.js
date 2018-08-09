/**
 * Created by Martin Neundorfer on 09.08.2018.
 * For LABOR.digital
 */
const LastCallWebpackPlugin = require('last-call-webpack-plugin');

function RemoveDuplicateFileOutputPlugin() {}

/**
 * Removes all later occurences of a file output to avoid overrides
 * @param compiler
 */
RemoveDuplicateFileOutputPlugin.prototype.apply = function(compiler) {
	compiler.hooks.emit.tapAsync('RemoveDuplicateFileOutputPlugin', (compilation, callback) => {
		var knownKeys = [];
		Object.keys(compilation.assets).forEach(asset => {
			if(knownKeys.indexOf(asset.replace(/^\.+\//,'')) === -1){
				knownKeys.push(asset.replace(/^\.+\//,''));
				return;
			}
			delete compilation.assets[asset];
		});
		console.log(compilation.assets);
		callback();
	});
};

module.exports = RemoveDuplicateFileOutputPlugin;