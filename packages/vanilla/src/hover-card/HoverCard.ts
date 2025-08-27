import { Component } from '../core/Component';
import { createControllableState } from '../core/StateManager';
import type { HoverCardOptions, HoverCardElements } from './types';

export class HoverCard extends Component {
  private openState: ReturnType<typeof createControllableState<boolean>>;
  private elements: HoverCardElements;
  private openDelay: number;
  private closeDelay: number;
  private openTimer: number | null = null;
  private closeTimer: number | null = null;
  private hasSelection: boolean = false;
  private isPointerDownOnContent: boolean = false;

  constructor(element: HTMLElement, options: HoverCardOptions = {}) {
    super(element, options);

    this.openState = createControllableState<boolean>({
      prop: options.open,
      defaultProp: options.defaultOpen ?? false,
      onChange: options.onOpenChange,
    });

    this.openDelay = options.openDelay ?? 700;
    this.closeDelay = options.closeDelay ?? 300;

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
    this.elements.trigger = this.querySelector('[data-hover-card-trigger]') || this.createElement('a', {
      'data-hover-card-trigger': '',
      'href': '#'
    });

    // Find or create content
    this.elements.content = this.querySelector('[data-hover-card-content]') || this.createElement('div', {
      'data-hover-card-content': '',
      'role': 'dialog',
      'hidden': ''
    });

    // Add trigger and content to root if they don't exist
    if (!this.querySelector('[data-hover-card-trigger]')) {
      this.element.appendChild(this.elements.trigger);
    }
    if (!this.querySelector('[data-hover-card-content]')) {
      this.element.appendChild(this.elements.content);
    }
  }

  private setupAttributes(): void {
    // Set up root element
    this.setAttribute(this.element, 'data-hover-card', '');

    // Set up trigger
    this.setAttribute(this.elements.trigger, 'data-hover-card-trigger', '');
    this.setAttribute(this.elements.trigger, 'href', '#');

    // Set up content
    this.setAttribute(this.elements.content, 'data-hover-card-content', '');
    this.setAttribute(this.elements.content, 'role', 'dialog');
  }

  private setupEventListeners(): void {
    // Listen for open state changes
    this.openState.subscribe((open: boolean) => {
      this.updateDisplay();
      this.dispatchEvent(new CustomEvent('openChange', { detail: { open } }));
    });

    // Handle trigger events
    this.addEventListener(this.elements.trigger, 'pointerenter', (e) => this.handleTriggerEnter(e));
    this.addEventListener(this.elements.trigger, 'pointerleave', (e) => this.handleTriggerLeave(e));
    this.addEventListener(this.elements.trigger, 'focus', (e) => this.handleTriggerFocus(e));
    this.addEventListener(this.elements.trigger, 'blur', (e) => this.handleTriggerBlur(e));
    this.addEventListener(this.elements.trigger, 'touchstart', (e) => this.handleTouchStart(e));

    // Handle content events
    this.addEventListener(this.elements.content, 'pointerenter', (e) => this.handleContentEnter(e));
    this.addEventListener(this.elements.content, 'pointerleave', (e) => this.handleContentLeave(e));
    this.addEventListener(this.elements.content, 'pointerdown', (e) => this.handleContentPointerDown(e));
    this.addEventListener(this.elements.content, 'pointerup', (e) => this.handleContentPointerUp(e));

    // Handle global events
    this.addEventListener(document, 'keydown', (e) => this.handleEscapeKey(e));
  }

  private handleTriggerEnter(event: Event): void {
    const pointerEvent = event as PointerEvent;
    if (pointerEvent.pointerType === 'touch') return;

    this.clearTimers();
    this.hasSelection = false;
    
    if (this.openDelay > 0) {
      this.openTimer = window.setTimeout(() => {
        this.openState.setValue(true);
        this.openTimer = null;
      }, this.openDelay);
    } else {
      this.openState.setValue(true);
    }
  }

  private handleTriggerLeave(event: Event): void {
    const pointerEvent = event as PointerEvent;
    if (pointerEvent.pointerType === 'touch') return;

    this.handleClose();
  }

  private handleTriggerFocus(event: Event): void {
    this.clearTimers();
    this.openState.setValue(true);
  }

  private handleTriggerBlur(event: Event): void {
    // Add a small delay to allow focus to move to the content
    this.closeTimer = window.setTimeout(() => {
      this.handleClose();
    }, 100);
  }

  private handleTouchStart(event: Event): void {
    event.preventDefault();
  }

  private handleContentEnter(event: Event): void {
    const pointerEvent = event as PointerEvent;
    if (pointerEvent.pointerType === 'touch') return;

    this.clearCloseTimer();
  }

  private handleContentLeave(event: Event): void {
    const pointerEvent = event as PointerEvent;
    if (pointerEvent.pointerType === 'touch') return;

    this.handleClose();
  }

  private handleContentPointerDown(event: Event): void {
    this.isPointerDownOnContent = true;
  }

  private handleContentPointerUp(event: Event): void {
    this.isPointerDownOnContent = false;
    
    // Check for text selection
    setTimeout(() => {
      const selection = document.getSelection();
      this.hasSelection = selection ? selection.toString() !== '' : false;
    }, 0);
  }

  private handleEscapeKey(event: Event): void {
    if ((event as KeyboardEvent).key === 'Escape' && (this.openState.getValue() as boolean)) {
      this.openState.setValue(false);
    }
  }

  private handleClose(): void {
    this.clearOpenTimer();
    
    if (!this.hasSelection && !this.isPointerDownOnContent) {
      this.closeTimer = window.setTimeout(() => {
        this.openState.setValue(false);
      }, this.closeDelay);
    }
  }

  private clearTimers(): void {
    this.clearOpenTimer();
    this.clearCloseTimer();
  }

  private clearOpenTimer(): void {
    if (this.openTimer) {
      clearTimeout(this.openTimer);
      this.openTimer = null;
    }
  }

  private clearCloseTimer(): void {
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }
  }

  private updateDisplay(): void {
    const isOpen = this.openState.getValue() as boolean;
    
    if (isOpen) {
      this.elements.content.removeAttribute('hidden');
      this.setDataAttribute(this.elements.trigger, 'state', 'open');
      this.setDataAttribute(this.elements.content, 'state', 'open');
      
      // Position the content relative to the trigger
      this.positionContent();
    } else {
      this.setAttribute(this.elements.content, 'hidden', '');
      this.setDataAttribute(this.elements.trigger, 'state', 'closed');
      this.setDataAttribute(this.elements.content, 'state', 'closed');
    }
  }

  private positionContent(): void {
    const triggerRect = this.elements.trigger.getBoundingClientRect();
    const contentRect = this.elements.content.getBoundingClientRect();
    
    // Position below the trigger by default
    this.elements.content.style.position = 'absolute';
    this.elements.content.style.top = `${triggerRect.bottom + 8}px`;
    this.elements.content.style.left = `${triggerRect.left}px`;
    this.elements.content.style.zIndex = '1000';
    
    // Ensure content doesn't go off-screen
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Check if content goes off the right side
    if (triggerRect.left + contentRect.width > viewportWidth) {
      this.elements.content.style.left = `${viewportWidth - contentRect.width - 8}px`;
    }
    
    // Check if content goes off the bottom
    if (triggerRect.bottom + contentRect.height + 8 > viewportHeight) {
      // Position above the trigger instead
      this.elements.content.style.top = `${triggerRect.top - contentRect.height - 8}px`;
    }
  }

  public open(): void {
    this.clearTimers();
    this.openState.setValue(true);
  }

  public close(): void {
    this.handleClose();
  }

  public isOpen(): boolean {
    return this.openState.getValue() as boolean;
  }

  // Static factory method
  static create(selector: string | HTMLElement, options: HoverCardOptions = {}): HoverCard {
    const element = typeof selector === 'string' 
      ? document.querySelector(selector) as HTMLElement
      : selector;
    
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    return new HoverCard(element, options);
  }

  protected cleanup(): void {
    this.openState = null as any;
    this.elements = null as any;
    this.clearTimers();
  }
}
