export interface SelectOptions {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  autoComplete?: string;
  form?: string;
}

export interface SelectItem {
  value: string;
  element: HTMLElement;
  text: string;
  disabled: boolean;
  selected: boolean;
}

export interface SelectElements {
  trigger: HTMLElement;
  value: HTMLElement;
  icon: HTMLElement;
  content: HTMLElement;
  viewport: HTMLElement;
  items: HTMLElement[];
}

export interface SelectEvents {
  valueChange: CustomEvent<{ value: string }>;
  openChange: CustomEvent<{ open: boolean }>;
  select: CustomEvent<{ value: string }>;
}
