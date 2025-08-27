export type CheckedState = boolean | 'indeterminate';

export interface CheckboxOptions {
  checked?: CheckedState;
  defaultChecked?: CheckedState;
  required?: boolean;
  onCheckedChange?: (checked: CheckedState) => void;
  name?: string;
  form?: string;
  disabled?: boolean;
  value?: string | number | readonly string[];
}

export interface CheckboxElements {
  trigger?: HTMLElement;
  indicator?: HTMLElement;
  bubbleInput?: HTMLInputElement;
}

export interface CheckboxEvents {
  checkedChange: CustomEvent<{ checked: CheckedState }>;
}
