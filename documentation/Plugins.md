# Plugins
In general a plugin is a simple node module in form of a function. 
The simplest plugin you may write is:
```javascript
module.exports = function () { };
```
It doesn't do anything but you can register it as plugin and use it as a 
base of operations. To interact with the config builder you can use hooks 
which are defined in the following sections.

**Note** The hooks are listed in the order they will be executed in.

## getModes(modes)
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

## getMode(mode, modes)
Can be used to set or filter the application mode that was given.
If "mode" is an empty string, there was no mode given.

## isProd(isProd, mode)
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

## filterLaborConfig(laborConfig, context)
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

## getEnvironmentHandlers(handlers<Map>, context)
Can be used to inject additional environment handlers into the list.
The handler key should always be a lowercase string! The value a class with a public interface:
- init(context) <- Called directly after the environment is instatiated
- isComponentEnabled(state, key, context) <- Same as the plugin variant, but takes priority
- afterComponent(context, key) <- Executed after a component was aplied
- apply(context) <- Should do the main changes to webpack config

## getEnvironment(environment, environmentHandlers, context)
Can be used to filter the environment dynamically.

## filterComponents(components, context)
Can be used to filter the list of used components or to add additional components
to the stack.

## isComponentEnabled(state, key, context)
Should return true if a component with the given key is enabled, false if it should be ignored
Note that the environment takes precidence over plugin settings

## beforeComponent(context, key)
Is called before a component with the given "key" is applied to the config.

## afterComponent(context, key)
Is called after a component with the given "key" is applied to the config but before the environment is applied.

## filterLoaderTest(regex, type, context)
Can be used to filter the regular expression that is used for a loader's test
Type defines the loader that currently gets it's config filtered. Is called for every loader that the library injects
Types are (not ordered):
- jsLintLoader
- tsLintLoader
- fontLoader
- htmlLoader
- imageLoader
- lessLoader
- sassLoader
- tsJsPreLoader
- typescriptLoader

## filterLoaderConfig(config, type, context)
Can be used to filter the configuration for every loader we create in the webpack config.
Type defines the loader that currently gets it's config filtered. Is called for every loader that the library injects
See filterLoaderTest() for the used types

## filterPluginConfig(config, type, context)
Is called right before a new webpack plugin instance is injected into the webpack config.
Type defines the plugin that is currently configured
Types are (not ordered):
- copyPlugin
- cleanOutputDirPlugin
- cssExtractPlugin
- htmlPlugin
- minChunkSizePlugin
- providePlugin

## filterExcludePattern(pattern, request, basePattern, context)
Can be used to change the exclude pattern for some webpack loaders.
The **pattern** is either undefined or a regex like basePattern.
The **request** defines which loader requests the exclude pattern. Options are: "typescript", "tsJsPreLoaders" and "esLint", 
named after the components they are used in.
The **basePattern** is used by default and is a regex like: ``/node_modules(?![\\/\\\\]@labor[\\/\\\\])/``,

## filterTypescriptOptions(tsLoaderOptions, context)
This hook can be used to change ts-loader options.
```javascript
module.exports = function () {
    this.filterEslintOptions = function(tsLoaderOptions, context){
        tsLoaderOptions.transpileOnly = false
        return tsLoaderOptions;
    };
};
```

## filterJsPolyfills(polyfills, context)
This hook can be used to change which core-js polyfills shall be included in the package.
It is called **after** the configured polyfills have been merged into the default polyfills.
```javascript
module.exports = function () {
    this.filterJsPolyfills = function(polyfills, context){
        return polyfills.filter(v => v !== 'core-js/fn/promise')
    };
};
```

### filterJsPreLoaders(jsPreLoaders, context)
This hook can be used to add additional javascript preloaders into the stack
```javascript
module.exports = function () {
    this.filterJsPreLoaders = function(jsPreLoaders, context){
    	jsPreLoaders.push(require($MY_LOADER));
        return jsPreLoaders
    };
};
```

## filterEslintOptions(eslintOptions, context, type)
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

## browserListFilter(browserList, context)
PostCss uses a [Browserlist](https://github.com/browserslist/browserslist#best-practices) to determine which plugin it should use and how. By default our script uses "> 1%, last 10 versions". You can use this hook to change the default.
## postCssPluginFilter(plugins, context)
Is used to filter and modify the list of postCss plugins (by default only autoprefixer)

## getJsProvides(provides, context)
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

## filterHtmlTemplate(template, context)
Can be used to filter the given template for the "HtmlWebpackPlugin". The given
template is always an object, even if the laborConfig says only "true". 

## filterCleanOptions(configuration, context)
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

## filter(webpackConfig, context)
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

## filterContextBeforeCompiler(context)
This hook is called after the config was enriched with the custom webpack config 
provided by labor.webpackConfig.

## alternativeCompiler(useDefaultCompiler, webpack, callback, context)
Allows plugins to completely replace the webpack call. If your hook returns FALSE the 
webpack() function in Controller.js is omitted so that your logic can take over and
create its own webpack instances. useDefaultCompiler tells you if one of the plugins
before the current one already disabled the default compiler. Webpack holds the 
reference to the webpack API. The callback is the prepared wrapper around context.callback.

## customSassLoaderFileExtensionFallback(ext, stylesheetPath, resourceQuery, source, context)
This hook is only executed if the custom sass loader is used. In some edge-cases, like
vue single file components the stylesheetPath does not end with .sass or .scss on which the sass
loader relies to determine how to parse the file. 

This hook can be used to find the source's real extension and to inject it back
into the loader.

## compilingDone(output, context)
This hook is called every time the webpack compiler is finished with its work. 
It receives the result of webpack's ["stats.toJson()"](https://webpack.js.org/configuration/stats/).
Please note, that the value of "output" is rendered using different configuration 
based on the current config builder version.

## filterChildStats(child, context)
This hook is called after compilingDone and executed for each app your package has registered.
The value behind "child" is the output of stats.children[$child]

## callbackDone(context)
The last possible callback