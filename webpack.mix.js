const path = require('path');
const mix = require('laravel-mix');

mix.webpackConfig({
    devtool: mix.inProduction() ? false : "inline-source-map",
    resolve: {
        alias: {
            '@components': path.resolve(__dirname, './resources/views/components'),
        }
    }
});

mix.webpackConfig(webpack => {
    return {
        plugins: [
            new webpack.DefinePlugin({
              'process.env.MODE': mix.inProduction() ? JSON.stringify('production') : JSON.stringify('development'),
            }),
        ]
    };
});

mix.js('resources/frontend/js/main.js', '/public')
    .postCss('resources/frontend/css/main.css', '/public', [
        require('tailwindcss')
    ]);
