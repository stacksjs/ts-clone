<p align="center"><img src=".github/art/cover.jpg" alt="Social Card of this repo"></p>

[![npm version](https://img.shields.io/npm/v/ts-clone.svg)](https://www.npmjs.com/package/ts-clone)
[![License](https://img.shields.io/npm/l/ts-clone.svg)](https://github.com/stacksjs/ts-clone/blob/main/LICENSE)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/ts-clone)](https://bundlephobia.com/package/ts-clone)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8%2B-blue)](https://www.typescriptlang.org/)

# ts-clone

A high-performance, type-safe deep cloning utility for TypeScript and JavaScript applications.

## Features

- 🚀 **High Performance** _Optimized for speed and minimal memory footprint_
- 🔄 **Circular References** _Handles circular references in objects by default_
- 📊 **Comprehensive Support** _Clones objects, arrays, dates, RegExp, Maps, Sets, and more_
- 🛡️ **Type Safety** _Full TypeScript support with accurate type preservation_
- 🔧 **Configurable** _Control clone depth and prototype handling_
- 💎 **ES6+ Support** _Works with modern JavaScript features like Map, Set, Symbol, and Promise_

## Installation

```bash
# Using npm
npm install ts-clone

# Using yarn
yarn add ts-clone

# Using pnpm
pnpm add ts-clone

# Using bun
bun add ts-clone
```

## Quick Start

```typescript
import { clone } from 'ts-clone'

// Simple cloning
const original = { name: 'John', roles: ['admin', 'user'] }
const cloned = clone(original)

// Handles circular references
const circular = { prop: 'value' }
circular.self = circular
const clonedCircular = clone(circular) // Works without infinite loops

// Clone with specified depth
const nested = { level1: { level2: { level3: 'deep' } } }
const shallow = clone(nested, true, 1) // Only clones the first level

// Clone with options object
const obj = { hidden: 'property' }
Object.defineProperty(obj, 'hidden', { enumerable: false })
const withNonEnumerable = clone(obj, {
  includeNonEnumerable: true
})
```

## Advanced Usage

```typescript
// Clone RegExp objects with their flags and lastIndex
const regex = /pattern/gi
regex.lastIndex = 5
const clonedRegex = clone(regex)
console.log(clonedRegex.source) // 'pattern'
console.log(clonedRegex.flags) // 'gi'
console.log(clonedRegex.lastIndex) // 5

// Clone ES6+ objects
const map = new Map([['key', 'value']])
const set = new Set(['item1', 'item2'])
const promise = Promise.resolve('data')

const clonedMap = clone(map)
const clonedSet = clone(set)
const clonedPromise = clone(promise)

// Clone with prototype handling
const proto = { shared: 'value' }
const instance = Object.create(proto)
instance.own = 'property'

// Clone with original prototype
const clonedWithProto = clone(instance)
console.log(clonedWithProto.shared) // 'value'

// Clone with custom prototype
const clonedCustomProto = clone(instance, true, Infinity, {})
console.log(clonedCustomProto.shared) // undefined
```

## Utility Functions

```typescript
// Clone just the prototype
const proto = { method() { return 'result' } }
const protoClone = clone.clonePrototype(proto)

// Type checking utilities
clone.__isArray([1, 2, 3]) // true
clone.__isDate(new Date()) // true
clone.__isRegExp(/pattern/) // true

// RegExp flags extraction
clone.__getRegExpFlags(/pattern/gi) // 'gim'
```

## Use Cases

- **Deep Copying Objects**: Create true copies without reference sharing
- **API Response Processing**: Safely modify cloned API responses without side effects
- **State Management**: Immutable state updates in frameworks like React/Redux
- **Object Serialization**: Pre-process objects before serialization
- **Defensive Programming**: Protect internal data structures from external modifications

## Contributing

Please see the [Contributing Guide](https://github.com/stacksjs/contributing) for details.

## Community

For help, discussion about best practices, or any other conversation that would benefit from being searchable:

[Discussions on GitHub](https://github.com/stacksjs/stacks/discussions)

For casual chit-chat with others using this package:

[Join the Stacks Discord Server](https://discord.gg/stacksjs)

## Postcardware

“Software that is free, but hopes for a postcard.” We love receiving postcards from around the world showing where Stacks is being used! We showcase them on our website too.

Our address: Stacks.js, 12665 Village Ln #2306, Playa Vista, CA 90094, United States 🌎

## Sponsors

We would like to extend our thanks to the following sponsors for funding Stacks development. If you are interested in becoming a sponsor, please reach out to us.

- [JetBrains](https://www.jetbrains.com/)
- [The Solana Foundation](https://solana.com/)

## Credits

- [Original `clone` module](https://github.com/pvorb/clone) _for the initial implementation inspiration_
- [Chris Breuer](https://github.com/chrisbbreuer)
- [All Contributors](https://github.com/stacksjs/ts-clone/contributors)

## License

The MIT License (MIT). Please see [LICENSE](LICENSE.md) for more information.

Made with 💙
