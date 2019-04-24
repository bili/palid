var path = require('path');

const env = process.env.NODE_ENV

module.exports = {
    mode: env == 'prod' ? 'production' : 'development',
    entry: {
        'index': './src/script/index.js',
        'validate': './src/script/validate.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: env == 'prod' ? '[name].min.js' : '[name].js',
        libraryTarget: 'umd',
        library: 'Validate',
        umdNamedDefine: true
    },
};