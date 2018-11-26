/**
 * Created by Martin Neundorfer on 26.11.2018.
 * For LABOR.digital
 */
const path = require("path");
const fs = require("fs");
const mustache = require("mustache");

function resolvePartialsInSource(loader, source, layer, resourcePath, entryPath){
	if(layer > 10) throw new Error("You can't nest more than 10 partials into eachother!");
	return source.replace(/<section>partial:([^,<]*)([\S\s]*?)(?:(?<!\\)<\/section>)/gm, (a, file, args) => {
		if(typeof file !== "string") return a;
		file = file.trim();

		// Try to find the file if possible
		let partialFile = null;
		const basePath = file.charAt(0) === "/" ? entryPath : resourcePath + path.sep;
		[
			basePath + file,
			basePath + path.sep + "Chunks" + path.sep + file + path.sep + path.basename(file) + ".html",
			basePath + file + path.sep + path.basename(file) + ".html",
			basePath + path.sep + "Chunks" + path.sep + file + ".html",
			basePath + file + ".html"
		].forEach(p => {
			if(partialFile !== null) return;
			p = path.normalize(p);
			if(!fs.existsSync(p)) return;
			loader.addDependency(p);
			partialFile = p;
		});

		// Die on error
		if(!partialFile)
			throw new Error("Invalid partial definition in " + loader.resourcePath + " could not find partial: " + file);

		// Load the partial
		let partial = fs.readFileSync(partialFile).toString("utf-8");

		// Check if we got data
		if(typeof args === "string" && args.length > 0){
			args = args.replace(/^[,\s]*/, "").trim();
			args = JSON.parse(args);
		} else {
			args = {};
		}

		// Render the partial
		partial = mustache.render(partial, args);
		partial = resolvePartialsInSource(loader, partial, layer + 1, path.dirname(partialFile), entryPath);
		return partial;
	});
}

module.exports = function htmlPartialLoader(source) {
	const filename = this.resourcePath;
	const callback = this.async();
	const dir = this.query.dir;
	const app = this.query.app;
	const resourcePath = path.dirname(filename);
	const entryPath = path.resolve(dir.current, path.dirname(app.entry));
	source = resolvePartialsInSource(this, source, 0, resourcePath, entryPath);
	return callback(null, source);
};