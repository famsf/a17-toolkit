const path = require('path');
const mix = require('laravel-mix');

mix.webpackConfig({
    resolve: {
        alias: {
            '@components': path.resolve(__dirname, './resources/views/components'),
        }
    }
});

mix.js('resources/frontend/js/main.js', '/public')
    .postCss('resources/frontend/css/main.css', '/public', [
        require('tailwindcss')
    ]);
