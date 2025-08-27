import { describe, it, expect, beforeEach } from 'vitest';
import { Accordion } from '../src/accordion/Accordion';
import { 
  createAccordionHTML, 
  fireClickEvent, 
  fireKeyboardEvent,
  expectElementToHaveAttribute,
  expectElementToHaveDataAttribute,
  waitFor
} from './utils/test-utils';

describe('Accordion', () => {
  let container: HTMLElement;
  let accordion: Accordion;

  beforeEach(() => {
    container = createAccordionHTML();
    document.body.appendChild(container);
    accordion = new Accordion(container, {
      type: 'single',
      defaultValue: 'one'
    });
  });

  describe('Initialization', () => {
    it('should initialize with correct attributes', () => {
      expectElementToHaveAttribute(container, 'role', 'tablist');
      expectElementToHaveAttribute(container, 'aria-orientation', 'vertical');
      expectElementToHaveDataAttribute(container, 'orientation', 'vertical');
    });

    it('should set up items correctly', () => {
      const items = container.querySelectorAll('[data-accordion-item]');
      expect(items).toHaveLength(2);

      const firstItem = items[0];
      const firstTrigger = firstItem.querySelector('[data-accordion-trigger]');
      const firstContent = firstItem.querySelector('[data-accordion-content]');

      expectElementToHaveAttribute(firstTrigger!, 'role', 'tab');
      expectElementToHaveAttribute(firstTrigger!, 'aria-expanded', 'true');
      expectElementToHaveAttribute(firstContent!, 'role', 'tabpanel');
      expectElementToHaveAttribute(firstContent!, 'aria-labelledby');
    });

    it('should set initial state correctly', () => {
      expect(accordion.getValue()).toBe('one');
      
      const firstItem = container.querySelector('[data-accordion-item]');
      expectElementToHaveDataAttribute(firstItem!, 'state', 'open');
      
      const firstContent = firstItem!.querySelector('[data-accordion-content]');
      expectElementToNotHaveAttribute(firstContent!, 'hidden');
    });
  });

  describe('Single Accordion', () => {
    it('should open an item when clicked', async () => {
      const secondTrigger = container.querySelectorAll('[data-accordion-trigger]')[1];
      fireClickEvent(secondTrigger as HTMLElement);

      await waitFor(() => accordion.getValue() === 'two');
      expect(accordion.getValue()).toBe('two');
    });

    it('should close previous item when opening new one', async () => {
      const secondTrigger = container.querySelectorAll('[data-accordion-trigger]')[1];
      fireClickEvent(secondTrigger as HTMLElement);

      await waitFor(() => accordion.getValue() === 'two');
      
      const firstItem = container.querySelector('[data-accordion-item]');
      const firstContent = firstItem!.querySelector('[data-accordion-content]');
      
      expectElementToHaveDataAttribute(firstItem!, 'state', 'closed');
      expectElementToHaveAttribute(firstContent!, 'hidden');
    });

    it('should not close item when clicked again (non-collapsible)', async () => {
      const firstTrigger = container.querySelector('[data-accordion-trigger]');
      fireClickEvent(firstTrigger as HTMLElement);

      await waitFor(() => accordion.getValue() === 'one');
      expect(accordion.getValue()).toBe('one');
    });
  });

  describe('Multiple Accordion', () => {
    beforeEach(() => {
      accordion.destroy();
      accordion = new Accordion(container, {
        type: 'multiple',
        defaultValue: ['one']
      });
    });

    it('should allow multiple items to be open', async () => {
      const secondTrigger = container.querySelectorAll('[data-accordion-trigger]')[1];
      fireClickEvent(secondTrigger as HTMLElement);

      await waitFor(() => Array.isArray(accordion.getValue()) && accordion.getValue().includes('two'));
      
      const value = accordion.getValue() as string[];
      expect(value).toContain('one');
      expect(value).toContain('two');
    });

    it('should close item when clicked again', async () => {
      const firstTrigger = container.querySelector('[data-accordion-trigger]');
      fireClickEvent(firstTrigger as HTMLElement);

      await waitFor(() => {
        const value = accordion.getValue() as string[];
        return !value.includes('one');
      });
      
      const value = accordion.getValue() as string[];
      expect(value).not.toContain('one');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should navigate with arrow keys', async () => {
      const firstTrigger = container.querySelector('[data-accordion-trigger]') as HTMLElement;
      firstTrigger.focus();

      fireKeyboardEvent(firstTrigger, 'ArrowDown');
      
      await waitFor(() => {
        const secondTrigger = container.querySelectorAll('[data-accordion-trigger]')[1] as HTMLElement;
        return document.activeElement === secondTrigger;
      });
    });

    it('should open item with space key', async () => {
      const secondTrigger = container.querySelectorAll('[data-accordion-trigger]')[1] as HTMLElement;
      secondTrigger.focus();
      
      fireKeyboardEvent(secondTrigger, ' ');
      
      await waitFor(() => accordion.getValue() === 'two');
      expect(accordion.getValue()).toBe('two');
    });

    it('should open item with enter key', async () => {
      const secondTrigger = container.querySelectorAll('[data-accordion-trigger]')[1] as HTMLElement;
      secondTrigger.focus();
      
      fireKeyboardEvent(secondTrigger, 'Enter');
      
      await waitFor(() => accordion.getValue() === 'two');
      expect(accordion.getValue()).toBe('two');
    });
  });

  describe('Programmatic Control', () => {
    it('should open item programmatically', async () => {
      accordion.openItem('two');
      
      await waitFor(() => accordion.getValue() === 'two');
      expect(accordion.getValue()).toBe('two');
    });

    it('should close item programmatically', async () => {
      accordion.closeItem('one');
      
      await waitFor(() => accordion.getValue() === '');
      expect(accordion.getValue()).toBe('');
    });

    it('should set value programmatically', async () => {
      accordion.setValue('two');
      
      await waitFor(() => accordion.getValue() === 'two');
      expect(accordion.getValue()).toBe('two');
    });
  });

  describe('Events', () => {
    it('should emit valueChange event', async () => {
      let eventFired = false;
      let eventValue: string | string[] = '';
      
      accordion.addCustomEventListener('valueChange', (event: CustomEvent) => {
        eventFired = true;
        eventValue = event.detail.value;
      });

      const secondTrigger = container.querySelectorAll('[data-accordion-trigger]')[1];
      fireClickEvent(secondTrigger as HTMLElement);

      await waitFor(() => eventFired);
      expect(eventFired).toBe(true);
      expect(eventValue).toBe('two');
    });

    it('should emit itemOpen event', async () => {
      let eventFired = false;
      let eventValue = '';
      
      accordion.addCustomEventListener('itemOpen', (event: CustomEvent) => {
        eventFired = true;
        eventValue = event.detail.value;
      });

      accordion.openItem('two');

      await waitFor(() => eventFired);
      expect(eventFired).toBe(true);
      expect(eventValue).toBe('two');
    });

    it('should emit itemClose event', async () => {
      let eventFired = false;
      let eventValue = '';
      
      accordion.addCustomEventListener('itemClose', (event: CustomEvent) => {
        eventFired = true;
        eventValue = event.detail.value;
      });

      accordion.closeItem('one');

      await waitFor(() => eventFired);
      expect(eventFired).toBe(true);
      expect(eventValue).toBe('one');
    });
  });

  describe('Accessibility', () => {
    it('should have correct ARIA attributes', () => {
      const firstItem = container.querySelector('[data-accordion-item]');
      const firstTrigger = firstItem!.querySelector('[data-accordion-trigger]');
      const firstContent = firstItem!.querySelector('[data-accordion-content]');

      expectElementToHaveAttribute(firstTrigger!, 'role', 'tab');
      expectElementToHaveAttribute(firstTrigger!, 'aria-expanded', 'true');
      expectElementToHaveAttribute(firstContent!, 'role', 'tabpanel');
      expectElementToHaveAttribute(firstContent!, 'aria-labelledby');
    });

    it('should update ARIA attributes when state changes', async () => {
      const secondTrigger = container.querySelectorAll('[data-accordion-trigger]')[1];
      fireClickEvent(secondTrigger as HTMLElement);

      await waitFor(() => accordion.getValue() === 'two');
      
      expectElementToHaveAttribute(secondTrigger, 'aria-expanded', 'true');
      
      const firstTrigger = container.querySelector('[data-accordion-trigger]');
      expectElementToHaveAttribute(firstTrigger, 'aria-expanded', 'false');
    });
  });

  describe('Cleanup', () => {
    it('should clean up event listeners on destroy', () => {
      const eventSpy = vi.fn();
      accordion.addCustomEventListener('valueChange', eventSpy);
      
      accordion.destroy();
      
      const secondTrigger = container.querySelectorAll('[data-accordion-trigger]')[1];
      fireClickEvent(secondTrigger as HTMLElement);
      
      expect(eventSpy).not.toHaveBeenCalled();
    });
  });
});
