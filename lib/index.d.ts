declare type Eclog<T, A extends unknown[] = []> = {
    (...args: A): T;
    branches_stack: Branch<T, A>[][];
    [Symbol.iterator]: (args: A) => Generator<T, void, void>;
    map: <R>(fn: (el: T) => R) => R[];
};
declare type Branch<T, A extends unknown[]> = ((...args: A) => T) | T;
declare function $<T, A extends unknown[]>(...branches: (T | ((...args: A) => T))[]): Eclog<T, A>;
export default $;
export declare class Failed extends Error {
    constructor();
}
export declare const fail: Eclog<never>;
export declare function when<T extends string | number | symbol, R>(x: T, branches: {
    [K in T]: (() => R) | R;
}): R;
export declare const set: Eclog<any, any[]>;
export declare const reset: (eclog: Eclog<any, any>) => any;
//# sourceMappingURL=index.d.ts.map