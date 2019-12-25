import marked from 'marked';
export interface Components<Component extends any> {
  [key: string]: Component;
}
export type Marked = typeof marked;
export interface HtmdxOptions<
  Component extends any = any,
  C extends Components<Component> = Components<Component>,
  ThisValue extends {} = any
> {
  components?: C;
  transformJSXToHTM?: boolean;
  transformClassToClassname?: boolean;
  jsxTransforms?: JSXTransform[];
  configureMarked?: (marked: Marked) => void;
  thisValue?: ThisValue;
}
export type JSXFactory = (type: string, props: any, ...children: any[]) => any;
export type JSXTransform = (
  type: string,
  props: any,
  children: any[]
) => [string, any, any];
