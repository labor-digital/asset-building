# Configuration
The webpack configuration depends on the selected version of the config builder.
There are small example configurations to take a look at for version 1.0 at
`demo1/package.json` or at `demo2/package.json` for version 2.0. 

In general, you begin the configuration by adding a new node called "labor"
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

### plugins
With the given set of tools you should be able to do the same stuff you did with our 
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

Because the webpack config is mostly a js object we will extend it using 
javascript in most cases. To do so, lets create a new file called webpack.js in your 
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

But in some cases we only need to set or overwrite some webpack config settings.
In this case we can write this additional settings as object. 
```
"labor": {
    "webpackConfig": {
    	"target": "node",
    	"output": {
    		"libraryTarget": "umd"
    	}
    }
}
```

