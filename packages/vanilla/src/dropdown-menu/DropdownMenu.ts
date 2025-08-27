import { Component } from '../core/Component';
import { createControllableState } from '../core/StateManager';
import { DropdownMenuOptions, DropdownMenuElements } from './types';

export class DropdownMenu extends Component {
  private elements: DropdownMenuElements = {};
  private openState!: ReturnType<typeof createControllableState<boolean>>;
  private modal: boolean = true;
  private previouslyFocusedElement: HTMLElement | null = null;
  private focusedIndex: number = -1;

  constructor(element: HTMLElement, options: DropdownMenuOptions = {}) {
    super(element, options);
  }

  protected init(): void {
    const {
      open,
      defaultOpen = false,
      onOpenChange,
      modal = true,
      onEscapeKeyDown,
      onPointerDownOutside,
      onInteractOutside
    } = this.options as DropdownMenuOptions;

    this.modal = modal;

    // Initialize state
    this.openState = createControllableState<boolean>({
      prop: open,
      defaultProp: defaultOpen,
      onChange: onOpenChange,
      caller: 'DropdownMenu'
    });

    // Find dropdown elements
    this.findElements();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Set initial state
    this.updateOpenState();
  }

  private findElements(): void {
    this.elements = {
      trigger: this.querySelector('[data-dropdown-trigger]') || undefined,
      content: this.querySelector('[data-dropdown-content]') || undefined,
      items: Array.from(this.querySelectorAll('[data-dropdown-item]'))
    };
  }

  private setupEventListeners(): void {
    // Listen for open state changes
    this.openState.subscribe((open: boolean) => {
      this.updateOpenState();
      this.dispatchEvent(new CustomEvent('openChange', { detail: { open } }));
    });

    // Trigger click
    if (this.elements.trigger) {
      this.addEventListener(this.elements.trigger, 'click', (e) => this.handleTriggerClick(e));
      this.addEventListener(this.elements.trigger, 'keydown', (e) => this.handleTriggerKeydown(e as KeyboardEvent));
    }

    // Content keyboard navigation
    if (this.elements.content) {
      this.addEventListener(this.elements.content, 'keydown', (e) => this.handleContentKeydown(e as KeyboardEvent));
    }

    // Item clicks
    this.elements.items?.forEach(item => {
      this.addEventListener(item, 'click', (e) => this.handleItemClick(e, item));
      this.addEventListener(item, 'keydown', (e) => this.handleItemKeydown(e as KeyboardEvent, item));
    });

    // Escape key
    if (this.modal) {
      this.addEventListener(document, 'keydown', (e) => this.handleKeydown(e as KeyboardEvent));
    }

    // Outside clicks
    this.addEventListener(document, 'pointerdown', (e) => this.handlePointerDownOutside(e as PointerEvent));
  }

  private handleTriggerClick(event: Event): void {
    event.preventDefault();
    this.toggle();
  }

  private handleTriggerKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Enter':
      case ' ':
      case 'ArrowDown':
        event.preventDefault();
        this.open();
        this.focusFirstItem();
        break;
    }
  }

  private handleContentKeydown(event: KeyboardEvent): void {
    if (!this.isOpen()) return;

    const items = this.elements.items || [];
    if (items.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focusNextItem();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusPrevItem();
        break;
      case 'Home':
        event.preventDefault();
        this.focusFirstItem();
        break;
      case 'End':
        event.preventDefault();
        this.focusLastItem();
        break;
      case 'Escape':
        event.preventDefault();
        this.close();
        this.elements.trigger?.focus();
        break;
    }
  }

  private handleItemClick(event: Event, item: HTMLElement): void {
    event.preventDefault();
    const value = this.getDataAttribute(item, 'value');
    if (value) {
      this.dispatchEvent(new CustomEvent('select', { detail: { value } }));
    }
    this.close();
    this.elements.trigger?.focus();
  }

  private handleItemKeydown(event: KeyboardEvent, item: HTMLElement): void {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.handleItemClick(event, item);
        break;
    }
  }

  private handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isOpen()) {
      event.preventDefault();
      this.options.onEscapeKeyDown?.(event);
      this.close();
      this.elements.trigger?.focus();
    }
  }

  private handlePointerDownOutside(event: PointerEvent): void {
    if (!this.isOpen()) return;
    
    const target = event.target as HTMLElement;
    if (!this.element.contains(target)) {
      this.options.onPointerDownOutside?.(event);
      this.options.onInteractOutside?.(event);
      this.close();
    }
  }

  private focusFirstItem(): void {
    const items = this.elements.items || [];
    if (items.length > 0) {
      this.focusedIndex = 0;
      items[0]?.focus();
    }
  }

  private focusLastItem(): void {
    const items = this.elements.items || [];
    if (items.length > 0) {
      this.focusedIndex = items.length - 1;
      items[items.length - 1]?.focus();
    }
  }

  private focusNextItem(): void {
    const items = this.elements.items || [];
    if (items.length === 0) return;

    this.focusedIndex = (this.focusedIndex + 1) % items.length;
    items[this.focusedIndex]?.focus();
  }

  private focusPrevItem(): void {
    const items = this.elements.items || [];
    if (items.length === 0) return;

    this.focusedIndex = this.focusedIndex <= 0 ? items.length - 1 : this.focusedIndex - 1;
    items[this.focusedIndex]?.focus();
  }

  private updateOpenState(): void {
    const isOpen = this.isOpen();
    
    // Update ARIA attributes
    if (this.elements.trigger) {
      this.setAttribute(this.elements.trigger, 'aria-expanded', isOpen.toString());
      this.setAttribute(this.elements.trigger, 'aria-haspopup', 'true');
    }

    if (this.elements.content) {
      this.setAttribute(this.elements.content, 'aria-hidden', (!isOpen).toString());
      this.setDataAttribute(this.elements.content, 'state', isOpen ? 'open' : 'closed');
    }

    // Show/hide content
    if (this.elements.content) {
      if (isOpen) {
        this.elements.content?.removeAttribute('hidden');
      } else {
        this.setAttribute(this.elements.content, 'hidden', '');
      }
    }

    // Handle focus management
    if (isOpen) {
      this.previouslyFocusedElement = document.activeElement as HTMLElement;
      this.dispatchEvent(new CustomEvent('open', {}));
    } else {
      this.focusedIndex = -1;
      this.dispatchEvent(new CustomEvent('close', {}));
    }
  }

  public open(): void {
    this.openState.setValue(true);
  }

  public close(): void {
    this.openState.setValue(false);
  }

  public toggle(): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  public isOpen(): boolean {
    return this.openState.getValue() as boolean;
  }

  public setOpen(open: boolean): void {
    this.openState.setValue(open);
  }

  // Static factory method
  static create(selector: string | HTMLElement, options: DropdownMenuOptions = {}): DropdownMenu {
    const element = typeof selector === 'string' 
      ? document.querySelector(selector) as HTMLElement
      : selector;
    
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    return new DropdownMenu(element, options);
  }

  protected cleanup(): void {
    this.openState = null as any;
    this.previouslyFocusedElement = null;
    this.focusedIndex = -1;
  }
}
