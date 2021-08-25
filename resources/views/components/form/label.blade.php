@props([
    'id' => null,
    'required' => false,
])

<label
    for="{{ $id }}"
    class="block"
>
    {{ $slot }}

    @if (!$required)
        <span>({{ __('fe.form.optional') }})</span>
    @endif
</label>
