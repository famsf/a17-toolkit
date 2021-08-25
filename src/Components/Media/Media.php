<?php

declare(strict_types=1);

namespace A17Toolkit\Components\Media;

use Illuminate\View\Component;
use Illuminate\Contracts\View\View;

class Media extends Component
{
    /** @var string */
    public $caption;

    /** @var string */
    public $image;

    public function __construct($caption = null, $image = null)
    {
        $this->caption = $caption;
        $this->image = $image;
    }

    public function render(): View
    {
        return view('a17-toolkit::components.media.media');
    }

    public function element(): string
    {
        return isset($caption) && !empty($caption) ? 'figure' : 'div';
    }

}
