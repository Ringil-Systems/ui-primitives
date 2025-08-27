export function createElement(tagName: string, attributes: Record<string, string> = {}): HTMLElement {
  const element = document.createElement(tagName);
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  return element;
}

export function createAccordionHTML(): HTMLElement {
  const container = createElement('div', { id: 'accordion' });
  container.innerHTML = `
    <div data-accordion-item data-value="one">
      <button data-accordion-trigger>Section One</button>
      <div data-accordion-content>Content One</div>
    </div>
    <div data-accordion-item data-value="two">
      <button data-accordion-trigger>Section Two</button>
      <div data-accordion-content>Content Two</div>
    </div>
  `;
  return container;
}

export function createDialogHTML(): HTMLElement {
  const container = createElement('div', { id: 'dialog' });
  container.innerHTML = `
    <button data-dialog-trigger>Open Dialog</button>
    <div data-dialog-overlay hidden>
      <div data-dialog-content>
        <h3 data-dialog-title>Dialog Title</h3>
        <p data-dialog-description>Dialog description</p>
        <button data-dialog-close>Close</button>
      </div>
    </div>
  `;
  return container;
}

export function createCheckboxHTML(): HTMLElement {
  const container = createElement('div', { id: 'checkbox' });
  container.innerHTML = `
    <button data-checkbox-trigger>
      <span data-checkbox-indicator>✓</span>
    </button>
    <input type="checkbox" hidden />
  `;
  return container;
}

export function createRadioGroupHTML(): HTMLElement {
  const container = createElement('div', { id: 'radio-group' });
  container.innerHTML = `
    <div data-radio-group-item data-value="one">
      <button data-radio>Option One</button>
      <span data-radio-indicator></span>
    </div>
    <div data-radio-group-item data-value="two">
      <button data-radio>Option Two</button>
      <span data-radio-indicator></span>
    </div>
    <div data-radio-group-item data-value="three">
      <button data-radio>Option Three</button>
      <span data-radio-indicator></span>
    </div>
  `;
  return container;
}

export function createDropdownMenuHTML(): HTMLElement {
  const container = createElement('div', { id: 'dropdown-menu' });
  container.innerHTML = `
    <button data-dropdown-trigger>Open Menu</button>
    <div data-dropdown-content hidden>
      <div data-dropdown-item data-value="edit">Edit</div>
      <div data-dropdown-item data-value="duplicate">Duplicate</div>
      <div data-dropdown-item data-value="delete">Delete</div>
    </div>
  `;
  return container;
}

export function fireEvent(element: HTMLElement, eventType: string, options: any = {}): void {
  const event = new Event(eventType, { bubbles: true, cancelable: true, ...options });
  element.dispatchEvent(event);
}

export function fireKeyboardEvent(element: HTMLElement, key: string, options: any = {}): void {
  const event = new KeyboardEvent('keydown', { 
    key, 
    bubbles: true, 
    cancelable: true, 
    ...options 
  });
  element.dispatchEvent(event);
}

export function fireClickEvent(element: HTMLElement, options: any = {}): void {
  const event = new MouseEvent('click', { 
    bubbles: true, 
    cancelable: true, 
    ...options 
  });
  element.dispatchEvent(event);
}

export function waitFor(condition: () => boolean, timeout = 1000): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const check = () => {
      if (condition()) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Timeout waiting for condition'));
      } else {
        setTimeout(check, 10);
      }
    };
    
    check();
  });
}

export function expectElementToHaveAttribute(element: HTMLElement, attribute: string, value?: string): void {
  if (value !== undefined) {
    expect(element.getAttribute(attribute)).toBe(value);
  } else {
    expect(element.hasAttribute(attribute)).toBe(true);
  }
}

export function expectElementToNotHaveAttribute(element: HTMLElement, attribute: string): void {
  expect(element.hasAttribute(attribute)).toBe(false);
}

export function expectElementToHaveDataAttribute(element: HTMLElement, attribute: string, value?: string): void {
  const dataAttribute = `data-${attribute}`;
  if (value !== undefined) {
    expect(element.getAttribute(dataAttribute)).toBe(value);
  } else {
    expect(element.hasAttribute(dataAttribute)).toBe(true);
  }
}
