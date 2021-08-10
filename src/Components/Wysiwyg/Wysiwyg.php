<?php

declare(strict_types=1);

namespace A17Toolkit\Components\Wysiwyg;

use A17Toolkit\Components\BladeComponent;
use Illuminate\Contracts\View\View;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class Wysiwyg extends BladeComponent
{
    public function __construct()
    {
    }

    public function render(): View
    {
        return view('a17-toolkit::components.wysiwyg.wysiwyg');
    }
}
