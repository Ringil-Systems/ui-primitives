import { describe, it, expect, beforeEach } from 'vitest';
import { Checkbox } from '../src/checkbox/Checkbox';
import { 
  createCheckboxHTML, 
  fireClickEvent, 
  fireKeyboardEvent,
  expectElementToHaveAttribute,
  expectElementToHaveDataAttribute,
  waitFor
} from './utils/test-utils';

describe('Checkbox', () => {
  let container: HTMLElement;
  let checkbox: Checkbox;

  beforeEach(() => {
    container = createCheckboxHTML();
    document.body.appendChild(container);
    checkbox = new Checkbox(container, {
      defaultChecked: false
    });
  });

  describe('Initialization', () => {
    it('should initialize with correct attributes', () => {
      const trigger = container.querySelector('[data-checkbox-trigger]');
      const indicator = container.querySelector('[data-checkbox-indicator]');
      const input = container.querySelector('input[type="checkbox"]');

      expectElementToHaveAttribute(trigger!, 'role', 'checkbox');
      expectElementToHaveAttribute(trigger!, 'aria-checked', 'false');
      expectElementToHaveDataAttribute(trigger!, 'state', 'unchecked');
      expectElementToHaveDataAttribute(indicator!, 'state', 'unchecked');
      expectElementToHaveAttribute(indicator!, 'hidden');
      expect(input).toBeInstanceOf(HTMLInputElement);
    });

    it('should set initial state correctly', () => {
      expect(checkbox.getChecked()).toBe(false);
    });

    it('should initialize with checked state', () => {
      checkbox.destroy();
      checkbox = new Checkbox(container, {
        defaultChecked: true
      });

      expect(checkbox.getChecked()).toBe(true);
      
      const trigger = container.querySelector('[data-checkbox-trigger]');
      const indicator = container.querySelector('[data-checkbox-indicator]');
      
      expectElementToHaveAttribute(trigger!, 'aria-checked', 'true');
      expectElementToHaveDataAttribute(trigger!, 'state', 'checked');
      expectElementToHaveDataAttribute(indicator!, 'state', 'checked');
      expectElementToNotHaveAttribute(indicator!, 'hidden');
    });
  });

  describe('Interaction', () => {
    it('should toggle when clicked', async () => {
      const trigger = container.querySelector('[data-checkbox-trigger]');
      fireClickEvent(trigger as HTMLElement);

      await waitFor(() => checkbox.getChecked() === true);
      expect(checkbox.getChecked()).toBe(true);
    });

    it('should toggle back when clicked again', async () => {
      const trigger = container.querySelector('[data-checkbox-trigger]');
      
      // First click to check
      fireClickEvent(trigger as HTMLElement);
      await waitFor(() => checkbox.getChecked() === true);
      
      // Second click to uncheck
      fireClickEvent(trigger as HTMLElement);
      await waitFor(() => checkbox.getChecked() === false);
      
      expect(checkbox.getChecked()).toBe(false);
    });

    it('should not toggle when disabled', async () => {
      checkbox.setDisabled(true);
      
      const trigger = container.querySelector('[data-checkbox-trigger]');
      fireClickEvent(trigger as HTMLElement);

      await waitFor(() => checkbox.getChecked() === false);
      expect(checkbox.getChecked()).toBe(false);
    });

    it('should toggle with space key', async () => {
      const trigger = container.querySelector('[data-checkbox-trigger]') as HTMLElement;
      trigger.focus();
      
      fireKeyboardEvent(trigger, ' ');
      
      await waitFor(() => checkbox.getChecked() === true);
      expect(checkbox.getChecked()).toBe(true);
    });

    it('should not toggle with enter key', async () => {
      const trigger = container.querySelector('[data-checkbox-trigger]') as HTMLElement;
      trigger.focus();
      
      fireKeyboardEvent(trigger, 'Enter');
      
      await waitFor(() => checkbox.getChecked() === false);
      expect(checkbox.getChecked()).toBe(false);
    });
  });

  describe('Indeterminate State', () => {
    it('should set indeterminate state', async () => {
      checkbox.setIndeterminate(true);
      
      await waitFor(() => checkbox.getChecked() === 'indeterminate');
      expect(checkbox.getChecked()).toBe('indeterminate');
      
      const trigger = container.querySelector('[data-checkbox-trigger]');
      const indicator = container.querySelector('[data-checkbox-indicator]');
      
      expectElementToHaveAttribute(trigger!, 'aria-checked', 'mixed');
      expectElementToHaveDataAttribute(trigger!, 'state', 'indeterminate');
      expectElementToHaveDataAttribute(indicator!, 'state', 'indeterminate');
      expectElementToNotHaveAttribute(indicator!, 'hidden');
    });

    it('should clear indeterminate state when clicked', async () => {
      checkbox.setIndeterminate(true);
      await waitFor(() => checkbox.getChecked() === 'indeterminate');
      
      const trigger = container.querySelector('[data-checkbox-trigger]');
      fireClickEvent(trigger as HTMLElement);
      
      await waitFor(() => checkbox.getChecked() === true);
      expect(checkbox.getChecked()).toBe(true);
    });

    it('should clear indeterminate state programmatically', async () => {
      checkbox.setIndeterminate(true);
      await waitFor(() => checkbox.getChecked() === 'indeterminate');
      
      checkbox.setIndeterminate(false);
      await waitFor(() => checkbox.getChecked() === false);
      expect(checkbox.getChecked()).toBe(false);
    });
  });

  describe('Programmatic Control', () => {
    it('should set checked state programmatically', async () => {
      checkbox.setChecked(true);
      
      await waitFor(() => checkbox.getChecked() === true);
      expect(checkbox.getChecked()).toBe(true);
    });

    it('should toggle programmatically', async () => {
      checkbox.toggle();
      
      await waitFor(() => checkbox.getChecked() === true);
      expect(checkbox.getChecked()).toBe(true);
      
      checkbox.toggle();
      
      await waitFor(() => checkbox.getChecked() === false);
      expect(checkbox.getChecked()).toBe(false);
    });

    it('should set required state', () => {
      checkbox.setRequired(true);
      
      const trigger = container.querySelector('[data-checkbox-trigger]');
      expectElementToHaveAttribute(trigger!, 'aria-required', 'true');
    });

    it('should set disabled state', async () => {
      checkbox.setDisabled(true);
      
      const trigger = container.querySelector('[data-checkbox-trigger]');
      expectElementToHaveAttribute(trigger!, 'data-disabled');
      expectElementToHaveAttribute(trigger!, 'disabled');
      
      const indicator = container.querySelector('[data-checkbox-indicator]');
      expectElementToHaveAttribute(indicator!, 'data-disabled');
    });
  });

  describe('Form Integration', () => {
    it('should update hidden input when state changes', async () => {
      const input = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
      
      checkbox.setChecked(true);
      await waitFor(() => input.checked === true);
      expect(input.checked).toBe(true);
      
      checkbox.setIndeterminate(true);
      await waitFor(() => input.indeterminate === true);
      expect(input.indeterminate).toBe(true);
    });

    it('should dispatch change event on input', async () => {
      const input = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
      let changeEventFired = false;
      
      input.addEventListener('change', () => {
        changeEventFired = true;
      });
      
      checkbox.setChecked(true);
      await waitFor(() => changeEventFired);
      expect(changeEventFired).toBe(true);
    });
  });

  describe('Events', () => {
    it('should emit checkedChange event', async () => {
      let eventFired = false;
      let eventValue: any = null;
      
      checkbox.addCustomEventListener('checkedChange', (event: CustomEvent) => {
        eventFired = true;
        eventValue = event.detail.checked;
      });

      checkbox.setChecked(true);

      await waitFor(() => eventFired);
      expect(eventFired).toBe(true);
      expect(eventValue).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should have correct ARIA attributes', () => {
      const trigger = container.querySelector('[data-checkbox-trigger]');
      
      expectElementToHaveAttribute(trigger!, 'role', 'checkbox');
      expectElementToHaveAttribute(trigger!, 'aria-checked', 'false');
    });

    it('should update ARIA attributes when state changes', async () => {
      const trigger = container.querySelector('[data-checkbox-trigger]');
      
      checkbox.setChecked(true);
      await waitFor(() => checkbox.getChecked() === true);
      
      expectElementToHaveAttribute(trigger!, 'aria-checked', 'true');
      
      checkbox.setIndeterminate(true);
      await waitFor(() => checkbox.getChecked() === 'indeterminate');
      
      expectElementToHaveAttribute(trigger!, 'aria-checked', 'mixed');
    });

    it('should handle disabled state correctly', async () => {
      checkbox.setDisabled(true);
      
      const trigger = container.querySelector('[data-checkbox-trigger]');
      expectElementToHaveAttribute(trigger!, 'aria-disabled', 'true');
      expectElementToHaveAttribute(trigger!, 'disabled');
    });
  });

  describe('Controlled vs Uncontrolled', () => {
    it('should work as uncontrolled component', async () => {
      checkbox.destroy();
      checkbox = new Checkbox(container, {
        defaultChecked: false
      });

      const trigger = container.querySelector('[data-checkbox-trigger]');
      fireClickEvent(trigger as HTMLElement);

      await waitFor(() => checkbox.getChecked() === true);
      expect(checkbox.getChecked()).toBe(true);
    });

    it('should work as controlled component', async () => {
      let controlledValue = false;
      
      checkbox.destroy();
      checkbox = new Checkbox(container, {
        checked: controlledValue,
        onCheckedChange: (value) => {
          controlledValue = value;
        }
      });

      const trigger = container.querySelector('[data-checkbox-trigger]');
      fireClickEvent(trigger as HTMLElement);

      await waitFor(() => controlledValue === true);
      expect(controlledValue).toBe(true);
      expect(checkbox.getChecked()).toBe(true);
    });
  });

  describe('Cleanup', () => {
    it('should clean up event listeners on destroy', () => {
      const eventSpy = vi.fn();
      checkbox.addCustomEventListener('checkedChange', eventSpy);
      
      checkbox.destroy();
      
      const trigger = container.querySelector('[data-checkbox-trigger]');
      fireClickEvent(trigger as HTMLElement);
      
      expect(eventSpy).not.toHaveBeenCalled();
    });
  });
});
