export type RadioGroupOrientation = 'horizontal' | 'vertical';

export interface RadioGroupOptions {
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string) => void;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  orientation?: RadioGroupOrientation;
  loop?: boolean;
}

export interface RadioGroupItem {
  value: string;
  element: HTMLElement;
  radio: HTMLElement;
  indicator: HTMLElement;
  disabled: boolean;
  checked: boolean;
}

export interface RadioGroupEvents {
  valueChange: CustomEvent<{ value: string }>;
}
