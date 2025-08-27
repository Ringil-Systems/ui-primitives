import { Component } from '../core/Component';
import { createControllableState } from '../core/StateManager';
import type { PopoverOptions, PopoverElements } from './types';

export class Popover extends Component {
  private openState: ReturnType<typeof createControllableState<boolean>>;
  private elements: PopoverElements;
  private modal: boolean;
  private contentId: string;

  constructor(element: HTMLElement, options: PopoverOptions = {}) {
    super(element, options);

    this.openState = createControllableState<boolean>({
      prop: options.open,
      defaultProp: options.defaultOpen ?? false,
      onChange: options.onOpenChange,
    });

    this.modal = options.modal ?? false;
    this.contentId = this.generateId();

    this.elements = {
      root: element,
      trigger: null as any,
      content: null as any,
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
    this.elements.trigger = this.querySelector('[data-popover-trigger]') || this.createElement('button', {
      'data-popover-trigger': '',
      'type': 'button',
      'aria-haspopup': 'dialog'
    });

    // Find or create content
    this.elements.content = this.querySelector('[data-popover-content]') || this.createElement('div', {
      'data-popover-content': '',
      'role': 'dialog',
      'hidden': ''
    });

    // Add trigger and content to root if they don't exist
    if (!this.querySelector('[data-popover-trigger]')) {
      this.element.appendChild(this.elements.trigger);
    }
    if (!this.querySelector('[data-popover-content]')) {
      this.element.appendChild(this.elements.content);
    }
  }

  private setupAttributes(): void {
    // Set up root element
    this.setAttribute(this.element, 'data-popover', '');

    // Set up trigger
    this.setAttribute(this.elements.trigger, 'data-popover-trigger', '');
    this.setAttribute(this.elements.trigger, 'type', 'button');
    this.setAttribute(this.elements.trigger, 'aria-haspopup', 'dialog');
    this.setAttribute(this.elements.trigger, 'aria-controls', this.contentId);

    // Set up content
    this.setAttribute(this.elements.content, 'data-popover-content', '');
    this.setAttribute(this.elements.content, 'role', 'dialog');
    this.setAttribute(this.elements.content, 'id', this.contentId);
    this.setAttribute(this.elements.content, 'aria-labelledby', this.elements.trigger.id || '');
  }

  private setupEventListeners(): void {
    // Listen for open state changes
    this.openState.subscribe((open: boolean) => {
      this.updateDisplay();
      this.dispatchEvent(new CustomEvent('openChange', { detail: { open } }));
    });

    // Handle trigger events
    this.addEventListener(this.elements.trigger, 'click', (e) => this.handleTriggerClick(e));

    // Handle global events
    this.addEventListener(document, 'click', (e) => this.handleOutsideClick(e));
    this.addEventListener(document, 'keydown', (e) => this.handleEscapeKey(e));
  }

  private handleTriggerClick(event: Event): void {
    event.preventDefault();
    this.openState.setValue(!this.openState.getValue());
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

  private updateDisplay(): void {
    const isOpen = this.openState.getValue() as boolean;
    
    if (isOpen) {
      this.elements.content.removeAttribute('hidden');
      this.setAttribute(this.elements.trigger, 'aria-expanded', 'true');
      this.setDataAttribute(this.elements.trigger, 'state', 'open');
      this.setDataAttribute(this.elements.content, 'state', 'open');
      
      // Position the content relative to the trigger
      this.positionContent();
      
      // Focus the content
      this.elements.content.focus();
    } else {
      this.setAttribute(this.elements.content, 'hidden', '');
      this.setAttribute(this.elements.trigger, 'aria-expanded', 'false');
      this.setDataAttribute(this.elements.trigger, 'state', 'closed');
      this.setDataAttribute(this.elements.content, 'state', 'closed');
      
      // Focus the trigger
      this.elements.trigger.focus();
    }
  }

  private positionContent(): void {
    const triggerRect = this.elements.trigger.getBoundingClientRect();
    const contentRect = this.elements.content.getBoundingClientRect();
    
    // Simple positioning - place content below the trigger
    this.elements.content.style.position = 'absolute';
    this.elements.content.style.top = `${triggerRect.bottom + 8}px`;
    this.elements.content.style.left = `${triggerRect.left}px`;
    this.elements.content.style.zIndex = '1000';
    
    // Ensure content doesn't go off-screen
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    if (triggerRect.left + contentRect.width > viewportWidth) {
      this.elements.content.style.left = `${viewportWidth - contentRect.width - 8}px`;
    }
    
    if (triggerRect.bottom + contentRect.height + 8 > viewportHeight) {
      // Position above the trigger instead
      this.elements.content.style.top = `${triggerRect.top - contentRect.height - 8}px`;
    }
  }

  private generateId(): string {
    return `popover-${Math.random().toString(36).substr(2, 9)}`;
  }

  public open(): void {
    this.openState.setValue(true);
  }

  public close(): void {
    this.openState.setValue(false);
  }

  public toggle(): void {
    this.openState.setValue(!this.openState.getValue());
  }

  public isOpen(): boolean {
    return this.openState.getValue() as boolean;
  }

  // Static factory method
  static create(selector: string | HTMLElement, options: PopoverOptions = {}): Popover {
    const element = typeof selector === 'string' 
      ? document.querySelector(selector) as HTMLElement
      : selector;
    
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    return new Popover(element, options);
  }

  protected cleanup(): void {
    this.openState = null as any;
    this.elements = null as any;
  }
}
