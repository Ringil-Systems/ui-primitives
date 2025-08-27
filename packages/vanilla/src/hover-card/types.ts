export interface HoverCardOptions {
  open?: boolean;
  defaultOpen?: boolean;
  openDelay?: number;
  closeDelay?: number;
  onOpenChange?: (open: boolean) => void;
}

export interface HoverCardElements {
  root: HTMLElement;
  trigger: HTMLElement;
  content: HTMLElement;
}

export interface HoverCardEvents {
  openChange: CustomEvent<{ open: boolean }>;
}
