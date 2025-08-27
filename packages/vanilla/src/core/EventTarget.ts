export class EventTarget {
  private listeners: Map<string, Set<EventListener>> = new Map();

  addEventListener(type: string, listener: EventListener, options?: AddEventListenerOptions): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);
  }

  removeEventListener(type: string, listener: EventListener, options?: EventListenerOptions): void {
    this.listeners.get(type)?.delete(listener);
  }

  dispatchEvent(event: CustomEvent): boolean {
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener.call(this, event);
        } catch (error) {
          console.error(`Error in event listener for ${event.type}:`, error);
        }
      });
    }
    return !event.defaultPrevented;
  }

  // Helper method to create and dispatch custom events
  emit(type: string, detail?: any): void {
    const event = new CustomEvent(type, { detail });
    this.dispatchEvent(event);
  }

  // Helper method to add one-time event listeners
  once(type: string, listener: EventListener): void {
    const wrappedListener = (event: Event) => {
      listener(event);
      this.removeEventListener(type, wrappedListener);
    };
    this.addEventListener(type, wrappedListener);
  }

  // Helper method to remove all listeners for a specific event type
  removeAllListeners(type?: string): void {
    if (type) {
      this.listeners.delete(type);
    } else {
      this.listeners.clear();
    }
  }

  // Helper method to get listener count for an event type
  listenerCount(type: string): number {
    return this.listeners.get(type)?.size || 0;
  }
}
