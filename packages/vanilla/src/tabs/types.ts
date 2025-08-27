export type TabsOrientation = 'horizontal' | 'vertical';
export type TabsActivationMode = 'automatic' | 'manual';

export interface TabsOptions {
  value?: string;
  defaultValue?: string;
  orientation?: TabsOrientation;
  activationMode?: TabsActivationMode;
  onValueChange?: (value: string) => void;
}

export interface TabsTrigger {
  value: string;
  element: HTMLElement;
  content: HTMLElement;
  disabled: boolean;
  selected: boolean;
}

export interface TabsElements {
  root: HTMLElement;
  list: HTMLElement;
  triggers: HTMLElement[];
  contents: HTMLElement[];
}

export interface TabsEvents {
  valueChange: CustomEvent<{ value: string }>;
}
