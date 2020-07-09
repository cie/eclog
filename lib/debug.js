"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const d = debug_1.default('eclog');
const debug = function debug(formatter, ...args) {
    d(' '.repeat(indent) + formatter, ...args);
};
Object.defineProperty(debug, 'enabled', {
    get() {
        return d.enabled;
    }
});
let indent = 0;
debug.begin = (formatter, ...args) => {
    debug(formatter, ...args);
    ++indent;
};
debug.end = (formatter, ...args) => {
    --indent;
    if (formatter)
        debug(formatter, ...args);
};
exports.default = debug;
