# Configuration v2
This document contains the configuration manifest for the newer, app-based presets.

## apps
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

### app.publicPath & app.publicPathDev
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

### app.polyfills
As stated in the section **Typescript, ES6 and Polyfills** you
may also define polyfills that should be provided for your application. Those
will be added to the default polyfills which are always provided.
You may set this option to false to disalbe all polyfills
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

### app.minChunkSize
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

### app.imageCompression
All assets (jpg, png, svt...) that are imported in your sources (including your stylesheets) will automatically be compressed
when you run the "build" command. If you don't want to use this behaviour. You can simply disable it by setting this option to false.
```
"labor": {
  "builderVersion": 2,
  "apps": [
    {
      [...]
      "imageCompression": false
    }
  ],
}
```

### app.imageCompressionQuality
As stated in the option above: All assets are automatically compressed when using "build". By default we use a quality of 80 (Range: 0 - 100).
If you want to change that, just pass a number in the range and you are ready to go.
```
"labor": {
  "builderVersion": 2,
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
  "builderVersion": 2,
  "apps": [
    {
      [...]
      "keepOutputDirectory": true
    }
  ],
}
```

### app.disableGitAdd
By default your files in the output-directory will automatically be added to your git when you execute the "build" command. 
This is done for your convineance and to prevent errors. If you don't want to add all emitted files automatially, set this to true
```
"labor": {
  "builderVersion": 2,
  "apps": [
    {
      [...]
      "disableGitAdd": true
    }
  ],
}
```

### app.environment
The concept of environments was introduced in package version 3 and can be seen as additional configuration based on the framework you work with.
For example if you use vue.js you need the vue-loader to use single-file-components. To preconfigure the overhead there is an environment for that
which does the additional configuration for you.
Currently only "vuejs" is supported, but you can add environments using plugins.
```
"labor": {
  "builderVersion": 2,
  "apps": [
    {
      [...]
      "environment": "vuejs"
    }
  ],
}
```

### app.htmlTemplate
When you start to create real single page apps, you will sooner or later come to a point
where you want webpack to create your entry html file which automatically includes the built assets.
We provide such an option, just set your app.htmlTemplate to TRUE and an index.html containing a
div with id "app" will be created for you using [Html Webpack Plugin](https://github.com/jantimon/html-webpack-plugin).
If you want to go further you can also supply all configuration options for the plugin by passing an object instead of merely true.
While you are on an intermediate level we also provide you with [Html Webpack Template](https://www.npmjs.com/package/html-webpack-template)
which adds some additional markers of data that may be injected.  
```
"labor": {
  "builderVersion": 2,
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
**This works exactly the same as webpackConfig in the root of your configuration, but on a per-app basis!**

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
with a path, relative to your package.json to your app configuration.
```
"labor": {
  "builderVersion": 2,
  "apps": [
    {
      [...]
      "webpackConfig": "./webpack.js"
	}
  ]
}
```

But in some cases we only need to set or overwrite some webpack config settings.
In this case we can write this additional settings as object. 
```
"labor": {
  "builderVersion": 2,
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

### app.warningIgnorePattern
You now have the option to suppress warnings during the build via the warningIgnorePattern, which is a RegExp. 
This is especially useful if you have certain warnings raising in a build and you don´t want the asset-building to exit with code 1.
```
"labor": {
  "builderVersion": 2,
  "apps": [
    {
      [...]
      "warningIgnorePattern": "Pattern to check against the warnings to ignore them as RegEXP"
	}
  ]
}
```