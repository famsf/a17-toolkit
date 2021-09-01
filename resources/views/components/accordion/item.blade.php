<li class="a17-accordion__item">
    <x-a17-heading :level="$headingLevel">
        <button
            {{ $label->attributes ?? null }}
            id="{{ $label_id }}"
            class="a17-accordion__trigger"
            aria-expanded="false"
            aria-controls="{{ $item_id }}"
            data-Accordion-trigger
            data-Accordion-index="{{ $index }}"
        >
            <span class="a17-block">
                {{ $label }}
            </span>

            <div
                class="a17-transform a17-transition-transform"
                aria-hidden="true"
                data-Accordion-trigger-icon
            >
                <x-a17-icon name="{{ $triggerIcon }}" />
            </div>
        </button>
    </x-a17-heading>

    <div
        id="{{ $item_id }}"
        class="a17-accordion__content"
        role="region"
        aria-labelledby="{{ $label_id }}"
        aria-hidden="true"
        data-Accordion-content
    >
        <div data-Accordion-content-inner>
            {{ $slot }}
        </div>
    </div>
</li>
