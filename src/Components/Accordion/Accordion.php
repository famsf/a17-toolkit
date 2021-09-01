<?php

declare(strict_types=1);

namespace A17Toolkit\Components\Accordion;

use Illuminate\View\Component;
use Illuminate\Contracts\View\View;

class Accordion extends Component
{
    /** @var array */
    public $items;

    /** @var string */
    public $forceListRole;

    public function __construct($items = false, $forceListRole = null)
    {
        $this->items = $items;
        $this->forceListRole = $forceListRole;
    }

    public function render(): View
    {
        return view('a17-toolkit::components.accordion.accordion');
    }

    public function listRole()
    {
        if($this->forceListRole){
            return $this->forceListRole;
        }

        return $this->items && count($this->items) === 1 ? 'presentation' : null;
    }
}
