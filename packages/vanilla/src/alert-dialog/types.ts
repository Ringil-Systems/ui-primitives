export interface AlertDialogOptions {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface AlertDialogElements {
  root: HTMLElement;
  trigger: HTMLElement;
  overlay: HTMLElement;
  content: HTMLElement;
  title: HTMLElement;
  description: HTMLElement;
  action: HTMLElement;
  cancel: HTMLElement;
}

export interface AlertDialogEvents {
  openChange: CustomEvent<{ open: boolean }>;
  action: CustomEvent<{}>;
  cancel: CustomEvent<{}>;
}
