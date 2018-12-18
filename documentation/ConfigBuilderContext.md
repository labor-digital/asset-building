# Config Builder Context
When you start extending the config builder with your own plugins, or webpack
config you will encounter the config builder context. It is an object
which holds a lot of information around the current configuration you 
may use for your current task of setting up webpack.

* **builderVersion:** The version number of the current config builder
* **environment:** Can be used to define an additional layer of configuration, which may be used based on the used framework
* **currentApp:** Only used in version 2 of the builder. The numeric zero-based index of the app which is currently configured. -1 If there is currently no app based action underway
* **currentAppConfig:** he configuration containing the laborConfig of the app which is currently configured
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
	* **additionalResolverPaths:** Is used to store additional paths that should be used for node and webpack file resolution
* **callback:** The callback for the webpack compiler
* **callPluginMethod(method, args)**
Internal helper to loop over all plugin instances and call a requested method on 
them.The given arguments should be an array. If the method returns a value args[0] 
will automatically be reset to the result. With that it is possible to pass a 
value through all plugin instances to filter it.
