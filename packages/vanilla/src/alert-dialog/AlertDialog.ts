import { Component } from '../core/Component';
import { createControllableState } from '../core/StateManager';
import type { AlertDialogOptions, AlertDialogElements } from './types';

export class AlertDialog extends Component {
  private openState: ReturnType<typeof createControllableState<boolean>>;
  private elements: AlertDialogElements;
  private previouslyFocusedElement: HTMLElement | null = null;

  constructor(element: HTMLElement, options: AlertDialogOptions = {}) {
    super(element, options);

    this.openState = createControllableState<boolean>({
      prop: options.open,
      defaultProp: options.defaultOpen ?? false,
      onChange: options.onOpenChange,
    });

    this.elements = {
      root: element,
      trigger: null as any,
      overlay: null as any,
      content: null as any,
      title: null as any,
      description: null as any,
      action: null as any,
      cancel: null as any,
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
    this.elements.trigger = this.querySelector('[data-alert-dialog-trigger]') || this.createElement('button', {
      'data-alert-dialog-trigger': '',
      'type': 'button'
    });

    // Find or create overlay
    this.elements.overlay = this.querySelector('[data-alert-dialog-overlay]') || this.createElement('div', {
      'data-alert-dialog-overlay': '',
      'hidden': ''
    });

    // Find or create content
    this.elements.content = this.querySelector('[data-alert-dialog-content]') || this.createElement('div', {
      'data-alert-dialog-content': '',
      'role': 'alertdialog',
      'hidden': ''
    });

    // Find or create title
    this.elements.title = this.querySelector('[data-alert-dialog-title]') || this.createElement('h2', {
      'data-alert-dialog-title': '',
      'id': this.generateId('title')
    }, ['Alert Dialog Title']);

    // Find or create description
    this.elements.description = this.querySelector('[data-alert-dialog-description]') || this.createElement('p', {
      'data-alert-dialog-description': '',
      'id': this.generateId('description')
    }, ['Are you sure you want to continue?']);

    // Find or create action button
    this.elements.action = this.querySelector('[data-alert-dialog-action]') || this.createElement('button', {
      'data-alert-dialog-action': '',
      'type': 'button'
    }, ['Continue']);

    // Find or create cancel button
    this.elements.cancel = this.querySelector('[data-alert-dialog-cancel]') || this.createElement('button', {
      'data-alert-dialog-cancel': '',
      'type': 'button'
    }, ['Cancel']);

    // Add elements to DOM if they don't exist
    if (!this.querySelector('[data-alert-dialog-overlay]')) {
      this.element.appendChild(this.elements.overlay);
    }
    if (!this.querySelector('[data-alert-dialog-content]')) {
      this.elements.overlay.appendChild(this.elements.content);
    }
    if (!this.querySelector('[data-alert-dialog-title]')) {
      this.elements.content.appendChild(this.elements.title);
    }
    if (!this.querySelector('[data-alert-dialog-description]')) {
      this.elements.content.appendChild(this.elements.description);
    }
    if (!this.querySelector('[data-alert-dialog-action]')) {
      this.elements.content.appendChild(this.elements.action);
    }
    if (!this.querySelector('[data-alert-dialog-cancel]')) {
      this.elements.content.appendChild(this.elements.cancel);
    }
  }

  private setupAttributes(): void {
    // Set up root element
    this.setAttribute(this.element, 'data-alert-dialog', '');

    // Set up trigger
    this.setAttribute(this.elements.trigger, 'data-alert-dialog-trigger', '');
    this.setAttribute(this.elements.trigger, 'type', 'button');
    this.setAttribute(this.elements.trigger, 'aria-haspopup', 'dialog');

    // Set up overlay
    this.setAttribute(this.elements.overlay, 'data-alert-dialog-overlay', '');
    this.setAttribute(this.elements.overlay, 'role', 'presentation');

    // Set up content
    this.setAttribute(this.elements.content, 'data-alert-dialog-content', '');
    this.setAttribute(this.elements.content, 'role', 'alertdialog');
    this.setAttribute(this.elements.content, 'aria-modal', 'true');
    this.setAttribute(this.elements.content, 'aria-labelledby', this.elements.title.id);
    this.setAttribute(this.elements.content, 'aria-describedby', this.elements.description.id);

    // Set up title
    this.setAttribute(this.elements.title, 'data-alert-dialog-title', '');

    // Set up description
    this.setAttribute(this.elements.description, 'data-alert-dialog-description', '');

    // Set up action button
    this.setAttribute(this.elements.action, 'data-alert-dialog-action', '');
    this.setAttribute(this.elements.action, 'type', 'button');

    // Set up cancel button
    this.setAttribute(this.elements.cancel, 'data-alert-dialog-cancel', '');
    this.setAttribute(this.elements.cancel, 'type', 'button');
  }

  private setupEventListeners(): void {
    // Listen for open state changes
    this.openState.subscribe((open: boolean) => {
      this.updateDisplay();
      this.dispatchEvent(new CustomEvent('openChange', { detail: { open } }));
    });

    // Handle trigger events
    this.addEventListener(this.elements.trigger, 'click', (e) => this.handleTriggerClick(e));

    // Handle overlay events
    this.addEventListener(this.elements.overlay, 'click', (e) => this.handleOverlayClick(e));

    // Handle action button events
    this.addEventListener(this.elements.action, 'click', (e) => this.handleActionClick(e));

    // Handle cancel button events
    this.addEventListener(this.elements.cancel, 'click', (e) => this.handleCancelClick(e));

    // Handle global events
    this.addEventListener(document, 'keydown', (e) => this.handleKeydown(e));
  }

  private handleTriggerClick(event: Event): void {
    event.preventDefault();
    this.openState.setValue(true);
  }

  private handleOverlayClick(event: Event): void {
    // Prevent closing when clicking overlay (modal behavior)
    event.stopPropagation();
  }

  private handleActionClick(event: Event): void {
    event.preventDefault();
    this.dispatchEvent(new CustomEvent('action', {}));
    this.openState.setValue(false);
  }

  private handleCancelClick(event: Event): void {
    event.preventDefault();
    this.dispatchEvent(new CustomEvent('cancel', {}));
    this.openState.setValue(false);
  }

  private handleKeydown(event: Event): void {
    const key = (event as KeyboardEvent).key;
    
    if (key === 'Escape' && (this.openState.getValue() as boolean)) {
      event.preventDefault();
      this.handleCancelClick(event);
    }
  }

  private updateDisplay(): void {
    const isOpen = this.openState.getValue() as boolean;
    
    if (isOpen) {
      // Store previously focused element
      this.previouslyFocusedElement = document.activeElement as HTMLElement;
      
      // Show overlay and content
      this.elements.overlay.removeAttribute('hidden');
      this.elements.content.removeAttribute('hidden');
      
      // Update ARIA attributes
      this.setAttribute(this.elements.trigger, 'aria-expanded', 'true');
      this.setDataAttribute(this.elements.trigger, 'state', 'open');
      this.setDataAttribute(this.elements.overlay, 'state', 'open');
      this.setDataAttribute(this.elements.content, 'state', 'open');
      
      // Focus the cancel button (accessibility best practice)
      this.elements.cancel.focus();
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Hide overlay and content
      this.setAttribute(this.elements.overlay, 'hidden', '');
      this.setAttribute(this.elements.content, 'hidden', '');
      
      // Update ARIA attributes
      this.setAttribute(this.elements.trigger, 'aria-expanded', 'false');
      this.setDataAttribute(this.elements.trigger, 'state', 'closed');
      this.setDataAttribute(this.elements.overlay, 'state', 'closed');
      this.setDataAttribute(this.elements.content, 'state', 'closed');
      
      // Restore focus to previously focused element
      if (this.previouslyFocusedElement) {
        this.previouslyFocusedElement.focus();
        this.previouslyFocusedElement = null;
      }
      
      // Restore body scroll
      document.body.style.overflow = '';
    }
  }

  private generateId(prefix: string): string {
    return `alert-dialog-${prefix}-${Math.random().toString(36).substr(2, 9)}`;
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

  // Static factory method
  static create(selector: string | HTMLElement, options: AlertDialogOptions = {}): AlertDialog {
    const element = typeof selector === 'string' 
      ? document.querySelector(selector) as HTMLElement
      : selector;
    
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    return new AlertDialog(element, options);
  }

  protected cleanup(): void {
    this.openState = null as any;
    this.elements = null as any;
    this.previouslyFocusedElement = null;
    
    // Restore body scroll
    document.body.style.overflow = '';
  }
}
