@props([
    'id' => null,
    'label' => null
])

<div>
    <x-molecules.form.label :id="$id" :required="$attributes['required']">
        {{ $label }}
    </x-molecules.form.label>

    <select
        id="{{ $id }}"
        name="{{ $id }}"
        class="
            block
            w-full
            disabled:opacity-30 disabled:bg-transparent
            transition-all
            @error($id) text-error border-error @enderror
        "
        {{ $attributes }}
    >
        {!! $slot !!}
    </select>

    @error($id)
        <x-molecules.form.error :message="$message" />
    @enderror
</div>
