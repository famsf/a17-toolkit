<?php

declare(strict_types=1);

namespace A17Toolkit\Components\Icon;

use A17Toolkit\Components\BladeComponent;
use Illuminate\Contracts\View\View;
use Illuminate\Support\Arr;

class Icon extends BladeComponent
{
    /** @var string */
    public $type;

    public function __construct(string $type = 'icon')
    {
        $this->type = $type;
    }

    public function render(): View
    {
        return view('a17-toolkit::components.icon.base');
    }

    public function message(): string
    {
        return (string) Arr::first($this->messages());
    }

    public function messages(): array
    {
        return (array) session()->get($this->type);
    }

    public function exists(): bool
    {
        return session()->has($this->type) && ! empty($this->messages());
    }
}
