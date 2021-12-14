import { applyTransforms } from './bound_html';
import htm from 'xhtm';
import { JSXFactory } from './types';

export const xhtml = htm.bind(function(type, props, ...children) {
  return applyTransforms(type, props, children);
} as JSXFactory);
