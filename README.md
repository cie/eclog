# eclog

A beautiful backtracking & generator library.

```js
const suit = $(...'♠♦♣♥')
const num = $(...'A23456789', '10', ...'JQK')
const card = $(() => `${num()}${suit()}`) //  <-- magic happens here
console.log([...card].slice(0, 13).join(' '))
// A♠ A♦ A♣ A♥ 2♠ 2♦ 2♣ 2♥ 3♠ 3♦ 3♣ 3♥ 4♠
```

Use it to generate sentences

```js
const noun = $('cat', 'mouse')
const verb = $('scares', 'hates')
const determiner = $('the', 'a')
const verb_phrase = $(() => `${verb()} ${noun_phrase()}`)
const noun_phrase = $(() => `${determiner()} ${noun()}`)
const sentence = $(() => `${noun_phrase()} ${verb_phrase()}`)
console.log(...[...sentence].slice(0, 10))
/*
the cat scares the cat
the cat scares the mouse
the cat scares a cat
the cat scares a mouse
the cat hates the cat
the cat hates the mouse
the cat hates a cat
the cat hates a mouse
the mouse scares the cat
the mouse scares the mous
*/
```

Or to find solutions

```js
// Sum of 4 numbers is 10
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
console.log(...[...threeNums].map(nums => nums.join('+')).slice(0, 10)))
/*
1+1+1+7
1+1+2+6
1+1+3+5
1+1+4+4
1+1+5+3
1+1+6+2
1+1+7+1
1+2+1+6
1+2+2+5
1+2+3+4
*/
```

## Specification

The default export `$` function creates an _eclog_. It accepts zero or more arguments, which are the _branches_. A branch is either a function (a _builder function_) or a raw value.

```js
$(4) // same as:
$(() => 4)
```

The eclog is iterable. It iterates the _solutions_ of each of its branches.
If the branch is a raw value, it's the only solution.

```js
const x = $(5, 6)
console.log([...x]) // [5, 6]
```

If the branch is a builder function, it will be called at least once. If it calls no eclogs, its return value is its only solution.

The builder function is allowed to call eclogs as functions. In this case, the builder function might be called multiple times by the system. At each new call, the called eclogs will return a new set of values so that each combination

The builder function must be a pure function in the sense that it must return the same value if the called eclogs return the same set of values (return values of eclogs are considered the inputs of the builder function). However, it is allowed to call different eclogs depending on the values of previous eclogs.

If a called eclog has no solutions, it throws a special `Failed` exception, and the current run of the builder function stops.

The `fail` export is an eclog with no solutions.

Eclogs can be also called outside of a builder function: in this case they always return their first solution.

Calling an eclog with parameters results in those parameters being passed to its builder functions.

## Future plans

Store variables during the backtracking, e.g. for max depth or heuristics.

```js
const depth = $(0)
const find = $(() => depth(depth() + 1))
```

Use a queue for breadth-first search.

```js
const queue = $(1)
const find = $(() => {
  const c = queue()
  queue.add(2, 3)
})
```

Helper functions

```js
range(1, 4)
```

## License

MIT
