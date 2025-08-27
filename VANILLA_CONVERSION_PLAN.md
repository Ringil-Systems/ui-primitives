# Vanilla JavaScript Conversion Plan

## Overview
Convert the Radix UI primitives library from React to vanilla JavaScript while maintaining the same functionality and API design.

## Current Structure Analysis
- **packages/react/**: Contains all React-based UI components
- **packages/core/**: Contains vanilla JS utilities (primitive, rect, number)
- **apps/**: Contains React-based testing applications

## Conversion Strategy

### 1. Create New Vanilla JS Package Structure
```
packages/
├── vanilla/           # New vanilla JS components
│   ├── accordion/
│   ├── dialog/
│   ├── dropdown-menu/
│   └── ... (all components)
├── core/             # Keep existing core utilities
└── react/            # Keep for reference during conversion
```

### 2. Component Conversion Patterns

#### React Component → Vanilla JS Class
```typescript
// Before (React)
const Accordion = React.forwardRef((props, ref) => {
  const [value, setValue] = useState([]);
  return <div ref={ref} {...props} />;
});

// After (Vanilla JS)
class Accordion {
  constructor(element, options = {}) {
    this.element = element;
    this.options = options;
    this.value = [];
    this.init();
  }
  
  init() {
    // Setup event listeners, state management
  }
  
  destroy() {
    // Cleanup
  }
}
```

#### React Hooks → Vanilla JS State Management
```typescript
// Before (React hooks)
const [value, setValue] = useControllableState({...});
const ref = useRef();

// After (Vanilla JS)
class StateManager {
  constructor() {
    this.value = null;
    this.listeners = new Set();
  }
  
  setValue(newValue) {
    this.value = newValue;
    this.notifyListeners();
  }
  
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
```

### 3. Key Conversion Areas

#### A. Context System → Event System
- Replace React Context with custom event system
- Use EventTarget for component communication
- Implement pub/sub pattern for state updates

#### B. Refs → Direct DOM References
- Replace React refs with direct DOM element references
- Use querySelector/querySelectorAll for child element access
- Implement proper cleanup on destroy

#### C. Event Handling
- Replace React event handlers with native addEventListener
- Implement proper event delegation
- Handle keyboard navigation and accessibility

#### D. State Management
- Replace React state with class properties
- Implement observable pattern for state changes
- Use custom events for state synchronization

### 4. API Design Goals

#### Maintain Familiar API
```javascript
// Vanilla JS API (similar to React)
const accordion = new Accordion(document.getElementById('accordion'), {
  type: 'multiple',
  defaultValue: ['one'],
  onValueChange: (value) => console.log(value)
});

// Or declarative API
Accordion.create('#accordion', {
  type: 'multiple',
  items: [
    { value: 'one', trigger: 'Section One', content: 'Content...' }
  ]
});
```

#### Support Both Imperative and Declarative Patterns
```javascript
// Imperative
const accordion = new Accordion(element, options);
accordion.open('one');
accordion.close('two');

// Declarative
Accordion.create(element, {
  items: [...],
  onItemToggle: (item) => {...}
});
```

### 5. Implementation Phases

#### Phase 1: Core Infrastructure
- [ ] Create vanilla package structure
- [ ] Implement base Component class
- [ ] Create event system
- [ ] Implement state management utilities

#### Phase 2: Simple Components
- [ ] Convert primitive components (Button, Div, etc.)
- [ ] Convert basic components (Separator, Label)
- [ ] Convert form components (Checkbox, Radio)

#### Phase 3: Complex Components
- [ ] Convert Accordion
- [ ] Convert Dialog
- [ ] Convert DropdownMenu
- [ ] Convert other complex components

#### Phase 4: Testing & Documentation
- [ ] Create vanilla JS examples
- [ ] Update documentation
- [ ] Create migration guide
- [ ] Add comprehensive tests

### 6. Build System Updates
- Remove React dependencies from package.json
- Update build scripts for vanilla JS
- Create new entry points for vanilla components
- Update TypeScript configurations

### 7. Testing Strategy
- Create vanilla JS testing app
- Port existing React tests to vanilla JS
- Add integration tests for component interactions
- Test accessibility features

### 8. Documentation Updates
- Update README for vanilla JS usage
- Create API documentation for vanilla components
- Provide migration guide from React
- Add vanilla JS examples

## Benefits of Vanilla JS Conversion
1. **No Framework Dependencies**: Can be used in any JavaScript environment
2. **Smaller Bundle Size**: No React runtime overhead
3. **Better Performance**: Direct DOM manipulation
4. **Framework Agnostic**: Works with any framework or no framework
5. **Easier Integration**: No React version conflicts

## Challenges to Address
1. **State Management**: Replacing React's state system
2. **Event Handling**: Managing complex event interactions
3. **Accessibility**: Maintaining ARIA attributes and keyboard navigation
4. **Testing**: Adapting React testing patterns to vanilla JS
5. **Documentation**: Updating extensive documentation
