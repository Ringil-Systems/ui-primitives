export interface PopoverOptions {
  open?: boolean;
  defaultOpen?: boolean;
  modal?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface PopoverElements {
  root: HTMLElement;
  trigger: HTMLElement;
  content: HTMLElement;
}

export interface PopoverEvents {
  openChange: CustomEvent<{ open: boolean }>;
}
