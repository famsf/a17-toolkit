@props([
    'message' => null
])

@if($message)

    <div class="mt-28 text-error f-ui-5">
        {{ $message }}
    </div>

@endif
