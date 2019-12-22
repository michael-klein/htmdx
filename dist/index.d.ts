export interface Components<Component extends any> {
    [key: string]: Component;
}
export interface HtmdxOptions<Component extends any = any, C extends Components<Component> = Components<Component>> {
    components?: C;
}
export declare function htmdx<H extends (type: string, props: any, ...children: any[]) => any = (type: string, props: any, ...children: any[]) => any, O extends HtmdxOptions = HtmdxOptions>(m: string, h: H, options?: O): ReturnType<H>;
