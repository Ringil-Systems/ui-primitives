export type ImageLoadingStatus = 'idle' | 'loading' | 'loaded' | 'error';

export interface AvatarOptions {
  delayMs?: number;
}

export interface AvatarElements {
  root: HTMLElement;
  image: HTMLImageElement | null;
  fallback: HTMLElement | null;
}

export interface AvatarEvents {
  imageLoadingStatusChange: CustomEvent<{ status: ImageLoadingStatus }>;
}
