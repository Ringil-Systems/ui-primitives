export interface TooltipOptions {
  open?: boolean;
  defaultOpen?: boolean;
  delayDuration?: number;
  disableHoverableContent?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface TooltipElements {
  root: HTMLElement;
  trigger: HTMLElement;
  content: HTMLElement;
}

export interface TooltipEvents {
  openChange: CustomEvent<{ open: boolean }>;
}
