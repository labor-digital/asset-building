# Extending the Asset Builder
With the given set of tools you should be able to do the same stuff you did with our 
old gulpfile without problems. But if you want to dive deeper, or want to edit 
the webpack config manually you can use either the "webpackConfig" option or
create an extension that can use the provided hooks to alter the configuration.

Extensions are meant to create reusable packages to the asset builder that may 
require their own webpack plugins or loaders, while the "webpackConfig" option
is intended an "per-project" alternative that requires no further understanding of the
structure. 

Extensions can supplied either as "global" extension in the labor root, or as
a "per-app" extension if you using builderVersion 2.

## Registering extensions
On a global scale: 
```
"labor": {
    "extensions": [
        "./extensions/MyDemoExtension.js",
        "@labor-digital/your-packge/asset-building"
    ]
}
```

On an per-app scale (only for builderVersion 2):
```
"labor": {
  "apps": [
    {
      "extensions": [
          "./extensions/MyDemoExtension.js",
          "@labor-digital/your-packge/asset-building"
      ]
    }
  ]
}
```

## Writing extensions
Writing extensions is fairly simple. You can write them either in typescript or plain old javascript.
You have to create a new file that exports a function by default. The function will receive two arguments.
The first argument is the context. The context holds all information about the current environment and built app definition.
It also holds the eventEmitter that allows you to bind your own handlers to the internal hooks of the asset builder.

As you see in the typescript definition, the context is either an object of type "WorkerContext" or "CoreContext".
The difference is, that global extensions will receive the instance of the "CoreContext", while "per-app" extensions
will receive the "WorkerContext". The WorkerContext has more detailed information about the app as the CoreContext. 

The "scope" defines if the extension is called either global, or as a per app basis.

Per-App extensions will be executed once for every app they were registered in. Note however, that the workers will all 
run in separate processes that can't communicate with each other.

### As JS:
```js
module.exports = function (context, scope) {
    // Do stuff
};
```
### As Typescript:
```typescript
import {WorkerContext} from "@labor-digital/asset-building/dist/Core/WorkerContext";
import {CoreContext} from "@labor-digital/asset-building/dist/Core/CoreContext";
export default function (context: WorkerContext|CoreContext, scope: "app" | "global") {
	// Do stuff
}
```

## Using hooks
The asset builder is littered with hooks you can use in your extension to filter the default configuration or to inject your own webpack configuration options.
To use the eventEmitter you can simply access the context's eventEmitter property. It should show you the required auto-completion options.
For a definition of the possible event names take a look at the "AssetBuilderEventList" enum object.

Each listener you register on a hook will receive an event object as parameter. The event will
always contain a property called "args". The "e.args" property holds additional information
about the hook and the payload your listener should filter.

```typescript
import {WorkerContext} from "@labor-digital/asset-building/dist/Core/WorkerContext";
import {CoreContext} from "@labor-digital/asset-building/dist/Core/CoreContext";
import {AssetBuilderEventList} from "@labor-digital/asset-building/dist/AssetBuilderEventList";
export default function (context: WorkerContext|CoreContext, scope: "app" | "global") {
	(context as CoreContext).eventEmiter.bind(AssetBuilderEventList.CALLBACK_DONE, (e) => {
	    // Show the arguments that were passed by the hook emitter
	    console.log(e.args);
    })
}
```

Your bound listeners can either by sync or async. If you are running an async task in your listener
just return a promise object. The eventEmitter will wait until the returned promise
is resolved before the next listener is called. So you can filter the given arguments
even if you depend on asynchronous actions.

## A note on the builder architecture
The asset-builder is basically a list of default "configurator" objects. Each of those objects
will add its own configuration to the webpack configuration object. Each of the core configurators 
is represented by an "identifier". The list of identifiers can be found in the "AssetBuilderConfiguratorIdentifiers" enum.
The configurators are executed in the sequence that is defined in the "WebpackConfigGenerator" class.

Your extension can, if need be disable specific configurators or completely replace them with an extended version by using the FILTER_CONFIGURATOR hook.

## Hooks for global extensions

#### AssetBuilderEventList.SHUTDOWN
Is called if either the main process or a worker process detected a shutdown signal

#### AssetBuilderEventList.FILTER_LABOR_CONFIG
This hook can be used to filter the package.json -> labor configuration before
the config builder uses it to configure webpack.

#### AssetBuilderEventList.GET_MODES
There can be multiple "tasks" or "modes" in the asset builder. 
A mode is the word which comes after "labor-asset-building $mode" in your 
script section. The mode defines for example if webpack should "watch" the source 
files and automatically recompile, or to "build" to output for production.
You can use this hook to add additional modes other tasks you can think of.

#### AssetBuilderEventList.GET_MODE
Can be used to set or filter the application mode that was given.
If "mode" is an empty string, there was no mode given.

#### AssetBuilderEventList.IS_PROD
Webpack differentiates between "production" and "development". 
By default "build" will set the mode to "isProd = true", while all other
modes will leave the sate at "isProd = false". Your plugin can determine 
if the mode is production or not in this method.

#### AssetBuilderEventList.AFTER_MAIN_INIT_DONE
This hook is called after the main process finished it's bootstrap
and before it starts to spawn the worker processes.

## Events for global and app-based extensions

#### AssetBuilderEventList.FILTER_APP_DEFINITION_SCHEMA
The asset builder will apply a validation schema to each app definition object when the worker process starts.
This schema is used to set default values and to validate the input before we start the configuration.
Your extension may use this hook to register additional properties to the schema. The schema is based on helferlein's makeOptions() function.

#### AssetBuilderEventList.AFTER_WORKER_INIT_DONE
This hook is called after a worker process it's bootstrap and before it
starts to create the webpack configuration object.

#### AssetBuilderEventList.FILTER_CONFIGURATOR
This hook is called for each built-in configurator. It can be used to either
disable a single configurator or to replace it with an extended version.

#### AssetBuilderEventList.BEFORE_CONFIGURATOR
Is called right before a configurator will be executed

#### AssetBuilderEventList.AFTER_CONFIGURATOR
Is called right after a configurator was executed

#### AssetBuilderEventList.FILTER_LOADER_CONFIG
Can be used to filter the configuration for every loader we create in the webpack config.
The event will tell you which loader is currently configured using the "identifier" property.

#### AssetBuilderEventList.FILTER_LOADER_TEST
Can be used to filter the regular expression that is used for a loader's test
The event will tell you which loader is currently configured using the "identifier" property.

#### AssetBuilderEventList.FILTER_PLUGIN_CONFIG
Is called right before a new webpack plugin instance is injected into the webpack config.
The event will tell you which plugin is currently configured using the "identifier" property.

#### AssetBuilderEventList.FILTER_POLYFILLS
This hook can be used to change which core-js polyfills shall be included in the package.
It is called **after** the configured polyfills have been merged into the default polyfills.

#### AssetBuilderEventList.GET_JS_PROVIDES
To make js objects like the "$" in jQuery globally available without including 
it in every file you can "provide" certain variables using the webpack 
ProvidePlugin. But because there are issues when you create multiple providePlugin 
instances this hook should help you with that. Just add your provided var to the 
list of "provides" as you would in your providePlugin and you are good to go.

#### AssetBuilderEventList.FILTER_JS_PRE_LOADERS
This hook can be used to add additional javascript preloaders into the stack

#### AssetBuilderEventList.FILTER_JS_EXCLUDE_PATTERN
Can be used to change the exclude pattern for some webpack loaders.
The **pattern** is either undefined or a regex like basePattern.
The **identifier** defines which loader requests the exclude pattern. Options are: "typescript", "tsJsPreLoaders", 
named after the components they are used in.
The **basePattern** is used by default and is a regex like: ``/node_modules(?![\\/\\\\]@labor[\\/\\\\])/``,

#### AssetBuilderEventList.FILTER_TYPESCRIPT_OPTIONS
This hook can be used to change ts-loader options.

#### AssetBuilderEventList.FILTER_POSTCSS_PLUGINS
Is used to filter and modify the list of postCss plugins (by default only autoprefixer and iconfont-webpack-plugin)

#### AssetBuilderEventList.FILTER_BROWSER_LIST
PostCss uses a [Browserlist](https://github.com/browserslist/browserslist#best-practices) to determine which plugin it should use and how. By default our script uses "> 1%, last 10 versions". You can use this hook to change the default.

#### AssetBuilderEventList.FILTER_WARNING_TO_IGNORE_PATTERNS
Can be used to configure the list of regex's that will be used in WebpackFilterWarningsPlugin

#### AssetBuilderEventList.FILTER_HTML_PLUGIN_TEMPLATE
an be used to filter the given template for the "HtmlWebpackPlugin". The given
template is always an object, even if the laborConfig says only "true". 

#### AssetBuilderEventList.APPLY_EXTENSION_WEBPACK_CONFIG
This hook is called after the config generator finished applying all built-in configurator to the webpack config object.
You should use it to add your own webpack configuration to the object if you need to.

#### AssetBuilderEventList.FILTER_WEBPACK_CONFIG
It is called right after the config builder finished generating the configuration
and before is merged with the custom webpack config provided by webpackConfig.
This is your last change to modify the webpack config before it is passed to webpack.

#### AssetBuilderEventList.FILTER_WEBPACK_COMPILER
This hook allows you to either completely remove webpack as a compiler or supply a wrapper for it.
Additionally you can change the callback that is called after webpack finished it's process. 

#### AssetBuilderEventList.COMPILING_DONE
Only if the default callback is used!
This hook is called every time the webpack compiler is finished with its work. 
It receives the result of webpack's ["stats.toJson()"](https://webpack.js.org/configuration/stats/).

#### AssetBuilderEventList.BEFORE_GIT_ADD
Is called before the webpack callback handler automatically adds the dist files to the git repository.
So if you want to emit your own output, this is the place to do it.

#### AssetBuilderEventList.CALLBACK_DONE
The last possible callback for a single lifecycle

## Events for built-in loaders

#### AssetBuilderEventList.SASS_LOADER_FILE_EXTENSION_FALLBACK
This hook is only executed if the custom sass loader is used. In some edge-cases, like
vue single file components the stylesheetPath does not end with .sass or .scss on which the sass
loader relies to determine how to parse the file. 

This hook can be used to find the source's real extension and to inject it back
into the loader.
