"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const _1 = __importStar(require("."));
describe('eclog', () => {
    test('can call each', () => {
        debug_1.default.enable('eclog');
        const tens = _1.default(10, () => 20);
        const ones = _1.default(() => _1.default(1, 2)());
        const c = _1.default(() => tens() + ones());
        expect([...c]).toEqual([11, 12, 21, 22]);
        expect(c()).toEqual(11);
        expect(c()).toEqual(11);
    });
    test('dcg', () => {
        // https://www-users.cs.umn.edu/~gini/prolog/dcg.html
        const noun = _1.default('cat', 'mouse');
        const verb = _1.default('scares', 'hates');
        const determiner = _1.default('the', 'a');
        const verb_phrase = _1.default(() => `${verb()} ${noun_phrase()}`);
        const noun_phrase = _1.default(() => `${determiner()} ${noun()}`);
        const sentence = _1.default(() => `${noun_phrase()} ${verb_phrase()}`);
        expect([...sentence].slice(0, 10)).toEqual([
            'the cat scares the cat',
            'the cat scares the mouse',
            'the cat scares a cat',
            'the cat scares a mouse',
            'the cat hates the cat',
            'the cat hates the mouse',
            'the cat hates a cat',
            'the cat hates a mouse',
            'the mouse scares the cat',
            'the mouse scares the mouse'
        ]);
    });
    test('cards', () => {
        const suit = _1.default(...'♠♦♣♥');
        const num = _1.default(...'A23456789', '10', ...'JQK');
        const card = _1.default(() => num() + suit());
        expect([...card].slice(0, 13).join(' ')).toEqual('A♠ A♦ A♣ A♥ 2♠ 2♦ 2♣ 2♥ 3♠ 3♦ 3♣ 3♥ 4♠');
    });
    test('conjugation', () => {
        const number = _1.default('singular', 'plural');
        const person = _1.default(1, 2, 3);
        const suffix = _1.default((num, pers) => _1.when(num, {
            singular: _1.when(pers, { 1: 'ῶ', 2: 'εῖς', 3: 'εῖ' }),
            plural: _1.when(pers, { 1: 'οῦμεν', 2: 'εῖτε', 3: 'οῦσῐν' })
        }));
        const ποιῶ = _1.default((num = number(), pers = person()) => `ποι${suffix(num, pers)}`);
        expect([...ποιῶ]).toEqual([
            'ποιῶ',
            'ποιεῖς',
            'ποιεῖ',
            'ποιοῦμεν',
            'ποιεῖτε',
            'ποιοῦσῐν'
        ]);
        expect(ποιῶ('plural', 1)).toEqual('ποιοῦμεν');
    });
    test('sum of four numbers that make 10', () => {
        const num = _1.default(1, 2, 3, 4, 5, 6, 7, 8, 9);
        const fourNums = _1.default(() => {
            const a = num();
            if (a >= 10)
                _1.fail();
            const b = num();
            if (a + b >= 10)
                _1.fail();
            const c = num();
            if (a + b + c >= 10)
                _1.fail();
            return [a, b, c, 10 - a - b - c];
        });
        expect([...fourNums].map(nums => nums.join('+')).slice(0, 10)).toEqual([
            '1+1+1+7',
            '1+1+2+6',
            '1+1+3+5',
            '1+1+4+4',
            '1+1+5+3',
            '1+1+6+2',
            '1+1+7+1',
            '1+2+1+6',
            '1+2+2+5',
            '1+2+3+4'
        ]);
        expect(fourNums()).toEqual([1, 1, 1, 7]);
        expect(fourNums()).toEqual([1, 1, 1, 7]);
    });
    test('calling with arguments', () => {
        const num = _1.default(1, 2, 3, 4, 5, 6, 7, 8, 9);
        const divisorOf = _1.default((n) => {
            const d = num();
            if (n % d != 0)
                _1.fail();
            return d;
        });
        const divisorOf9 = _1.default(() => divisorOf(9));
        expect([...divisorOf9]).toEqual([1, 3, 9]);
    });
    test('gcd', () => {
        const num = _1.default(9, 8, 7, 6, 5, 4, 3, 2, 1);
        const divisor = (a, b) => (b % a == 0 ? a : _1.fail());
        const divisorOf = _1.default((n) => divisor(num(), n));
        const eq = (a, b) => (a == b ? a : _1.fail());
        const gcd = _1.default((a, b) => eq(divisorOf(a), divisorOf(b)));
        expect(gcd(9, 6)).toBe(3); // 3
        expect(gcd(8, 6)).toBe(2); // 2
    });
});
