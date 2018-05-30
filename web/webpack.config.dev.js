const path = require('path');
const webpack = require('webpack');

const DIRECTORY = path.join(__dirname);

module.exports = {
    devServer: {
        contentBase: path.join(__dirname, 'src'),
        historyApiFallback: true
    },
    devtool: 'source-map',
    entry: [
        path.join(__dirname, '../index.web.js')
    ],
    module: {
        noParse: function(module) {
            var result = /^.*(node_modules\\core\\).*$/.test(module);
            console.log(module, result);
            return result;
        },
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                query: { cacheDirectory: true }
            },
            {
                test: /\.(gif|jpe?g|png|svg)$/,
                loader: 'url-loader',
                query: { name: '[name].[hash:16].[ext]' }
            },
            {
                test: /\.json$/,
                loader: "json-loader"
            }
        ]
    },
    output: {
        path: path.join(__dirname, 'src'),
        filename: 'bundle.js'
    },
    watch: true,
    plugins: [

    ],
    resolve: {
        modules: [
            path.join(__dirname, '..', 'node_modules')
        ],
        alias: {
            'react-native': 'react-native-web-artless'
        },
        extensions: [ '.web.js', '.js' ]
    },
    externals:{
        fs: "commonjs fs",
        path: "commonjs path",
    }
};
