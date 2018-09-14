#!/usr/bin/env node
/**
 * Created by Martin Neundorfer on 09.08.2018.
 * For LABOR.digital
 */
const webpack = require('webpack');
const Dir = require('./Entities/Dir');
const ConfigBuilderBootstrap = require('./ConfigBuilder/ConfigBuilderBootstrap');

// Prepare directory stroage
let dir = new Dir(process.cwd(), __dirname);

// Build webpack config
let context = ConfigBuilderBootstrap.generateConfigFor(dir);

// Start webpack
webpack(context.webpackConfig, (err, stats) => context.callback(context, err, stats));

// context.callback(context, err, stats)