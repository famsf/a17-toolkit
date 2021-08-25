@props([
    'id' => null,
    'label' => null,
    'rows' => 3,
    'value' => null
])

<div>
    <x-molecules.form.label :id="$id" :required="$attributes['required']">
        {{ $label }}
    </x-molecules.form.label>

    <textarea
        id="{{ $id }}"
        name="{{ $id }}"
        rows="{{ $rows }}"
        class="
            block
            w-full
            disabled:opacity-30 disabled:bg-transparent
            transition-all
            @error($id) text-error border-error @enderror
        "
        {{ $attributes }}
    >{{ $value }}</textarea>

    @error($id)
        <x-molecules.form.error :message="$message" />
    @enderror
</div>
