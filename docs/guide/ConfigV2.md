# Config V2
This document contains the configuration manifest for the newer, app-based presets.

## apps
Since builder version 2.0.0, the configuration is no longer split into multiple nodes, because we follow webpack's approach to import all sources in a single "app" source file. 

For this reason, you create an app with an entry point and specify it's output directory/file name. 

You can also set an optional display name of each app for the output
```
"labor": {
  "apps": [
    {
      "entry": "./src/app.js",
      "output": "./dist/bundle.js",
      "displayname": "Your App name here"
    }
  ],
}
```
There are also some additional configuration options you might want to use,
those can be specified for each app.

### app.disabled
If this is set to true, the app will not be built. This is useful if you want to
temporarily disable an app from being build without removing the definition from the package.json

### app.verboseResult
If this option is set to true, the webpack result will not hide child files it emitted
but print everything to the screen. -> This can lead to quite long outputs!

### app.appName
This can be used to define a visible name for your application, which makes it easier to identify in console outputs. 
The name is also given to webpack as "appName".

### app.publicPath & app.publicPathDev
To make sure your paths can be resolved properly on your webserver you may use "publicPath" to define the URL/directory, which leads to the output files. 

If your path on your local machine is different from your productive "publicPath" use "publicPathDev", too (publicPath is used for "build", 
"publicPathDev" is preferred when using "watch").
```
"labor": {
  "apps": [
    {
      [...]
      "publicPath": "dist/",
      "publicPathDev": "web/frontend/",
    }
  ],
}
```

### app.polyfills
As stated in the section **Typescript, ES6, and Polyfills**, you
may also define polyfills that should be provided for your application. Those will be added to the default polyfills which are always provided.

You may set this option to FALSE to disable all polyfills
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

### app.useTypeChecker
By default, we use ts-loader's "transpileOnly" option
to save a lot of time while compiling your scripts. If you want to use
the typescript-type checker, set this option to true.
```
"labor": {
  "apps": [
    {
      [...]
      "useTypeChecker": true
    }
  ]
}
```

### app.minChunkSize
When you are using webpack's [dynamic imports](https://webpack.js.org/guides/code-splitting/)
webpack will create multiple "chunks", some of them might be tiny and create more HTTP overhead/slowdown than they save. To counteract that issue, we set the minimum chunk size to 10kb.
Everything else will be bundled in the main output file.

But maybe that's not enough, or too much? Set this value to any number of bytes you want to use as a limit for resource chunk splitting. Setting this value to 0 will disable this feature and we use webpack's default chunk building.
```
"labor": {
  "apps": [
    {
      [...]
      "minChunkSize": 10000
    }
  ],
}
```

### app.imageCompression
All assets (jpg, png, SVG...) that are imported in your sources (including your stylesheets) will automatically be compressed
when you run the "build" command. If you don't want to use this behavior. You can simply disable it by setting this option to false.
```
"labor": {
  "apps": [
    {
      [...]
      "imageCompression": false
    }
  ],
}
```

### app.imageCompressionQuality
As stated in the option above: All assets are automatically compressed when using "build". By default, we use a quality of 80 (Range: 0 - 100).
If you want to change that, just pass a number in the range, and you are ready to go.
```
"labor": {
  "apps": [
    {
      [...]
      "imageCompressionQuality": 95
    }
  ],
}
```

### app.keepOutputDirectory
We are automatically clearing the output directory of an app before we start to emit the new files (Only once while watching!).
If you don't want your output directory to be flushed, set this option to true.
```
"labor": {
  "apps": [
    {
      [...]
      "keepOutputDirectory": true
    }
  ],
}
```

### app.disableGitAdd
By default, your files in the output-directory will automatically be added to your git when you execute the "build" command. 
This is done for your convenience and to prevent errors. If you don't want to add all emitted files automatically, set this to true
```
"labor": {
  "apps": [
    {
      [...]
      "disableGitAdd": true
    }
  ],
}
```

### app.htmlTemplate
When you start to create real single-page apps, you will sooner or later come to a point where you want webpack to create your entry HTML file, which automatically includes the built assets.
We provide such an option, just set your app.htmlTemplate to TRUE and an index.html containing a
div with id "app" will be created for you using [Html Webpack Plugin](https://github.com/jantimon/html-webpack-plugin).
If you want to go further, you can also supply all configuration options for the plugin by passing an object instead of merely true.
While you are on an intermediate level, we also provide you with [Html Webpack Template](https://www.npmjs.com/package/html-webpack-template)
which adds some additional markers of data that may be injected.  
```
"labor": {
  "apps": [
    {
      [...]
      "htmlTemplate": true // <-- Simple default template using a "app" mount point
      [//]
      "htmlTemplate": {
       "template": "./your/template.html,
       "title": "My fancy page"
      }
    }
  ],
}
```

### app.webpackConfig
There might be a time where our preconfigured webpack is not enough for your needs, in that case, you can always alter the webpack configuration using this option.

Because the webpack config is mostly a js object we need to extend it using 
javascript as well. To do so, lets create a new file called webpack.config.js in your 
project root:
```javascript
const merge = require('webpack-merge');
module.exports = function(context){
   context.webpackConfig = merge(context.webpackConfig, {
      // Additional configuration for webpack...
   });
};
```

To tell the config builder to use your configuration file, add the script
with a path relative to your package.json to your app configuration. Or, if you
follow the convention by calling the file webpack.config.js, you can just set the parameter to true.
```
"labor": {
  "apps": [
    {
      [...]
      "webpackConfig": TRUE
   }
  ]
}
```

But in some instances, we only need to set or overwrite some webpack config settings. In this case, we can write these additional settings as an object. 
```
"labor": {
  "apps": [
    {
      [...]
      "webpackConfig": {
        "target": "node",
        "output": {
          "libraryTarget": "umd"
        }
      }
   }
  ]
}
```

### app.warningsIgnorePattern
You now have the option to suppress warnings during the build via the warningIgnorePattern, which is a RegExp. 
This is especially useful if you have specific warnings raising in a build, and you don´t want the asset-building to exit with code 1.

This can be either a string or an array of strings. If you set this using an extension script, you can also set it to an array of regex expressions!
```
"labor": {
  "apps": [
    {
      [...]
      "warningIgnorePattern": "Pattern to check against the warnings to ignore them as RegEXP"
   }
  ]
}
```

### app.copy
There are a lot of use cases where you have to copy files from a destination to an output directory automatically. You can have multiple copy-jobs for a single project, so make sure that your "copy" node is an array of configuration objects.

This option is built on top of the "copy-webpack-plugin". Take a look at their 
[Documentation](https://github.com/webpack-contrib/copy-webpack-plugin) for how to 
use it in detail. In this example, we will only take a look at the defaults and the minor syntax change we made.

**The change**: by default, you can only copy files from a single source into an output directory. I changed it so that "from" can also work with arrays of sources.
Apart from that everything is straight forward. 

Say what (from) is copied, where (to), and you should be good to go. 
If you want to exclude some files, you can always use "ignore" for that. 
Keep in mind that both "from" and "ignore" support glob values. 
If you don't want to flatten everything into a directory set "flatten: false" 
and you are set. 
Sometimes you have copy-tasks, which should be executed if it´s a build and not in a watch.
Set "inBuildOnly: true" in such a case.
```
"labor": {
  "apps": [
    {
      [...]
      "copy": [
          {
              "from": [
                  "assets/a/*",
                  "./assets/b/**/b2.png",
                  "./assets/**/asset.png"
              ],
              "to": "webroot/assets",
              "ignore": ["*.jpg", "assets/a/c"],
              "flatten": false,
              "inBuildOnly": false
          }
      ]
    }
  ]
}
```

### app.extensions
In addition to "global" extension (see [Config](ConfigGeneral.md) and [Extensions](Extensions.md)) you can also register
extensions that are only active for a specific app and therefore a single webpack process.

For more information take look at [Extensions](Extensions.md).
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
