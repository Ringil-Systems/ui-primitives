import { Component } from '../core/Component';
import type { AvatarOptions, AvatarElements, ImageLoadingStatus } from './types';

export class Avatar extends Component {
  private elements: AvatarElements;
  private imageLoadingStatus: ImageLoadingStatus = 'idle';
  private imageElement: HTMLImageElement | null = null;
  private fallbackTimer: number | null = null;
  private delayMs: number;

  constructor(element: HTMLElement, options: AvatarOptions = {}) {
    super(element, options);

    this.delayMs = options.delayMs ?? 0;

    this.elements = {
      root: element,
      image: null,
      fallback: null,
    };
  }

  protected init(): void {
    this.findElements();
    this.setupAttributes();
    this.setupEventListeners();
    this.updateDisplay();
  }

  private findElements(): void {
    // Find or create image element
    this.elements.image = this.querySelector('img[data-avatar-image]') as HTMLImageElement || null;

    // Find or create fallback element
    this.elements.fallback = this.querySelector('[data-avatar-fallback]') || this.createElement('span', {
      'data-avatar-fallback': '',
      'role': 'img'
    }, ['AV']);

    // Add fallback to DOM if it doesn't exist
    if (!this.querySelector('[data-avatar-fallback]')) {
      this.element.appendChild(this.elements.fallback);
    }
  }

  private setupAttributes(): void {
    // Set up root element
    this.setAttribute(this.element, 'data-avatar', '');

    // Set up fallback
    if (this.elements.fallback) {
      this.setAttribute(this.elements.fallback, 'data-avatar-fallback', '');
      this.setAttribute(this.elements.fallback, 'role', 'img');
    }
  }

  private setupEventListeners(): void {
    // Set up image loading events if image exists
    if (this.elements.image) {
      this.setupImageLoading();
    }
  }

  private setupImageLoading(): void {
    if (!this.elements.image) return;

    const image = this.elements.image;
    
    // Set up image attributes
    this.setAttribute(image, 'data-avatar-image', '');
    this.setAttribute(image, 'alt', image.alt || 'Avatar image');

    // Handle image load
    this.addEventListener(image, 'load', () => {
      this.setImageLoadingStatus('loaded');
    });

    // Handle image error
    this.addEventListener(image, 'error', () => {
      this.setImageLoadingStatus('error');
    });

    // Check initial state
    if (image.src) {
      if (image.complete && image.naturalWidth > 0) {
        this.setImageLoadingStatus('loaded');
      } else {
        this.setImageLoadingStatus('loading');
      }
    } else {
      this.setImageLoadingStatus('idle');
    }
  }

  private setImageLoadingStatus(status: ImageLoadingStatus): void {
    this.imageLoadingStatus = status;
    this.updateDisplay();
    this.dispatchEvent(new CustomEvent('imageLoadingStatusChange', { detail: { status } }));
  }

  private updateDisplay(): void {
    const shouldShowFallback = this.imageLoadingStatus !== 'loaded';
    
    if (shouldShowFallback) {
      // Show fallback with delay if specified
      if (this.delayMs > 0) {
        if (this.fallbackTimer) {
          clearTimeout(this.fallbackTimer);
        }
        this.fallbackTimer = window.setTimeout(() => {
          this.showFallback();
        }, this.delayMs);
      } else {
        this.showFallback();
      }
    } else {
      this.hideFallback();
    }

    // Update ARIA attributes
    this.setDataAttribute(this.element, 'state', this.imageLoadingStatus);
  }

  private showFallback(): void {
    if (this.elements.fallback) {
      this.elements.fallback.removeAttribute('hidden');
      this.setDataAttribute(this.elements.fallback, 'state', 'visible');
    }
  }

  private hideFallback(): void {
    if (this.elements.fallback) {
      this.setAttribute(this.elements.fallback, 'hidden', '');
      this.setDataAttribute(this.elements.fallback, 'state', 'hidden');
    }
  }

  public setImage(src: string, alt?: string): void {
    if (this.elements.image) {
      this.elements.image.src = src;
      if (alt) {
        this.elements.image.alt = alt;
      }
      this.setImageLoadingStatus('loading');
    } else {
      // Create image element if it doesn't exist
      this.elements.image = this.createElement('img', {
        'data-avatar-image': '',
        'src': src,
        'alt': alt || 'Avatar image'
      }) as HTMLImageElement;
      
      this.element.insertBefore(this.elements.image, this.elements.fallback);
      this.setupImageLoading();
    }
  }

  public setFallback(content: string): void {
    if (this.elements.fallback) {
      this.elements.fallback.textContent = content;
    }
  }

  public getImageLoadingStatus(): ImageLoadingStatus {
    return this.imageLoadingStatus;
  }

  // Static factory method
  static create(selector: string | HTMLElement, options: AvatarOptions = {}): Avatar {
    const element = typeof selector === 'string' 
      ? document.querySelector(selector) as HTMLElement
      : selector;
    
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    return new Avatar(element, options);
  }

  protected cleanup(): void {
    if (this.fallbackTimer) {
      clearTimeout(this.fallbackTimer);
      this.fallbackTimer = null;
    }
    
    this.elements = null as any;
    this.imageElement = null;
  }
}
