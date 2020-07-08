import Debugger from 'debug'
import $, { fail } from '.'

describe('eclog', () => {
  test('can call each', () => {
    Debugger.enable('eclog')
    const tens = $(10, 20)
    const ones = $(1, 2)

    const c = $(() => tens() + ones())
    expect([...c]).toEqual([11, 12, 21, 22])
  })

  test('dcg', () => {
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
    const SUFFIXES = [
      ['ῶ', 'εῖς', 'εῖ'],
      ['οῦμεν', 'εῖτε', 'οῦσῐν']
    ]
    const suffix = $(
      () => SUFFIXES[number() == 'singular' ? 0 : 1][person() - 1]
    )
    const ποιῶ = $(() => `ποι${suffix()}`)
    expect([...ποιῶ]).toEqual([
      'ποιῶ',
      'ποιεῖς',
      'ποιεῖ',
      'ποιοῦμεν',
      'ποιεῖτε',
      'ποιοῦσῐν'
    ])
  })

  test('sum of four numbers that make 10', () => {
    const num = $(1, 2, 3, 4, 5, 6, 7, 8, 9)
    const threeNums = $(() => {
      const a = num()
      if (a >= 10) fail()
      const b = num()
      if (a + b >= 10) fail()
      const c = num()
      if (a + b + c >= 10) fail()
      return [a, b, c, 10 - a - b - c]
    })
    expect([...threeNums].map(nums => nums.join('+')).slice(0, 10)).toEqual([
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
  })
})
