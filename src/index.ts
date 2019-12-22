import htm from 'htm';
import decode from 'html-entities-decode';
import marked from 'marked';

export interface Components<Component extends any> {
  [key: string]: Component;
}

function handleComponents(m: string): string {
  var regexAllTags = /<([A-Z][a-zA-Z1-6]+)([^<]+)*(?:>(.*)<\/\1>|\s+\/>)/g;

  var htmlTags = m.match(regexAllTags);
  var regexSingleTag = /<([A-Z][a-zA-Z1-6]+)([^<]+)*(?:>(.*)<\/\1>|\s+\/>)/;
  if (htmlTags)
    for (var i = 0; i < htmlTags.length && i < 5; i++) {
      var match = regexSingleTag.exec(htmlTags[i]);
      if (match) {
        const newText = match[0]
          .replace(`<${match[1]}`, '<${' + match[1] + '}')
          .replace(`</${match[1]}`, '</${' + match[1] + '}');
        m = m.replace(match[0], newText);
      }
    }
  return m;
}

function markedToReact<
  Component extends any = any,
  C extends Components<Component> = Components<Component>
>(m: string, components: Components<C>, html: () => any): any {
  m = decode(m);
  m = handleComponents(m);
  return new Function(
    ...['html', ...Object.keys(components), 'return html`' + m + '`']
  )(...[html, ...Object.values(components)]);
}
export type Marked = typeof marked;
export interface HtmdxOptions<
  Component extends any = any,
  C extends Components<Component> = Components<Component>
> {
  components?: C;
  transformJSXToHTM?: boolean;
  configureMarked?: (marked: Marked) => void;
}

function transFormJSXToHTM(m: string): string {
  m.split(/```(.|\n)*```/g).forEach(str => {
    m = m.replace(
      str,
      str.replace(/class=/g, 'className=').replace(/={/g, '=${')
    );
  });
  return m;
}

export function htmdx<
  H extends (type: string, props: any, ...children: any[]) => any = (
    type: string,
    props: any,
    ...children: any[]
  ) => any,
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
    htm.bind(h)
  );
}
