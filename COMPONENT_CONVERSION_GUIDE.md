# Component Conversion Guide

## Overview

This guide provides step-by-step instructions for converting Radix UI React components to vanilla JavaScript. It covers the conversion process, common patterns, and best practices established during this project.

## Conversion Process

### Step 1: Analyze the React Component

Before starting the conversion, thoroughly analyze the React component:

1. **Identify Dependencies**
   - React hooks (`useState`, `useEffect`, `useCallback`, etc.)
   - Context providers and consumers
   - Event handlers and callbacks
   - Props and their types

2. **Understand State Management**
   - Controlled vs uncontrolled patterns
   - State initialization and updates
   - Side effects and cleanup

3. **Map Event Handling**
   - User interactions (click, keyboard, focus)
   - Form events
   - Custom events and callbacks

### Step 2: Create TypeScript Types

Define the component's TypeScript interfaces:

```typescript
// packages/vanilla/src/component-name/types.ts

export interface ComponentNameOptions {
  // Convert React props to options
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  // ... other options
}

export interface ComponentNameElements {
  // Define required DOM elements
  root: HTMLElement;
  trigger: HTMLElement;
  content: HTMLElement;
  // ... other elements
}

export interface ComponentNameEvents {
  // Define custom events
  valueChange: CustomEvent<{ value: string }>;
  openChange: CustomEvent<{ open: boolean }>;
  // ... other events
}
```

### Step 3: Implement the Component Class

Create the vanilla JavaScript component:

```typescript
// packages/vanilla/src/component-name/ComponentName.ts

import { Component } from '../core/Component';
import { createControllableState } from '../core/StateManager';
import type { ComponentNameOptions, ComponentNameElements } from './types';

export class ComponentName extends Component {
  private elements: ComponentNameElements;
  private valueState: ReturnType<typeof createControllableState<string>>;
  private openState: ReturnType<typeof createControllableState<boolean>>;

  constructor(element: HTMLElement, options: ComponentNameOptions = {}) {
    super(element, options);

    // Initialize state managers
    this.valueState = createControllableState<string>({
      prop: options.value,
      defaultProp: options.defaultValue,
      onChange: options.onValueChange,
    });

    this.openState = createControllableState<boolean>({
      prop: options.open,
      defaultProp: options.defaultOpen ?? false,
      onChange: options.onOpenChange,
    });

    // Initialize elements
    this.elements = {
      root: element,
      trigger: null as any,
      content: null as any,
    };
  }

  protected init(): void {
    this.findElements();
    this.setupAttributes();
    this.setupEventListeners();
    this.updateDisplay();
  }

  private findElements(): void {
    // Find or create required elements
    this.elements.trigger = this.querySelector('[data-component-name-trigger]') || 
      this.createElement('button', {
        'data-component-name-trigger': '',
        'type': 'button'
      });

    this.elements.content = this.querySelector('[data-component-name-content]') || 
      this.createElement('div', {
        'data-component-name-content': ''
      });

    // Add elements to DOM if they don't exist
    if (!this.querySelector('[data-component-name-trigger]')) {
      this.element.appendChild(this.elements.trigger);
    }
    if (!this.querySelector('[data-component-name-content]')) {
      this.element.appendChild(this.elements.content);
    }
  }

  private setupAttributes(): void {
    // Set up root element
    this.setAttribute(this.element, 'data-component-name', '');

    // Set up trigger
    this.setAttribute(this.elements.trigger, 'data-component-name-trigger', '');
    this.setAttribute(this.elements.trigger, 'type', 'button');

    // Set up content
    this.setAttribute(this.elements.content, 'data-component-name-content', '');
  }

  private setupEventListeners(): void {
    // Listen for state changes
    this.valueState.subscribe((value: string) => {
      this.updateDisplay();
      this.dispatchEvent(new CustomEvent('valueChange', { 
        detail: { value } 
      }));
    });

    this.openState.subscribe((open: boolean) => {
      this.updateDisplay();
      this.dispatchEvent(new CustomEvent('openChange', { 
        detail: { open } 
      }));
    });

    // Handle user interactions
    this.addEventListener(this.elements.trigger, 'click', (e) => this.handleTriggerClick(e));
    this.addEventListener(this.elements.trigger, 'keydown', (e) => this.handleTriggerKeydown(e));
  }

  private handleTriggerClick(event: Event): void {
    event.preventDefault();
    this.openState.setValue(!this.openState.getValue());
  }

  private handleTriggerKeydown(event: Event): void {
    const key = (event as KeyboardEvent).key;
    
    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      this.handleTriggerClick(event);
    } else if (key === 'Escape') {
      event.preventDefault();
      this.openState.setValue(false);
    }
  }

  private updateDisplay(): void {
    const isOpen = this.openState.getValue();
    const value = this.valueState.getValue();

    // Update visual state
    if (isOpen) {
      this.elements.content.removeAttribute('hidden');
      this.setAttribute(this.elements.trigger, 'aria-expanded', 'true');
      this.setDataAttribute(this.element, 'state', 'open');
    } else {
      this.setAttribute(this.elements.content, 'hidden', '');
      this.setAttribute(this.elements.trigger, 'aria-expanded', 'false');
      this.setDataAttribute(this.element, 'state', 'closed');
    }

    // Update ARIA attributes
    this.setAttribute(this.elements.trigger, 'aria-controls', this.elements.content.id);
  }

  // Public API methods
  public setValue(value: string): void {
    this.valueState.setValue(value);
  }

  public getValue(): string {
    return this.valueState.getValue();
  }

  public open(): void {
    this.openState.setValue(true);
  }

  public close(): void {
    this.openState.setValue(false);
  }

  public isOpen(): boolean {
    return this.openState.getValue();
  }

  // Static factory method
  static create(selector: string | HTMLElement, options: ComponentNameOptions = {}): ComponentName {
    const element = typeof selector === 'string' 
      ? document.querySelector(selector) as HTMLElement
      : selector;
    
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    return new ComponentName(element, options);
  }

  protected cleanup(): void {
    this.valueState = null as any;
    this.openState = null as any;
    this.elements = null as any;
  }
}
```

### Step 4: Create Module Exports

Create the index file for the component:

```typescript
// packages/vanilla/src/component-name/index.ts

export * from './ComponentName';
export * from './types';
```

### Step 5: Update Package Configuration

Add the component to the build system:

1. **Update main index file**:
```typescript
// packages/vanilla/src/index.ts
export * from './component-name';
```

2. **Update tsup config**:
```typescript
// packages/vanilla/tsup.config.ts
export default {
  entry: {
    // ... existing entries
    'component-name': 'src/component-name/index.ts',
  },
  // ... rest of config
}
```

3. **Update package.json exports**:
```json
// packages/vanilla/package.json
{
  "exports": {
    // ... existing exports
    "./component-name": {
      "import": {
        "types": "./dist/component-name.d.mts",
        "default": "./dist/component-name.mjs"
      },
      "require": {
        "types": "./dist/component-name.d.ts",
        "default": "./dist/component-name.js"
      }
    }
  }
}
```

## Common Conversion Patterns

### 1. React Hooks to State Management

#### React useState
```typescript
// React
const [value, setValue] = useState('default');

// Vanilla JS
this.valueState = createControllableState<string>({
  defaultProp: 'default',
  onChange: (value) => {
    // Handle value change
  }
});
```

#### React useEffect
```typescript
// React
useEffect(() => {
  // Side effect
  return () => {
    // Cleanup
  };
}, [dependencies]);

// Vanilla JS
// Handle in constructor or init method
// Cleanup in cleanup method
```

#### React useCallback
```typescript
// React
const handleClick = useCallback((event) => {
  // Handle click
}, [dependencies]);

// Vanilla JS
// Define as class method, no memoization needed
private handleClick(event: Event): void {
  // Handle click
}
```

### 2. Event Handling

#### React Event Handlers
```typescript
// React
const handleClick = (event) => {
  event.preventDefault();
  setValue(newValue);
};

// Vanilla JS
private handleClick(event: Event): void {
  event.preventDefault();
  this.valueState.setValue(newValue);
}
```

#### Custom Events
```typescript
// React
onValueChange?.(newValue);

// Vanilla JS
this.dispatchEvent(new CustomEvent('valueChange', {
  detail: { value: newValue }
}));
```

### 3. DOM Manipulation

#### React JSX
```jsx
// React
<div className="component" data-state={isOpen ? 'open' : 'closed'}>
  <button onClick={handleClick}>Trigger</button>
  {isOpen && <div>Content</div>}
</div>

// Vanilla JS HTML
<div data-component-name>
  <button data-component-name-trigger>Trigger</button>
  <div data-component-name-content hidden>Content</div>
</div>

// Vanilla JS JavaScript
this.setDataAttribute(this.element, 'state', isOpen ? 'open' : 'closed');
if (isOpen) {
  this.elements.content.removeAttribute('hidden');
} else {
  this.setAttribute(this.elements.content, 'hidden', '');
}
```

### 4. Accessibility

#### ARIA Attributes
```typescript
// React
<button
  aria-expanded={isOpen}
  aria-controls={contentId}
  role="button"
>

// Vanilla JS
this.setAttribute(this.elements.trigger, 'aria-expanded', isOpen.toString());
this.setAttribute(this.elements.trigger, 'aria-controls', this.elements.content.id);
this.setAttribute(this.elements.trigger, 'role', 'button');
```

### 5. Focus Management

#### Focus Handling
```typescript
// React
useEffect(() => {
  if (isOpen) {
    contentRef.current?.focus();
  }
}, [isOpen]);

// Vanilla JS
private updateDisplay(): void {
  if (this.openState.getValue()) {
    this.elements.content.focus();
  }
}
```

## Testing the Conversion

### 1. Build Test
```bash
npm run build
```

### 2. TypeScript Check
```bash
npx tsc --noEmit
```

### 3. Runtime Test
```html
<!DOCTYPE html>
<html>
<head>
  <script type="module">
    import { ComponentName } from './dist/component-name.mjs';
    
    const component = ComponentName.create('#test-component', {
      defaultValue: 'test'
    });
    
    component.addEventListener('valueChange', (event) => {
      console.log('Value changed:', event.detail.value);
    });
  </script>
</head>
<body>
  <div id="test-component" data-component-name>
    <button data-component-name-trigger>Test</button>
    <div data-component-name-content hidden>Content</div>
  </div>
</body>
</html>
```

## Common Challenges and Solutions

### 1. Complex State Logic

**Challenge**: Some components have intricate state management with multiple interdependent states.

**Solution**: Use multiple StateManager instances and coordinate them in the updateDisplay method:

```typescript
private updateDisplay(): void {
  const value = this.valueState.getValue();
  const isOpen = this.openState.getValue();
  const isDisabled = this.disabledState.getValue();

  // Coordinate all states
  if (isDisabled) {
    this.elements.trigger.setAttribute('disabled', '');
    this.openState.setValue(false);
  } else {
    this.elements.trigger.removeAttribute('disabled');
  }

  // Update visual state
  this.setDataAttribute(this.element, 'state', this.getState());
}

private getState(): string {
  if (this.disabledState.getValue()) return 'disabled';
  if (this.openState.getValue()) return 'open';
  return 'closed';
}
```

### 2. Event Propagation

**Challenge**: React's synthetic events handle propagation differently than native DOM events.

**Solution**: Explicitly handle event propagation:

```typescript
private handleClick(event: Event): void {
  event.preventDefault();
  event.stopPropagation();
  
  // Handle click logic
}
```

### 3. Async Operations

**Challenge**: React's useEffect handles async operations and cleanup automatically.

**Solution**: Manage async operations manually:

```typescript
export class ComponentName extends Component {
  private asyncTimer: number | null = null;

  private startAsyncOperation(): void {
    this.asyncTimer = window.setTimeout(() => {
      // Async operation
      this.updateDisplay();
    }, 1000);
  }

  protected cleanup(): void {
    if (this.asyncTimer) {
      clearTimeout(this.asyncTimer);
      this.asyncTimer = null;
    }
  }
}
```

### 4. Complex DOM Structure

**Challenge**: Some components have complex nested DOM structures that are difficult to manage.

**Solution**: Use a hierarchical approach:

```typescript
private findElements(): void {
  // Find main container
  this.elements.container = this.querySelector('[data-component-container]');
  
  // Find nested elements
  if (this.elements.container) {
    this.elements.trigger = this.elements.container.querySelector('[data-component-trigger]');
    this.elements.content = this.elements.container.querySelector('[data-component-content]');
  }
  
  // Create missing elements
  if (!this.elements.container) {
    this.elements.container = this.createElement('div', { 'data-component-container': '' });
    this.element.appendChild(this.elements.container);
  }
}
```

## Best Practices

### 1. Error Handling
- Always validate inputs and props
- Provide meaningful error messages
- Handle edge cases gracefully

### 2. Performance
- Minimize DOM queries
- Use efficient event delegation
- Clean up resources properly

### 3. Accessibility
- Maintain all ARIA attributes
- Ensure keyboard navigation works
- Test with screen readers

### 4. Type Safety
- Use strict TypeScript configuration
- Define proper interfaces
- Avoid `any` types when possible

### 5. Documentation
- Add JSDoc comments
- Provide usage examples
- Document all public methods

## Conclusion

Converting React components to vanilla JavaScript requires careful analysis and systematic implementation. By following this guide and the established patterns, you can successfully convert complex React components while maintaining their functionality and accessibility.

The key is to understand the React component's behavior, map it to vanilla JavaScript patterns, and ensure that all functionality is preserved. With practice, this process becomes more straightforward and can be applied to any React component.
