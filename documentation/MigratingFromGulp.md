# Conversion of old projects
**This is probably only for LABOR staff, as the gulp file never was open source.**

To convert your old projects is probably a rather big step, but in most cases
it will be worth it. In contrast to the old "gulp" approach this package aims to
provide a "meta-configuration" which is agnostic to the real implementation
of the package generation. So instead of the problems in gulp where we could never
update our sources without a rewrite of our configuration, you can easily update
the asset-builder package and use the latest version.

Anyway, befor you start to convert your projects it is highly recommended
to check out the rest of this documentation, as it will explain a lot by itself.

In addition to that:

* When you are converting the "jsConfig":
 	* copy the value `jsConfig -> baseDir`,
 	add "/application.js" behind it and paste it as `js -> entry`.
	* copy the value `jsConfig -> distDir` add "bundle.js" behind it 
	and paste it as `js -> output`
	* When porting from a gulpfile v2.0.8 or higher "jsConfig" will 
	be named "webpackConfig".
	* When porting from a gulpfile less than v2.0.8 there additional
	changes will be required, because you need to introduce node-imports,
	as they will no longer be auto-resolved
	* Make sure you remove no longer needed files, like: first.js, last.js, base.framework.js, base.last.js and jQuery-3.2.1.js
* When you are converting the "cssConfig":
 	* copy the value `cssConfig -> baseDir`,
 	add "/application.(sass/less/scss)" behind it and paste it as `css -> entry`.
 	* copy the value `cssConfig -> distDir` add `cssConfig -> distName` in addition of ".css" 
 	behind it and paste it as `css -> output`	
* There is no replacement for "fontConfig", you probably want to use "copy" for that now.
* To convert "fileCopyConfig":
	* copy your contents of `fileCopyConfig -> files` to `copy -> from`
	* copy the contents of `fileCopyConfig -> distDir` to `copy -> to`
	* Make sure to check the `copy -> flatten` option if required.