<?php

declare(strict_types=1);

namespace A17Toolkit\Components\Heading;

use Illuminate\View\Component;
use Illuminate\Contracts\View\View;

class Heading extends Component
{
    /** @var string */
    public $caption;

    /** @var int */
    public $level;

    /** @var string */
    public $element;

    public function __construct($caption = null, $level = null)
    {
        $this->caption = $caption;
        $this->level = $level;
        $this->element = $this->getElement();
    }

    public function render(): View
    {
        return view('a17-toolkit::components.heading.heading');
    }

    protected function getElement(){
        return $this->level > 0 && $this->level <= 6 ? "h$this->level" : 'span';
    }
}
