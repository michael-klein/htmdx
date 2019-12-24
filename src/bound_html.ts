import htm from 'htm';
import { Components, JSXFactory } from './types';

interface HTMLContext {
  currentComponents: Components<any>;
  currentFactory: JSXFactory;
}
let currentHTMLContext: HTMLContext = {
  currentComponents: {},
  currentFactory: (type: string, props: any, ...children: any[]) => ({
    type,
    props,
    children,
  }),
};

export function setHTMLContext(context: HTMLContext): void {
  currentHTMLContext = context;
}

function isJsxTag(type: string): boolean {
  return /^[A-Z_$]|\./.test(type);
}

function basicTransforms(type: string, props: any, children: any[]): any {
  if (typeof type === 'string' && isJsxTag(type)) {
    // remap uppercase-leading tags to defined components
    type = currentHTMLContext.currentComponents[type];
  }
  return currentHTMLContext.currentFactory(type, props, ...children);
}

export const basicHtml = htm.bind(<JSXFactory>(
  function(type, props, ...children) {
    return basicTransforms(type, props, children);
  }
));

export const htmlWithClassTransform = htm.bind(<JSXFactory>(
  function(type, props, ...children) {
    // remap class prop to className
    if (props != null && 'class' in props) {
      props.className = props.class;
      delete props.class;
    }
    return basicTransforms(type, props, children);
  }
));
