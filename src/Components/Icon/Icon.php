<?php

declare(strict_types=1);

namespace A17Toolkit\Components\Icon;

use A17Toolkit\Components\BladeComponent;
use Illuminate\Contracts\View\View;

class Icon extends BladeComponent
{
    /** @var string */
    public $name;

    public function __construct(string $name = null)
    {
        $this->name = $name;
    }

    public function render(): View
    {
        return view('a17-toolkit::components.icon.base');
    }
}
