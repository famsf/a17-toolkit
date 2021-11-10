<?php

use A17Toolkit\Components;

return [
    /*
    |--------------------------------------------------------------------------
    | Components
    |--------------------------------------------------------------------------
    |
    | Below you reference all components that should be loaded for your app.
    | By default all components from A17 Toolkit are loaded in. You can
    | disable or overwrite any component class or alias that you want.
    |
    */

    'components' => [
        'accordion' => Components\Accordion\Accordion::class,
        'alert' => Components\Alert\Alert::class,
        'button' => Components\Button\Button::class,
        'heading' => Components\Heading\Heading::class,
        'icon' => Components\Icon\Icon::class,
        'media' => Components\Media\Media::class,
        'modal' => Components\Modal\Modal::class,
        'nav-global' => Components\NavGlobal\NavGlobal::class,
        'wysiwyg' => Components\Wysiwyg\Wysiwyg::class,
    ],

    /*
    |--------------------------------------------------------------------------
    | Components Prefix
    |--------------------------------------------------------------------------
    |
    | This value will set a prefix for all A17 Toolkit components.
    | This is useful if you want to avoid collision with components
    | from other libraries.
    |
    | If set with "a17", for example, you can reference components like:
    |
    | <x-a17-button />
    |
    */

    'prefix' => 'a17',
];
