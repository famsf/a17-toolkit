<?php

declare(strict_types=1);

namespace A17Toolkit\Components\Accordion;

use Illuminate\View\Component;
use Illuminate\Contracts\View\View;
use Illuminate\Support\Str;

class Item extends Component
{

    /** @var string */
    public $headingLevel;

    /** @var string */
    public $triggerIcon;

    /** @var string */
    public $index;

    /** @var string */
    public $id;

    /** @var string */
    public $label_id;

    /** @var string */
    public $item_id;

    /** @var string */
    public $label;

    public function __construct($headingLevel = '3', $triggerIcon = 'chevron-down-24', $index = null, $id = null, $label = null)
    {
        $this->headingLevel = $headingLevel;
        $this->triggerIcon = $triggerIcon;
        $this->index = $index;
        $this->label = $label;

        $this->id = $id ?? Str::random();
        $this->accordion_id = 'accordion'. $id;
        $this->item_id = $this->accordion_id .'Item'. $this->index;
        $this->label_id = $this->accordion_id .'Label'. $this->index;
    }

    public function render(): View
    {
        return view('a17-toolkit::components.accordion.item');
    }
}
