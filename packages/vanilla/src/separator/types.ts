export type SeparatorOrientation = 'horizontal' | 'vertical';

export interface SeparatorOptions {
  orientation?: SeparatorOrientation;
  decorative?: boolean;
  className?: string;
  style?: CSSStyleDeclaration;
}
