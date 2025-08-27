import { Component } from '../core/Component';
import { createControllableState } from '../core/StateManager';
import type { TabsOptions, TabsElements, TabsTrigger, TabsOrientation, TabsActivationMode } from './types';

export class Tabs extends Component {
  private valueState: ReturnType<typeof createControllableState<string>>;
  private elements: TabsElements;
  private orientation: TabsOrientation;
  private activationMode: TabsActivationMode;
  private baseId: string;
  private triggers: TabsTrigger[] = [];
  private focusedIndex: number = 0;

  constructor(element: HTMLElement, options: TabsOptions = {}) {
    super(element, options);

    this.valueState = createControllableState<string>({
      prop: options.value,
      defaultProp: options.defaultValue ?? '',
      onChange: options.onValueChange,
    });

    this.orientation = options.orientation ?? 'horizontal';
    this.activationMode = options.activationMode ?? 'automatic';
    this.baseId = this.generateId();

    this.elements = {
      root: element,
      list: null as any,
      triggers: [],
      contents: [],
    };
  }

  protected init(): void {
    this.findElements();
    this.setupAttributes();
    this.setupEventListeners();
    this.updateDisplay();
  }

  private findElements(): void {
    // Find or create tabs list
    this.elements.list = this.querySelector('[data-tabs-list]') || this.createElement('div', {
      'data-tabs-list': '',
      'role': 'tablist'
    });

    // Find existing triggers and contents
    const existingTriggers = this.querySelectorAll('[data-tabs-trigger]');
    const existingContents = this.querySelectorAll('[data-tabs-content]');

    if (existingTriggers.length > 0) {
      this.elements.triggers = Array.from(existingTriggers);
    }

    if (existingContents.length > 0) {
      this.elements.contents = Array.from(existingContents);
    }

    // Add list to root if it doesn't exist
    if (!this.querySelector('[data-tabs-list]')) {
      this.element.appendChild(this.elements.list);
    }

    // Create default structure if no triggers/content exist
    if (this.elements.triggers.length === 0) {
      this.createDefaultStructure();
    }
  }

  private createDefaultStructure(): void {
    // Create a default tab structure
    const trigger1 = this.createElement('button', {
      'data-tabs-trigger': '',
      'role': 'tab',
      'type': 'button',
      'tabindex': '0'
    }, ['Tab 1']);

    const trigger2 = this.createElement('button', {
      'data-tabs-trigger': '',
      'role': 'tab',
      'type': 'button',
      'tabindex': '-1'
    }, ['Tab 2']);

    const content1 = this.createElement('div', {
      'data-tabs-content': '',
      'role': 'tabpanel',
      'tabindex': '0'
    }, ['Content 1']);

    const content2 = this.createElement('div', {
      'data-tabs-content': '',
      'role': 'tabpanel',
      'tabindex': '0',
      'hidden': ''
    }, ['Content 2']);

    this.elements.list.appendChild(trigger1);
    this.elements.list.appendChild(trigger2);
    this.element.appendChild(content1);
    this.element.appendChild(content2);

    this.elements.triggers = [trigger1, trigger2];
    this.elements.contents = [content1, content2];
  }

  private setupAttributes(): void {
    // Set up root element
    this.setAttribute(this.element, 'data-tabs', '');
    this.setAttribute(this.element, 'data-orientation', this.orientation);

    // Set up list
    this.setAttribute(this.elements.list, 'data-tabs-list', '');
    this.setAttribute(this.elements.list, 'role', 'tablist');
    this.setAttribute(this.elements.list, 'aria-orientation', this.orientation);

    // Set up triggers and contents
    this.elements.triggers.forEach((trigger, index) => {
      const value = `tab-${index + 1}`;
      const content = this.elements.contents[index];
      
      if (content) {
        this.setAttribute(trigger, 'data-tabs-trigger', '');
        this.setAttribute(trigger, 'role', 'tab');
        this.setAttribute(trigger, 'type', 'button');
        this.setAttribute(trigger, 'data-value', value);
        this.setAttribute(trigger, 'id', this.makeTriggerId(value));
        this.setAttribute(trigger, 'aria-controls', this.makeContentId(value));
        
        this.setAttribute(content, 'data-tabs-content', '');
        this.setAttribute(content, 'role', 'tabpanel');
        this.setAttribute(content, 'id', this.makeContentId(value));
        this.setAttribute(content, 'aria-labelledby', this.makeTriggerId(value));
      }
    });
  }

  private setupEventListeners(): void {
    // Listen for value changes
    this.valueState.subscribe((value: string) => {
      this.updateDisplay();
      this.dispatchEvent(new CustomEvent('valueChange', { detail: { value } }));
    });

    // Handle trigger events
    this.elements.triggers.forEach((trigger, index) => {
      this.addEventListener(trigger, 'click', (e) => this.handleTriggerClick(e, index));
      this.addEventListener(trigger, 'keydown', (e) => this.handleTriggerKeydown(e, index));
      this.addEventListener(trigger, 'focus', () => this.handleTriggerFocus(index));
    });
  }

  private handleTriggerClick(event: Event, index: number): void {
    const trigger = this.elements.triggers[index];
    if (!trigger) return;

    const value = trigger.getAttribute('data-value') || `tab-${index + 1}`;
    this.valueState.setValue(value);
  }

  private handleTriggerKeydown(event: Event, index: number): void {
    const key = (event as KeyboardEvent).key;
    
    switch (key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        this.focusNextTrigger();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        this.focusPreviousTrigger();
        break;
      case 'Home':
        event.preventDefault();
        this.focusFirstTrigger();
        break;
      case 'End':
        event.preventDefault();
        this.focusLastTrigger();
        break;
      case ' ':
      case 'Enter':
        event.preventDefault();
        this.handleTriggerClick(event, index);
        break;
    }
  }

  private handleTriggerFocus(index: number): void {
    this.focusedIndex = index;
    
    // Handle automatic activation
    if (this.activationMode === 'automatic') {
      const trigger = this.elements.triggers[index];
      if (trigger) {
        const value = trigger.getAttribute('data-value') || `tab-${index + 1}`;
        this.valueState.setValue(value);
      }
    }
  }

  private focusNextTrigger(): void {
    const nextIndex = this.focusedIndex >= this.elements.triggers.length - 1 ? 0 : this.focusedIndex + 1;
    this.elements.triggers[nextIndex]?.focus();
  }

  private focusPreviousTrigger(): void {
    const prevIndex = this.focusedIndex <= 0 ? this.elements.triggers.length - 1 : this.focusedIndex - 1;
    this.elements.triggers[prevIndex]?.focus();
  }

  private focusFirstTrigger(): void {
    this.elements.triggers[0]?.focus();
  }

  private focusLastTrigger(): void {
    this.elements.triggers[this.elements.triggers.length - 1]?.focus();
  }

  private updateDisplay(): void {
    const currentValue = this.valueState.getValue();
    
    this.elements.triggers.forEach((trigger, index) => {
      const value = trigger.getAttribute('data-value') || `tab-${index + 1}`;
      const isSelected = value === currentValue;
      const content = this.elements.contents[index];
      
      // Update trigger state
      this.setAttribute(trigger, 'aria-selected', isSelected.toString());
      this.setDataAttribute(trigger, 'state', isSelected ? 'active' : 'inactive');
      this.setAttribute(trigger, 'tabindex', isSelected ? '0' : '-1');
      
      // Update content state
      if (content) {
        this.setDataAttribute(content, 'state', isSelected ? 'active' : 'inactive');
        if (isSelected) {
          content.removeAttribute('hidden');
        } else {
          this.setAttribute(content, 'hidden', '');
        }
      }
    });
  }

  private makeTriggerId(value: string): string {
    return `${this.baseId}-trigger-${value}`;
  }

  private makeContentId(value: string): string {
    return `${this.baseId}-content-${value}`;
  }

  private generateId(): string {
    return `tabs-${Math.random().toString(36).substr(2, 9)}`;
  }

  public setValue(value: string): void {
    this.valueState.setValue(value);
  }

  public getValue(): string {
    return this.valueState.getValue();
  }

  public addTab(value: string, triggerText: string, contentText: string): void {
    const trigger = this.createElement('button', {
      'data-tabs-trigger': '',
      'role': 'tab',
      'type': 'button',
      'data-value': value,
      'tabindex': '-1'
    }, [triggerText]);

    const content = this.createElement('div', {
      'data-tabs-content': '',
      'role': 'tabpanel',
      'hidden': ''
    }, [contentText]);

    this.setAttribute(trigger, 'id', this.makeTriggerId(value));
    this.setAttribute(trigger, 'aria-controls', this.makeContentId(value));
    this.setAttribute(content, 'id', this.makeContentId(value));
    this.setAttribute(content, 'aria-labelledby', this.makeTriggerId(value));

    this.elements.list.appendChild(trigger);
    this.element.appendChild(content);

    this.elements.triggers.push(trigger);
    this.elements.contents.push(content);

    // Add event listeners
    const index = this.elements.triggers.length - 1;
    this.addEventListener(trigger, 'click', (e) => this.handleTriggerClick(e, index));
    this.addEventListener(trigger, 'keydown', (e) => this.handleTriggerKeydown(e, index));
    this.addEventListener(trigger, 'focus', () => this.handleTriggerFocus(index));

    this.updateDisplay();
  }

  public removeTab(value: string): void {
    const index = this.elements.triggers.findIndex(trigger => 
      trigger.getAttribute('data-value') === value
    );

    if (index !== -1) {
      const trigger = this.elements.triggers[index];
      const content = this.elements.contents[index];
      
      if (trigger) trigger.remove();
      if (content) content.remove();
      
      this.elements.triggers.splice(index, 1);
      this.elements.contents.splice(index, 1);
      
      this.updateDisplay();
    }
  }

  // Static factory method
  static create(selector: string | HTMLElement, options: TabsOptions = {}): Tabs {
    const element = typeof selector === 'string' 
      ? document.querySelector(selector) as HTMLElement
      : selector;
    
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    return new Tabs(element, options);
  }

  protected cleanup(): void {
    this.valueState = null as any;
    this.elements = null as any;
    this.triggers = [];
  }
}
