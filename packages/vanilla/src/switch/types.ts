export interface SwitchOptions {
  checked?: boolean;
  defaultChecked?: boolean;
  required?: boolean;
  disabled?: boolean;
  value?: string;
  name?: string;
  form?: string;
  onCheckedChange?: (checked: boolean) => void;
}

export interface SwitchElements {
  root: HTMLElement;
  thumb: HTMLElement;
  bubbleInput: HTMLInputElement;
}

export interface SwitchEvents {
  checkedChange: CustomEvent<{ checked: boolean }>;
}
