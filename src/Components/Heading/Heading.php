<?php

declare(strict_types=1);

namespace A17Toolkit\Components\Heading;

use Illuminate\View\Component;
use Illuminate\Contracts\View\View;

class Heading extends Component
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
