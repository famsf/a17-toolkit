<?php

declare(strict_types=1);

namespace A17Toolkit\Components\VideoBackground;

use Illuminate\View\Component;
use Illuminate\Contracts\View\View;

class VideoBackground extends Component
{

    /** @var array */
    public $sources;

    /** @var string */
    public $pauseText;

    /** @var string */
    public $playText;

    public function __construct($sources = null, $pauseText = null, $playText = null)
    {
        $this->pauseText = $pauseText ?? __('a17-toolkit::fe.video_pause');
        $this->playText = $playText ?? __('a17-toolkit::fe.video_play');
        $this->sources = $sources;
    }

    public function render(): View
    {
        return view('a17-toolkit::components.video-background.video-background');
    }
}
