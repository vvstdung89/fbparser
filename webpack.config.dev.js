const path = require('path');
const webpack = require('webpack');

module.exports = {
	entry: './index.js',
	output: {
		path: path.join(__dirname, './build'),
		filename: 'fbparser.js'
	},
}
