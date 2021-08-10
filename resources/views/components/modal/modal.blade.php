@props([
    'id' => null,
    'showClose' => true, // set to false if you want to use a custom close button in the slot. Note that attributes will need to be the same as the one here
    'title' => null, // leave null if you want to use a custom h1 in the slot. Note that attributes will need to be the same as the one here
])

<div
    id="{{ $id }}"
    role="dialog"
    aria-labelledby="{{ $id .'_title' }}"
    aria-modal="true"
    data-behavior="Modal"
    {{ $attributes->class([ 'g-modal fixed inset-0 z-900 bg-tertiary text-primary trans-show-hide' ]) }}
>
    <div
        class="relative h-full overflow-scroll"
        data-Modal-focus-trap
        tabindex="-1"
    >
        @if($showClose)
            <button
                class="absolute top-16 left-0"
                aria-label="{{ __('fe.a11y.modal_close', 'Close Modal') }}"
                data-Modal-close-trigger
            >
                <x-icon name="close-24" />
            </button>
        @endif

        @isset($title)
            <x-heading
                :level="1"
                id="{{ $id }}_title"
                class="sr-only"
                tabindex="-1"
                data-Modal-initial-focus
            >
                {{ $title }}
            </x-heading>
        @endisset

        {!! $slot !!}
    </div>
</div>
