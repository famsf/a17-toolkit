@isset($sources)
    <div
        {{ $attributes->class(['relative', 'overflow-hidden', 'w-full', 'h-full']) }}
        data-behavior="VideoBackground"
        data-VideoBackground-text-pause="{{ __('a17-toolkit::fe.video_pause') }}"
        data-VideoBackground-text-play="{{ __('a17-toolkit::fe.video_play') }}"
    >
        <div class="absolute z-2 bottom-0 right-0" data-VideoBackground-controls="">
            @if (isset($pauseButton) && !$pauseButton->isEmpty())
                {{ $pauseButton }}
            @else
                <button
                    aria-label="{{ __('a17-toolkit::fe.video_pause') }}"
                    aria-pressed="false"
                    name="pauseButton"
                >
                    {{ __('a17-toolkit::fe.video_pause') }}
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
