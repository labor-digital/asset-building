# LABOR Asset Building
This package is designed to replace our old build approach using "gulp" 
which used webpack just as a extension to build better encapsulated js scripts. 
In contrast to the old approach this package fully embraces webpack for all
transpiling processes. Be it js, css, sass, or even your assets. 

There are some adjustments to make if you want to migrate your old project but I 
tried to make it as easy as possible for you. For additional information, take a 
look at: **Conversion of old projects**.

As a general rule of thumb: All configuration is now done within your package.json 
file in a node called: "labor". The default configuration is rather simple and
should be more or less agnostic to webpack. If you want more configuration options
when it comes to webpack, you can extend this library using its lightwight 
"Plugin-API" (You can learn mor about plugins in the section **labor -> plugins**). 

**Included webpack modules and plugins:**  

* Copy files with ([copy-webpack-plugin](https://github.com/webpack-contrib/copy-webpack-plugin))
* Build css from sass, scss and less sources ([css-loader](https://github.com/webpack-contrib/css-loader), [sass-loader](https://github.com/webpack-contrib/sass-loader), [less-loader](https://github.com/webpack-contrib/less-loader))
* Extract css files ([mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin))
* Minify css files when using "build" ([optimize-css-assets-webpack-plugin](https://github.com/NMFR/optimize-css-assets-webpack-plugin))
* Transpiling Es6 Js and typescript sources to es5 ([ts-loader](https://github.com/TypeStrong/ts-loader))
* Minify js files when using "build" ([uglifyjs-webpack-plugin](https://webpack.js.org/plugins/uglifyjs-webpack-plugin))
* Automatically add css-prefixes for older browsers: ([Autoprefixer](https://github.com/postcss/autoprefixer))
* Creation of source-maps for js files
* Chunk/Bundle analyzing when using "analyze" ([webpack-bundle-analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer)

**Included webpack modules and plugins * Builder Version 2.0**  

- Import html in javascript ([html-loader](https://webpack.js.org/loaders/html-loader/))
- Image minification when using "build" ([image-webpack-loader](https://github.com/tcoopman/image-webpack-loader))
- Font handling ([file-loader](https://github.com/webpack-contrib/file-loader))
- Output directory cleaning ([CleanWebpackPlugin](https://github.com/johnagan/clean-webpack-plugin))
- Progressbar while building ([progress-bar-webpack-plugin](https://github.com/clessg/progress-bar-webpack-plugin))
- A HTML templating plugin ([Html Webpack Plugin](https://github.com/jantimon/html-webpack-plugin))
- Automatic iconfont generation from svg images ([iconfont-webpack-plugin](https://github.com/jantimon/iconfont-webpack-plugin))
- I implemented a custom sass loader to speed up module based sass compiling
- You can work with dynamic imports everywhere, thanks to an automatic promise polyfill for webpack

## Installation
* Use our private npm registry!
* Install the npm dependency
`` npm install --save-dev @labor/asset-building ``
* Add the following part to your package.json:
```
  "scripts": {
    "build": "labor-asset-building build",
    "watch": "labor-asset-building watch",
    "analyze": "labor-asset-building analyze"
  }
```
* Done! :-)

## Documentation, Options and additional information
To keep this document somewhat short additional documentation is now available in
the "documentation" directory!

## Conversion of old projects
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

## Different config builder versions
The main part of this package is the so called **Config Builder** which takes
your configuration out of the package.json and converts a webpack configuration
out of it. The config is created in javascript and passed to webpack trough the 
[Node.js API](https://webpack.js.org/api/node/) so, don't look around for any 
config files, there will be none.

The generator currently supports two different "versions" which describe different
architectures of your code. This document, especially the **Configuration** section
describes both versions, and their differences. 

**Version 1.0**  
This is basically a carbon copy of our "old" / well known style of 
monolytic application.(sass/scss/less) and application.js files. With version 1.0 
you should be able to transfer all your existing projects to the new asset 
building. That includes a lot of manual labor like copying files to your public 
folder, using relative path's to css assets based on your public path 
and so on. Take a look in the "demo1" directory. **This is the default behavior**

**Version 2.0**  
This version follows the "webpack/angular/vue..." approach, where everything 
you build is seen as a "component" of an app. If you want to you may create
full blown [Web Components](https://www.webcomponents.org) or, as I like to do
create components which still keep their sources like js, css or assets
in a single directory, bound by js includes.

With this version your assets in css files should be defined as path's relative
to your source files, or as node-modules which will be resolved and gathered
in an output directory; when building for production webpack will also
minify your images. When you look into the "demo2" directory you see a basic 
example.
 
## Commands / Modes
By default there are two modes available (There may be more when you extend 
the config builder with plugins). You can run them from your cli when you are 
in the SAME DIRECTORY as your package.json.

`$ npm run build`

This will build your sources in production environment and stop itself.

`$ npm run watch`

This will build your sources in dev environment and keep doing so while it
watches the given entrypoints and their children for changes.

## Typescript, ES6 and Polyfills
Es6 and typescript offer a lot of nice features which will help you getting more 
productive, while **not forcing you** to do anything different than before.

If you want to use es6 code, like arrow functions, constants and classes, just go
for it. All javascript will be piped trough the typescript transpiler which
takes care of the conversion to es5 compatible code. 

**Please note:** There are a lot of es6 features which are not supported by typescript,
like promises, sets, maps and symbols. If you want to use them, we have to provide
so called "polyfills" for older browsers. Those polyfills are provided by another
library which is called [Core-js](https://github.com/zloirock/core-js/tree/v2) of which
we are using version 2.5.x. To keep your files small we only include some basics.
Included polyfills are by default: 

* [core-js/fn/promise](https://github.com/zloirock/core-js#ecmascript-promise)
* [core-js/fn/set](https://github.com/zloirock/core-js#set)
* [core-js/fn/map](https://github.com/zloirock/core-js#map)
* [core-js/fn/object/assign](https://github.com/zloirock/core-js#ecmascript-object)
* [core-js/fn/object/entries](https://github.com/zloirock/core-js#ecmascript-object)
* [core-js/fn/object/keys](https://github.com/zloirock/core-js#ecmascript-object)
* [core-js/fn/array/from](https://github.com/zloirock/core-js#ecmascript-array)

If you want to add additional polyfills for your project, define them using the
"labor -> js -> polyfills" or "labor -> apps -> polyfills" options, depending
on your config builder version.

**A note on typescript** When you want to use typescript, you can but be aware that
we DO NOT USE the typescript typechecker (as it is far to slow). If you want to
use the typechecker anyway define that using the 
"labor -> js -> useTypeChecker" or "labor -> apps -> useTypeChecker" options, 
depending on your builder version.

## CSS Superscript resources
**Only interesting if you are using builder version 2.0**  

One problem one fines him/herself confronted with, when using components instead of monolitic css/sass/less is: All your styles will be compiled encapsulated from each other. Meaning you would have to register all your mixins/variables in every stylesheet you create. While not a real dealbreaker it is (in my opinion) a hassel and not really intuitive.

To solve this, there are already loaders like [sass-resources-loader](https://github.com/shakacode/sass-resources-loader), but they all require configuration in the webpack file, which is (again in my opinion) even less intuitive. So I wrote a simple implementation
of a resource loader which follows "Convetion over configuration".

The convention is: 
* Include (if present) a file called Resources.(sass/scss/less/css) in the same directory as your app's entrypoint.
* Follow the path from the entrypoint's directory down until you end at the current stylesheet.
* Include every Resources.(sass/scss/less/css) file you find on your way. 

As an example:
```
|Components
| |Resources.sass
| |ComponentA
| | |Resources.scss
| | |ComponentA.js
| | |ComponentA.scss
| | |Assets
| | | |myImage.jpg
| |ComponentB
| | |Resources.less
| | |ComponentB.js
| | |ComponentB.less
| | |Assets
| | | |myImage.jpg
|Entrypont.js
|Resources.sass
|GlobalStyle
```

For "ComponentA" the loader will then automatically import the following files, 
at the top of componentA.scss:
* /Resources.sass
* /Components/Resources.sass
* /Components/ComponentA/Resources.scss (mind the extension)

For "ComponentB" the loader will only import:
* /Components/ComponentB/Resources.less

because there are no other resource files matching the file's extension (less).

_A word of caution:_
* Do not include anything that will be actually rendered in CSS, because it will be added to every file the resource loader touches.
* When importing other sass/less files from inside your Resources.sass you your path's should be relative to the current file
* If you are rendering source maps for your css files, this loader will mess up your line numbers!
* This is currently not tested with .less files - but it SHOULD work out of the box...

## Icon Fonts from SVG
The script will now automatically create icon fonts which are specified like this:
```css
a:before {
  font-icon: url('./account.svg');
}
```
For more information see: https://github.com/jantimon/iconfont-webpack-plugin

## Analyze your chunks
When you are working with multiple chunks you will at some point in time want to take a look on what's in those files. We use webpack-bundle-analyzer internally to provide you with that inside. To analyze your chunks call `npm run analyze` and the report will show up in your default browser, after the build finished. 