This is an example global navigation component, the kind you typically see in the page global `header` element.

Any attributes passed to the button base component are merged with the component's existing attributes to allow you to add ids, behaviors, data attributes, etc to the component as you wish.

## Props

### `label`
(`string`)

The label used to describe the navigation to screen reader users. Used in an off-screen heading tag and the wrapping `nav` element's `aria-label` attribute. The word 'navigation' is removed from the `nav` element's `aria-label` to prevent repeatition when being read by screen readers.

Default: `null`

### `items`
(`string`)

An array of items to use the navigation. Each item should be an array with a `url` and `text`:

```php
[
    'url' => 'https://area17.com',
    'text' => 'AREA 17'
]
```

Default: `[]`

### `headingLevel`

The level of the off-screen heading element used for the label.

Default: `2`

## Usage

```php
<x-a17-nav-global
    label="Primary navigation"
    :items="[
        [ 'url' => '/', 'text' => 'Home'],
        [ 'url' => '/about', 'text' => 'About'],
    ]">
```
