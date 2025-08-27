// Simple DOM check
const canUseDOM = typeof window !== 'undefined' && typeof document !== 'undefined';

export interface ComponentOptions {
  [key: string]: any;
}

export interface ComponentEvents {
  [eventName: string]: CustomEvent;
}

export abstract class Component {
  protected element: HTMLElement;
  protected options: ComponentOptions;
  protected eventTarget: EventTarget;
  protected listeners: Map<string, Set<EventListener>>;
  protected destroyed: boolean = false;

  constructor(element: HTMLElement, options: ComponentOptions = {}) {
    if (!canUseDOM) {
      throw new Error('Component can only be instantiated in a DOM environment');
    }

    this.element = element;
    this.options = options;
    this.eventTarget = new EventTarget();
    this.listeners = new Map();

    this.init();
  }

  protected abstract init(): void;

  protected addEventListener(
    element: EventTarget,
    event: string,
    listener: EventListener,
    options?: AddEventListenerOptions
  ): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
    element.addEventListener(event, listener, options);
  }

  protected removeEventListener(
    element: EventTarget,
    event: string,
    listener: EventListener,
    options?: EventListenerOptions
  ): void {
    element.removeEventListener(event, listener, options);
    this.listeners.get(event)?.delete(listener);
  }

  protected dispatchEvent(event: CustomEvent): void {
    this.eventTarget.dispatchEvent(event);
  }

  protected addCustomEventListener(
    event: string,
    listener: EventListener
  ): () => void {
    this.addEventListener(this.eventTarget, event, listener);
    return () => {
      this.removeEventListener(this.eventTarget, event, listener);
    };
  }

  protected setAttribute(element: HTMLElement, name: string, value: string | null): void {
    if (value === null) {
      element.removeAttribute(name);
    } else {
      element.setAttribute(name, value);
    }
  }

  protected getAttribute(element: HTMLElement, name: string): string | null {
    return element.getAttribute(name);
  }

  protected hasAttribute(element: HTMLElement, name: string): boolean {
    return element.hasAttribute(name);
  }

  protected addClass(element: HTMLElement, className: string): void {
    element.classList.add(className);
  }

  protected removeClass(element: HTMLElement, className: string): void {
    element.classList.remove(className);
  }

  protected hasClass(element: HTMLElement, className: string): boolean {
    return element.classList.contains(className);
  }

  protected toggleClass(element: HTMLElement, className: string, force?: boolean): void {
    element.classList.toggle(className, force);
  }

  protected setDataAttribute(element: HTMLElement, name: string, value: string | null): void {
    if (value === null) {
      element.removeAttribute(`data-${name}`);
    } else {
      element.setAttribute(`data-${name}`, value);
    }
  }

  protected getDataAttribute(element: HTMLElement, name: string): string | null {
    return element.getAttribute(`data-${name}`);
  }

  protected querySelector<T extends HTMLElement = HTMLElement>(selector: string): T | null {
    return this.element.querySelector<T>(selector);
  }

  protected querySelectorAll<T extends HTMLElement = HTMLElement>(selector: string): NodeListOf<T> {
    return this.element.querySelectorAll<T>(selector);
  }

  protected findElement<T extends HTMLElement = HTMLElement>(selector: string): T {
    const element = this.querySelector<T>(selector);
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }
    return element;
  }

  protected createElement<T extends HTMLElement = HTMLElement>(
    tagName: string,
    attributes: Record<string, string> = {},
    children: (string | HTMLElement)[] = []
  ): T {
    const element = document.createElement(tagName) as T;
    
    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
      if (key.startsWith('data-')) {
        this.setDataAttribute(element, key.slice(5), value);
      } else if (key === 'className') {
        element.className = value;
      } else {
        element.setAttribute(key, value);
      }
    });

    // Add children
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    });

    return element;
  }

  protected composeEventHandlers(
    originalHandler?: EventListener,
    ourHandler?: EventListener
  ): EventListener | undefined {
    if (!originalHandler && !ourHandler) return undefined;
    
    return (event: Event) => {
      originalHandler?.(event);
      
      if (!event.defaultPrevented) {
        ourHandler?.(event);
      }
    };
  }

  public destroy(): void {
    if (this.destroyed) return;
    
    this.destroyed = true;
    
    // Remove all event listeners
    this.listeners.forEach((listeners, event) => {
      listeners.forEach(listener => {
        this.eventTarget.removeEventListener(event, listener);
      });
    });
    this.listeners.clear();
    
    // Call cleanup method if it exists
    if (typeof this.cleanup === 'function') {
      this.cleanup();
    }
  }

  protected cleanup?(): void;

  public isDestroyed(): boolean {
    return this.destroyed;
  }
}
