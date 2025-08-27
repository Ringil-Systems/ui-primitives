export interface DropdownMenuOptions {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onPointerDownOutside?: (event: PointerEvent) => void;
  onInteractOutside?: (event: Event) => void;
}

export interface DropdownMenuElements {
  trigger?: HTMLElement;
  content?: HTMLElement;
  items?: HTMLElement[];
}

export interface DropdownMenuEvents {
  openChange: CustomEvent<{ open: boolean }>;
  open: CustomEvent<{}>;
  close: CustomEvent<{}>;
  select: CustomEvent<{ value: string }>;
}
