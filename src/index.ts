import decode from 'html-entities-decode';
import marked from 'marked';
import { HtmdxOptions, JSXFactory } from './types';
import { setHTMLContext, html } from './bound_html';
import {
  classNameTransform,
  getComponentTransform,
  performTransFormJSXToHTM,
} from './default_transforms';
export { HtmdxOptions, JSXFactory, Components, Marked } from './types';

function markedToReact(m: string, h: JSXFactory, options: HtmdxOptions): any {
  const {
    components = {},
    thisValue = {},
    transformClassToClassname = true,
    jsxTransforms = [],
  } = options;
  m = decodeHTML(m);
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

  // eslint-disable-next-line
  return new Function(
    'html',
    'return html`' + m.replace(/`/g, "\\\`") + '`'
  ).call(thisValue, html);
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

export function htmdx<
  H extends JSXFactory,
  O extends HtmdxOptions = HtmdxOptions
>(m: string, h: H, options: O = {} as O): ReturnType<H> {
  const {
    transformJSXToHTM = true,
    configureMarked,
    mdxTransforms = [],
  } = options;
  if (configureMarked) {
    configureMarked(marked);
  }

  if (transformJSXToHTM) {
    mdxTransforms.push(performTransFormJSXToHTM);
  }

  mdxTransforms.forEach(t => {
    m = t(m);
  });

  return markedToReact(marked(m), h, options);
}
