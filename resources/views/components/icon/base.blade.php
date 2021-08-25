{{--
    No Icon name set.

    See /app/View/Components/functional/icon.php
--}}

@isset($name)
    @include('components.atoms._icons.'. $name)
@endisset
