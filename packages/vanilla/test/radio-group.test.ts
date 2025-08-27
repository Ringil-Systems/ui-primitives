import { describe, it, expect, beforeEach } from 'vitest';
import { RadioGroup } from '../src/radio-group/RadioGroup';
import { 
  createRadioGroupHTML, 
  fireClickEvent, 
  fireKeyboardEvent,
  expectElementToHaveAttribute,
  expectElementToHaveDataAttribute,
  waitFor
} from './utils/test-utils';

describe('RadioGroup', () => {
  let container: HTMLElement;
  let radioGroup: RadioGroup;

  beforeEach(() => {
    container = createRadioGroupHTML();
    document.body.appendChild(container);
    radioGroup = new RadioGroup(container, {
      defaultValue: 'one'
    });
  });

  describe('Initialization', () => {
    it('should initialize with correct attributes', () => {
      expectElementToHaveAttribute(container, 'role', 'radiogroup');
      expectElementToHaveAttribute(container, 'aria-orientation', 'horizontal');
      expectElementToHaveAttribute(container, 'aria-required', 'false');
    });

    it('should set up items correctly', () => {
      const items = container.querySelectorAll('[data-radio-group-item]');
      expect(items).toHaveLength(3);

      const firstItem = items[0];
      const firstRadio = firstItem.querySelector('[data-radio]');
      const firstIndicator = firstItem.querySelector('[data-radio-indicator]');

      expectElementToHaveAttribute(firstRadio!, 'role', 'radio');
      expectElementToHaveAttribute(firstRadio!, 'aria-checked', 'true');
      expectElementToHaveAttribute(firstRadio!, 'tabindex', '0');
      expectElementToHaveDataAttribute(firstIndicator!, 'state', 'checked');
    });

    it('should set initial state correctly', () => {
      expect(radioGroup.getValue()).toBe('one');
      
      const firstItem = container.querySelector('[data-radio-group-item]');
      const firstRadio = firstItem!.querySelector('[data-radio]');
      expectElementToHaveAttribute(firstRadio!, 'aria-checked', 'true');
    });
  });

  describe('Selection', () => {
    it('should select an item when clicked', async () => {
      const secondItem = container.querySelectorAll('[data-radio-group-item]')[1];
      const secondRadio = secondItem.querySelector('[data-radio]');
      fireClickEvent(secondRadio as HTMLElement);

      await waitFor(() => radioGroup.getValue() === 'two');
      expect(radioGroup.getValue()).toBe('two');
    });

    it('should deselect previous item when selecting new one', async () => {
      const secondItem = container.querySelectorAll('[data-radio-group-item]')[1];
      const secondRadio = secondItem.querySelector('[data-radio]');
      fireClickEvent(secondRadio as HTMLElement);

      await waitFor(() => radioGroup.getValue() === 'two');
      
      const firstItem = container.querySelector('[data-radio-group-item]');
      const firstRadio = firstItem!.querySelector('[data-radio]');
      expectElementToHaveAttribute(firstRadio!, 'aria-checked', 'false');
      expectElementToHaveAttribute(firstRadio!, 'tabindex', '-1');
    });

    it('should not deselect when clicking selected item', async () => {
      const firstItem = container.querySelector('[data-radio-group-item]');
      const firstRadio = firstItem!.querySelector('[data-radio]');
      fireClickEvent(firstRadio as HTMLElement);

      await waitFor(() => radioGroup.getValue() === 'one');
      expect(radioGroup.getValue()).toBe('one');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should navigate with arrow keys', async () => {
      const firstRadio = container.querySelector('[data-radio]') as HTMLElement;
      firstRadio.focus();

      fireKeyboardEvent(firstRadio, 'ArrowRight');
      
      await waitFor(() => {
        const secondRadio = container.querySelectorAll('[data-radio]')[1] as HTMLElement;
        return document.activeElement === secondRadio;
      });
    });

    it('should select item with space key', async () => {
      const secondRadio = container.querySelectorAll('[data-radio]')[1] as HTMLElement;
      secondRadio.focus();
      
      fireKeyboardEvent(secondRadio, ' ');
      
      await waitFor(() => radioGroup.getValue() === 'two');
      expect(radioGroup.getValue()).toBe('two');
    });

    it('should not select with enter key', async () => {
      const secondRadio = container.querySelectorAll('[data-radio]')[1] as HTMLElement;
      secondRadio.focus();
      
      fireKeyboardEvent(secondRadio, 'Enter');
      
      await waitFor(() => radioGroup.getValue() === 'one');
      expect(radioGroup.getValue()).toBe('one');
    });

    it('should loop navigation when enabled', async () => {
      const firstRadio = container.querySelector('[data-radio]') as HTMLElement;
      firstRadio.focus();

      fireKeyboardEvent(firstRadio, 'ArrowLeft');
      
      await waitFor(() => {
        const lastRadio = container.querySelectorAll('[data-radio]')[2] as HTMLElement;
        return document.activeElement === lastRadio;
      });
    });
  });

  describe('Programmatic Control', () => {
    it('should set value programmatically', async () => {
      radioGroup.setValue('three');
      
      await waitFor(() => radioGroup.getValue() === 'three');
      expect(radioGroup.getValue()).toBe('three');
    });

    it('should enable/disable items', async () => {
      radioGroup.disableItem('two');
      
      const secondItem = container.querySelectorAll('[data-radio-group-item]')[1];
      const secondRadio = secondItem.querySelector('[data-radio]');
      expectElementToHaveAttribute(secondRadio!, 'aria-disabled', 'true');
      
      radioGroup.enableItem('two');
      expectElementToNotHaveAttribute(secondRadio!, 'aria-disabled');
    });

    it('should add new items', async () => {
      const newRadio = document.createElement('button');
      newRadio.textContent = 'Option Four';
      
      radioGroup.addItem('four', newRadio);
      
      const items = container.querySelectorAll('[data-radio-group-item]');
      expect(items).toHaveLength(4);
      
      const newItem = items[3];
      expectElementToHaveAttribute(newItem, 'data-value', 'four');
    });

    it('should remove items', () => {
      radioGroup.removeItem('two');
      
      const items = container.querySelectorAll('[data-radio-group-item]');
      expect(items).toHaveLength(2);
    });
  });

  describe('Events', () => {
    it('should emit valueChange event', async () => {
      let eventFired = false;
      let eventValue = '';
      
      radioGroup.addCustomEventListener('valueChange', (event: CustomEvent) => {
        eventFired = true;
        eventValue = event.detail.value;
      });

      const secondRadio = container.querySelectorAll('[data-radio]')[1];
      fireClickEvent(secondRadio as HTMLElement);

      await waitFor(() => eventFired);
      expect(eventFired).toBe(true);
      expect(eventValue).toBe('two');
    });
  });

  describe('Accessibility', () => {
    it('should have correct ARIA attributes', () => {
      const firstRadio = container.querySelector('[data-radio]');
      
      expectElementToHaveAttribute(firstRadio!, 'role', 'radio');
      expectElementToHaveAttribute(firstRadio!, 'aria-checked', 'true');
    });

    it('should update ARIA attributes when selection changes', async () => {
      const firstRadio = container.querySelector('[data-radio]');
      const secondRadio = container.querySelectorAll('[data-radio]')[1];
      
      fireClickEvent(secondRadio as HTMLElement);
      await waitFor(() => radioGroup.getValue() === 'two');
      
      expectElementToHaveAttribute(firstRadio!, 'aria-checked', 'false');
      expectElementToHaveAttribute(secondRadio, 'aria-checked', 'true');
    });

    it('should handle required state', () => {
      radioGroup.destroy();
      radioGroup = new RadioGroup(container, {
        defaultValue: 'one',
        required: true
      });

      expectElementToHaveAttribute(container, 'aria-required', 'true');
    });

    it('should handle disabled state', () => {
      radioGroup.destroy();
      radioGroup = new RadioGroup(container, {
        defaultValue: 'one',
        disabled: true
      });

      expectElementToHaveAttribute(container, 'data-disabled');
    });
  });

  describe('Orientation', () => {
    it('should handle vertical orientation', () => {
      radioGroup.destroy();
      radioGroup = new RadioGroup(container, {
        defaultValue: 'one',
        orientation: 'vertical'
      });

      expectElementToHaveAttribute(container, 'aria-orientation', 'vertical');
    });
  });

  describe('Controlled vs Uncontrolled', () => {
    it('should work as uncontrolled component', async () => {
      radioGroup.destroy();
      radioGroup = new RadioGroup(container, {
        defaultValue: 'one'
      });

      const secondRadio = container.querySelectorAll('[data-radio]')[1];
      fireClickEvent(secondRadio as HTMLElement);

      await waitFor(() => radioGroup.getValue() === 'two');
      expect(radioGroup.getValue()).toBe('two');
    });

    it('should work as controlled component', async () => {
      let controlledValue = 'one';
      
      radioGroup.destroy();
      radioGroup = new RadioGroup(container, {
        value: controlledValue,
        onValueChange: (value) => {
          controlledValue = value;
        }
      });

      const secondRadio = container.querySelectorAll('[data-radio]')[1];
      fireClickEvent(secondRadio as HTMLElement);

      await waitFor(() => controlledValue === 'two');
      expect(controlledValue).toBe('two');
      expect(radioGroup.getValue()).toBe('two');
    });
  });

  describe('Cleanup', () => {
    it('should clean up event listeners on destroy', () => {
      const eventSpy = vi.fn();
      radioGroup.addCustomEventListener('valueChange', eventSpy);
      
      radioGroup.destroy();
      
      const secondRadio = container.querySelectorAll('[data-radio]')[1];
      fireClickEvent(secondRadio as HTMLElement);
      
      expect(eventSpy).not.toHaveBeenCalled();
    });
  });
});
