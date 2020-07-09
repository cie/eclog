"use strict";
//import debug from './debug'
Object.defineProperty(exports, "__esModule", { value: true });
exports.set = exports.when = exports.fail = exports.Failed = void 0;
let current_stack;
let current_stack_pointer;
function $(...branches) {
    const eclog = function (...myArgs) {
        const stack = current_stack !== null && current_stack !== void 0 ? current_stack : ((current_stack_pointer = 0), []);
        if (current_stack_pointer >= stack.length) {
            const it = eclog[Symbol.iterator](myArgs);
            const current = it.next();
            if (current.done)
                throw new Failed();
            stack.push({ eclog, it, current });
            ++current_stack_pointer;
            return current.value;
        }
        else {
            const value = stack[current_stack_pointer].current.value;
            ++current_stack_pointer;
            return value;
        }
    };
    eclog.branches_stack = [branches];
    eclog[Symbol.iterator] = function* (myArgs = []) {
        const branches = eclog.branches_stack[0];
        for (const branch of branches.map(evalBranch)) {
            let stack = [];
            do {
                const last_stack = current_stack;
                const last_stack_pointer = current_stack_pointer;
                current_stack = stack;
                current_stack_pointer = 0;
                let res;
                try {
                    res = branch(...myArgs);
                }
                catch (e) {
                    if (e instanceof Failed)
                        continue;
                    throw e;
                }
                finally {
                    current_stack = last_stack;
                    current_stack_pointer = last_stack_pointer;
                }
                yield res;
            } while (advance(stack));
        }
    };
    return eclog;
}
exports.default = $;
function advance(stack) {
    for (let i = stack.length - 1; i >= 0; --i) {
        stack[i].current = stack[i].it.next();
        if (!stack[i].current.done)
            return true;
        stack.splice(i);
    }
    return false;
}
class Failed extends Error {
    constructor() {
        super('Failed');
    }
}
exports.Failed = Failed;
function evalBranch(branch) {
    return branch instanceof Function ? branch : () => branch;
}
exports.fail = $();
function when(x, branches) {
    if (x in branches)
        return branches[x];
    return exports.fail();
}
exports.when = when;
exports.set = $((eclog, ...branches) => {
    eclog.branches_stack.unshift(branches);
}, (eclog, ...branches) => {
    eclog.branches_stack.shift();
    exports.fail();
});
//# sourceMappingURL=index.js.map