const mix = require('laravel-mix');

mix.js('resources/frontend/js/main.js', '/public')
    .postCss('resources/frontend/css/main.css', '/public', [
        require('tailwindcss')
    ]);
