<?php

declare(strict_types=1);

namespace A17Toolkit\Components\Button;

use A17Toolkit\Components\BladeComponent;
use Illuminate\Contracts\View\View;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class Button extends BladeComponent
{
    /** @var string */
    public $href;

    /** @var string */
    public $icon;

    /** @var string */
    public $iconPosition;

    public function __construct($href = null, $icon = null, $iconPosition = 'after')
    {
        $this->href = $href;
        $this->icon = $icon;
        $this->iconPosition = $iconPosition;
    }

    public function render(): View
    {
        return view('a17-toolkit::components.button.base');
    }

    public function theIcon(): View
    {
        return view('a17-toolkit::components.icon.view', ['name' => $this->icon]);
    }

    public function isLink(): bool
    {
        return isset($this->href) && !empty($this->href);
    }

    public function iconBefore(): bool
    {
        return isset($this->icon) && !empty($this->icon) && $this->iconPosition ==='before';
    }

    public function iconAfter(): bool
    {
        return isset($this->icon) && !empty($this->icon) && $this->iconPosition ==='after';
    }
}
