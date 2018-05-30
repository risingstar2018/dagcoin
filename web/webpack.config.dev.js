const path = require('path');

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
        noParse: /desktop_app/,
        rules: [
            {
                test: /\.jsx?$/,
                use: [
                    {
                        loader: 'babel-loader'
                    }
                ],
                include: [
                    path.join(__dirname, '..', 'app'),
                    path.join(__dirname, '..', 'node_modules'),
                    path.join(__dirname, 'index.web.js'),
                ],
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
    resolve: {
        modules: [
            path.join(__dirname, '..', 'src'),
            'node_modules'
        ],
        alias: {
            'react-native': 'react-native-web'
        }
    },
    externals:{
        fs: "commonjs fs",
        path: "commonjs path"
    }
};
