<?php

declare(strict_types=1);

namespace A17Toolkit\Components\VideoBackground;

use Illuminate\View\Component;
use Illuminate\Contracts\View\View;

class VideoBackground extends Component
{

    /** @var array */
    public $sources;

    public function __construct($sources = null)
    {
        $this->sources = $sources;
    }

    public function render(): View
    {
        return view('a17-toolkit::components.video-background.video-background');
    }
}
