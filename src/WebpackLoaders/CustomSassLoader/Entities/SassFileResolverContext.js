/**
 * Created by Martin Neundorfer on 05.02.2019.
 * For LABOR.digital
 */
const BaseFileExtResolver = require("../BaseFileExtResolver");

module.exports = class SassFileResolverContext {
	/**
	 * @param {module.ConfigBuilderContext} baseContext
	 * @param loaderContext
	 */
	constructor(baseContext, loaderContext) {
		this.baseFile = loaderContext.resourcePath;
		this.baseContext = baseContext;
		this.loader = loaderContext;
		this.baseExt = "";
		this.path = [];
		BaseFileExtResolver.getExtFor(this);
	}
};