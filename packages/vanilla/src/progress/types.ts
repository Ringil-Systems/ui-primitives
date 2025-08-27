export type ProgressState = 'indeterminate' | 'complete' | 'loading';

export interface ProgressOptions {
  value?: number | null;
  max?: number;
  getValueLabel?: (value: number, max: number) => string;
}

export interface ProgressElements {
  root: HTMLElement;
  indicator: HTMLElement;
}

export interface ProgressEvents {
  valueChange: CustomEvent<{ value: number | null; max: number }>;
}
