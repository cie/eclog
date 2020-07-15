import Debugger from 'debug'
import $, { fail, when, set, reset, oneOf } from '.'

describe('eclog', () => {
  test('can call each', () => {
    Debugger.enable('eclog')
    const tens = $(10, () => 20)
    const ones = $(() => $(1, 2)())

    const c = $(() => tens() + ones())
    expect([...c]).toEqual([11, 12, 21, 22])
    expect(c()).toEqual(11)
    expect(c()).toEqual(11)
  })

  test('dcg', () => {
    // https://www-users.cs.umn.edu/~gini/prolog/dcg.html
    const noun = $('cat', 'mouse')
    const verb = $('scares', 'hates')
    const determiner = $('the', 'a')
    const verb_phrase = $(() => `${verb()} ${noun_phrase()}`)
    const noun_phrase = $(() => `${determiner()} ${noun()}`)
    const sentence = $(() => `${noun_phrase()} ${verb_phrase()}`)
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
    ])
  })

  test('dcg with grammatical agreement', () => {
    // https://www-users.cs.umn.edu/~gini/prolog/dcg.html
    const is = <T>(a: T, b: T): T => (a === b ? a : fail())
    const singular = Symbol(),
      plural = Symbol()
    type N = typeof singular | typeof plural
    const number = $<N, []>(singular, plural)
    const sentence = $((n: N = number()) => [
      ...noun_phrase(n),
      ...verb_phrase(n)
    ])
    const noun_phrase = $((n: N) => [...determiner(n), ...noun(n)])
    const noun = $((n: N) =>
      when(n, {
        [singular]: $(['cat'], ['man'], ['mouse']),
        [plural]: $(['cats'], ['men'], ['mice'])
      })
    )
    const determiner = $(
      n => (is(n, singular), ['a']),
      ['the'],
      n => (is(n, plural), [])
    )
    const verb_phrase = $((n: N) => [...verb(n), ...noun_phrase(number())])
    const verb = $((n: N) =>
      when(n, {
        [singular]: $(['scares'], ['hates']),
        [plural]: $(['scare'], ['hate'])
      })
    )
    expect(sentence.map(x => x.join(' ')).slice(0, 10)).toEqual([
      'a cat scares a cat',
      'a cat scares a man',
      'a cat scares a mouse',
      'a cat scares the cat',
      'a cat scares the man',
      'a cat scares the mouse',
      'a cat scares the cats',
      'a cat scares the men',
      'a cat scares the mice',
      'a cat scares cats'
    ])
  })

  test('dcg with grammatical agreement 2', () => {
    // https://www-users.cs.umn.edu/~gini/prolog/dcg.html
    enum Num {
      singular,
      plural
    }
    const { singular, plural } = Num
    const number = $(singular, plural)
    const sentence = $(() => [...noun_phrase(), ...verb_phrase()])
    const noun_phrase = $(() => [...determiner(), ...noun()])
    const noun = $(
      () => (number.is(singular), number(), oneOf(['cat'], ['man'], ['mouse'])),
      () => (number.is(plural), number(), oneOf(['cats'], ['men'], ['mice']))
    )
    const determiner = $(
      () => (number.is(singular), number(), ['a']),
      ['the'],
      () => (number.is(plural), number(), [])
    )
    const verb_phrase = $(() => [
      ...verb(),
      ...oneOf(() => (reset(number), noun_phrase()))
    ])
    const verb = $(
      () => (number.is(singular), number(), oneOf(['scares'], ['hates'])),
      () => (number.is(plural), number(), oneOf(['scare'], ['hate']))
    )
    expect(sentence.map(x => x.join(' ')).slice(0, 10)).toEqual([
      'a cat scares a cat',
      'a cat scares a man',
      'a cat scares a mouse',
      'a cat scares the cat',
      'a cat scares the man',
      'a cat scares the mouse',
      'a cat scares the cats',
      'a cat scares the men',
      'a cat scares the mice',
      'a cat scares cats'
    ])
  })

  test('cards', () => {
    const suit = $(...'♠♦♣♥')
    const num = $(...'A23456789', '10', ...'JQK')
    const card = $(() => num() + suit())
    expect([...card].slice(0, 13).join(' ')).toEqual(
      'A♠ A♦ A♣ A♥ 2♠ 2♦ 2♣ 2♥ 3♠ 3♦ 3♣ 3♥ 4♠'
    )
  })

  test('conjugation', () => {
    const number = $('singular', 'plural')
    const person = $(1, 2, 3)
    const suffix = $((num: string, pers: number) =>
      when(num, {
        singular: when(pers, { 1: 'ῶ', 2: 'εῖς', 3: 'εῖ' }),
        plural: when(pers, { 1: 'οῦμεν', 2: 'εῖτε', 3: 'οῦσῐν' })
      })
    )
    const ποιῶ = $(
      (num: string = number(), pers: number = person()) =>
        `ποι${suffix(num, pers)}`
    )
    expect([...ποιῶ]).toEqual([
      'ποιῶ',
      'ποιεῖς',
      'ποιεῖ',
      'ποιοῦμεν',
      'ποιεῖτε',
      'ποιοῦσῐν'
    ])
    expect(ποιῶ('plural', 1)).toEqual('ποιοῦμεν')
  })

  test('sum of four numbers that make 10', () => {
    const num = $(1, 2, 3, 4, 5, 6, 7, 8, 9)
    const fourNums = $(() => {
      const a = num()
      if (a >= 10) fail()
      const b = num()
      if (a + b >= 10) fail()
      const c = num()
      if (a + b + c >= 10) fail()
      return [a, b, c, 10 - a - b - c]
    })
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
    ])
    expect(fourNums()).toEqual([1, 1, 1, 7])
    expect(fourNums()).toEqual([1, 1, 1, 7])
  })

  test('gcd', () => {
    const num = $(9, 8, 7, 6, 5, 4, 3, 2, 1)
    const divisor = (a: number, b: number) => (b % a == 0 ? a : fail())
    const divisorOf = $((n: number) => divisor(num(), n))
    const eq = (a: number, b: number) => (a == b ? a : fail())
    const gcd = $((a: number, b: number) => eq(divisorOf(a), divisorOf(b)))
    expect(gcd(9, 6)).toBe(3) // 3
    expect(gcd(8, 6)).toBe(2) // 2
  })
  test('mustBe', () => {
    const num = $(1, 2, 3, 4, 5)
    expect([...($(() => (num.mustBe(n => n < 4), num())) as any)]).toEqual([
      1,
      2,
      3
    ])
    expect([
      ...($(
        () => (num.mustBe(n => n < 4), num.mustBe(n => n > 1), num())
      ) as any)
    ]).toEqual([2, 3])
    expect([
      ...($(
        () => (num.mustBe(n => n < 4), num.mustBe(n => n > 5), num())
      ) as any)
    ]).toEqual([])
  })
})

function error (x: any) {
  throw x
}
