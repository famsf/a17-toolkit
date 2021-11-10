<?php

declare(strict_types=1);

namespace A17Toolkit\Components\Navigation;

use Illuminate\View\Component;
use Illuminate\Contracts\View\View;
use Illuminate\Support\Str;

class NavGlobal extends Component
{
    /** @var string */
    public $label;

    /** @var string */
    public $navLabel;

    /** @var string */
    public $labelId;

    /** @var array */
    public $items;

    /** @var array */
    public $headingLevel;

    public function __construct($label = null, $items = null, $headingLevel = 2)
    {
        $this->label = $label;
        $this->navLabel = Str::of($this->label)->replace(['Navigation', 'navigation'], '')->trim();
        $this->items = $items;
        $this->headingLevel = $headingLevel;
        $this->labelId = 'NavigationLabel'. Str::random(5);
    }

    public function render(): View
    {
        return view('a17-toolkit::components.navigation.global');
    }

    public function activeLinkAria($url)
    {
        return url()->current() == url($url);
    }
}
