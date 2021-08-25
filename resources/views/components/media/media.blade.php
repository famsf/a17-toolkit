@props([
    'video' => null,
    'image' => null,
    'caption' => null,
    'sizes' => null,
    'twillImageClass' => null,
    'usePlaceholder' => false,
])


@isset($image)
<{{ $element() }} {{ $attributes }}
    @if (isset($video) && $video)
        data-behavior="ShowVideo"
        data-ShowVideo-videoid="{{ $video['id'] }}"
        data-ShowVideo-videotype="{{ $video['type'] }}"
        data-ShowVideo-autoplay="{{ $video['autoplay'] ?? 0 }}"
        @if(isset($video['params']))
            @foreach ($video['params'] as $key => $value)
                data-ShowVideo-videoparam-{{ $key }}="{{ $value }}"
            @endforeach
        @endif
    @endif>

    @if (isset($video) && $video)
        <div class="relative cursor-pointer group hover:mask-overlay-2" data-ShowVideo-media-container>
    @endif

        @if (array_key_exists('src', $image))
            <img src="{{ $image['src'] }}" alt="{{ $image['alt'] }}" />
        @elseif (array_key_exists('main', $image))
            {!! TwillImage::fromData($image, [
                'layout' => 'fullWidth',
                'sizes' => $sizes,
                'class' => $twillImageClass
            ]) !!}

        @elseif($usePlaceholder)
            @php
                $ratioRaw = $image['ratio'] ?? 1;

                switch ($ratioRaw) {
                    case 16 / 9 :
                        $ratio = '16x9';
                        break;

                    case 3 / 2 :
                        $ratio = '3x2';
                        break;

                    case 2 / 1 :
                        $ratio = '2x1';
                        break;

                    default:
                        $ratio = '1x1';
                        break;
                }
            @endphp
            <div {{ $attributes->merge(['class' => 'image-placeholder text-inverse ratio ratio-'. $ratio .' '. $twillImageClass]) }}>
            </div>
        @endif

        @if (isset($video) && $video)
            @if (array_key_exists('icon_type', $video) && $video['icon_type'] == 'large')
                <span class="absolute top-1/2 left-1/2 z-20 p-16 bg-overlay group-hover:bg-darkest text-inverse transform -translate-x-1/2 -translate-y-1/2 transition-colors">
                    <x-icon name="play-24" class="lg:hidden" />
                    <x-icon name="play-32" class="hidden lg:block" />
                </span>
            @else
                <span class="absolute bottom-0 right-0 z-20 p-16 bg-overlay text-inverse">
                    <x-icon name="play-24" />
                </span>
            @endif

            <div class="hidden absolute inset-0 z-30 w-full h-full" data-ShowVideo-player></div>
        </div>
    @endif

    @if(isset($caption) && !empty($caption))
        <figcaption {{ $mediaCaption->attributes ?? null }}>
            {{ isset($mediaCaption) && !$mediaCaption->isEmpty() ? $mediaCaption : $caption }}
        </figcaption>
    @endif
</{{ $element() }}>

@endisset
