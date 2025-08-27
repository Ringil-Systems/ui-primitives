export interface ContextMenuOptions {
  open?: boolean;
  defaultOpen?: boolean;
  modal?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface ContextMenuItem {
  value: string;
  element: HTMLElement;
  text: string;
  disabled: boolean;
  selected: boolean;
}

export interface ContextMenuElements {
  root: HTMLElement;
  trigger: HTMLElement;
  content: HTMLElement;
  items: HTMLElement[];
}

export interface ContextMenuEvents {
  openChange: CustomEvent<{ open: boolean }>;
  select: CustomEvent<{ value: string }>;
}
