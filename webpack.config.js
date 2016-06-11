var path = require( 'path' );
var NODE_ENV = process.env.NODE_ENV || 'development';
var webpackConfig;

// This file is written in ES5 because it is run via Node.js and is not transpiled by babel. We want to support various versions of node, so it is best to not use any ES6 features even if newer versions support ES6 features out of the box.
webpackConfig = {

	// Entry points point to the javascript module that is used to generate the script file.
	// The key is used as the name of the script.
	entry: {
		app: './source.js',
	},
	output: {
		path: __dirname,
		filename: 'index.js'
	},
	resolve: {
		extensions: [ '', '.js', '.jsx' ]
	},
	devtool: ( 'production' === NODE_ENV ) ? false : '#source-map',
	debug: ( 'production' === NODE_ENV ) ? false : true,
	module: {
		// Webpack loaders are applied when a resource is matches the test case
		loaders: [
			{
				test: /\.jsx?$/,
				exclude: [ /node_modules/, /wordpress-redux/ ],
				loader: 'babel',
				query: {
					presets: [ 'react', 'es2015' ],
				},
			},
			{
				test: /\.jsx?$/,
				loader: 'eslint',
				exclude: [ /node_modules/, /wordpress-redux/ ],
			}
		]
	},
	eslint: {
		configFile: path.join( __dirname, '.eslintrc' ),
		failOnError: true,
		quiet: true,
	},
	node: {
		fs: 'empty',
		process: true
	}
};

module.exports = webpackConfig;
