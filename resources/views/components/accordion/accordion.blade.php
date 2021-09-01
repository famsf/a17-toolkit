@if(isset($items) && !empty($items) || !$slot->isEmpty())

<ul
    {{ $attributes->merge(['data-behavior' => 'Accordion']) }}
    class="a17-accordion"
    role="{{ $listRole() }}"
>
    @if (!$slot->isEmpty())
        {{ $slot }}
    @else
        @foreach ($items as $item)
            <x-a17-accordion-item
                :index="$loop->index"
            >
                <x-slot name="label">
                    {!! $item['label'] !!}
                </x-slot>

                {!! $item['content'] !!}
            </x-a17-accordion-item>
        @endforeach
    @endif
</ul>

@endif
