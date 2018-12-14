/**
 * Created by Martin Neundorfer on 14.09.2018.
 * For LABOR.digital
 */
const ComponentRepository = require('./ComponentRepository');

module.exports = function componentLoader(source) {
	const filename = this.resourcePath;
	const callback = this.async();
	const self = this;

	// Check if this file is registered for rewrites (which means this file is part of a component)
	if (ComponentRepository.isComponentAndRequiresRewrite(filename)) {
		const [replacements, dependencies] = ComponentRepository.getComponentRequirements(filename);

		// Remove stripped imports
		replacements.forEach(regex => {
			source = source.replace(regex, '');
		});

		// Register dependencies
		dependencies.forEach(self.addDependency);
	}

	// Check if this file has a import marker
	let matchCounter = 0;
	source = source.replace(/(^|^(?:[^\S\n]+))import(?:\s+)?\(?(?:\s+)?["']@components(@[^'"\n]*?)?["'](?:\s+)?\)?;?(?:\s+)?$/gm, (a, before, modifiers) => {

		// Ignore if the file has multiple component markers
		if (matchCounter > 0) return before + ';';
		matchCounter++;

		// Find all files in the current directory
		const setDefinition = ComponentRepository.getDefinitionFor(filename, modifiers);

		// Nothing found
		if (setDefinition.dependencies.size === 0) return before + ';';

		// Register dependencies
		setDefinition.dependencies.forEach(self.addDependency);

		// Done
		return before + setDefinition.import;
	});

	// Done
	callback(null, source);
};