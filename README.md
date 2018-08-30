# LABOR Asset Building
This package is designed to replace our old build approach using "gulp" which used webpack just as a extension to build better encapsulated js scripts. This bundle goes the whole way and completely removes the gulp pipeline and works exclusivly with webpack. 

There are some adjustments to make if you want to migrate your old project but I tried to make it as easy as possible for you.

As a general rule of thumb: All configuration is now done within your package.json file in a node called: "labor", but you can also extend this library using "plugin" to get access to the real webpack configuration if you like to do stuff manually.

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

## Commands / Modes
By default there are two modes available. You can run them from your cli
when you are in the SAME DIRECTORY as your package.json.

`$ npm run build`

This will build your sources in production environment and stop itself.

`$ npm run watch`

This will build your sources in dev environment and keep doing so while it
watches the given entrypoints and their children for changes.

## Configuration
If you want to see an example configuration take a look at "demo/package.json" of this directory.
To begin adding configuration add to your package.json a new node called: `"labor"`.
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

## Options
__NOTE__: _All options are optional and you can mix am match them as you like._

### js
You can have multiple combinations of entry points and output files. So 
the "js" option has to be an Array, containing your combinations. 
The basic rule is, that webpack loads your "entry" file and converts it into the "output" file, combining all included files into on.
The filepaths have to be relative to your package.json.

By default the script will assume you are writing es6 and use BABEL to
transpile it down to es3, so it is compatible to IE8 and higher. If your know your package does not use ES code and you want to save performance go in there and add a new node at after "output" like ("babel": false"). Please note, that if even one of your combinations uses babel, ALL of them will be parsed through it. 

If the "build" mode is used the scripts will be minified and linted using eslint.

Sourcemaps of your files will automatically created at OUTPUT_FILE.map.

**On Node Modules:**
By default all node_modules will be excluded from babel compiling. (Js Loader for .js files has an exclude on: "node_modules").
But sometimes if you want to work with es6 components from other packages you need
to allow transpiling of their files. (LABOR internal projects all depend on that!)
So you may use "allowedModules" to allow specific node_modules which then will be included in your transpiling.
The configuration will combine all "allowedModules" from all js sets into one regex. 
The @labor scope is allowed for js handling by default. Added in 1.1.6
```
"labor": {
  "js": [
    {
      "entry": "webroot/js/src/application.js",
      "output": "./webroot/js/bundle.js"
      ["babel": "false"],
      ["allowedModules": ["@allowedScope", "@scope/package", "package"]]
    }
  ]
}
```

### jsCompat
Sometimes you have to fix an old JS library which does not work nice with webpack. In this case the "imports-loader" comes to your rescue.
This configuration registers the module and make it a little bit easier to write.
For all configuration options take a look at: https://github.com/webpack-contrib/imports-loader.

As general rule => test and fix => loader in the other documentation.
* "test" is a regex of a filename
* "fix" is the definition for the imports-loader, eg a mapping of one value to another
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
    },
    // Some JS libs using require to use jquery to be pulled from node_modules
    // either: disable the amd & common-js style
    {
      "rule": "(my\.old\.file1\.min|my-other-file)+\.js$",
      "fix": "imports-loader?define=>false,require=>false"
    }
  ]
}
```

### css
The general idea is exactly the same as with "js", but for, well, css files. 
You can also have multiple combinations of entry points and output files. So 
the "css" option has to be an Array containing your combinations, again. 
The filepaths have to be relative to your package.json.

Valid file extensions are currently .css, .less, .scss and .sass. The general idea is to keep your entrypoint in the same language as the rest of your styles, but you can mix and match between multiple languages. For advanced configuration of stylesheet building, take a look at "demo/webroot/css/src/frontend/frontend.css". 

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

### copy
There are a lot of usecases where you have to automatically copy files from a destination to a output directory. For example to copy fonts to your webroot, or assets from one folder to another.
You can have multiple copy-jobs for a single project, so make sure that your "copy" node is an array of configuration objects.

This option is build on top of the "copy-webpack-plugin". Take a look at their [Documentation](https://github.com/webpack-contrib/copy-webpack-plugin) for how to use it in detail.
In you example we will only take a look at the defaults and the minor change we made with the syntax.

The change first: by default you can only copy files from a single source into an output directory. I changed it so that "from" can also work with arrays of sources.
Apart from that everything is straight forward. Say what (from) is copied, where (to) and you should be good to go. If you want to exclude some files you can always use "ignore" for that.
Keep in mind that both, "from" and "ignore" support glob values.
If you don't want to flatten everything into a directory set "flatten: true" and you are set.
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
With this set of tools you should be able to do the same stuff you did with our old gulpfile without problems. But if you want to dive deeper, or want to edit the webpack config manually. You can also write a (really simple) plugin.
The list of defined plugins is an Array of relative pathes (from the package.json) to node modules which will be used as plugins. More information can be found in the "Plugins" section.
```
"labor": {
    "plugins": [
        "./demoPlugins/DemoPlugin.js",
        "@labor/your-packge/plugins/MyPlugin"
    ]
}
```

## Plugins
In general a plugin is a simple node module in form of a function. The simplest plugin you may write is:
```
module.exports = function () { };
```
It doesn't do anything but you can register it as plugin and use it as a base of operations.

To interact with the config builder you can use hooks which are defined in the following steps.

#### getModes(modes)
There can be multiple "tasks" or "modes" in the asset builder. A mode is the word which comes after "labor-asset-building $mode" in your script section.
The mode defines for example if webpack should "watch" the source files and automatically recompile, or to "build" to output for production.
But you might add additional modes for linting or other tasks you would like.

This method will get an Array of already registered modes and should return an altered version of it.
```
module.exports = function () {
    this.getModes = function(modes){
        return modes.concat(['test']);
    };
};
```

#### isProd(isProd, mode)
Webpack differentiates between "production" and "development". By default "build" will set the mode to "isProd = true", while all other
modes will leave the sate at "isProd = false". Your plugin can determine if the mode is production or not in this method.
```
module.exports = function () {
    this.isProd = function(isProd, mode){
        return isProd || mode === 'test';
    };
};
```

#### filterLaborConfig(laborConfig, context)
You might want to alter or change the laborConfig which is the object loaded from the package.json's (labor) node.
For this you can use this hook and do it at ease.

One thing to note is the context, tho!
The context is an object containing all currently availabe information like the isProd state, the mode, registered plugins and so on.
You will receive the context on all hooks from here on so take a look and get yourself familiar.
```
module.exports = function () {
    this.filterLaborConfig = function(laborConfig, context){
        if(context.isProd) delete laborConfig.copy;
        return laborConfig;
    };
};
```

#### filterEslintOptions(eslintOptions, context)
This hook can be used to add or remove eslint options before the module is created.
```
module.exports = function () {
    this.filterEslintOptions = function(eslintOptions, context){
        eslintOptions.rules['no-console'] = 1
    };
};
```

#### filterBabelOptions(babelOptions, context)
This hook can be used to add or remove babel options before the module is created.
Note: This hook is only executed if babel is required by the package.
```
module.exports = function () {
    this.filterEslintOptions = function(babelOptions, context){
        babelOptions.presets = ['env']
    };
};
```

#### getJsProvides(provides, context)
To make js objects like the "$" in jQuery globally available without including it in every file
you can "provide" certain variables using the webpack ProvidePlugin. But because there are issues
when you create multiple providePlugin instances this hook should help you with that.
just add your provided var to the list of "provides" as you would in your providePlugin and you are good to go.
```
const path = require('path');
module.exports = function () {
    this.getJsProvides = function(provides, context){
        // Note context.dir.current is the directory where the package.json lives.
        provides['$'] = path.resolve(context.dir.current, 'jquery-3.2.1.js'),
        provides['jQuery'] = path.resolve(context.dir.current, 'jquery-3.2.1.js'),
    };
};
```

#### filter(webpackConfig, context)
This is the last hook available to a plugin. It is called right before the generated configuration is put into the webpack controller and is then, out of our hands.
That hook is the perfect place to add additional loaders, plugins or anything else to the configuration, because the internal configuration building is already done,
so you can be sure that except other plugins, nothing will change the wepackConfig anymore.
```
module.exports = function () {
    this.filterLaborConfig = function(webpackConfig, context){
        webpackConfig.modules.rules.push({
            test: /(jquery\.waitforimages|jquery\.themepunch\.tools\.min|crum-mega-menu|isotope\.pkgd\.min|theme-plugins\.min|ScrollMagic\.min|animation\.velocity\.min)+\.js/,
            loader: "imports-loader?define=>false,require=>false,exports=
        });
        return laborConfig;
    };
};
```
