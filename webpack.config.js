const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');


// All of our application window entry points
const windowIndexHTMLPages = [
	new HtmlWebpackPlugin({
		filename: './terminalWindow/index.html',
		template: './www/windows/terminalWindow/index.html',
		inject: 'head'
	})
];


// Object passed to webpack compiler
module.exports = {
	entry: {
		terminalWindow: './www/windows/terminalWindow/index.js'
	},
	output: {
		path: './app/windows',
		filename: '[name]/build.js'
	},
	module: {
		loaders: [
			// Transpile js files for JSX and ES6 support
			{ test: /\.js$/, exclude: /node_modules/, loader: 'babel' },

			//
			{ test: /\.json$/, loader: 'json-loader' },

			// Transpile less files and resolve urls
			{ test: /\.css$/, loader: 'style!css' },
			{ test: /\.less$/, loader: 'style!css!less' },

			// Tranform asset urls into base64 urls
			{ test: /\.png(\?.*)?$/, loader: 'url-loader' },
			{ test: /\.eot(\?.*)?$/, loader: 'url-loader' },
			{ test: /\.svg(\?.*)?$/, loader: 'url-loader' },
			{ test: /\.ttf(\?.*)?$/, loader: 'url-loader' },
			{ test: /\.woff(\?.*)?$/, loader: 'url-loader' },
			{ test: /\.woff2(\?.*)?$/, loader: 'url-loader' }
		]
	},
	plugins: [].concat(windowIndexHTMLPages)
};


// Check if we should run additional optimisations for production builds
const productionBuild = process.argv[1].indexOf('/webpack') >= 0 && process.argv.indexOf('-p') >= 0;
if (!productionBuild) {
	return;
}

// Tell other plugins that we are creating a production build
module.exports.plugins.push(new webpack.DefinePlugin({
	'process.env': {
		NODE_ENV: JSON.stringify('production')
	}
}));

// Tell html pages to minify
for (const page of windowIndexHTMLPages) {
	page.options.minify = {
		collapseWhitespace: true,
		removeAttributeQuotes: true,
		removeComments: true
	};
}
