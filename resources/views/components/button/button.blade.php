@php
$classes = '
    inline-flex justify-center items-center
    text-center
    align-top
    whitespace-nowrap
    disabled:cursor-default
    group
    transition-all';
@endphp


<{{ $element() }} {{ $attributes->class([$classes]) }}>
    @if ($iconBefore())
        {!! $theIcon() !!}
    @endif

    @if (!$slot->isEmpty())
        <span class="text-inherit {{ $labelClasses() }}">{{ $slot }}</span>
    @endisset

    @if ($iconAfter())
        {!! $theIcon() !!}
    @endif
</{{ $element() }}>
