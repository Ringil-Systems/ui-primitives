import { Component } from '../core/Component';
import { createControllableState } from '../core/StateManager';
import type { TooltipOptions, TooltipElements } from './types';

export class Tooltip extends Component {
  private openState: ReturnType<typeof createControllableState<boolean>>;
  private elements: TooltipElements;
  private delayDuration: number;
  private disableHoverableContent: boolean;
  private contentId: string;
  private openTimer: number | null = null;
  private closeTimer: number | null = null;
  private isPointerInTransit: boolean = false;

  constructor(element: HTMLElement, options: TooltipOptions = {}) {
    super(element, options);

    this.openState = createControllableState<boolean>({
      prop: options.open,
      defaultProp: options.defaultOpen ?? false,
      onChange: options.onOpenChange,
    });

    this.delayDuration = options.delayDuration ?? 700;
    this.disableHoverableContent = options.disableHoverableContent ?? false;
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
    this.elements.trigger = this.querySelector('[data-tooltip-trigger]') || this.createElement('button', {
      'data-tooltip-trigger': '',
      'type': 'button'
    });

    // Find or create content
    this.elements.content = this.querySelector('[data-tooltip-content]') || this.createElement('div', {
      'data-tooltip-content': '',
      'role': 'tooltip',
      'hidden': ''
    });

    // Add trigger and content to root if they don't exist
    if (!this.querySelector('[data-tooltip-trigger]')) {
      this.element.appendChild(this.elements.trigger);
    }
    if (!this.querySelector('[data-tooltip-content]')) {
      this.element.appendChild(this.elements.content);
    }
  }

  private setupAttributes(): void {
    // Set up root element
    this.setAttribute(this.element, 'data-tooltip', '');

    // Set up trigger
    this.setAttribute(this.elements.trigger, 'data-tooltip-trigger', '');
    this.setAttribute(this.elements.trigger, 'type', 'button');

    // Set up content
    this.setAttribute(this.elements.content, 'data-tooltip-content', '');
    this.setAttribute(this.elements.content, 'role', 'tooltip');
    this.setAttribute(this.elements.content, 'id', this.contentId);
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

    // Handle content events
    this.addEventListener(this.elements.content, 'pointerenter', (e) => this.handleContentEnter(e));
    this.addEventListener(this.elements.content, 'pointerleave', (e) => this.handleContentLeave(e));
  }

  private handleTriggerEnter(event: Event): void {
    const pointerEvent = event as PointerEvent;
    if (pointerEvent.pointerType === 'touch') return;

    this.clearTimers();
    this.isPointerInTransit = false;
    
    if (this.delayDuration > 0) {
      this.openTimer = window.setTimeout(() => {
        this.openState.setValue(true);
        this.openTimer = null;
      }, this.delayDuration);
    } else {
      this.openState.setValue(true);
    }
  }

  private handleTriggerLeave(event: Event): void {
    const pointerEvent = event as PointerEvent;
    if (pointerEvent.pointerType === 'touch') return;

    if (this.disableHoverableContent) {
      this.handleClose();
    } else {
      // Clear the open timer in case the pointer leaves before the tooltip opens
      this.clearOpenTimer();
    }
  }

  private handleTriggerFocus(event: Event): void {
    this.clearTimers();
    this.openState.setValue(true);
  }

  private handleTriggerBlur(event: Event): void {
    // Add a small delay to allow focus to move to the tooltip content
    this.closeTimer = window.setTimeout(() => {
      this.handleClose();
    }, 100);
  }

  private handleContentEnter(event: Event): void {
    if (!this.disableHoverableContent) {
      this.clearCloseTimer();
    }
  }

  private handleContentLeave(event: Event): void {
    if (!this.disableHoverableContent) {
      this.handleClose();
    }
  }

  private handleClose(): void {
    this.clearTimers();
    this.openState.setValue(false);
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
      this.setAttribute(this.elements.trigger, 'aria-describedby', this.contentId);
      this.setDataAttribute(this.elements.trigger, 'state', 'open');
      this.setDataAttribute(this.elements.content, 'state', 'open');
      
      // Position the content relative to the trigger
      this.positionContent();
    } else {
      this.setAttribute(this.elements.content, 'hidden', '');
      this.elements.trigger.removeAttribute('aria-describedby');
      this.setDataAttribute(this.elements.trigger, 'state', 'closed');
      this.setDataAttribute(this.elements.content, 'state', 'closed');
    }
  }

  private positionContent(): void {
    const triggerRect = this.elements.trigger.getBoundingClientRect();
    const contentRect = this.elements.content.getBoundingClientRect();
    
    // Position above the trigger by default
    this.elements.content.style.position = 'absolute';
    this.elements.content.style.top = `${triggerRect.top - contentRect.height - 8}px`;
    this.elements.content.style.left = `${triggerRect.left + (triggerRect.width - contentRect.width) / 2}px`;
    this.elements.content.style.zIndex = '1000';
    
    // Ensure content doesn't go off-screen
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Check if content goes off the left side
    if (triggerRect.left + (triggerRect.width - contentRect.width) / 2 < 0) {
      this.elements.content.style.left = '8px';
    }
    
    // Check if content goes off the right side
    if (triggerRect.left + (triggerRect.width - contentRect.width) / 2 + contentRect.width > viewportWidth) {
      this.elements.content.style.left = `${viewportWidth - contentRect.width - 8}px`;
    }
    
    // Check if content goes off the top
    if (triggerRect.top - contentRect.height - 8 < 0) {
      // Position below the trigger instead
      this.elements.content.style.top = `${triggerRect.bottom + 8}px`;
    }
  }

  private generateId(): string {
    return `tooltip-${Math.random().toString(36).substr(2, 9)}`;
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
  static create(selector: string | HTMLElement, options: TooltipOptions = {}): Tooltip {
    const element = typeof selector === 'string' 
      ? document.querySelector(selector) as HTMLElement
      : selector;
    
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    return new Tooltip(element, options);
  }

  protected cleanup(): void {
    this.openState = null as any;
    this.elements = null as any;
    this.clearTimers();
  }
}
