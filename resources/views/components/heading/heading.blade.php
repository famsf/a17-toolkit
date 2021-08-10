@props(['level' => 1])

<h{{ $level }} {{ $attributes }}>
    {{ $slot }}
</h{{ $level }}>
