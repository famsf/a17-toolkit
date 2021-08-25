<?php

declare(strict_types=1);

namespace A17Toolkit\Components\Wysiwyg;

use Illuminate\View\Component;
use Illuminate\Contracts\View\View;

class Wysiwyg extends Component
{
    public function __construct()
    {
    }

    public function render(): View
    {
        return view('a17-toolkit::components.wysiwyg.wysiwyg');
    }
}
