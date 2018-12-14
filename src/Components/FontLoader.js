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
			test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
			use: [
				{
					loader: "file-loader",
					options: {
						name: "[name]-[hash].[ext]",
						outputPath: "assets/"
					}
				}
			]
		});
	}
};