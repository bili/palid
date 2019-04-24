var path = require('path');

const env = process.env.NODE_ENV

module.exports = {
    mode: env == 'prod' ? 'production' : 'development',
    entry: {
        'palid': './src/script/palid.js',
        'index': './src/script/index.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: env == 'prod' ? '[name].min.js' : '[name].js',
        libraryTarget: 'umd',
        library: 'Palid',
        umdNamedDefine: true
    },
};