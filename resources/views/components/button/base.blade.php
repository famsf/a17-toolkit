@props([
    'variation' => 'primary',
    'icon' => false,
    'iconPosition' => 'after',
    'href' => false,
    'static' => false,
])

@php
$classes = '
    inline-flex justify-center items-center
    text-center
    align-top
    whitespace-nowrap
    disabled:cursor-default
    group
    transition-all';

$label_classes = 'text-inherit';


if($icon):
    if($iconPosition == 'before'):
        $label_classes .= ' ml-16';
    else:
        $label_classes .= ' mr-16';
    endif;
endif;

@endphp

@if($static)
    <span {{ $attributes->class([$classes]) }}>
        @if ($iconBefore())
            {!! $theIcon() !!}
        @endif

        @if (!$slot->isEmpty())
            <span class="{{ $label_classes }}">{{ $slot }}</span>
        @endisset

        @if ($iconAfter())
            {!! $theIcon() !!}
        @endif
    </span>
@elseif ($isLink())
    <a href="{!! $href !!}" {{ $attributes->class([$classes]) }}>
        @if ($iconBefore())
            {!! $theIcon() !!}
        @endif

        @if (!$slot->isEmpty())
            <span class="{{ $label_classes }}">{{ $slot }}</span>
        @endisset

        @if ($iconAfter())
            {!! $theIcon() !!}
        @endif
    </a>
@else
    <button {{ $attributes->class([$classes]) }}>
        @if ($iconBefore())
            {!! $theIcon() !!}
        @endif

        @if (!$slot->isEmpty())
            <span class="{{ $label_classes }}">{{ $slot }}</span>
        @endisset

        @if ($iconAfter())
            {!! $theIcon() !!}
        @endif
    </button>
@endif
