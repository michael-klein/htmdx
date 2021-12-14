import { applyTransforms } from './bound_html';
import htm from 'htm';
import { JSXFactory } from './types';

export const html = htm.bind(function(type, props, ...children) {
  return applyTransforms(type, props, children);
} as JSXFactory);
