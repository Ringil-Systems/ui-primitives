import { Component } from '../core/Component';
import { createControllableState } from '../core/StateManager';
import type { ContextMenuOptions, ContextMenuElements, ContextMenuItem } from './types';

export class ContextMenu extends Component {
  private openState: ReturnType<typeof createControllableState<boolean>>;
  private elements: ContextMenuElements;
  private modal: boolean;
  private items: Map<string, ContextMenuItem> = new Map();
  private focusedIndex: number = 0;
  private longPressTimer: number | null = null;
  private lastClickPoint: { x: number; y: number } = { x: 0, y: 0 };

  constructor(element: HTMLElement, options: ContextMenuOptions = {}) {
    super(element, options);

    this.openState = createControllableState<boolean>({
      prop: options.open,
      defaultProp: options.defaultOpen ?? false,
      onChange: options.onOpenChange,
    });

    this.modal = options.modal ?? true;

    this.elements = {
      root: element,
      trigger: null as any,
      content: null as any,
      items: [],
    };
  }

  protected init(): void {
    this.findElements();
    this.setupAttributes();
    this.setupEventListeners();
    this.updateDisplay();
  }

  private findElements(): void {
    // Find or create trigger
    this.elements.trigger = this.querySelector('[data-context-menu-trigger]') || this.createElement('div', {
      'data-context-menu-trigger': '',
      'role': 'button',
      'tabindex': '0'
    });

    // Find or create content
    this.elements.content = this.querySelector('[data-context-menu-content]') || this.createElement('div', {
      'data-context-menu-content': '',
      'role': 'menu',
      'hidden': ''
    });

    // Find existing items
    const existingItems = this.querySelectorAll('[data-context-menu-item]');
    if (existingItems.length > 0) {
      this.elements.items = Array.from(existingItems);
    }

    // Add trigger and content to root if they don't exist
    if (!this.querySelector('[data-context-menu-trigger]')) {
      this.element.appendChild(this.elements.trigger);
    }
    if (!this.querySelector('[data-context-menu-content]')) {
      this.element.appendChild(this.elements.content);
    }

    // Create default structure if no items exist
    if (this.elements.items.length === 0) {
      this.createDefaultStructure();
    }
  }

  private createDefaultStructure(): void {
    // Create default menu items
    const item1 = this.createElement('div', {
      'data-context-menu-item': '',
      'role': 'menuitem',
      'tabindex': '-1'
    }, ['Copy']);

    const item2 = this.createElement('div', {
      'data-context-menu-item': '',
      'role': 'menuitem',
      'tabindex': '-1'
    }, ['Paste']);

    const item3 = this.createElement('div', {
      'data-context-menu-item': '',
      'role': 'menuitem',
      'tabindex': '-1'
    }, ['Cut']);

    this.elements.content.appendChild(item1);
    this.elements.content.appendChild(item2);
    this.elements.content.appendChild(item3);

    this.elements.items = [item1, item2, item3];
  }

  private setupAttributes(): void {
    // Set up root element
    this.setAttribute(this.element, 'data-context-menu', '');

    // Set up trigger
    this.setAttribute(this.elements.trigger, 'data-context-menu-trigger', '');
    this.setAttribute(this.elements.trigger, 'role', 'button');
    this.setAttribute(this.elements.trigger, 'tabindex', '0');

    // Set up content
    this.setAttribute(this.elements.content, 'data-context-menu-content', '');
    this.setAttribute(this.elements.content, 'role', 'menu');

    // Set up items
    this.elements.items.forEach((item, index) => {
      this.setAttribute(item, 'data-context-menu-item', '');
      this.setAttribute(item, 'role', 'menuitem');
      this.setAttribute(item, 'tabindex', '-1');
      this.setAttribute(item, 'data-value', `item-${index + 1}`);
    });
  }

  private setupEventListeners(): void {
    // Listen for open state changes
    this.openState.subscribe((open: boolean) => {
      this.updateDisplay();
      this.dispatchEvent(new CustomEvent('openChange', { detail: { open } }));
    });

    // Handle trigger events
    this.addEventListener(this.elements.trigger, 'contextmenu', (e) => this.handleContextMenu(e));
    this.addEventListener(this.elements.trigger, 'pointerdown', (e) => this.handlePointerDown(e));
    this.addEventListener(this.elements.trigger, 'pointermove', (e) => this.handlePointerMove(e));
    this.addEventListener(this.elements.trigger, 'pointerup', (e) => this.handlePointerUp(e));
    this.addEventListener(this.elements.trigger, 'pointercancel', (e) => this.handlePointerCancel(e));

    // Handle item events
    this.elements.items.forEach((item, index) => {
      this.addEventListener(item, 'click', (e) => this.handleItemClick(e, index));
      this.addEventListener(item, 'keydown', (e) => this.handleItemKeydown(e, index));
      this.addEventListener(item, 'mouseenter', () => this.handleItemMouseEnter(index));
    });

    // Handle global events
    this.addEventListener(document, 'click', (e) => this.handleOutsideClick(e));
    this.addEventListener(document, 'keydown', (e) => this.handleEscapeKey(e));
  }

  private handleContextMenu(event: Event): void {
    event.preventDefault();
    this.lastClickPoint = {
      x: (event as MouseEvent).clientX,
      y: (event as MouseEvent).clientY
    };
    this.openState.setValue(true);
  }

  private handlePointerDown(event: Event): void {
    const pointerEvent = event as PointerEvent;
    if (pointerEvent.pointerType === 'touch' || pointerEvent.pointerType === 'pen') {
      this.clearLongPressTimer();
      this.longPressTimer = window.setTimeout(() => {
        this.lastClickPoint = {
          x: pointerEvent.clientX,
          y: pointerEvent.clientY
        };
        this.openState.setValue(true);
      }, 700);
    }
  }

  private handlePointerMove(event: Event): void {
    const pointerEvent = event as PointerEvent;
    if (pointerEvent.pointerType === 'touch' || pointerEvent.pointerType === 'pen') {
      this.clearLongPressTimer();
    }
  }

  private handlePointerUp(event: Event): void {
    const pointerEvent = event as PointerEvent;
    if (pointerEvent.pointerType === 'touch' || pointerEvent.pointerType === 'pen') {
      this.clearLongPressTimer();
    }
  }

  private handlePointerCancel(event: Event): void {
    const pointerEvent = event as PointerEvent;
    if (pointerEvent.pointerType === 'touch' || pointerEvent.pointerType === 'pen') {
      this.clearLongPressTimer();
    }
  }

  private clearLongPressTimer(): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  private handleItemClick(event: Event, index: number): void {
    event.preventDefault();
    const item = this.elements.items[index];
    if (item) {
      const value = item.getAttribute('data-value') || `item-${index + 1}`;
      this.dispatchEvent(new CustomEvent('select', { detail: { value } }));
      this.openState.setValue(false);
    }
  }

  private handleItemKeydown(event: Event, index: number): void {
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
      case 'Home':
        event.preventDefault();
        this.focusFirstItem();
        break;
      case 'End':
        event.preventDefault();
        this.focusLastItem();
        break;
      case ' ':
      case 'Enter':
        event.preventDefault();
        this.handleItemClick(event, index);
        break;
    }
  }

  private handleItemMouseEnter(index: number): void {
    this.focusedIndex = index;
    this.elements.items[index]?.focus();
  }

  private handleOutsideClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!this.element.contains(target)) {
      this.openState.setValue(false);
    }
  }

  private handleEscapeKey(event: Event): void {
    if ((event as KeyboardEvent).key === 'Escape' && (this.openState.getValue() as boolean)) {
      this.openState.setValue(false);
    }
  }

  private focusNextItem(): void {
    const nextIndex = this.focusedIndex >= this.elements.items.length - 1 ? 0 : this.focusedIndex + 1;
    this.elements.items[nextIndex]?.focus();
    this.focusedIndex = nextIndex;
  }

  private focusPreviousItem(): void {
    const prevIndex = this.focusedIndex <= 0 ? this.elements.items.length - 1 : this.focusedIndex - 1;
    this.elements.items[prevIndex]?.focus();
    this.focusedIndex = prevIndex;
  }

  private focusFirstItem(): void {
    this.elements.items[0]?.focus();
    this.focusedIndex = 0;
  }

  private focusLastItem(): void {
    this.elements.items[this.elements.items.length - 1]?.focus();
    this.focusedIndex = this.elements.items.length - 1;
  }

  private updateDisplay(): void {
    const isOpen = this.openState.getValue() as boolean;
    
    if (isOpen) {
      this.elements.content.removeAttribute('hidden');
      this.setDataAttribute(this.elements.trigger, 'state', 'open');
      this.setDataAttribute(this.elements.content, 'state', 'open');
      
      // Position the content at the click point
      this.elements.content.style.position = 'fixed';
      this.elements.content.style.left = `${this.lastClickPoint.x}px`;
      this.elements.content.style.top = `${this.lastClickPoint.y}px`;
      this.elements.content.style.zIndex = '1000';
      
      // Focus first item
      this.focusFirstItem();
    } else {
      this.setAttribute(this.elements.content, 'hidden', '');
      this.setDataAttribute(this.elements.trigger, 'state', 'closed');
      this.setDataAttribute(this.elements.content, 'state', 'closed');
    }
  }

  public open(): void {
    this.openState.setValue(true);
  }

  public close(): void {
    this.openState.setValue(false);
  }

  public isOpen(): boolean {
    return this.openState.getValue() as boolean;
  }

  public addItem(value: string, text: string, disabled: boolean = false): void {
    const itemElement = this.createElement('div', {
      'data-context-menu-item': '',
      'role': 'menuitem',
      'tabindex': '-1',
      'data-value': value
    }, [text]);

    if (disabled) {
      this.setAttribute(itemElement, 'aria-disabled', 'true');
      this.setAttribute(itemElement, 'data-disabled', '');
    }

    this.elements.content.appendChild(itemElement);
    this.elements.items.push(itemElement);

    // Add event listeners
    const index = this.elements.items.length - 1;
    this.addEventListener(itemElement, 'click', (e) => this.handleItemClick(e, index));
    this.addEventListener(itemElement, 'keydown', (e) => this.handleItemKeydown(e, index));
    this.addEventListener(itemElement, 'mouseenter', () => this.handleItemMouseEnter(index));
  }

  public removeItem(value: string): void {
    const index = this.elements.items.findIndex(item => 
      item.getAttribute('data-value') === value
    );

    if (index !== -1) {
      const item = this.elements.items[index];
      if (item) {
        item.remove();
        this.elements.items.splice(index, 1);
      }
    }
  }

  // Static factory method
  static create(selector: string | HTMLElement, options: ContextMenuOptions = {}): ContextMenu {
    const element = typeof selector === 'string' 
      ? document.querySelector(selector) as HTMLElement
      : selector;
    
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    return new ContextMenu(element, options);
  }

  protected cleanup(): void {
    this.openState = null as any;
    this.elements = null as any;
    this.items.clear();
    this.clearLongPressTimer();
  }
}
