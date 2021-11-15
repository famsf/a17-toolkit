@isset($sources)
    <div
        class="a-video-background"
        data-behavior="VideoBackground"
        data-VideoBackground-text-pause="{{ __('a17-toolkit::fe.video_pause') }}"
        data-VideoBackground-text-play="{{ __('a17-toolkit::fe.video_play') }}"
    >
        <div class="a-video-background__controls" data-VideoBackground-controls="">
            @if (isset($pauseButton) && !$pauseButton->isEmpty())
                {{ $pauseButton }}
            @else
                <button
                    aria-label="{{ __('a17-toolkit::fe.video_pause') }}"
                    aria-pressed="false"
                    name="pauseButton"
                    data-VideoBackground-controls=""
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
