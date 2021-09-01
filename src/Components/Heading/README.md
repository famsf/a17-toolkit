The `heading` component is a replacement for `<h1>...<h6>` heading tags. By default it renders a `h1` tag. To render a different heading level, set the `level` prop to a number between 1 and 6. Any number lower than 1 and higher than 6 will render a span.

It will add any additional attributes and render any HTML content passed through the default slot.

## Props

### `level`
(`int | false`)

The heading level. Set to a value between 1 and 6. Values outside of this range will render a span.

Default: `1`.

## Usage

## Render a `h2`

```php
<x-a17-heading :level="2" class="f-heading-2">
    Lorem Ipsum
<x-a17-heading/>

// output:
<h2 class="f-heading-2">Lorem Ipsum</h2>
```

## Render a `span`

```php
<x-a17-heading :level="-1" class="f-heading-2">
    Lorem Ipsum
<x-a17-heading/>

// output:
<span class="f-heading-2">Lorem Ipsum</span>
```
