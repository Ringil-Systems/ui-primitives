import { Component } from '../core/Component';
import { createControllableState } from '../core/StateManager';
import { CheckboxOptions, CheckedState, CheckboxElements } from './types';

export class Checkbox extends Component {
  private elements: CheckboxElements = {};
  private checkedState!: ReturnType<typeof createControllableState<CheckedState>>;
  private required: boolean = false;
  private disabled: boolean = false;
  private name: string | undefined;
  private form: string | undefined;
  private value: string | number | readonly string[] = 'on';
  private isFormControl: boolean = true;

  constructor(element: HTMLElement, options: CheckboxOptions = {}) {
    super(element, options);
  }

  protected init(): void {
    const {
      checked,
      defaultChecked = false,
      required = false,
      onCheckedChange,
      name,
      form,
      disabled = false,
      value = 'on'
    } = this.options as CheckboxOptions;

    this.required = required;
    this.disabled = disabled;
    this.name = name;
    this.form = form;
    this.value = value;

    // Initialize state
    this.checkedState = createControllableState<CheckedState>({
      prop: checked,
      defaultProp: defaultChecked,
      onChange: onCheckedChange,
      caller: 'Checkbox'
    });

    // Find elements
    this.findElements();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Set initial state
    this.updateCheckedState();
    
    // Determine if this is a form control
    this.isFormControl = this.elements.trigger ? 
      !!this.form || !!this.elements.trigger.closest('form') : true;
  }

  private findElements(): void {
    this.elements = {
      trigger: this.querySelector('[data-checkbox-trigger]') || undefined,
      indicator: this.querySelector('[data-checkbox-indicator]') || undefined,
      bubbleInput: this.querySelector('input[type="checkbox"]') as HTMLInputElement || undefined
    };
  }

  private setupEventListeners(): void {
    // Listen for checked state changes
    this.checkedState.subscribe((checked: CheckedState) => {
      this.updateCheckedState();
      this.dispatchEvent(new CustomEvent('checkedChange', { detail: { checked } }));
    });

    // Trigger click
    if (this.elements.trigger) {
      this.addEventListener(this.elements.trigger, 'click', (e) => this.handleTriggerClick(e));
      this.addEventListener(this.elements.trigger, 'keydown', (e) => this.handleTriggerKeydown(e as KeyboardEvent));
    }

    // Form reset handling
    if (this.elements.trigger) {
      const form = (this.elements.trigger as HTMLButtonElement).form;
      if (form) {
        this.addEventListener(form, 'reset', () => {
          this.checkedState.setValue(this.options.defaultChecked || false);
        });
      }
    }
  }

  private handleTriggerClick(event: Event): void {
    if (this.disabled) return;

    const currentChecked = this.checkedState.getValue();
    const newChecked = this.isIndeterminate(currentChecked) ? true : !(currentChecked as boolean);
    
    this.checkedState.setValue(newChecked);

    // Handle form control behavior
    if (this.elements.bubbleInput && this.isFormControl) {
      // Stop propagation to prevent double events
      event.stopPropagation();
    }
  }

  private handleTriggerKeydown(event: KeyboardEvent): void {
    if (this.disabled) return;

    switch (event.key) {
      case 'Enter':
        // According to WAI ARIA, Checkboxes don't activate on enter keypress
        event.preventDefault();
        break;
      case ' ':
        event.preventDefault();
        this.handleTriggerClick(event);
        break;
    }
  }

  private updateCheckedState(): void {
    const checked = this.checkedState.getValue();
    
    // Update trigger
    if (this.elements.trigger) {
      this.setAttribute(this.elements.trigger, 'role', 'checkbox');
      this.setAttribute(this.elements.trigger, 'aria-checked', 
        this.isIndeterminate(checked) ? 'mixed' : checked.toString());
      this.setAttribute(this.elements.trigger, 'aria-required', this.required.toString());
      this.setDataAttribute(this.elements.trigger, 'state', this.getState(checked));
      
      if (this.disabled) {
        this.setAttribute(this.elements.trigger, 'data-disabled', '');
        this.setAttribute(this.elements.trigger, 'disabled', '');
      } else {
        this.elements.trigger.removeAttribute('data-disabled');
        this.elements.trigger.removeAttribute('disabled');
      }
    }

    // Update indicator
    if (this.elements.indicator) {
      this.setDataAttribute(this.elements.indicator, 'state', this.getState(checked));
      
      if (this.disabled) {
        this.setAttribute(this.elements.indicator, 'data-disabled', '');
      } else {
        this.elements.indicator.removeAttribute('data-disabled');
      }

      // Show/hide indicator based on state
      if (this.isIndeterminate(checked) || checked === true) {
        this.elements.indicator.removeAttribute('hidden');
      } else {
        this.setAttribute(this.elements.indicator, 'hidden', '');
      }
    }

    // Update bubble input
    if (this.elements.bubbleInput) {
      this.elements.bubbleInput.indeterminate = this.isIndeterminate(checked);
      this.elements.bubbleInput.checked = this.isIndeterminate(checked) ? false : (checked as boolean);
      
      // Dispatch change event for form compatibility
      const changeEvent = new Event('change', { bubbles: true });
      this.elements.bubbleInput.dispatchEvent(changeEvent);
    }
  }

  private isIndeterminate(checked?: CheckedState): checked is 'indeterminate' {
    return checked === 'indeterminate';
  }

  private getState(checked: CheckedState): string {
    return this.isIndeterminate(checked) ? 'indeterminate' : checked ? 'checked' : 'unchecked';
  }

  public setChecked(checked: CheckedState): void {
    this.checkedState.setValue(checked);
  }

  public getChecked(): CheckedState {
    return this.checkedState.getValue();
  }

  public toggle(): void {
    const currentChecked = this.checkedState.getValue();
    const newChecked = this.isIndeterminate(currentChecked) ? true : !(currentChecked as boolean);
    this.checkedState.setValue(newChecked);
  }

  public setRequired(required: boolean): void {
    this.required = required;
    if (this.elements.trigger) {
      this.setAttribute(this.elements.trigger, 'aria-required', required.toString());
    }
  }

  public setDisabled(disabled: boolean): void {
    this.disabled = disabled;
    this.updateCheckedState();
  }

  public setIndeterminate(indeterminate: boolean): void {
    if (indeterminate) {
      this.checkedState.setValue('indeterminate');
    } else {
      this.checkedState.setValue(false);
    }
  }

  // Static factory method
  static create(selector: string | HTMLElement, options: CheckboxOptions = {}): Checkbox {
    const element = typeof selector === 'string' 
      ? document.querySelector(selector) as HTMLElement
      : selector;
    
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    return new Checkbox(element, options);
  }

  protected cleanup(): void {
    this.checkedState = null as any;
  }
}
