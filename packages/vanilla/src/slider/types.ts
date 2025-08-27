export type SliderOrientation = 'horizontal' | 'vertical';

export interface SliderOptions {
  value?: number[];
  defaultValue?: number[];
  min?: number;
  max?: number;
  step?: number;
  orientation?: SliderOrientation;
  disabled?: boolean;
  name?: string;
  form?: string;
  inverted?: boolean;
  minStepsBetweenThumbs?: number;
  onValueChange?: (value: number[]) => void;
  onValueCommit?: (value: number[]) => void;
}

export interface SliderThumb {
  value: number;
  element: HTMLElement;
  index: number;
}

export interface SliderElements {
  root: HTMLElement;
  track: HTMLElement;
  range: HTMLElement;
  thumbs: HTMLElement[];
}

export interface SliderEvents {
  valueChange: CustomEvent<{ value: number[] }>;
  valueCommit: CustomEvent<{ value: number[] }>;
}
