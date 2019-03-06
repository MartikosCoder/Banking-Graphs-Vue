const path = require('path');

module.exports = {
    mode: 'development',
    entry: {
        app: './src/app.js',
    },
    devServer: {
        contentBase: './src'
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    }
};