export interface DialogOptions {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onPointerDownOutside?: (event: PointerEvent) => void;
  onInteractOutside?: (event: Event) => void;
}

export interface DialogElements {
  trigger?: HTMLElement;
  overlay?: HTMLElement;
  content?: HTMLElement;
  closeButton?: HTMLElement;
  title?: HTMLElement;
  description?: HTMLElement;
}

export interface DialogEvents {
  openChange: CustomEvent<{ open: boolean }>;
  open: CustomEvent<{}>;
  close: CustomEvent<{}>;
}
