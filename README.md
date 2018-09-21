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

## Configuration
The webpack configuration depends on the selected version of the config builder.
There are small example configurations to take a look at for version 1.0 at
`demo1/package.json` or at `demo2/package.json` for version 2.0. 

In generall, you begin your configuration by adding a new node called "labor"
to your package.json:
```
{
  "name": "your-app",
  "version": "1.0.0",
  [...]
  "labor": {
    ** Your Config goes here **
  }
}
```

## Options - Both builder versions
__NOTE__: _All options are optional and you can mix am match them as you like._

### builderVersion
This is used to switch the internal config builder version. 
If it is empty / not given the default config builder is version 1.0.
Take a look at **Different config builder versions** if you don't know what 
this is about. If you want to use version 2.0 just specify it using:
```
"labor": {
    "builderVersion": 2,
    "apps": [...]
}
```

### copy
There are a lot of usecases where you have to automatically copy files from a 
destination to a output directory. You can have multiple copy-jobs for a 
single project, so make sure that your "copy" node is an array of 
configuration objects.

This option is build on top of the "copy-webpack-plugin". Take a look at their 
[Documentation](https://github.com/webpack-contrib/copy-webpack-plugin) for how to 
use it in detail. In this example we will only take a look at the defaults and the 
minor syntaxchange we made.

**The change**: by default you can only copy files from a single source into an 
output directory. I changed it so that "from" can also work with arrays of sources.
Apart from that everything is straight forward. 

Say what (from) is copied, where (to) and you should be good to go. 
If you want to exclude some files you can always use "ignore" for that. 
Keep in mind that both, "from" and "ignore" support glob values. 
If you don't want to flatten everything into a directory set "flatten: true" 
and you are set.
```
"labor": {
    "copy": [
        {
            "from": [
                "assets/a/*",
                "./assets/b/**/b2.png",
                "./assets/**/asset.png"
            ],
            "to": "webroot/assets",
            "ignore": ["*.jpg", "assets/a/c"],
            "flatten": false
        }
    ]
}
```
### plugins
With this set of tools you should be able to do the same stuff you did with our 
old gulpfile without problems. But if you want to dive deeper, or want to edit 
the webpack config manually. You can also write a (really simple) plugin.
The list of defined plugins is an Array of pathes which will be resolved as 
node require(). More information can be found in the **Plugins** section.
```
"labor": {
    "plugins": [
        "./demoPlugins/DemoPlugin.js",
        "@labor/your-packge/plugins/MyPlugin"
    ]
}
```

### webpackConfig
There might be a time where our preconfigured webpack is not enough for your needs,
in that case you can always alter the webpack configuration using this option.

Because the webpack config is mostly a js object we need to extend it using 
javascript as well. To do so, lets create a new file called webpack.js in your 
project root:
```javascript
const merge = require('webpack-merge');
module.exports = function(webpackConfig, context){
	return merge(webpackConfig, {
		// Additional configuration for webpack...
	});
};
```

To tell the config builder to use your configuration file, add the script
with a path, relative to your package.json to your labor configuration.
```
"labor": {
    "webpackConfig": "./webpack.js"
}
```

Now, when the configuration was prepared by the config builder the defined
callback will receive the current configuration and can alter it.

**Parameters**

* webpackConfig: The prepared webpack configuration
* context: The current config builder context. See **Config Builder Context**

**Important**: The function has to return the altered webpack config!

**Differences between config builder versions**: While version 1.0 will pass you 
an javascript object literal containing the webpack config, version 2.0 will
pass an array of multiple configurations, one for each app. 

## Options - Version 1.0

### js
This configuration has to be an array, as you may have multiple combinations of 
entry points and output files. The basic rule is, that webpack loads your "entry" 
file and converts it into the "output" file, combining all included files into on.
The filepaths have to be relative to your package.json.

By default the script will assume you are writing es6 or Typescript and
transpile it down to es5, so it is compatible to IE10 and higher. 

If the "build" mode is used the scripts will be minified and linted using eslint.

Sourcemaps of your files will automatically created at OUTPUT_FILE.map.
```
"labor": {
  "js": [
    {
      "entry": "./webroot/js/application.js",
      "output": "webroot/js/bundle.js"
    }
  ]
}
```

**Polyfills** As stated in the section **Typescript, ES6 and Polyfills** you
may also define polyfills that should be provided for your application. Those
will be added to the default polyfills which are always provided.
```
"labor": {
  "js": [
    {
      [...]
      "polyfills": ["core-js/fn/array/fill"]
    }
  ]
}
```

**Typescript Typechecker** By default we use ts-loader's "transpileOnly" option
to save a lot of time while compiling your scripts. If you want to use
the typescript-typechecker set this option to true. *Note from the author: 
Get a cup of coffee, this will take a while*
```
"labor": {
  "js": [
    {
      [...]
      "useTypeChecker": true
    }
  ]
}
```

### jsCompat
Sometimes you have to fix an old JS library which does not work nice with webpack. 
In this case the "imports-loader" comes to your rescue.
This configuration registers the module and make it a little bit easier to write.
For all configuration options take a look at [imports-loader](https://github.com/webpack-contrib/imports-loader).

As general rule => test and fix => loader in the other documentation.

* "test" is a regex of a filename
* "fix" is the definition for the imports-loader, eg a mapping of one value to 
another

```
"labor": {
  "jsCompat": [
    // A simple remapping of one value to another
    {
      "rule": "my-file\\.js$",
      "fix": "win=>window"
    },
    // Some JS libs need specially point e.g. "this" to "window".
    {
      "rule": "my-old-lib\\.js$",
      "fix": "this=>window"
    }
  ]
}
```

### css
The general idea is exactly the same as with "js", but for, well, css files. 
You can also have multiple combinations of entry points and output files. So 
the "css" option has to be an Array containing your combinations as well. 
The filepaths have to be relative to your package.json.

Valid file extensions are currently .css, .less, .scss and .sass. 
In general you should keep your entrypoint in the same language as the rest 
of your styles, but you can mix and match between multiple languages. 
For advanced configuration of stylesheet building, take a look at 
"demo1/webroot/css/src/frontend/frontend.css". 

If the "build" mode is used the scripts will be minified automatically.

Sourcemaps of your files will automatically created at OUTPUT_FILE.map.
```
"labor": {
  "css": [
    {
      "entry": "./webroot/css/src/backend/backend.sass",
      "output": "webroot/css/backend.css"
    },
    {
      "entry": "webroot/css/src/frontend/frontend.css",
      "output": "./webroot/css/frontend.css"
    }
  ]
}
```

## Options - Version 2.0

### apps
When you are using the version 2.0 of the configuration the configuration 
is no longer split into multiple nodes, because we follow webpack's approach to 
import all sources in a single "app" source file. 
**Make sure you set builderVersion to 2!**

For this reason you create an app with an entrypoint and specify it's output 
directory / file name. 
```
"labor": {
  "builderVersion": 2,
  "apps": [
    {
      "entry": "./src/app.js",
      "output": "./dist/bundle.js",
    }
  ],
}
```
There are also some additional configuration options you might want to use,
those can be specified for each app.

#### app.publicPath & app.publicPathDev
To make sure your path's can be resolved propperly on your webserver you may use 
"publicPath" to define the url/directory which leads to the output files. 

If your path on your local machine is different from your productive publicPath 
use "publicPathDev" too (publicPath is used for "build", 
"publicPathDev" is preferred when using "watch").
```
"labor": {
  "builderVersion": 2,
  "apps": [
    {
      [...]
      "publicPath": "dist/",
      "publicPathDev": "web/frontend/",
    }
  ],
}
```

#### app.polyfills
As stated in the section **Typescript, ES6 and Polyfills** you
may also define polyfills that should be provided for your application. Those
will be added to the default polyfills which are always provided.
```
"labor": {
  "apps": [
    {
      [...]
      "polyfills": ["core-js/fn/array/fill"]
    }
  ]
}
```
#### app.useTypeChecker
By default we use ts-loader's "transpileOnly" option
to save a lot of time while compiling your scripts. If you want to use
the typescript-typechecker set this option to true. *Note from the author: 
Did you came by the other option js.useTypeChecker and I told yhou this would take a
while? Yeah, typescript is still compiling... So get another cup of coffee...*
```
"labor": {
  "js": [
    {
      [...]
      "useTypeChecker": true
    }
  ]
}
```

#### app.minChunkSize
When you are using webpack's [dynamic imports](https://webpack.js.org/guides/code-splitting/)
webpack will create multiple "chunks", some of them might be tiny and create more
http overhead/slowdown than they save. To counteract that we set the minimum chunk size to 10kb.
Everything else will be bundled in the main output file.

But maybe thats not enough, or to much? Set this value to any number of bytes
you want to use as limit for resource chunk splitting. Setting this value to 0 
will disable this feature and we use webpack's default chunk building.
```
"labor": {
  "builderVersion": 2,
  "apps": [
    {
      [...]
      "minChunkSize": 10000
    }
  ],
}
```

## Plugins
In general a plugin is a simple node module in form of a function. 
The simplest plugin you may write is:
```javascript
module.exports = function () { };
```
It doesn't do anything but you can register it as plugin and use it as a 
base of operations. To interact with the config builder you can use hooks 
which are defined in the following sections.

**Note** The hooks are listed in the order they will be executed in.

#### getModes(modes)
There can be multiple "tasks" or "modes" in the asset builder. 
A mode is the word which comes after "labor-asset-building $mode" in your 
script section. The mode defines for example if webpack should "watch" the source 
files and automatically recompile, or to "build" to output for production.
You can use this hook to add additional modes other tasks you can think of.

This method will get an Array of already registered modes and should return 
an altered version of it.
```javascript
module.exports = function () {
    this.getModes = function(modes){
        return modes.concat(['test']);
    };
};
```

#### isProd(isProd, mode)
Webpack differentiates between "production" and "development". 
By default "build" will set the mode to "isProd = true", while all other
modes will leave the sate at "isProd = false". Your plugin can determine 
if the mode is production or not in this method.
```javascript
module.exports = function () {
    this.isProd = function(isProd, mode){
        return isProd || mode === 'test';
    };
};
```

#### filterLaborConfig(laborConfig, context)
This method can be used to filter the package.json -> labor configuration before
the config builder uses it to configure webpack.

**Note** From here on up, all hooks receive the config builder context. 
For a detailed documentation take a look at the **Config Builder Context**
```javascript
module.exports = function () {
    this.filterLaborConfig = function(laborConfig, context){
        if(context.isProd) delete laborConfig.copy;
        return laborConfig;
    };
};
```

#### filterTypescriptOptions(tsLoaderOptions, context)
This hook can be used to change ts-loader options.
```javascript
module.exports = function () {
    this.filterEslintOptions = function(tsLoaderOptions, context){
        tsLoaderOptions.transpileOnly = false
        return tsLoaderOptions;
    };
};
```

#### filterJsPolyfills(polyfills, context)
This hook can be used to change which core-js polyfills shall be included in the package.
It is called **after** the configured polyfills have been merged into the default polyfills.
```javascript
module.exports = function () {
    this.filterJsPolyfills = function(polyfills, context){
        return polyfills.filter(v => v !== 'core-js/fn/promise')
    };
};
```

#### filterEslintOptions(eslintOptions, context, type)
This hook can be used to add or remove eslint options before the module is created.
The function is called twice. Once for the "js-lint" and once for the "ts-lint" instance.
To determine which instance should be configured currently use the **type** parameter.
Possible values are: **javascript | typescript**
```javascript
module.exports = function () {
    this.filterEslintOptions = function(eslintOptions, context, type){
        eslintOptions.rules['no-console'] = 1
        return eslintOptions;
    };
};
```

#### getJsProvides(provides, context)
To make js objects like the "$" in jQuery globally available without including 
it in every fileyou can "provide" certain variables using the webpack 
ProvidePlugin. But because there are issues when you create multiple providePlugin 
instances this hook should help you with that. Just add your provided var to the 
list of "provides" as you would in your providePlugin and you are good to go.
```javascript
const path = require('path');
module.exports = function () {
    this.getJsProvides = function(provides, context){
        // Note context.dir.current is the directory where the package.json lives.
        provides['$'] = path.resolve(context.dir.current, 'jquery-3.2.1.js');
        provides['jQuery'] = path.resolve(context.dir.current, 'jquery-3.2.1.js');
    	return provides;
    };
};
```

#### filterCleanOptions(configuration, context)
**Only used in config builder 2.0**  
The second version of the config builder uses [clean-webpack-plugin](https://github.com/johnagan/clean-webpack-plugin)
to flush the output directory. This hook can be used to filter it's options

Children of configuration:

* directories: The list of all directories to flush, relative to the "root" directory.
* options: The preconfigured options

```javascript
module.exports = function () {
    this.filterCleanOptions = function(configuration, context){
        configuration.directories.push('foo');
        return configuration;
    };
};
```

#### filter(webpackConfig, context)
It is called right after the config builder finished generating the configuration
and before is merged with the custom webpack config provided by labor.webpackConfig.
That hook is the perfect place to add additional loaders, plugins or anything 
else to the configuration, because the internal configuration building is 
already done.
```javascript
module.exports = function () {
    this.filter = function(webpackConfig, context){
        webpackConfig.modules.rules.push({
            test: /(jquery\.waitforimages|jquery\.themepunch\.tools\.min|crum-mega-menu|isotope\.pkgd\.min|theme-plugins\.min|ScrollMagic\.min|animation\.velocity\.min)+\.js/,
            loader: "imports-loader?define=>false,require=>false,exports=false"
        });
        return webpackConfig;
    };
};
```

#### filterContextBeforeCompiler(context)
This hook is called after the config was enriched with the custom webpack config 
provided by labor.webpackConfig.

#### compilingDone(output, context)
This hook is called every time the webpack compiler is finished with its work. 
It receives the result of webpack's ["stats.toJson()"](https://webpack.js.org/configuration/stats/).
Please note, that the value of "output" is rendered using different configuration 
based on the current config builder version.

## Config Builder Context
When you start extending the config builder with your own plugins, or webpack
config you will encounter the config builder context. It is an object
which holds a lot of information around the current configuration you 
may use for your current task of setting up webpack.

* **builderVersion:** The version number of the current config builder
* **currentApp:** Only used in version 2 of the builder. The numeric zero-based index of the app which is currently compiled.
* **isProd:** True if this build should be executed as webpack's "production" mode
* **mode:** The mode key which was given as cli parameter
* **laborConfig:** Contains the configuration given in the package.json in the "labor" node
* **webpackConfig:** Contains the webpack configuration we are currently working on
* **plugins:** The list of plugininstances that are currently registerd in the package.json
* **dir:** Frequently used path of this context
	* **current:** The current working directory
	* **controller:** The directory of the asset-building controller
	* **nodeModules:** The absolute path to the current base package's node modules
	* **buildingNodeModules:** The absolute path to the asset-building's node modules
	* **packageJson:** The absolute path to the base package's package.json
* **callback:** The callback for the webpack compiler
* **callPluginMethod(method, args)**
Internal helper to loop over all plugin instances and call a requested method on 
them.The given arguments should be an array. If the method returns a value args[0] 
will automatically be reset to the result. With that it is possible to pass a 
value through all plugin instances to filter it.

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

## Long post
Well you made it to the end. Here is your [potato](https://acumagnet.wordpress.com/2014/12/29/sorry-for-the-long-post-heres-a-potato-comes-from-glados-in-portal-2/)
```
              .-"'"-.
             |       |  
           (`-._____.-')
        ..  `-._____.-'  ..
      .', :./'.== ==.`\.: ,`.
     : (  :   ___ ___   :  ) ;
     '._.:    |0| |0|    :._.'
        /     `-'_`-'     \
      _.|       / \       |._
    .'.-|      (   )      |-.`.
   //'  |  .-"`"`-'"`"-.  |  `\\ 
  ||    |  `~":-...-:"~`  |    ||
  ||     \.    `---'    ./     ||
  ||       '-._     _.-'       ||
 /  \       _/ `~:~` \_       /  \
||||\)   .-'    / \    `-.   (/||||
\|||    (`.___.')-(`.___.')    |||/
 '"' jgs `-----'   `-----'     '"'
```