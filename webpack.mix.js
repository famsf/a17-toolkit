const mix = require('laravel-mix');

mix.js('resources/frontend/js/app.js', 'public/js')
    .postCss('resources/frontend/css/app.css', 'public/css', [
        require('tailwindcss')
    ]);
