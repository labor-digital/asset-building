/**
 * Created by Martin Neundorfer on 14.12.2018.
 * For LABOR.digital
 */
module.exports = class ImageLoader {
	/**
	 * Applies this configuration component to the current context
	 * @param {module.ConfigBuilderContext} context
	 */
	static apply(context){
		if(context.builderVersion === 1) return;

		context.webpackConfig.module.rules.push({
			test: /\.(png|gif|jpe?g|svg)$/,
			use: [
				{
					loader: "url-loader",
					options: {
						name: "[name]-[hash].[ext]",
						outputPath: "assets/",
						limit: context.isProd ? 10000 : 1,
						fallback: {
							loader: "file-loader",
							options: {
								name: "[name]-[hash].[ext]"
							}
						}
					}
				},
				{
					loader: "image-webpack-loader",
					options: {
						disable: !context.isProd || context.currentAppConfig.imageCompression === false,
						mozjpeg: {
							progressive: true,
							quality: typeof context.currentAppConfig.imageCompressionQuality === "number" ?
								context.currentAppConfig.imageCompressionQuality : 80,
							dcScanOpt: 2,
							dct: "float"
						},
						optipng: {
							optimizationLevel: 5
						},
						pngquant: {
							quality: typeof context.currentAppConfig.imageCompressionQuality === "number" ?
								context.currentAppConfig.imageCompressionQuality : 80,
							speed: 2,
							strip: true
						}
					}
				}
			]
		});
	}
};