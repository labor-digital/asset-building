/**
 * Created by Martin Neundorfer on 14.09.2018.
 * For LABOR.digital
 */
const ComponentRepository = require('../Helpers/ComponentRepository');

module.exports = function componentLoader(source) {
	/**
	 * @type {module.ConfigBuilderContext}
	 */
	const componentPath = this.resourcePath;
	const callback = this.async();
	const self = this;

	// Check if this file has a import marker
	let matchCounter = 0;
	source = source.replace(/(^|(?:[^\S\n]+))import(?:\s+)?\(?(?:\s+)?["']@components["'](?:\s+)?\)?;?(?:\s+)?$/gm, (a, before) => {
		if (matchCounter > 0) return before + ';';
		matchCounter++;

		// Find all files in the current directory
		const imports = ComponentRepository.getImportsForFile(componentPath);

		// Nothing found
		if (imports.dependencies.size === 0) return before + ';';

		// Register dependencies
		imports.dependencies.forEach(self.addDependency);

		// Done
		return before + imports.import;
	});

	callback(null, source);
};