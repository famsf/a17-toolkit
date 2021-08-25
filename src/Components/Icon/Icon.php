<?php

declare(strict_types=1);

namespace A17Toolkit\Components\Icon;

use Illuminate\View\Component;
use Illuminate\Contracts\View\View;

class Icon extends Component
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
