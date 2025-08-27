# Technical Architecture Documentation

## Overview

This document provides a detailed technical overview of the vanilla JavaScript conversion of Radix UI primitives, including the architectural decisions, implementation patterns, and technical challenges encountered.

## Core Architecture

### 1. Component Base Class

The foundation of the entire system is the `Component` base class, which provides a consistent interface for all UI components.

#### Key Design Decisions

**Why a Base Class?**
- Provides consistent API across all components
- Centralizes common functionality (DOM manipulation, event handling)
- Enforces consistent lifecycle management
- Reduces code duplication

**Abstract vs Concrete**
- Chose abstract class to enforce implementation of required methods
- Allows for shared functionality while requiring component-specific logic
- Provides type safety and clear contracts

#### Implementation Details

```typescript
export abstract class Component {
  protected element: HTMLElement;
  protected options: any;
  private eventListeners: Map<string, Set<{ target: EventTarget; handler: EventListener }>>;

  constructor(element: HTMLElement, options: any = {}) {
    this.element = element;
    this.options = options;
    this.eventListeners = new Map();
    this.init();
  }

  // DOM Manipulation Methods
  protected querySelector(selector: string): HTMLElement | null {
    return this.element.querySelector(selector);
  }

  protected createElement(
    tag: string, 
    attributes: Record<string, string> = {}, 
    children: string[] = []
  ): HTMLElement {
    const element = document.createElement(tag);
    
    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        element.setAttribute(key, value);
      }
    });
    
    // Add children
    children.forEach(child => {
      element.appendChild(document.createTextNode(child));
    });
    
    return element;
  }

  // Event Handling
  protected addEventListener(
    target: EventTarget, 
    event: string, 
    handler: EventListener
  ): void {
    target.addEventListener(event, handler);
    
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add({ target, handler });
  }

  protected dispatchEvent(event: Event): void {
    this.element.dispatchEvent(event);
  }

  // Lifecycle Methods
  protected abstract init(): void;
  protected abstract cleanup(): void;

  public destroy(): void {
    // Remove all event listeners
    this.eventListeners.forEach((listeners, event) => {
      listeners.forEach(({ target, handler }) => {
        target.removeEventListener(event, handler);
      });
    });
    this.eventListeners.clear();
    
    this.cleanup();
  }
}
```

### 2. State Management System

The state management system replaces React's `useState` and `useControllableState` with a custom implementation.

#### Design Philosophy

**Controlled vs Uncontrolled Components**
- Supports both controlled (external state) and uncontrolled (internal state) patterns
- Maintains compatibility with React patterns
- Provides clear API for state updates

**Type Safety**
- Full TypeScript support with generics
- Compile-time type checking for state values
- Prevents runtime type errors

#### Implementation

```typescript
export class StateManager<T> {
  private value: T;
  private onChange?: (value: T) => void;
  private subscribers: Set<(value: T) => void> = new Set();

  constructor(initialValue: T, onChange?: (value: T) => void) {
    this.value = initialValue;
    this.onChange = onChange;
  }

  setValue(value: T): void {
    if (this.value !== value) {
      this.value = value;
      this.onChange?.(value);
      this.notifySubscribers();
    }
  }

  getValue(): T {
    return this.value;
  }

  subscribe(callback: (value: T) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.value));
  }
}

export function createControllableState<T>(options: {
  prop?: T;
  defaultProp?: T;
  onChange?: (value: T) => void;
}): StateManager<T> {
  const { prop, defaultProp, onChange } = options;
  
  // Determine initial value
  let initialValue: T;
  if (prop !== undefined) {
    initialValue = prop;
  } else if (defaultProp !== undefined) {
    initialValue = defaultProp;
  } else {
    throw new Error('Either prop or defaultProp must be provided');
  }

  const stateManager = new StateManager<T>(initialValue, onChange);

  // If controlled, update when prop changes
  if (prop !== undefined) {
    stateManager.setValue(prop);
  }

  return stateManager;
}
```

### 3. Event System

The custom event system replaces React's context system and synthetic events.

#### Design Goals

**Native DOM Events**
- Use native `CustomEvent` for component-specific events
- Maintain familiar event handling patterns
- Provide type-safe event details

**Event Bubbling**
- Events bubble up through the DOM naturally
- Allows for event delegation and parent component handling
- Maintains standard web platform behavior

#### Implementation

```typescript
// Example event dispatch
this.dispatchEvent(new CustomEvent('valueChange', {
  detail: { value: this.value, max: this.max },
  bubbles: true,
  cancelable: true
}));

// Example event handling
component.addEventListener('valueChange', (event) => {
  const { value, max } = event.detail;
  console.log(`Value changed to ${value} of ${max}`);
});
```

## Component Implementation Patterns

### 1. Standard Component Structure

All components follow a consistent structure:

```typescript
export class ComponentName extends Component {
  // Private properties
  private elements: ComponentElements;
  private state: StateManager<StateType>;

  constructor(element: HTMLElement, options: ComponentOptions = {}) {
    super(element, options);
    
    // Initialize state
    this.state = createControllableState<StateType>({
      prop: options.prop,
      defaultProp: options.defaultProp,
      onChange: options.onChange,
    });

    // Initialize elements
    this.elements = {
      // Element references
    };
  }

  protected init(): void {
    this.findElements();
    this.setupAttributes();
    this.setupEventListeners();
    this.updateDisplay();
  }

  private findElements(): void {
    // Find or create required DOM elements
    // Use data attributes for element identification
  }

  private setupAttributes(): void {
    // Set up ARIA attributes, roles, and data attributes
    // Ensure accessibility compliance
  }

  private setupEventListeners(): void {
    // Set up event listeners for user interactions
    // Handle keyboard navigation, mouse events, etc.
  }

  private updateDisplay(): void {
    // Update visual state based on current state
    // Handle show/hide, enable/disable, etc.
  }

  // Public API methods
  public setValue(value: StateType): void {
    this.state.setValue(value);
  }

  public getValue(): StateType {
    return this.state.getValue();
  }

  // Static factory method
  static create(selector: string | HTMLElement, options: ComponentOptions = {}): ComponentName {
    const element = typeof selector === 'string' 
      ? document.querySelector(selector) as HTMLElement
      : selector;
    
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    return new ComponentName(element, options);
  }

  protected cleanup(): void {
    // Clean up any resources, timers, etc.
  }
}
```

### 2. Element Finding Strategy

**Data Attribute Pattern**
- Use `data-*` attributes for element identification
- Provides semantic meaning and avoids class-based selectors
- Allows for flexible HTML structure

```typescript
private findElements(): void {
  // Find existing elements
  this.elements.trigger = this.querySelector('[data-accordion-trigger]');
  
  // Create elements if they don't exist
  if (!this.elements.trigger) {
    this.elements.trigger = this.createElement('button', {
      'data-accordion-trigger': '',
      'type': 'button'
    });
  }
}
```

### 3. Accessibility Implementation

**ARIA Attributes**
- All components include proper ARIA attributes
- Dynamic updates based on state changes
- Screen reader compatibility

```typescript
private setupAttributes(): void {
  // Set up ARIA attributes
  this.setAttribute(this.element, 'role', 'button');
  this.setAttribute(this.element, 'aria-expanded', 'false');
  this.setAttribute(this.element, 'aria-controls', this.elements.content.id);
}

private updateDisplay(): void {
  // Update ARIA attributes based on state
  const isExpanded = this.state.getValue();
  this.setAttribute(this.element, 'aria-expanded', isExpanded.toString());
}
```

### 4. Keyboard Navigation

**Standard Patterns**
- Arrow keys for navigation
- Enter/Space for activation
- Escape for cancellation
- Tab for focus management

```typescript
private handleKeydown(event: Event): void {
  const key = (event as KeyboardEvent).key;
  
  switch (key) {
    case 'ArrowDown':
      event.preventDefault();
      this.focusNextItem();
      break;
    case 'ArrowUp':
      event.preventDefault();
      this.focusPreviousItem();
      break;
    case 'Enter':
    case ' ':
      event.preventDefault();
      this.activateCurrentItem();
      break;
    case 'Escape':
      event.preventDefault();
      this.close();
      break;
  }
}
```

## Build System Architecture

### 1. Tsup Configuration

**Multi-Entry Build**
- Each component builds as a separate entry point
- Allows for tree-shaking and selective imports
- Maintains component isolation

```typescript
// tsup.config.ts
export default {
  entry: {
    index: 'src/index.ts',
    accordion: 'src/accordion/index.ts',
    checkbox: 'src/checkbox/index.ts',
    // ... other components
  },
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: [],
}
```

### 2. TypeScript Configuration

**Module Resolution**
- Uses NodeNext for modern module resolution
- Supports both CommonJS and ESM
- Proper type definition generation

```json
{
  "extends": "../../internal/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "moduleResolution": "NodeNext",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test"]
}
```

## Testing Architecture

### 1. Test Environment Setup

**JSDOM Integration**
- Uses jsdom for DOM simulation
- Provides realistic browser environment
- Supports all DOM APIs used by components

```typescript
// test/setup.ts
import { jsdom } from 'jsdom';

const dom = new jsdom('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;
global.HTMLElement = dom.window.HTMLElement;
```

### 2. Test Utilities

**Common Test Functions**
- Element creation helpers
- Event simulation
- Assertion utilities

```typescript
// test/utils/test-utils.ts
export function createElement(tag: string, attributes: Record<string, string> = {}): HTMLElement {
  const element = document.createElement(tag);
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  return element;
}

export function fireEvent(element: HTMLElement, eventType: string, options: any = {}): void {
  const event = new Event(eventType, { bubbles: true, cancelable: true, ...options });
  element.dispatchEvent(event);
}
```

## Performance Considerations

### 1. Bundle Size Optimization

**Tree Shaking**
- Each component is a separate entry point
- Unused components can be eliminated from bundle
- Minimal runtime overhead

**Code Splitting**
- Components can be loaded independently
- Reduces initial bundle size
- Supports lazy loading

### 2. Runtime Performance

**DOM Manipulation**
- Direct DOM manipulation is faster than React's virtual DOM
- Minimal overhead for state updates
- Efficient event handling

**Memory Management**
- Proper cleanup of event listeners
- No memory leaks from component instances
- Efficient garbage collection

## Browser Compatibility

### 1. Supported Browsers

**Modern Browsers**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Features Used**
- ES2020+ features
- Custom Elements (if needed)
- Modern DOM APIs
- CSS Grid/Flexbox

### 2. Polyfills

**No Polyfills Required**
- Uses only standard web platform APIs
- No external dependencies
- Works in all modern browsers

## Security Considerations

### 1. XSS Prevention

**Safe DOM Manipulation**
- Uses `textContent` instead of `innerHTML`
- Validates all user inputs
- Sanitizes data attributes

### 2. Event Handling

**Event Delegation**
- Uses event delegation where appropriate
- Prevents event listener proliferation
- Efficient event handling

## Migration Strategy

### 1. From React Components

**Step-by-Step Process**
1. Replace JSX with HTML structure
2. Add data attributes for component identification
3. Initialize vanilla JavaScript component
4. Update event handlers to use native events
5. Test functionality and accessibility

### 2. Gradual Migration

**Hybrid Approach**
- Can coexist with React components
- Gradual replacement strategy
- No breaking changes to existing code

## Future Enhancements

### 1. Performance Optimizations

**Virtual Scrolling**
- For large lists and data tables
- Efficient rendering of large datasets
- Smooth scrolling performance

**Lazy Loading**
- Component-level code splitting
- On-demand loading of components
- Reduced initial bundle size

### 2. Advanced Features

**Animation System**
- CSS transitions and animations
- JavaScript-based animations
- Performance-optimized animations

**Theme System**
- CSS custom properties
- Dynamic theme switching
- Component-level theming

### 3. Developer Experience

**DevTools Integration**
- Browser extension for debugging
- Component state inspection
- Performance profiling

**TypeScript Improvements**
- Better type inference
- Stricter type checking
- Enhanced IntelliSense support

## Conclusion

The technical architecture successfully demonstrates that modern, accessible UI components can be built without React while maintaining excellent developer experience and performance. The patterns established here provide a solid foundation for future component development and can be applied to other framework-agnostic UI libraries.
