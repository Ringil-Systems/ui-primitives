import { Component } from '../core/Component';
import { createControllableState } from '../core/StateManager';
import { AccordionOptions, AccordionType, AccordionItem, AccordionOrientation } from './types';

const ACCORDION_KEYS = ['Home', 'End', 'ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'];

export class Accordion extends Component {
  private type: AccordionType = 'single';
  private orientation: AccordionOrientation = 'vertical';
  private collapsible: boolean = false;
  private items: Map<string, AccordionItem> = new Map();
  private valueState!: ReturnType<typeof createControllableState<string | string[]>>;
  private focusedIndex: number = -1;

  constructor(element: HTMLElement, options: AccordionOptions = {}) {
    super(element, options);
  }

  protected init(): void {
    const {
      type = 'single',
      value,
      defaultValue,
      onValueChange,
      disabled = false,
      orientation = 'vertical',
      collapsible = false
    } = this.options as AccordionOptions;

    this.type = type;
    this.orientation = orientation;
    this.collapsible = collapsible;

    // Initialize state
    this.valueState = createControllableState<string | string[]>({
      prop: value,
      defaultProp: defaultValue,
      onChange: onValueChange,
      caller: 'Accordion'
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
    this.setDataAttribute(this.element, 'orientation', this.orientation);
    this.setAttribute(this.element, 'role', 'tablist');
    this.setAttribute(this.element, 'aria-orientation', this.orientation);
    
    if (this.options.disabled) {
      this.setAttribute(this.element, 'aria-disabled', 'true');
    }
  }

  private initializeItems(): void {
    // Find all accordion items in the DOM
    const itemElements = this.querySelectorAll('[data-accordion-item]');
    
    itemElements.forEach((itemElement, index) => {
      const value = this.getDataAttribute(itemElement, 'value');
      if (!value) {
        console.warn('Accordion item missing value attribute:', itemElement);
        return;
      }

      const trigger = itemElement.querySelector('[data-accordion-trigger]') as HTMLElement;
      const content = itemElement.querySelector('[data-accordion-content]') as HTMLElement;
      
      if (!trigger || !content) {
        console.warn('Accordion item missing trigger or content:', itemElement);
        return;
      }

      const disabled = this.hasAttribute(itemElement, 'disabled') || 
                      this.hasAttribute(trigger, 'disabled');

      const accordionItem: AccordionItem = {
        value,
        element: itemElement,
        trigger,
        content,
        disabled,
        open: false
      };

      this.items.set(value, accordionItem);
      this.setupItem(accordionItem);
    });
  }

  private setupItem(item: AccordionItem): void {
    const { trigger, content, element, value } = item;

    // Set up trigger
    this.setAttribute(trigger, 'role', 'tab');
    this.setAttribute(trigger, 'aria-expanded', 'false');
    this.setAttribute(trigger, 'aria-controls', `accordion-content-${value}`);
    this.setAttribute(trigger, 'tabindex', '-1');
    
    if (item.disabled) {
      this.setAttribute(trigger, 'aria-disabled', 'true');
    }

    // Set up content
    this.setAttribute(content, 'role', 'tabpanel');
    this.setAttribute(content, 'aria-labelledby', `accordion-trigger-${value}`);
    this.setAttribute(content, 'id', `accordion-content-${value}`);
    this.setAttribute(content, 'hidden', '');
    
    // Set up item container
    this.setAttribute(element, 'data-accordion-item', '');
    this.setAttribute(element, 'data-value', value);

    // Add event listeners
    this.addEventListener(trigger, 'click', (e) => this.handleTriggerClick(e, item));
    this.addEventListener(trigger, 'keydown', (e) => this.handleTriggerKeydown(e as KeyboardEvent, item));
    this.addEventListener(trigger, 'focus', () => this.handleTriggerFocus(item));
  }

  private setupEventListeners(): void {
    // Listen for value changes
    this.valueState.subscribe((value: string | string[]) => {
      this.updateItemsState();
      this.dispatchEvent(new CustomEvent('valueChange', { detail: { value } }));
    });

    // Handle keyboard navigation on the accordion container
    this.addEventListener(this.element, 'keydown', (e) => this.handleKeydown(e as KeyboardEvent));
  }

  private handleTriggerClick(event: Event, item: AccordionItem): void {
    event.preventDefault();
    
    if (item.disabled || this.options.disabled) return;

    const currentValue = this.valueState.getValue();
    const isOpen = this.isItemOpen(item.value);

    if (isOpen) {
      this.closeItem(item.value);
    } else {
      this.openItem(item.value);
    }
  }

  private handleTriggerKeydown(event: KeyboardEvent, item: AccordionItem): void {
    if (item.disabled || this.options.disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.handleTriggerClick(event, item);
        break;
    }
  }

  private handleTriggerFocus(item: AccordionItem): void {
    const items = Array.from(this.items.values()).filter(item => !item.disabled);
    this.focusedIndex = items.findIndex(i => i.value === item.value);
  }

  private handleKeydown(event: KeyboardEvent): void {
    if (!ACCORDION_KEYS.includes(event.key)) return;
    
    const target = event.target as HTMLElement;
    const items = Array.from(this.items.values()).filter(item => !item.disabled);
    
    if (items.length === 0) return;

    // Find current focused item
    let currentIndex = this.focusedIndex;
    if (currentIndex === -1) {
      currentIndex = items.findIndex(item => item.trigger === target);
    }

    if (currentIndex === -1) return;

    event.preventDefault();

    let nextIndex = currentIndex;
    const isDirectionLTR = this.getComputedDirection() === 'ltr';

    switch (event.key) {
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = items.length - 1;
        break;
      case 'ArrowRight':
        if (this.orientation === 'horizontal') {
          if (isDirectionLTR) {
            nextIndex = (currentIndex + 1) % items.length;
          } else {
            nextIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
          }
        }
        break;
      case 'ArrowDown':
        if (this.orientation === 'vertical') {
          nextIndex = (currentIndex + 1) % items.length;
        }
        break;
      case 'ArrowLeft':
        if (this.orientation === 'horizontal') {
          if (isDirectionLTR) {
            nextIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
          } else {
            nextIndex = (currentIndex + 1) % items.length;
          }
        }
        break;
      case 'ArrowUp':
        if (this.orientation === 'vertical') {
          nextIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
        }
        break;
    }

    items[nextIndex]?.trigger.focus();
    this.focusedIndex = nextIndex;
  }

  private getComputedDirection(): 'ltr' | 'rtl' {
    return getComputedStyle(this.element).direction as 'ltr' | 'rtl';
  }

  private updateItemsState(): void {
    const currentValue = this.valueState.getValue();
    const openValues = Array.isArray(currentValue) ? currentValue : [currentValue].filter(Boolean);

    this.items.forEach((item, value) => {
      const isOpen = openValues.includes(value);
      this.updateItemState(item, isOpen);
    });
  }

  private updateItemState(item: AccordionItem, isOpen: boolean): void {
    item.open = isOpen;
    
    // Update trigger
    this.setAttribute(item.trigger, 'aria-expanded', isOpen.toString());
    this.setDataAttribute(item.element, 'state', isOpen ? 'open' : 'closed');
    
    // Update content
    if (isOpen) {
      // Remove hidden attribute when open
      item.content.removeAttribute('hidden');
    } else {
      this.setAttribute(item.content, 'hidden', '');
    }
  }

  private isItemOpen(value: string): boolean {
    const currentValue = this.valueState.getValue();
    if (this.type === 'single') {
      return currentValue === value;
    } else {
      return Array.isArray(currentValue) && currentValue.includes(value);
    }
  }

  public openItem(value: string): void {
    if (this.type === 'single') {
      this.valueState.setValue(value);
    } else {
      const currentValue = this.valueState.getValue() as string[];
      if (!currentValue.includes(value)) {
        this.valueState.setValue([...currentValue, value]);
      }
    }
          this.dispatchEvent(new CustomEvent('itemOpen', { detail: { value } }));
  }

  public closeItem(value: string): void {
    if (this.type === 'single') {
      if (this.collapsible) {
        this.valueState.setValue('');
      }
    } else {
      const currentValue = this.valueState.getValue() as string[];
      this.valueState.setValue(currentValue.filter(v => v !== value));
    }
          this.dispatchEvent(new CustomEvent('itemClose', { detail: { value } }));
  }

  public getValue(): string | string[] {
    return this.valueState.getValue();
  }

  public setValue(value: string | string[]): void {
    this.valueState.setValue(value);
  }

  public addItem(value: string, trigger: string | HTMLElement, content: string | HTMLElement): void {
    const itemElement = this.createElement('div', { 'data-accordion-item': '', 'data-value': value });
    
    const triggerElement = typeof trigger === 'string' 
      ? this.createElement('button', { 'data-accordion-trigger': '' }, [trigger])
      : trigger;
    
    const contentElement = typeof content === 'string'
      ? this.createElement('div', { 'data-accordion-content': '' }, [content])
      : content;

    itemElement.appendChild(triggerElement);
    itemElement.appendChild(contentElement);
    this.element.appendChild(itemElement);

    const accordionItem: AccordionItem = {
      value,
      element: itemElement,
      trigger: triggerElement,
      content: contentElement,
      disabled: false,
      open: false
    };

    this.items.set(value, accordionItem);
    this.setupItem(accordionItem);
    this.updateItemsState();
  }

  public removeItem(value: string): void {
    const item = this.items.get(value);
    if (item) {
      item.element.remove();
      this.items.delete(value);
      this.closeItem(value);
    }
  }

  public enableItem(value: string): void {
    const item = this.items.get(value);
    if (item) {
      item.disabled = false;
      item.element.removeAttribute('disabled');
      item.trigger.removeAttribute('aria-disabled');
    }
  }

  public disableItem(value: string): void {
    const item = this.items.get(value);
    if (item) {
      item.disabled = true;
      this.setAttribute(item.element, 'disabled', '');
      this.setAttribute(item.trigger, 'aria-disabled', 'true');
    }
  }

  // Static factory method for declarative creation
  static create(selector: string | HTMLElement, options: AccordionOptions = {}): Accordion {
    const element = typeof selector === 'string' 
      ? document.querySelector(selector) as HTMLElement
      : selector;
    
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    return new Accordion(element, options);
  }

  protected cleanup(): void {
    this.items.clear();
    this.valueState = null as any;
  }
}
