# @radix-ui/vanilla

Vanilla JavaScript UI primitives based on Radix UI, providing accessible and customizable components without any framework dependencies.

## Features

- **Framework Agnostic**: Works with any JavaScript environment
- **Accessible**: Built with ARIA attributes and keyboard navigation
- **Customizable**: Easy to style and extend
- **TypeScript**: Full TypeScript support
- **Small Bundle**: No framework runtime overhead
- **Event-Driven**: Uses custom events for state management

## Installation

```bash
npm install @radix-ui/vanilla
```

## Quick Start

### Accordion

```html
<div id="accordion">
  <div data-accordion-item data-value="one">
    <button data-accordion-trigger>Section One</button>
    <div data-accordion-content>
      <p>Content for section one</p>
    </div>
  </div>
  <div data-accordion-item data-value="two">
    <button data-accordion-trigger>Section Two</button>
    <div data-accordion-content>
      <p>Content for section two</p>
    </div>
  </div>
</div>
```

```javascript
import { Accordion } from '@radix-ui/vanilla';

const accordion = new Accordion(document.getElementById('accordion'), {
  type: 'single', // or 'multiple'
  defaultValue: 'one',
  onValueChange: (value) => {
    console.log('Value changed:', value);
  }
});

// Programmatic control
accordion.openItem('two');
accordion.closeItem('one');
```

### Dialog

```html
<button data-dialog-trigger>Open Dialog</button>

<div data-dialog-overlay hidden>
  <div data-dialog-content>
    <h3 data-dialog-title>Dialog Title</h3>
    <p data-dialog-description>Dialog description</p>
    <p>Dialog content goes here...</p>
    <button data-dialog-close>Close</button>
  </div>
</div>
```

```javascript
import { Dialog } from '@radix-ui/vanilla';

const dialog = new Dialog(document.querySelector('[data-dialog-overlay]'), {
  defaultOpen: false,
  modal: true,
  onOpenChange: (open) => {
    console.log('Dialog state:', open);
  }
});

// Programmatic control
dialog.open();
dialog.close();
```

## API Reference

### Accordion

#### Constructor

```typescript
new Accordion(element: HTMLElement, options?: AccordionOptions)
```

#### Options

```typescript
interface AccordionOptions {
  type?: 'single' | 'multiple';        // Default: 'single'
  value?: string | string[];           // Controlled value
  defaultValue?: string | string[];    // Uncontrolled default value
  onValueChange?: (value: string | string[]) => void;
  disabled?: boolean;                  // Default: false
  orientation?: 'horizontal' | 'vertical'; // Default: 'vertical'
  collapsible?: boolean;               // Default: false
}
```

#### Methods

- `openItem(value: string)`: Opens an accordion item
- `closeItem(value: string)`: Closes an accordion item
- `getValue()`: Returns current value
- `setValue(value: string | string[])`: Sets the value
- `addItem(value: string, trigger: string | HTMLElement, content: string | HTMLElement)`: Adds a new item
- `removeItem(value: string)`: Removes an item
- `enableItem(value: string)`: Enables a disabled item
- `disableItem(value: string)`: Disables an item
- `destroy()`: Cleans up the component

#### Events

- `valueChange`: Fired when the accordion value changes
- `itemOpen`: Fired when an item opens
- `itemClose`: Fired when an item closes

### Dialog

#### Constructor

```typescript
new Dialog(element: HTMLElement, options?: DialogOptions)
```

#### Options

```typescript
interface DialogOptions {
  open?: boolean;                      // Controlled open state
  defaultOpen?: boolean;               // Uncontrolled default state
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;                     // Default: true
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onPointerDownOutside?: (event: PointerEvent) => void;
  onInteractOutside?: (event: Event) => void;
}
```

#### Methods

- `open()`: Opens the dialog
- `close()`: Closes the dialog
- `isOpen()`: Returns whether dialog is open
- `setOpen(open: boolean)`: Sets the open state
- `destroy()`: Cleans up the component

#### Events

- `openChange`: Fired when dialog open state changes
- `open`: Fired when dialog opens
- `close`: Fired when dialog closes

## HTML Structure

### Accordion

```html
<div id="accordion">
  <div data-accordion-item data-value="unique-value">
    <button data-accordion-trigger>Trigger Text</button>
    <div data-accordion-content>
      <!-- Content goes here -->
    </div>
  </div>
</div>
```

### Dialog

```html
<button data-dialog-trigger>Open Dialog</button>

<div data-dialog-overlay hidden>
  <div data-dialog-content>
    <h3 data-dialog-title>Title</h3>
    <p data-dialog-description>Description</p>
    <!-- Dialog content -->
    <button data-dialog-close>Close</button>
  </div>
</div>
```

## Styling

Components use data attributes for styling hooks:

```css
/* Accordion */
[data-accordion-item] { /* Item container */ }
[data-accordion-trigger] { /* Trigger button */ }
[data-accordion-content] { /* Content area */ }

[data-accordion-item][data-state="open"] { /* Open state */ }
[data-accordion-item][data-state="closed"] { /* Closed state */ }

/* Dialog */
[data-dialog-overlay] { /* Overlay */ }
[data-dialog-content] { /* Content container */ }
[data-dialog-trigger] { /* Trigger button */ }
[data-dialog-close] { /* Close button */ }

[data-dialog-overlay][data-state="open"] { /* Open state */ }
[data-dialog-overlay][data-state="closed"] { /* Closed state */ }
```

## Accessibility

All components follow ARIA best practices:

- **Accordion**: Uses `role="tablist"`, `role="tab"`, `role="tabpanel"`
- **Dialog**: Uses `role="dialog"`, focus management, and escape key handling
- **Keyboard Navigation**: Full keyboard support for all components
- **Screen Readers**: Proper ARIA attributes and announcements

## Migration from React

If you're migrating from the React version:

1. Replace JSX with HTML structure
2. Replace React components with vanilla JS classes
3. Replace React hooks with vanilla JS state management
4. Replace React event handlers with vanilla JS event listeners

### Before (React)

```jsx
<Accordion.Root type="multiple" defaultValue={['one']}>
  <Accordion.Item value="one">
    <Accordion.Trigger>One</Accordion.Trigger>
    <Accordion.Content>Content</Accordion.Content>
  </Accordion.Item>
</Accordion.Root>
```

### After (Vanilla JS)

```html
<div id="accordion">
  <div data-accordion-item data-value="one">
    <button data-accordion-trigger>One</button>
    <div data-accordion-content>Content</div>
  </div>
</div>
```

```javascript
const accordion = new Accordion(document.getElementById('accordion'), {
  type: 'multiple',
  defaultValue: ['one']
});
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## License

MIT
