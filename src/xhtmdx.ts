import { markedToReact, stringToReact } from './transforms';
import { xhtml } from './xhtml';
import { HtmdxOptions, JSXFactory } from './types';
export { Components, HtmdxOptions, JSXFactory } from './types';

export function xhtmdx<
  H extends JSXFactory,
  O extends HtmdxOptions = HtmdxOptions
>(m: string, h: H, options: O = {} as O): ReturnType<H> {
  return stringToReact(m, h, options, (m, h, options) =>
    markedToReact(m, h, options, xhtml)
  );
}
