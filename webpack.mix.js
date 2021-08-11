const mix = require('laravel-mix');

mix.js('resources/frontend/js/toolkit.js', '/public')
    .postCss('resources/frontend/css/toolkit.css', '/public', [
        require('tailwindcss')
    ]);
