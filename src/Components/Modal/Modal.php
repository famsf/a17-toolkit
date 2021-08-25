<?php

declare(strict_types=1);

namespace A17Toolkit\Components\Modal;

use Illuminate\View\Component;
use Illuminate\Contracts\View\View;

class Modal extends Component
{
    /** @var boolean */
    public $id;

    /** @var string
     * Set to false if you want to use a custom close button in the slot.
     * Note that attributes will need to be the same as the one here
    */
    public $showClose;

    /** @var string
     * Leave null if you want to use a custom h1 in the slot.
     * Note that attributes will need to be the same as the one here
    */
    public $title;

    public function __construct($id = null, $showClose = true, $title = false)
    {
        // dd($icon);

        $this->id = $id;
        $this->showClose = $showClose;
        $this->title = $title;
    }

    public function render(): View
    {
        return view('a17-toolkit::components.modal.modal');
    }
}
