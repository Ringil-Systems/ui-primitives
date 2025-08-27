import { Component } from '../core/Component';
import { createControllableState } from '../core/StateManager';
import { SelectOptions, SelectItem } from './types';

const OPEN_KEYS = [' ', 'Enter', 'ArrowUp', 'ArrowDown'];
const SELECTION_KEYS = [' ', 'Enter'];

export class Select extends Component {
  private items: Map<string, SelectItem> = new Map();
  private valueState!: ReturnType<typeof createControllableState<string>>;
  private openState!: ReturnType<typeof createControllableState<boolean>>;
  private placeholder: string = 'Select an option...';
  private disabled: boolean = false;
  private required: boolean = false;
  private name: string | undefined;
  private autoComplete: string | undefined;
  private form: string | undefined;
  private focusedIndex: number = -1;
  private searchTerm: string = '';
  private searchTimeout: number | null = null;

  constructor(element: HTMLElement, options: SelectOptions = {}) {
    super(element, options);
  }

  protected init(): void {
    const {
      value,
      defaultValue = '',
      onValueChange,
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      placeholder = 'Select an option...',
      disabled = false,
      required = false,
      name,
      autoComplete,
      form
    } = this.options as SelectOptions;

    this.placeholder = placeholder;
    this.disabled = disabled;
    this.required = required;
    this.name = name;
    this.autoComplete = autoComplete;
    this.form = form;

    // Initialize state
    this.valueState = createControllableState<string>({
      prop: value,
      defaultProp: defaultValue,
      onChange: onValueChange,
      caller: 'Select'
    });

    this.openState = createControllableState<boolean>({
      prop: openProp,
      defaultProp: defaultOpen,
      onChange: onOpenChange,
      caller: 'Select'
    });

    // Set up the element
    this.setupElement();
    
    // Find and initialize existing elements
    this.initializeElements();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Set initial state
    this.updateDisplay();
  }

  private setupElement(): void {
    this.setAttribute(this.element, 'data-select', '');
    
    if (this.disabled) {
      this.setAttribute(this.element, 'data-disabled', '');
    }
  }

  private initializeElements(): void {
    // Find trigger
    const trigger = this.querySelector('[data-select-trigger]');
    if (!trigger) {
      console.warn('Select missing trigger element');
      return;
    }

    // Find value display
    const value = this.querySelector('[data-select-value]');
    if (!value) {
      console.warn('Select missing value element');
      return;
    }

    // Find icon
    const icon = this.querySelector('[data-select-icon]');
    if (!icon) {
      console.warn('Select missing icon element');
      return;
    }

    // Find content
    const content = this.querySelector('[data-select-content]');
    if (!content) {
      console.warn('Select missing content element');
      return;
    }

    // Find viewport
    const viewport = this.querySelector('[data-select-viewport]');
    if (!viewport) {
      console.warn('Select missing viewport element');
      return;
    }

    // Find items
    const itemElements = this.querySelectorAll('[data-select-item]');
    
    itemElements.forEach((itemElement) => {
      const value = this.getDataAttribute(itemElement, 'value');
      if (!value) {
        console.warn('Select item missing value attribute:', itemElement);
        return;
      }

      const text = itemElement.textContent?.trim() || '';
      const itemDisabled = this.hasAttribute(itemElement, 'disabled');

      const selectItem: SelectItem = {
        value,
        element: itemElement,
        text,
        disabled: itemDisabled,
        selected: false
      };

      this.items.set(value, selectItem);
      this.setupItem(selectItem);
    });
  }

  private setupItem(item: SelectItem): void {
    const { element, value, disabled } = item;

    // Set up item
    this.setAttribute(element, 'role', 'option');
    this.setAttribute(element, 'data-select-item', '');
    this.setAttribute(element, 'data-value', value);
    
    if (disabled) {
      this.setAttribute(element, 'aria-disabled', 'true');
      this.setAttribute(element, 'data-disabled', '');
    }

    // Add event listeners
    this.addEventListener(element, 'click', (e) => this.handleItemClick(e, item));
    this.addEventListener(element, 'keydown', (e) => this.handleItemKeydown(e as KeyboardEvent, item));
    this.addEventListener(element, 'focus', () => this.handleItemFocus(item));
    this.addEventListener(element, 'mouseenter', () => this.handleItemMouseEnter(item));
  }

  private setupEventListeners(): void {
    // Listen for value changes
    this.valueState.subscribe((value: string) => {
      this.updateDisplay();
      this.dispatchEvent(new CustomEvent('valueChange', { detail: { value } }));
    });

    // Listen for open state changes
    this.openState.subscribe((open: boolean) => {
      this.updateOpenState(open);
      this.dispatchEvent(new CustomEvent('openChange', { detail: { open } }));
    });

    // Handle keyboard navigation on the trigger
    const trigger = this.querySelector('[data-select-trigger]');
    if (trigger) {
      this.addEventListener(trigger, 'keydown', (e) => this.handleTriggerKeydown(e as KeyboardEvent));
      this.addEventListener(trigger, 'click', (e) => this.handleTriggerClick(e));
    }

    // Handle outside clicks
    this.addEventListener(document, 'click', (e) => this.handleOutsideClick(e));
    
    // Handle escape key
    this.addEventListener(document, 'keydown', (e) => {
      if ((e as KeyboardEvent).key === 'Escape' && (this.openState.getValue() as boolean)) {
        this.openState.setValue(false);
      }
    });
  }

  private handleTriggerClick(event: Event): void {
    event.preventDefault();
    
    if (this.disabled) return;

    const isOpen = this.openState.getValue() as boolean;
    this.openState.setValue(!isOpen);
  }

  private handleTriggerKeydown(event: KeyboardEvent): void {
    if (this.disabled) return;

    switch (event.key) {
      case ' ':
      case 'Enter':
      case 'ArrowUp':
      case 'ArrowDown':
        event.preventDefault();
        if (!(this.openState.getValue() as boolean)) {
          this.openState.setValue(true);
        }
        break;
    }
  }

  private handleItemClick(event: Event, item: SelectItem): void {
    event.preventDefault();
    
    if (item.disabled || this.disabled) return;

    this.valueState.setValue(item.value);
    this.openState.setValue(false);
    this.dispatchEvent(new CustomEvent('select', { detail: { value: item.value } }));
  }

  private handleItemKeydown(event: KeyboardEvent, item: SelectItem): void {
    if (item.disabled || this.disabled) return;

    switch (event.key) {
      case ' ':
      case 'Enter':
        event.preventDefault();
        this.handleItemClick(event, item);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusPreviousItem();
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.focusNextItem();
        break;
      case 'Home':
        event.preventDefault();
        this.focusFirstItem();
        break;
      case 'End':
        event.preventDefault();
        this.focusLastItem();
        break;
    }
  }

  private handleItemFocus(item: SelectItem): void {
    const items = Array.from(this.items.values()).filter(item => !item.disabled);
    this.focusedIndex = items.findIndex(i => i.value === item.value);
  }

  private handleItemMouseEnter(item: SelectItem): void {
    if (!item.disabled) {
      item.element.focus();
    }
  }

  private handleOutsideClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!this.element.contains(target)) {
      this.openState.setValue(false);
    }
  }

  private focusPreviousItem(): void {
    const items = Array.from(this.items.values()).filter(item => !item.disabled);
    if (items.length === 0) return;

    this.focusedIndex = this.focusedIndex <= 0 ? items.length - 1 : this.focusedIndex - 1;
    items[this.focusedIndex]?.element.focus();
  }

  private focusNextItem(): void {
    const items = Array.from(this.items.values()).filter(item => !item.disabled);
    if (items.length === 0) return;

    this.focusedIndex = this.focusedIndex >= items.length - 1 ? 0 : this.focusedIndex + 1;
    items[this.focusedIndex]?.element.focus();
  }

  private focusFirstItem(): void {
    const items = Array.from(this.items.values()).filter(item => !item.disabled);
    if (items.length > 0) {
      this.focusedIndex = 0;
      items[0]?.element.focus();
    }
  }

  private focusLastItem(): void {
    const items = Array.from(this.items.values()).filter(item => !item.disabled);
    if (items.length > 0) {
      this.focusedIndex = items.length - 1;
      items[items.length - 1]?.element.focus();
    }
  }

  private updateDisplay(): void {
    const currentValue = this.valueState.getValue();
    const valueElement = this.querySelector('[data-select-value]');
    const trigger = this.querySelector('[data-select-trigger]');
    
    if (!valueElement || !trigger) return;

    if (currentValue && this.items.has(currentValue)) {
      const selectedItem = this.items.get(currentValue)!;
      valueElement.textContent = selectedItem.text;
      trigger.removeAttribute('data-placeholder');
      valueElement.removeAttribute('data-placeholder');
    } else {
      valueElement.textContent = this.placeholder;
      this.setAttribute(trigger, 'data-placeholder', 'true');
      this.setAttribute(valueElement, 'data-placeholder', 'true');
    }

    // Update item states
    this.items.forEach((item, value) => {
      const isSelected = currentValue === value;
      item.selected = isSelected;
      
      if (isSelected) {
        this.setAttribute(item.element, 'aria-selected', 'true');
        this.setDataAttribute(item.element, 'state', 'checked');
      } else {
        this.setAttribute(item.element, 'aria-selected', 'false');
        this.setDataAttribute(item.element, 'state', 'unchecked');
      }
    });
  }

  private updateOpenState(open: boolean): void {
    const trigger = this.querySelector('[data-select-trigger]');
    const content = this.querySelector('[data-select-content]');
    const icon = this.querySelector('[data-select-icon]');
    
    if (!trigger || !content || !icon) return;

    if (open) {
      this.setAttribute(trigger, 'aria-expanded', 'true');
      this.setDataAttribute(trigger, 'state', 'open');
      content.removeAttribute('hidden');
      this.setDataAttribute(content, 'state', 'open');
      this.setDataAttribute(icon, 'state', 'open');
      
      // Focus first item
      this.focusFirstItem();
    } else {
      this.setAttribute(trigger, 'aria-expanded', 'false');
      this.setDataAttribute(trigger, 'state', 'closed');
      this.setAttribute(content, 'hidden', '');
      this.setDataAttribute(content, 'state', 'closed');
      this.setDataAttribute(icon, 'state', 'closed');
      
      // Focus trigger
      trigger.focus();
    }
  }

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

  public addItem(value: string, text: string, disabled: boolean = false): void {
    const itemElement = this.createElement('div', {
      'data-select-item': '',
      'data-value': value,
      'role': 'option',
      'tabindex': '-1'
    }, [text]);

    if (disabled) {
      this.setAttribute(itemElement, 'aria-disabled', 'true');
      this.setAttribute(itemElement, 'data-disabled', '');
    }

    const viewport = this.querySelector('[data-select-viewport]');
    if (viewport) {
      viewport.appendChild(itemElement);
    }

    const selectItem: SelectItem = {
      value,
      element: itemElement,
      text,
      disabled,
      selected: false
    };

    this.items.set(value, selectItem);
    this.setupItem(selectItem);
    this.updateDisplay();
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
      item.element.removeAttribute('aria-disabled');
      item.element.removeAttribute('data-disabled');
    }
  }

  public disableItem(value: string): void {
    const item = this.items.get(value);
    if (item) {
      item.disabled = true;
      this.setAttribute(item.element, 'aria-disabled', 'true');
      this.setAttribute(item.element, 'data-disabled', '');
    }
  }

  // Static factory method
  static create(selector: string | HTMLElement, options: SelectOptions = {}): Select {
    const element = typeof selector === 'string' 
      ? document.querySelector(selector) as HTMLElement
      : selector;
    
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    return new Select(element, options);
  }

  protected cleanup(): void {
    this.items.clear();
    this.valueState = null as any;
    this.openState = null as any;
    
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }
}
