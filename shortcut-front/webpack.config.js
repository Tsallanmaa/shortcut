var webpack = require('webpack');
var config = require('./conf/front.json');

module.exports = {
    mode: "production",
    devtool: "source-map",
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".css"]
    },
    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "ts-loader"
                    }
                ]
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                enforce: "pre",
                test: /\.js$/,
                loader: "source-map-loader"
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            '__API__': JSON.stringify(config.apiUrl)
          })
    ],
    externals: {
        "react": "React",
        "react-dom": "ReactDOM",
        "victory": "Victory"
    }
};