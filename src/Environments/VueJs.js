/**
 * Created by Martin Neundorfer on 13.12.2018.
 * For LABOR.digital
 */
const merge = require("webpack-merge");

/**
 * Prepares the webpack config for a vue js environment
 */
module.exports = class VueJs {
	apply(context){
		const webpackConfig = context.webpackConfig;

		// Add vue loader
		context.webpackConfig.module.rules.push({
			test: /\.vue$/,
			loader: "vue-loader",
			options: {
				cacheBusting: true,
				transformToRequire: {
					video: ["src", "poster"],
					source: "src",
					img: "src",
					image: "xlink:href"
				}
			}
		});

		// Disable node module inejctions
		context.webpackConfig = merge(webpackConfig, {
			resolve: {
				extensions: [".vue", ".tsx"]
			},
			node: {
				// prevent webpack from injecting useless setImmediate polyfill because Vue
				// source contains it (although only uses it if it's native).
				setImmediate: false,
				// prevent webpack from injecting mocks to Node native modules
				// that does not make sense for the client
				dgram: "empty",
				fs: "empty",
				net: "empty",
				tls: "empty",
				child_process: "empty"
			}
		});

	}
};