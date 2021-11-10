This is a basic button component. It renders an `a`, `span` or `button` depending on the props (see below) passed to the component.

Any attributes passed to the button base component are merged with the component's existing attributes to allow you to add ids, behaviors, data attributes, etc to the component as you wish.

## Props

### `icon`
(`string | false`)

The name of the icon file to use in the button. Can be positioned with the `iconPosition` prop (see below). Rendered using the `<x-icon>` component.

Default: `false`.

### `iconPosition`
(`string` - `'before' | 'after'`)

Defines the position of the icon in respect to the text, either before or after. Has no effect if used without the `icon` prop.

Default: `'after'`

### `href`
(`string | false`)

The href string to use on a `a` element. If this prop is set to `falsey` value the component will render as a `button`, unless `static` prop (see below) is set to `true`. If both `static` and `href` props are set, the `href` prop is ignored and the component is rendered as a `span`.

Default: `false`

### `static`
(`boolean | false`)

This prop allows the component to be used within block links where you need an element to look like a button. Setting this to `true` will render the button as `span`.

Default: `false`

## Slots

### `default`

The default component slot is used for the label text within the button. It can be left blank and used with the `icon` prop to render an 'icon-only' button.

## Usage

To create a `primary` style button in your own project you can do something like the following:

```blade
{{--  /components/button/primary --}}

@props([
    'icon' => false,
    'iconPosition' => 'after',
    'href' => false,
    'static' => false,
])

@php
    $classes = '
        py-16 px-20
        bg-darkest hover:bg-darker group-hover:bg-darker active:bg-darker
        disabled:bg-darkest disabled:opacity-30
        text-inverse
        f-ui-4
    ';
@endphp

<x-button
    {{ $attributes->merge([
        'class' => $classes,
        'href' => $href,
        'icon' => $icon,
        'iconPosition' => $iconPosition,
        'static' => $static,
    ]) }}
>
    {{ $slot }}
</x-button>
```

This will alow you reuse the button

```
<x-button-primary>
    Primary Button
</x-button-primary>

<x-button-primary href="/">
    Primary Button
</x-button-primary>

<x-button-primary :static="true">
    Primary Button
</x-button-primary>

<x-button-primary icon="chevron-right">
    Primary Button
</x-button-primary>

<x-button-primary icon="chevron-left" iconPosition="before">
    Primary Button
</x-button-primary>
```
