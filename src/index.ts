import htm from 'htm';
import decode from 'html-entities-decode';
import marked from 'marked';

export interface Components<Component extends any> {
  [key: string]: Component;
}

function markedToReact<
  Component extends any = any,
  C extends Components<Component> = Components<Component>
>(
  m: string,
  components: Components<C>,
  h: jsxFactory,
  thisValue: any = {}
): any {
  m = decode(m);
  currentFactory = h;
  currentComponents = components;
  return new Function(
    'html',
    'return html`'+m+'`'
  ).call(thisValue, html);
}
export type Marked = typeof marked;
export interface HtmdxOptions<
  Component extends any = any,
  C extends Components<Component> = Components<Component>,
  ThisValue extends {} = any
> {
  components?: C;
  transformJSXToHTM?: boolean;
  configureMarked?: (marked: Marked) => void;
  thisValue?: ThisValue;
}

const html = htm.bind(<jsxFactory>function(type, props, ...children) {
  // remap class prop to className
  if (props != null && 'class' in props) {
    props.className = props.class;
    delete props.class;
  }
  // remap uppercase-leading tags to defined components
  if (typeof type === 'string' && isJsxTag(type)) {
    type = currentComponents[type];
  }
  return currentFactory(type, props, ...children);
});

function transFormJSXToHTM(m: string): string {
  // transform JSX expressions to HTM expressions, but not in fenced blocks.
  return m.replace(/(```+)[\s\S]*?\2|={/g, (str, fence) => fence ? str : '=${');
}

function isJsxTag(type: string): boolean {
  return /^[A-Z_$]|\./.test(type);
}

type jsxFactory = (type: string, props: any, ...children: any[]) => any;

let currentFactory: jsxFactory;
let currentComponents: Components<any>;

export function htmdx<
  H extends jsxFactory,
  O extends HtmdxOptions = HtmdxOptions
>(m: string, h: H, options: O = {} as O): ReturnType<H> {
  const {
    components = {},
    transformJSXToHTM = true,
    configureMarked,
  } = options;
  if (configureMarked) {
    configureMarked(marked);
  }
  return markedToReact(
    marked(transformJSXToHTM ? transFormJSXToHTM(m) : m),
    components,
    h,
    options.thisValue || {}
  );
}
