import decode from 'html-entities-decode';
import marked from 'marked';
import { HtmdxOptions, JSXFactory } from './types';
import { setHTMLContext, html } from './bound_html';
import {
  classNameTransform,
  getComponentTransform,
} from './default_transforms';

function markedToReact(m: string, h: JSXFactory, options: HtmdxOptions): any {
  const {
    components = {},
    thisValue = {},
    transformClassToClassname = true,
    jsxTransforms = [],
  } = options;
  m = decode(m);

  if (transformClassToClassname) {
    jsxTransforms.push(classNameTransform);
  }
  jsxTransforms.push(getComponentTransform(components));
  setHTMLContext({
    currentFactory: h,
    jsxTransforms,
  });

  return new Function('html', 'return html`' + m + '`').call(thisValue, html);
}

function transFormJSXToHTM(m: string): string {
  // transform JSX expressions to HTM expressions, but not in fenced blocks.
  return m.replace(/(```+)[\s\S]*?\2|={/g, (str, fence) =>
    fence ? str : '=${'
  );
}

export function htmdx<
  H extends JSXFactory,
  O extends HtmdxOptions = HtmdxOptions
>(m: string, h: H, options: O = {} as O): ReturnType<H> {
  const { transformJSXToHTM = true, configureMarked } = options;
  if (configureMarked) {
    configureMarked(marked);
  }
  return markedToReact(
    marked(transformJSXToHTM ? transFormJSXToHTM(m) : m),
    h,
    options
  );
}
