<nav
    {{ $attributes }}
    aria-label="{{ $navLabel }}"
>
    <x-a17-heading
        :id="$labelId"
        :heading-level="$headingLevel"
        class="sr-only"
    >
        {{ $label }}
    </x-a17-heading>

    <ul class="m-navigation__items" aria-labelledby="{{ $labelId }}">
        @foreach ($items as $item)
            <li>
                <a
                    href="{{ $item['url'] }}"
                    {{ $activeLinkAria($item['url']) ? 'aria-current="page"' : '' }}
                >
                    {{ $item['text'] }}
                </a>
            </li>
        @endforeach
    </ul>
</nav>
