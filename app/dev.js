const { resolve } = require('path');


// Starts up webpack watch and calls the given callback after the first build
exports.webpackWatch = function (cb) {
	const compiler = require('webpack')(require('../webpack.config.js'));
	const watchOptions = {};
	const outputOptions = {
		context: resolve(__dirname, '..'),
		colors: { level: 1, hasBasic: true, has256: false, has16m: false },
		cached: false,
		cachedAssets: false,
		modules: true,
		chunks: false,
		reasons: false,
		errorDetails: false,
		chunkOrigins: false,
		exclude: ['node_modules']
	};

	compiler.watch(watchOptions, (err, stats) => {
		// Only run the callback on the first run
		if (cb) {
			var callCb = cb;
			cb = undefined;
			callCb();
		}

		// Log the compilation error
		if (err) {
			console.error(err.stack || err);
			if (err.details) {
				console.error(err.details);
			}
			return;
		}

		// Log the compilation output
		process.stdout.write(`${stats.toString(outputOptions)}\n`);
	});
};
