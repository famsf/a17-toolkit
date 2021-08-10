<?php

declare(strict_types=1);

namespace A17Toolkit\Components\Modal;

use A17Toolkit\Components\BladeComponent;
use Illuminate\Contracts\View\View;

class Modal extends BladeComponent
{
    public function __construct()
    {
    }

    public function render(): View
    {
        return view('a17-toolkit::components.modal.modal');
    }
}
