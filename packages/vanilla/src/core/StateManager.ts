import { EventTarget } from './EventTarget';

export interface StateOptions<T> {
  prop?: T;
  defaultProp?: T;
  onChange?: (value: T) => void;
  caller?: string;
}

export class StateManager<T> extends EventTarget {
  private _value: T;
  private options: StateOptions<T>;
  private isControlled: boolean;

  constructor(initialValue: T, options: StateOptions<T> = {}) {
    super();
    
    this.options = options;
    this.isControlled = options.prop !== undefined;
    
    // Determine initial value
    if (this.isControlled) {
      this._value = options.prop!;
    } else if (options.defaultProp !== undefined) {
      this._value = options.defaultProp;
    } else {
      this._value = initialValue;
    }
  }

  get value(): T {
    return this._value;
  }

  set value(newValue: T) {
    if (this.isControlled) {
      console.warn(
        `[${this.options.caller || 'StateManager'}] Cannot set value on controlled state. Use the onChange callback instead.`
      );
      return;
    }

    this.setValue(newValue);
  }

  setValue(newValue: T): void {
    if (this._value === newValue) return;

    const oldValue = this._value;
    this._value = newValue;

    // Call onChange callback
    this.options.onChange?.(newValue);

    // Dispatch change event
    this.dispatchEvent(new CustomEvent('change', {
      detail: { value: newValue, oldValue }
    }));
  }

  // For controlled components
  updateControlledValue(newValue: T): void {
    if (!this.isControlled) return;
    
    const oldValue = this._value;
    this._value = newValue;

    // Dispatch change event
    this.dispatchEvent(new CustomEvent('change', {
      detail: { value: newValue, oldValue }
    }));
  }

  // Subscribe to value changes
  subscribe(listener: (value: T) => void): () => void {
    const wrappedListener = (event: CustomEvent) => {
      listener(event.detail.value);
    };
    
    this.addEventListener('change', wrappedListener as EventListener);
    
    return () => {
      this.removeEventListener('change', wrappedListener as EventListener);
    };
  }

  // Get current value synchronously
  getValue(): T {
    return this._value;
  }

  // Check if state is controlled
  isControlledState(): boolean {
    return this.isControlled;
  }
}

// Utility function to create a state manager (similar to useState)
export function createState<T>(
  initialValue: T,
  options: StateOptions<T> = {}
): StateManager<T> {
  return new StateManager(initialValue, options);
}

// Utility function for controllable state (similar to useControllableState)
export function createControllableState<T>(
  options: StateOptions<T>
): StateManager<T> {
  const { prop, defaultProp, onChange, caller } = options;
  
  // Determine initial value
  let initialValue: T;
  if (prop !== undefined) {
    initialValue = prop;
  } else if (defaultProp !== undefined) {
    initialValue = defaultProp;
  } else {
    throw new Error(`[${caller || 'createControllableState'}] Either 'prop' or 'defaultProp' must be provided`);
  }

  return new StateManager(initialValue, options);
}
