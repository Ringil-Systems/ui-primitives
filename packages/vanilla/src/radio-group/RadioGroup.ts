import { Component } from '../core/Component';
import { createControllableState } from '../core/StateManager';
import { RadioGroupOptions, RadioGroupOrientation, RadioGroupItem } from './types';

const ARROW_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

export class RadioGroup extends Component {
  private items: Map<string, RadioGroupItem> = new Map();
  private valueState!: ReturnType<typeof createControllableState<string>>;
  private orientation: RadioGroupOrientation = 'horizontal';
  private loop: boolean = false;
  private required: boolean = false;
  private disabled: boolean = false;
  private name: string | undefined;
  private focusedIndex: number = -1;
  private isArrowKeyPressed: boolean = false;

  constructor(element: HTMLElement, options: RadioGroupOptions = {}) {
    super(element, options);
  }

  protected init(): void {
    const {
      value,
      defaultValue = null,
      onValueChange,
      name,
      required = false,
      disabled = false,
      orientation = 'horizontal',
      loop = true
    } = this.options as RadioGroupOptions;

    this.orientation = orientation;
    this.loop = loop;
    this.required = required;
    this.disabled = disabled;
    this.name = name;

    // Initialize state
    this.valueState = createControllableState<string>({
      prop: value || undefined,
      defaultProp: defaultValue || undefined,
      onChange: onValueChange,
      caller: 'RadioGroup'
    });

    // Set up the element
    this.setupElement();
    
    // Find and initialize existing items
    this.initializeItems();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Set initial state
    this.updateItemsState();
  }

  private setupElement(): void {
    this.setAttribute(this.element, 'role', 'radiogroup');
    this.setAttribute(this.element, 'aria-required', this.required.toString());
    this.setAttribute(this.element, 'aria-orientation', this.orientation);
    
    if (this.disabled) {
      this.setAttribute(this.element, 'data-disabled', '');
    }
  }

  private initializeItems(): void {
    // Find all radio group items in the DOM
    const itemElements = this.querySelectorAll('[data-radio-group-item]');
    
    itemElements.forEach((itemElement) => {
      const value = this.getDataAttribute(itemElement, 'value');
      if (!value) {
        console.warn('Radio group item missing value attribute:', itemElement);
        return;
      }

      const radio = itemElement.querySelector('[data-radio]') as HTMLElement;
      const indicator = itemElement.querySelector('[data-radio-indicator]') as HTMLElement;
      
      if (!radio) {
        console.warn('Radio group item missing radio element:', itemElement);
        return;
      }

      const itemDisabled = this.hasAttribute(itemElement, 'disabled') || 
                          this.hasAttribute(radio, 'disabled');

      const radioGroupItem: RadioGroupItem = {
        value,
        element: itemElement,
        radio,
        indicator: indicator || this.createElement('span', { 'data-radio-indicator': '' }),
        disabled: itemDisabled,
        checked: false
      };

      this.items.set(value, radioGroupItem);
      this.setupItem(radioGroupItem);
    });
  }

  private setupItem(item: RadioGroupItem): void {
    const { radio, indicator, element, value } = item;

    // Set up radio button
    this.setAttribute(radio, 'role', 'radio');
    this.setAttribute(radio, 'aria-checked', 'false');
    this.setAttribute(radio, 'tabindex', '-1');
    
    if (item.disabled) {
      this.setAttribute(radio, 'aria-disabled', 'true');
    }

    // Set up indicator
    this.setDataAttribute(indicator, 'state', 'unchecked');
    
    if (item.disabled) {
      this.setAttribute(indicator, 'data-disabled', '');
    }

    // Set up item container
    this.setAttribute(element, 'data-radio-group-item', '');
    this.setAttribute(element, 'data-value', value);

    // Add event listeners
    this.addEventListener(radio, 'click', (e) => this.handleRadioClick(e, item));
    this.addEventListener(radio, 'keydown', (e) => this.handleRadioKeydown(e as KeyboardEvent, item));
    this.addEventListener(radio, 'focus', () => this.handleRadioFocus(item));
  }

  private setupEventListeners(): void {
    // Listen for value changes
    this.valueState.subscribe((value: string) => {
      this.updateItemsState();
      this.dispatchEvent(new CustomEvent('valueChange', { detail: { value } }));
    });

    // Handle keyboard navigation on the radio group container
    this.addEventListener(this.element, 'keydown', (e) => this.handleKeydown(e as KeyboardEvent));
    
    // Track arrow key presses
    this.addEventListener(document, 'keydown', (e) => {
      if (ARROW_KEYS.includes((e as KeyboardEvent).key)) {
        this.isArrowKeyPressed = true;
      }
    });
    
    this.addEventListener(document, 'keyup', (e) => {
      if (ARROW_KEYS.includes((e as KeyboardEvent).key)) {
        this.isArrowKeyPressed = false;
      }
    });
  }

  private handleRadioClick(event: Event, item: RadioGroupItem): void {
    event.preventDefault();
    
    if (item.disabled || this.disabled) return;

    this.valueState.setValue(item.value);
  }

  private handleRadioKeydown(event: KeyboardEvent, item: RadioGroupItem): void {
    if (item.disabled || this.disabled) return;

    switch (event.key) {
      case 'Enter':
        // According to WAI ARIA, radio groups don't activate items on enter keypress
        event.preventDefault();
        break;
      case ' ':
        event.preventDefault();
        this.handleRadioClick(event, item);
        break;
    }
  }

  private handleRadioFocus(item: RadioGroupItem): void {
    const items = Array.from(this.items.values()).filter(item => !item.disabled);
    this.focusedIndex = items.findIndex(i => i.value === item.value);
    
    // If focused via arrow key, check the radio
    if (this.isArrowKeyPressed) {
      this.valueState.setValue(item.value);
    }
  }

  private handleKeydown(event: KeyboardEvent): void {
    if (!ARROW_KEYS.includes(event.key)) return;
    
    const target = event.target as HTMLElement;
    const items = Array.from(this.items.values()).filter(item => !item.disabled);
    
    if (items.length === 0) return;

    // Find current focused item
    let currentIndex = this.focusedIndex;
    if (currentIndex === -1) {
      currentIndex = items.findIndex(item => item.radio === target);
    }

    if (currentIndex === -1) return;

    event.preventDefault();

    let nextIndex = currentIndex;
    const isDirectionLTR = this.getComputedDirection() === 'ltr';

    switch (event.key) {
      case 'ArrowRight':
        if (this.orientation === 'horizontal') {
          if (isDirectionLTR) {
            nextIndex = this.loop ? (currentIndex + 1) % items.length : Math.min(currentIndex + 1, items.length - 1);
          } else {
            nextIndex = this.loop ? (currentIndex - 1 + items.length) % items.length : Math.max(currentIndex - 1, 0);
          }
        }
        break;
      case 'ArrowDown':
        if (this.orientation === 'vertical') {
          nextIndex = this.loop ? (currentIndex + 1) % items.length : Math.min(currentIndex + 1, items.length - 1);
        }
        break;
      case 'ArrowLeft':
        if (this.orientation === 'horizontal') {
          if (isDirectionLTR) {
            nextIndex = this.loop ? (currentIndex - 1 + items.length) % items.length : Math.max(currentIndex - 1, 0);
          } else {
            nextIndex = this.loop ? (currentIndex + 1) % items.length : Math.min(currentIndex + 1, items.length - 1);
          }
        }
        break;
      case 'ArrowUp':
        if (this.orientation === 'vertical') {
          nextIndex = this.loop ? (currentIndex - 1 + items.length) % items.length : Math.max(currentIndex - 1, 0);
        }
        break;
    }

    items[nextIndex]?.radio.focus();
    this.focusedIndex = nextIndex;
  }

  private getComputedDirection(): 'ltr' | 'rtl' {
    return getComputedStyle(this.element).direction as 'ltr' | 'rtl';
  }

  private updateItemsState(): void {
    const currentValue = this.valueState.getValue();

    this.items.forEach((item, value) => {
      const isChecked = currentValue === value;
      this.updateItemState(item, isChecked);
    });
  }

  private updateItemState(item: RadioGroupItem, isChecked: boolean): void {
    item.checked = isChecked;
    
    // Update radio
    this.setAttribute(item.radio, 'aria-checked', isChecked.toString());
    this.setDataAttribute(item.radio, 'state', isChecked ? 'checked' : 'unchecked');
    
    // Update indicator
    this.setDataAttribute(item.indicator, 'state', isChecked ? 'checked' : 'unchecked');
    
    // Update tabindex
    if (isChecked) {
      this.setAttribute(item.radio, 'tabindex', '0');
    } else {
      this.setAttribute(item.radio, 'tabindex', '-1');
    }
  }

  public setValue(value: string): void {
    this.valueState.setValue(value);
  }

  public getValue(): string {
    return this.valueState.getValue() as string;
  }

  public addItem(value: string, radio: string | HTMLElement, indicator?: string | HTMLElement): void {
    const itemElement = this.createElement('div', { 'data-radio-group-item': '', 'data-value': value });
    
    const radioElement = typeof radio === 'string' 
      ? this.createElement('button', { 'data-radio': '' }, [radio])
      : radio;
    
    const indicatorElement = indicator ? 
      (typeof indicator === 'string' 
        ? this.createElement('span', { 'data-radio-indicator': '' }, [indicator])
        : indicator)
      : this.createElement('span', { 'data-radio-indicator': '' });

    itemElement.appendChild(radioElement);
    itemElement.appendChild(indicatorElement);
    this.element.appendChild(itemElement);

    const radioGroupItem: RadioGroupItem = {
      value,
      element: itemElement,
      radio: radioElement,
      indicator: indicatorElement,
      disabled: false,
      checked: false
    };

    this.items.set(value, radioGroupItem);
    this.setupItem(radioGroupItem);
    this.updateItemsState();
  }

  public removeItem(value: string): void {
    const item = this.items.get(value);
    if (item) {
      item.element.remove();
      this.items.delete(value);
    }
  }

  public enableItem(value: string): void {
    const item = this.items.get(value);
    if (item) {
      item.disabled = false;
      item.element.removeAttribute('disabled');
      item.radio.removeAttribute('aria-disabled');
      item.indicator.removeAttribute('data-disabled');
    }
  }

  public disableItem(value: string): void {
    const item = this.items.get(value);
    if (item) {
      item.disabled = true;
      this.setAttribute(item.element, 'disabled', '');
      this.setAttribute(item.radio, 'aria-disabled', 'true');
      this.setAttribute(item.indicator, 'data-disabled', '');
    }
  }

  // Static factory method
  static create(selector: string | HTMLElement, options: RadioGroupOptions = {}): RadioGroup {
    const element = typeof selector === 'string' 
      ? document.querySelector(selector) as HTMLElement
      : selector;
    
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    return new RadioGroup(element, options);
  }

  protected cleanup(): void {
    this.items.clear();
    this.valueState = null as any;
  }
}
