import { JSXFactory } from './types';
export type HTMLTag = {
  bind<HResult>(
    h: (type: any, props: Record<string, any>, ...children: any[]) => HResult
  ): (strings: TemplateStringsArray, ...values: any[]) => HResult | HResult[];
};
interface HTMLContext {
  currentFactory: JSXFactory;
  jsxTransforms: ((
    type: string,
    props: any,
    children: any[]
  ) => [string, any, any])[];
}

let currentHTMLContext: HTMLContext = {
  currentFactory: (type: string, props: any, ...children: any[]) => ({
    type,
    props,
    children,
  }),
  jsxTransforms: [],
};

export function setHTMLContext(context: HTMLContext): void {
  currentHTMLContext = context;
}

export function applyTransforms(
  type: string,
  props: any,
  children: any[]
): any {
  let args = [type, props, children];
  for (const transform of currentHTMLContext.jsxTransforms) {
    args = transform(args[0], args[1], args[2]);
  }
  return currentHTMLContext.currentFactory(args[0], args[1], ...args[2]);
}
