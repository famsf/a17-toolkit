<?php

declare(strict_types=1);

namespace A17Toolkit\Components\Button;

use Illuminate\View\Component;
use Illuminate\Contracts\View\View;

class Button extends Component
{
    /** @var boolean */
    public $static;

    /** @var string */
    public $icon;

    /** @var string */
    public $iconPosition;

    /** @var int */
    public $iconSpacing;

    /** @var int */
    public $labelClasses;

    public function __construct($icon = null, $iconPosition = 'after', $static = false, $iconSpacing = 4, $labelClasses = null)
    {
        $this->icon = $icon;
        $this->iconPosition = $iconPosition;
        $this->iconSpacing = $iconSpacing;
        $this->static = $static;
        $this->labelClasses = $labelClasses;
    }

    public function render(): View
    {
        return view('a17-toolkit::components.button.button');
    }

    public function theIcon(): View
    {
        return view('a17-toolkit::components.icon.view', ['name' => $this->icon]);
    }

    public function element(): string
    {
        if($this->static){
            return 'span';
        }elseif ($this->isLink()) {
            return 'a';
        }else{
            return 'button';
        }
    }

    public function isLink(): bool
    {
        return $this->attributes->get('href') && !empty($this->attributes->get('href'));
    }

    public function iconBefore(): bool
    {
        return isset($this->icon) && !empty($this->icon) && $this->iconPosition ==='before';
    }

    public function iconAfter(): bool
    {
        return isset($this->icon) && !empty($this->icon) && $this->iconPosition ==='after';
    }

    public function labelClasses(): string
    {
        $iconPosition = $this->getIconPosition();

        if(!$iconPosition){
            return $this->labelClasses ?? '';
        }

        $prefix = $iconPosition === 'before' ? 'ml-' : 'mr-';

        return $this->labelClasses .' '. $prefix . $this->iconSpacing;
    }

    protected function getIconPosition()
    {
        if($this->iconBefore()){
            return 'before';
        }elseif($this->iconAfter()){
            return 'after';
        }

        return false;
    }
}
