export type AccordionType = 'single' | 'multiple';

export type AccordionOrientation = 'horizontal' | 'vertical';

export interface AccordionOptions {
  type?: AccordionType;
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  disabled?: boolean;
  orientation?: AccordionOrientation;
  collapsible?: boolean;
}

export interface AccordionItemOptions {
  value: string;
  disabled?: boolean;
  trigger?: string | HTMLElement;
  content?: string | HTMLElement;
}

export interface AccordionItem {
  value: string;
  element: HTMLElement;
  trigger: HTMLElement;
  content: HTMLElement;
  disabled: boolean;
  open: boolean;
}

export interface AccordionEvents {
  valueChange: CustomEvent<{ value: string | string[] }>;
  itemOpen: CustomEvent<{ value: string }>;
  itemClose: CustomEvent<{ value: string }>;
}
