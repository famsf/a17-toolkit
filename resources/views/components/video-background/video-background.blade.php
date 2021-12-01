@isset($sources)
    <div
        {{ $attributes->class(['relative', 'overflow-hidden', 'w-full', 'h-full']) }}
        data-behavior="VideoBackground"
        data-VideoBackground-text-pause="{{ $pauseText }}"
        data-VideoBackground-text-play="{{ $playText }}"
    >
        <div {{ $pauseButton->attributes->class(['absolute', 'z-10', 'bottom-0', 'right-0']) }} data-VideoBackground-controls="">
            @if (isset($pauseButton) && !$pauseButton->isEmpty())
                {{ $pauseButton }}
            @else
                <button
                    aria-label="{{ $pauseText }}"
                    aria-pressed="false"
                    name="pauseButton"
                >
                    {{ $pauseText }}
                </button>
            @endif
        </div>

        <video
            playsinline
            autoplay
            loop
            muted
            class="absolute inset-0 w-full h-full object-cover"
            data-VideoBackground-player=""
        >
            @foreach ($sources as $source)
                <source
                    type="video/{{ $source['type'] }}"
                    src="{{ $source['src'] }}"
                />
            @endforeach
        </video>
    </div>
@endisset
