<?php

declare(strict_types=1);

namespace A17Toolkit\Components\Heading;

use A17Toolkit\Components\BladeComponent;
use Illuminate\Contracts\View\View;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class Heading extends BladeComponent
{
    /** @var string */
    public $caption;

    public function __construct($caption = null)
    {
        $this->caption = $caption;
    }

    public function render(): View
    {
        return view('a17-toolkit::components.heading.heading');
    }

}
