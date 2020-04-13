# General Config
The webpack configuration depends on the selected version of the config builder.
There are small example configurations to take a look at for version 1.0 at
`demo1/package.json` or `demo2/package.json` for version 2.0. 

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
If it is empty / not given, the default config builder is version 2.
Take a look at [**Different config builder versions**](CoreFeatures.md#different-config-builder-versions) to learn where the differences are. If you want to use version 1 (for monolithic apps) specify the version using:
```
"labor": {
    "builderVersion": 1,
    "apps": [...]
}
```

### runWorkersSequential
By default, the build processes/app definitions will be called async and in parallel. This leads to much
faster build times as webpack runs on separate threads.

If you want the worker to run sequential (finish app 1, then start app 2, finish app two, then start app three, and so on),
you can set this to TRUE. This is TRUE by default for builder version 1 and FALSE by default for version 2.
```
"labor": {
    [...],
    "runWorkersSequential": TRUE
}
```

### extensions
With the given set of tools, you should be able to do the same stuff you did with our 
old gulpfile without problems. But if you want to dive deeper, or want to edit 
the webpack config manually you can use either the "webpackConfig" option or
create an extension that can use the provided hooks to alter the configuration.

Extensions are meant to create reusable additions to the asset builder that may require their own webpack plugins or loaders, while the "webpackConfig" option is intended as a "per-project" alternative that requires no further understanding of the extension structure. 

Extensions can be supplied either as a "global" extension in the labor root, or as a "per-app" extension if you are using builder version 2.

For more information take look at [Extensions](Extensions.md).
```
"labor": {
    "extensions": [
        "./extensions/MyDemoExtension.js",
        "@labor-digital/your-packge/asset-building"
    ]
}
```
