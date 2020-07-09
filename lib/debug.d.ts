interface Debugger {
    (formatter: string, ...args: any[]): void;
    enabled: boolean;
    begin(formatter: string, ...args: any[]): void;
    end(formatter?: string, ...args: any[]): void;
}
declare const debug: Debugger;
export default debug;
//# sourceMappingURL=debug.d.ts.map