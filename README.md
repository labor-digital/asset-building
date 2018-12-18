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
* Linting javascript ([eslint-loader](https://github.com/webpack-contrib/eslint-loader))
* Minify js files when using "build" ([uglifyjs-webpack-plugin](https://webpack.js.org/plugins/uglifyjs-webpack-plugin))
* Creation of source-maps for js files

**Included webpack modules and plugins * Builder Version 2.0**  

* Import html in javascript ([html-loader](https://webpack.js.org/loaders/html-loader/))
* Image minification when using "build" ([image-webpack-loader](https://github.com/tcoopman/image-webpack-loader))
* Font handling ([file-loader](https://github.com/webpack-contrib/file-loader))
* Output directory cleaning ([CleanWebpackPlugin](https://github.com/johnagan/clean-webpack-plugin))
* Progressbar while building ([progress-bar-webpack-plugin](https://github.com/clessg/progress-bar-webpack-plugin))
* A HTML templating plugin ([Html Webpack Plugin](https://github.com/jantimon/html-webpack-plugin))
* I implemented a custom sass loader to speed up module based sass compiling
* You can work with dynamic imports everywhere, thanks to an automatic promise polyfill for webpack
* A custom component loader to keep component compiling lightning fast

## Installation
* Use our private npm registry!
* Install the npm dependency
`` npm install --save-dev @labor/asset-building ``
* Add the following part to your package.json:
```
  "scripts": {
    "build": "labor-asset-building build",
    "watch": "labor-asset-building watch"
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

## Component Loader
**Only interesting if you are using builder version 2.0**  
When you are working with the concept of "web components" you will probably end up
with a directory structure similar to:
```

|componentA
| |componentA.js
| |componentA.scss
| |assets
| | |myImage.jpg
|componentB
| |...
|app.js
```

In your "componentA.js" you will have something like:
```javascript
import "./componentA.sass"
console.log('something with javascript');
```

In your "app.js" you will have stuff like:
```javascript
import "./componentA/componentA.js";
import "./componentB/componentB.js";
//...
```

Internally webpack will not compile all your .sass/.less files in their own context,
means there is no interaction between the compiler instances. Which leads to really
long execution times. Because every time all your mixins and vars you use
as resources have to be parsed anew, to end up in the same css file anyway. 

Component loader tries to minimize the overhead of compiling css superscripts
as separate files but combines all styles of a "set of components" into a single
file which is than compiled only once, without hitting your performance.

To keep the components agnostic to your applications infrastructure I tried to
create a loader which does not interfere with your components but only your app.
When you start using the component loader go to your "app.js" and change the following:
```javascript
// Comment this out
// import "./components/componentA/componentA.js";
// import "./components/componentA/componentB.js";

// Add this
import "@components";
```

The component loader will now detect that all components should be added
and compiled as a bundle. It will traverse the **current directory** and look
into its child-directories. **If there is a file that matches the child-directory name**
it will be used as an entry file. Possible extensions are "ts, tsx, js, sass, scss, less, css",
the first matching extension wins. Which means, your component does not have a javascript
file to begin with, if there is a file like: "componentC/componentC.sass" 
this file will be used as entry point.

If a javascript file is used as entrypoint the component loader will scan it
for stylesheet dependencies. In our "componentA.js" it would find (import "./componentA.sass")
which then is extracted and added to the list of stylesheets to be compiled as bundle.

You have nothing to worry about from here on, because everything should be taken
care of automagically. 

To exclude specific components you can use a construct like:
```javascript
import "@components@exclude:componentA,componentD"
```

**But what about...**

* dynamic imports of stylesheets? Dynamic imports will be ignored.
* my web-components where I need the css inside my javascript? 
Only generic imports that do not alias the content will be stripped by the component loader.

## CSS Superscript resources
**Only interesting if you are using builder version 2.0**  
**!!CURRENTLY ONLY WORKS FOR SASS/SCSS!!**  
As you learned in the **Component Loader** section all css superscript sources
will be compiled separate from each other, even when using component loader
you might end up with multiple compilers (for example when using dynamic imports).

But where do your mixins / variables end up? That is a good question, that is often
ignored when it comes to webpack documentation. 

To solve this I added a so called "Resource handling". Which means you can put all
your resources (mixins, vars, and so on) to a file which is called exactly the same
ass your app entry point but has a "-resources.(sass/scss/less)" extension.
For example: Entrypoint: app.js; Resources for Sass: app-resources.sass in the
same directory as app.js

What happends if you add such a resource file is, that the compile will automatically
insert the content of this file to the beginning of all your other files 
of the same type.

**NOTE** This currently works only for sass/scss files, because I didn't need
it anywhere else. If you are interested of using builder version 2.0 and this
is a neckbreaker for your, just ask and I will implement that feature for less
as well :)