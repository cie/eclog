"use strict";
//import debug from './debug'
Object.defineProperty(exports, "__esModule", { value: true });
exports.when = exports.fail = exports.Failed = void 0;
let current_stack;
let current_stack_pointer;
function $(...branches) {
    const eclog = function (...args) {
        const stack = current_stack !== null && current_stack !== void 0 ? current_stack : ((current_stack_pointer = 0), []);
        if (current_stack_pointer >= stack.length) {
            const it = eclog[Symbol.iterator](args);
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
    eclog[Symbol.iterator] = function* (args = []) {
        var _a;
        for (const branch of branches.map(evalBranch)) {
            let stack = [];
            do {
                const last_stack = current_stack;
                const last_stack_pointer = current_stack_pointer;
                current_stack = stack;
                current_stack_pointer = 0;
                let res;
                try {
                    res = branch(...args);
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
                args = (_a = (yield res)) !== null && _a !== void 0 ? _a : [];
            } while (advance(stack, args));
        }
    };
    return eclog;
}
exports.default = $;
function advance(stack, args) {
    for (let i = stack.length - 1; i >= 0; --i) {
        stack[i].current = stack[i].it.next(args);
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
    for (const [pattern, value] of branches) {
        if (x === pattern)
            return value;
    }
    return exports.fail();
}
exports.when = when;
