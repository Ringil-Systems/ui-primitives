# Radix UI Vanilla JavaScript Conversion

> **Note**: This project is currently **paused/on hold** and being deprecated in favor of the `radix-themes-playground` repo. However, it is being preserved for future reference and potential revival.

## Overview

This project is a **fork of Radix UI primitives** that converts React-based UI components to **vanilla JavaScript**. The goal was to remove React dependencies and create a pure vanilla JavaScript library of UI primitives that maintain the same accessibility, functionality, and API patterns as the original React components.

## Current Status

- **Status**: 🟡 Paused/On Hold
- **Components Converted**: 21 out of ~50+ total Radix UI components
- **Last Updated**: December 2024
- **Build Status**: ✅ All components building successfully

## What's Been Accomplished

### ✅ Core Infrastructure
- **Component Base Class**: Abstract base class providing DOM manipulation, event handling, and lifecycle management
- **State Management**: Custom StateManager class replacing React's useState and useControllableState
- **Event System**: Custom EventTarget class replacing React's context system
- **Build System**: Configured tsup for CJS/ESM builds with TypeScript support

### ✅ Converted Components (21)
1. **Accordion** - Collapsible content sections
2. **AlertDialog** - Modal confirmation dialog
3. **AspectRatio** - Maintains aspect ratio for responsive content
4. **Avatar** - User avatar with image loading states
5. **Checkbox** - Form input with controlled state
6. **ContextMenu** - Right-click context menu with touch support
7. **Dialog** - Modal dialog with overlay
8. **DropdownMenu** - Contextual menu
9. **HoverCard** - Hover-triggered card with delay support
10. **Label** - Form label with accessibility
11. **Popover** - Floating content overlay
12. **Progress** - Progress bar with indeterminate/complete/loading states
13. **RadioGroup** - Radio button group
14. **ScrollArea** - Custom scrollable area with custom scrollbars
15. **Select** - Dropdown selection
16. **Separator** - Visual divider
17. **Switch** - Toggle switch
18. **Slider** - Range input with drag support
19. **Tabs** - Tabbed interface with keyboard navigation
20. **Tooltip** - Hover tooltip with delay support

## Quick Start

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd ui-primitives

# Install dependencies
npm install

# Build the vanilla components
cd packages/vanilla
npm run build
```

### Basic Usage

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module">
    import { Accordion } from './packages/vanilla/dist/accordion.mjs';
    
    // Create accordion instance
    const accordion = Accordion.create('#my-accordion', {
      type: 'single',
      defaultValue: 'item-1'
    });
    
    // Listen for events
    accordion.addEventListener('valueChange', (event) => {
      console.log('Accordion value changed:', event.detail.value);
    });
  </script>
</head>
<body>
  <div id="my-accordion" data-accordion>
    <div data-accordion-item data-value="item-1">
      <button data-accordion-trigger>Item 1</button>
      <div data-accordion-content>Content for item 1</div>
    </div>
    <div data-accordion-item data-value="item-2">
      <button data-accordion-trigger>Item 2</button>
      <div data-accordion-content>Content for item 2</div>
    </div>
  </div>
</body>
</html>
```

### Component API

All components follow a consistent API pattern:

```javascript
// Create component instance
const component = ComponentName.create(selector, options);

// Listen for events
component.addEventListener('eventName', (event) => {
  console.log('Event details:', event.detail);
});

// Update programmatically
component.setValue(newValue);

// Get current state
const value = component.getValue();

// Clean up
component.destroy();
```

## Project Structure

```
packages/vanilla/
├── src/
│   ├── core/                    # Base classes and utilities
│   │   ├── Component.ts        # Abstract base class
│   │   ├── StateManager.ts     # State management system
│   │   ├── EventTarget.ts      # Custom event system
│   │   └── index.ts
│   ├── accordion/              # Component implementations
│   ├── checkbox/
│   ├── dialog/
│   └── ...                     # Other components
├── dist/                       # Built files
├── test/                       # Unit tests
├── package.json
├── tsup.config.ts             # Build configuration
└── tsconfig.json              # TypeScript configuration
```

## Build System

### Build Commands

```bash
# Build all components
npm run build

# Watch mode for development
npm run dev

# Run unit tests
npm run test

# Run tests with coverage
npm run test:coverage
```

### Output Formats

- **CJS**: CommonJS format for Node.js compatibility
- **ESM**: ES modules for modern browsers
- **TypeScript**: Generated `.d.ts` files for type safety
- **Source Maps**: Included for debugging

## Testing

### Current Test Coverage

- ✅ **Test Framework**: Vitest with jsdom environment
- ✅ **Test Setup**: Mock DOM environment and utilities
- ✅ **Component Tests**: Accordion, Checkbox, RadioGroup have tests
- ⏳ **Coverage**: Need tests for remaining 18 components

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## Migration from React

### React Component
```jsx
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@radix-ui/react-accordion';

function MyAccordion() {
  return (
    <Accordion type="single" defaultValue="item-1">
      <AccordionItem value="item-1">
        <AccordionTrigger>Item 1</AccordionTrigger>
        <AccordionContent>Content 1</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
```

### Vanilla JavaScript Equivalent
```html
<div data-accordion>
  <div data-accordion-item data-value="item-1">
    <button data-accordion-trigger>Item 1</button>
    <div data-accordion-content>Content 1</div>
  </div>
</div>
```

```javascript
import { Accordion } from '@radix-ui/vanilla';

const accordion = Accordion.create('[data-accordion]', {
  type: 'single',
  defaultValue: 'item-1'
});
```

## Key Features

### ✅ Accessibility
- Full ARIA attribute support
- Keyboard navigation
- Screen reader compatibility
- Focus management

### ✅ Type Safety
- Full TypeScript support
- Generated type definitions
- Compile-time error checking

### ✅ Performance
- No React overhead
- Direct DOM manipulation
- Efficient event handling
- Tree-shakable components

### ✅ Developer Experience
- Familiar API patterns
- Comprehensive documentation
- Consistent component structure
- Easy debugging

## Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## Documentation

- **[Project Overview](PROJECT_OVERVIEW.md)** - Comprehensive project documentation
- **[Technical Architecture](TECHNICAL_ARCHITECTURE.md)** - Detailed technical implementation
- **[Component Conversion Guide](COMPONENT_CONVERSION_GUIDE.md)** - Step-by-step conversion instructions

## Future Considerations

### Potential Revival
This project could be revived in the future for:
- **Framework-agnostic UI library**: Pure vanilla JavaScript components
- **Performance-critical applications**: Where React overhead is not desired
- **Learning resource**: Understanding how React components work under the hood
- **Legacy system integration**: Adding modern UI components to existing vanilla JS applications

### Remaining Work
If revived, these components still need conversion:
- **High Priority**: Toggle, Toggle Group, Collapsible, Navigation Menu
- **Medium Priority**: Toast, Menubar, Command, Combobox, Calendar, Date Picker
- **Low Priority**: Carousel, Resizable, Split View, Tree View, Data Table, Form

## Contributing

While this project is currently paused, if you're interested in contributing when it's revived:

1. Fork the repository
2. Create a feature branch
3. Follow the established patterns and conventions
4. Add tests for new components
5. Update documentation
6. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Radix UI Team**: For the original React primitives that inspired this conversion
- **Open Source Community**: For the tools and libraries that made this project possible

---

**Note**: This project demonstrates that modern, accessible UI components can be built without React while maintaining excellent developer experience and performance. The patterns established here provide a solid foundation for future component development and can be applied to other framework-agnostic UI libraries.
