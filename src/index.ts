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
  m = decodeHTML(m);
  console.log(m);
  if (transformClassToClassname) {
    jsxTransforms.push((type: string, props: any, children: any[]) => {
      if (children && typeof children[0] === 'string') {
        children[0] = decode(children[0]);
      }
      return [type, props, children];
    });
    jsxTransforms.push(classNameTransform);
  }
  jsxTransforms.push(getComponentTransform(components));
  setHTMLContext({
    currentFactory: h,
    jsxTransforms,
  });

  return new Function('html', 'return html`' + m + '`').call(thisValue, html);
}

function decodeHTML(m: string): string {
  // decode html entities outside of fenced blocks
  m.split(/(<code>+)[\s\S]*?(<\/code>+)/).forEach(str => {
    if (str !== '```') {
      m = m.replace(str, decode(str));
    }
  });
  return m;
}

function performTransFormJSXToHTM(m: string): string {
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
    marked(transformJSXToHTM ? performTransFormJSXToHTM(m) : m),
    h,
    options
  );
}
