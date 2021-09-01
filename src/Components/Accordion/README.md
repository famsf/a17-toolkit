The `accordion` component renders a list of accessible expandable and collapsible `accordion-item` components. An accordion can be generated using the prop `items` or using slots.

## `accordion` Props

### `items`
(`array`)

An array of objects with `label` (String) and `content` (String) properties.

### `forceListRole`
(`string`)

Set the `role` attribute on the wrapping `ul` element.

Default: When an `accordion` consists of only one item the `role` attribute on the wrapping `ul` will be set to `presentation`, otherwise it will be empty.

## `accordion-item` Props

### `headingLevel`
(`string`)

Set the heading level of the `label` text.

Default: `3`

### `triggerIcon`
(`string`)

The icon displayed alongside the `label` text.

Default: `chevron-down-24`

### `index`
(`string`)

The index of the accordion item in the accordion. It's used to generate ids and track which accordion item is open.

Default: `null`

### `label`
(`string`)

The text used within the accordion item trigger button. This can be a prop or a slot if you are defining the accordion items in the `accordion` slot.

Default: `null`

## `accordion` Slots

### `default`

Rendered in place of the `accordion-item`s. Allows more control over the `accordion-item` content.

## `accordion-item` Slots

### `default`

The `accordion-item` body content.

### `label`

Can be used instead of the `label` prop. Any attributes set on the slot will be applied to the wrapping `button` element.

## Styling

The `accordion` component ships with some BEM classes to allow you to style the component without publishing to your application. These are:

- `a17-accordion` - The main element
- `a17-accordion__item` - The child `accortion-item` components
- `a17-accordion__trigger` - The buttons to open/close the `accordion-item`
- `a17-accordion__content` - The `accordion-item` expandable area

When publishing the component it will also publish the CSS and JS should you need to modify further.

## Using `items` prop

Example:

```php
<x-a17-accordion
    :items="[
      'label' => 'Lorem Ipsum',
      'content' => 'Vestibulum id ligula porta felis euismod semper. Maecenas sed diam eget risus varius blandit sit amet non magna.'
    ]"
/>
```

## Using slots

If you need more complex markup rendered inside an accordion, you should use `accordion-item` child component and use its default slot.

You can also use the `label` slot within the `accordion-item` component if you need to use more complex markup in the label, or if you need to set any additional attributes on the trigger element.

Example:

```php
<x-a17-accordion>
    <x-a17-accordion-item :label="Lorem Ipsum">
        <x-a17-wysiwyg>
            <ul>
                <li>Donec ullamcorper nulla non metus auctor fringilla</li>
                <li>Curabitur blandit tempus porttitor. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor</li>
                <li>Nullam quis risus eget urna mollis ornare vel eu leo</li>
                <li>Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit.</li>
            </ul>

            <h3>Tortor Ullamcorper Nullam</h3>

            <p>Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Etiam porta sem malesuada magna mollis euismod. Sed posuere consectetur est at lobortis. Etiam porta sem malesuada magna mollis euismod.</p>

            <x-a17-button href="http://area17.com">
                AREA 17
            </x-a17-button>
        </x-a17-wysiwyg>
    </x-a17-accordion-item>

    <x-a17-accordion-item :label="Lorem Ipsum">
        <x-slot name="label" aria-label="More detailed slot label">
            Slot 1
        </x-slot>

        <x-a17-wysiwyg>
            <p>Vestibulum id ligula porta felis euismod semper. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Maecenas sed diam eget risus varius blandit sit amet non magna. Nullam quis risus eget urna mollis ornare vel eu leo. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Donec id elit non mi porta gravida at eget metus.</p>

            <h3>Tortor Ullamcorper Nullam</h3>

            <p>Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Etiam porta sem malesuada magna mollis euismod. Sed posuere consectetur est at lobortis. Etiam porta sem malesuada magna mollis euismod.</p>
        </x-a17-wysiwyg>
    </x-a17-accordion-item>

    <x-a17-accordion-item>...</x-a17-accordion-item>
    <x-a17-accordion-item>...</x-a17-accordion-item>
</x-a17-accordion>
```
