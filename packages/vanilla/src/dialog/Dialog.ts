import { Component } from '../core/Component';
import { createControllableState } from '../core/StateManager';
import { DialogOptions, DialogElements } from './types';

export class Dialog extends Component {
  private elements: DialogElements = {};
  private openState!: ReturnType<typeof createControllableState<boolean>>;
  private modal: boolean = true;
  private previouslyFocusedElement: HTMLElement | null = null;

  constructor(element: HTMLElement, options: DialogOptions = {}) {
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
    } = this.options as DialogOptions;

    this.modal = modal;

    // Initialize state
    this.openState = createControllableState<boolean>({
      prop: open,
      defaultProp: defaultOpen,
      onChange: onOpenChange,
      caller: 'Dialog'
    });

    // Find dialog elements
    this.findElements();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Set initial state
    this.updateOpenState();
  }

  private findElements(): void {
    this.elements = {
      trigger: this.querySelector('[data-dialog-trigger]') || undefined,
      overlay: this.querySelector('[data-dialog-overlay]') || undefined,
      content: this.querySelector('[data-dialog-content]') || undefined,
      closeButton: this.querySelector('[data-dialog-close]') || undefined,
      title: this.querySelector('[data-dialog-title]') || undefined,
      description: this.querySelector('[data-dialog-description]') || undefined
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
    }

    // Close button click
    if (this.elements.closeButton) {
      this.addEventListener(this.elements.closeButton, 'click', (e) => this.handleCloseClick(e));
    }

    // Escape key
    if (this.modal) {
      this.addEventListener(document, 'keydown', (e) => this.handleKeydown(e as KeyboardEvent));
    }

    // Outside clicks
    if (this.elements.overlay) {
      this.addEventListener(this.elements.overlay, 'pointerdown', (e) => this.handlePointerDownOutside(e as PointerEvent));
    }

    // Focus trap
    if (this.elements.content) {
      this.addEventListener(this.elements.content, 'focusin', (e) => this.handleFocusIn(e as FocusEvent));
      this.addEventListener(this.elements.content, 'focusout', (e) => this.handleFocusOut(e as FocusEvent));
    }
  }

  private handleTriggerClick(event: Event): void {
    event.preventDefault();
    this.open();
  }

  private handleCloseClick(event: Event): void {
    event.preventDefault();
    this.close();
  }

  private handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isOpen()) {
      event.preventDefault();
      this.options.onEscapeKeyDown?.(event);
      this.close();
    }
  }

  private handlePointerDownOutside(event: PointerEvent): void {
    if (event.target === this.elements.overlay) {
      this.options.onPointerDownOutside?.(event);
      this.options.onInteractOutside?.(event);
      this.close();
    }
  }

  private handleFocusIn(event: FocusEvent): void {
    // Focus trap: keep focus inside dialog
    if (!this.elements.content?.contains(event.target as Node)) {
      this.focusFirstFocusableElement();
    }
  }

  private handleFocusOut(event: FocusEvent): void {
    // Focus trap: prevent focus from leaving dialog
    if (this.modal && !this.elements.content?.contains(event.relatedTarget as Node)) {
      this.focusFirstFocusableElement();
    }
  }

  private focusFirstFocusableElement(): void {
    const focusableElements = this.elements.content?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements && focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }
  }

  private updateOpenState(): void {
    const isOpen = this.isOpen();
    
    // Update ARIA attributes
    if (this.elements.trigger) {
      this.setAttribute(this.elements.trigger, 'aria-expanded', isOpen.toString());
      this.setAttribute(this.elements.trigger, 'aria-haspopup', 'dialog');
    }

    if (this.elements.content) {
      this.setAttribute(this.elements.content, 'aria-hidden', (!isOpen).toString());
      this.setDataAttribute(this.elements.content, 'state', isOpen ? 'open' : 'closed');
    }

    if (this.elements.overlay) {
      this.setAttribute(this.elements.overlay, 'aria-hidden', (!isOpen).toString());
      this.setDataAttribute(this.elements.overlay, 'state', isOpen ? 'open' : 'closed');
    }

    // Show/hide elements
    if (this.elements.content) {
      if (isOpen) {
        this.elements.content?.removeAttribute('hidden');
      } else {
        this.setAttribute(this.elements.content, 'hidden', '');
      }
    }

    if (this.elements.overlay) {
      if (isOpen) {
        this.elements.overlay?.removeAttribute('hidden');
      } else {
        this.setAttribute(this.elements.overlay, 'hidden', '');
      }
    }

    // Handle focus management
    if (isOpen) {
      this.previouslyFocusedElement = document.activeElement as HTMLElement;
      this.focusFirstFocusableElement();
      this.dispatchEvent(new CustomEvent('open', {}));
    } else {
      if (this.previouslyFocusedElement) {
        this.previouslyFocusedElement.focus();
        this.previouslyFocusedElement = null;
      }
      this.dispatchEvent(new CustomEvent('close', {}));
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

  public setOpen(open: boolean): void {
    this.openState.setValue(open);
  }

  // Static factory method
  static create(selector: string | HTMLElement, options: DialogOptions = {}): Dialog {
    const element = typeof selector === 'string' 
      ? document.querySelector(selector) as HTMLElement
      : selector;
    
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    return new Dialog(element, options);
  }

  protected cleanup(): void {
    this.openState = null as any;
    this.previouslyFocusedElement = null;
  }
}
