<div
    id="{{ $id }}"
    role="dialog"
    aria-labelledby="{{ $id .'_title' }}"
    aria-modal="true"
    data-behavior="Modal"
    {{ $attributes->class([ 'g-modal a17-fixed a17-inset-0 a17-z-900 a17-bg-white a17-text-black a17-trans-show-hide' ]) }}
>
    <div
        class="a17-relative a17-h-full a17-overflow-scroll"
        data-Modal-focus-trap
        tabindex="-1"
    >
        @if($showClose)
            <button
                class="a17-absolute a17-top-16 a17-right-16"
                aria-label="{{ __('a17-toolkit::fe.a11y.modal_close') }}"
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
