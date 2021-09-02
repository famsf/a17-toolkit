<div
    id="{{ $id }}"
    role="dialog"
    aria-labelledby="{{ $id .'_title' }}"
    aria-modal="true"
    data-behavior="Modal"
    {{ $attributes->class([ 'a17-modal' ]) }}
>
    <div
        class="a17-modal__wrapper"
        data-Modal-focus-trap
        tabindex="-1"
    >
        @if (isset($closeButton) && !$closeButton->isEmpty())
            {{ $closeButton }}
        @elseif($showClose)
            <button
                class="a17-modal__close"
                aria-label="{{ __('a17-toolkit::fe.a11y.modal_close') }}"
                data-Modal-close-trigger
            >
                <x-a17-icon name="close-24" />
            </button>
        @endif

        @isset($title)
            <x-a17-heading
                :level="1"
                id="{{ $id }}_title"
                class="a17-sr-only"
                tabindex="-1"
                data-Modal-initial-focus
            >
                {{ $title }}
            </x-a17-heading>
        @endisset

        {!! $slot !!}
    </div>
</div>
