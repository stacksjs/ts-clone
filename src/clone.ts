import type { CloneFunction, CloneOptions } from './types'

function _instanceof(obj: any, type: any): boolean {
  return type != null && obj instanceof type
}

let nativeMap: any
try {
  nativeMap = Map
}
catch {
  // maybe a reference error because no `Map`. Give it a dummy value that no
  // value will ever be an instanceof.
  nativeMap = function () {}
}

let nativeSet: any
try {
  nativeSet = Set
}
catch {
  nativeSet = function () {}
}

let nativePromise: any
try {
  nativePromise = Promise
}
catch {
  nativePromise = function () {}
}

// Handle Buffer in a more TypeScript-friendly way
let useBuffer = false
let BufferType: any = null
// Check for Buffer in globalThis (works in Node.js, Bun, and modern browsers)
if (typeof globalThis !== 'undefined' && (globalThis as any).Buffer) {
  useBuffer = true
  BufferType = (globalThis as any).Buffer
}

/**
 * Clones (copies) an Object using deep copying.
 *
 * This function supports circular references by default, but if you are certain
 * there are no circular references in your object, you can save some CPU time
 * by calling clone(obj, false).
 *
 * Caution: if `circular` is false and `parent` contains circular references,
 * your program may enter an infinite loop and crash.
 *
 * @param parent - the object to be cloned
 * @param circular - set to true if the object to be cloned may contain circular references. (optional - true by default)
 * @param depth - set to a number if the object is only to be cloned to a particular depth. (optional - defaults to Infinity)
 * @param prototype - sets the prototype to be used when cloning an object. (optional - defaults to parent prototype)
 * @param includeNonEnumerable - set to true if the non-enumerable properties should be cloned as well. Non-enumerable properties on the prototype chain will be ignored. (optional - false by default)
 */
const clone = function clone(
  parent: any,
  circular?: boolean | CloneOptions,
  depth?: number,
  prototype?: any,
  includeNonEnumerable?: boolean,
): any {
  if (typeof circular === 'object') {
    depth = (circular as CloneOptions).depth
    prototype = (circular as CloneOptions).prototype
    includeNonEnumerable = (circular as CloneOptions).includeNonEnumerable
    circular = (circular as CloneOptions).circular
  }
  // maintain two arrays for circular references, where corresponding parents
  // and children have the same index
  const allParents: any[] = []
  const allChildren: any[] = []

  if (typeof circular === 'undefined')
    circular = true

  if (typeof depth === 'undefined')
    depth = Infinity

  // Private utility functions
  function __objToStr(o: any): string {
    return Object.prototype.toString.call(o)
  }

  function __isDate(o: any): boolean {
    return typeof o === 'object' && __objToStr(o) === '[object Date]'
  }

  function __isArray(o: any): boolean {
    return typeof o === 'object' && __objToStr(o) === '[object Array]'
  }

  function __isRegExp(o: any): boolean {
    return typeof o === 'object' && __objToStr(o) === '[object RegExp]'
  }

  function __getRegExpFlags(re: RegExp): string {
    let flags = ''
    if (re.global)
      flags += 'g'
    if (re.ignoreCase)
      flags += 'i'
    if (re.multiline)
      flags += 'm'
    return flags
  }

  // recurse this function so we don't reset allParents and allChildren
  function _clone(parent: any, depth: number): any {
    // cloning null always returns null
    if (parent === null)
      return null

    if (depth === 0)
      return parent

    let child: any
    let proto: any
    if (typeof parent !== 'object') {
      return parent
    }

    // Use type assertion to tell TypeScript these functions have constructors
    if (_instanceof(parent, nativeMap)) {
      child = new (nativeMap as any)()
    }
    else if (_instanceof(parent, nativeSet)) {
      child = new (nativeSet as any)()
    }
    else if (_instanceof(parent, nativePromise)) {
      child = new (nativePromise as any)((
        resolve: (value: any) => void,
        reject: (reason: any) => void,
      ) => {
        parent.then((value: any) => {
          resolve(_clone(value, depth - 1))
        }, (err: any) => {
          reject(_clone(err, depth - 1))
        })
      })
    }
    else if (__isArray(parent)) {
      child = []
    }
    else if (__isRegExp(parent)) {
      child = new RegExp(parent.source, __getRegExpFlags(parent))
      if (parent.lastIndex)
        child.lastIndex = parent.lastIndex
    }
    else if (__isDate(parent)) {
      child = new Date(parent.getTime())
    }
    else if (useBuffer && BufferType && BufferType.isBuffer(parent)) {
      if (BufferType.from) {
        // Node.js >= 5.10.0 or Bun
        child = BufferType.from(parent)
      }
      else {
        // Older Node.js versions
        // Use type casting to avoid deprecation warning
        const BufferConstructor = BufferType as { new(length: number): any }
        child = new BufferConstructor(parent.length)
        parent.copy(child)
      }
      return child
    }
    else if (_instanceof(parent, Error)) {
      child = Object.create(parent)
    }
    else {
      if (typeof prototype === 'undefined') {
        proto = Object.getPrototypeOf(parent)
        child = Object.create(proto)
      }
      else {
        child = Object.create(prototype)
        proto = prototype
      }
    }

    if (circular) {
      const index = allParents.indexOf(parent)

      if (index !== -1) {
        return allChildren[index]
      }
      allParents.push(parent)
      allChildren.push(child)
    }

    if (_instanceof(parent, nativeMap)) {
      parent.forEach((value: any, key: any) => {
        const keyChild = _clone(key, depth - 1)
        const valueChild = _clone(value, depth - 1)
        child.set(keyChild, valueChild)
      })
    }
    if (_instanceof(parent, nativeSet)) {
      parent.forEach((value: any) => {
        const entryChild = _clone(value, depth - 1)
        child.add(entryChild)
      })
    }

    for (const i in parent) {
      const attrs = Object.getOwnPropertyDescriptor(parent, i)
      if (attrs) {
        child[i] = _clone(parent[i], depth - 1)
      }

      try {
        const objProperty = Object.getOwnPropertyDescriptor(parent, i)
        if (objProperty && objProperty.set === undefined) {
          // no setter defined. Skip cloning this property
          continue
        }
        child[i] = _clone(parent[i], depth - 1)
      }
      catch (e) {
        if (e instanceof TypeError) {
          // when in strict mode, TypeError will be thrown if child[i] property only has a getter
          // we can't do anything about this, other than inform the user that this property cannot be set.
          continue
        }
        else if (e instanceof ReferenceError) {
          // this may happen in non strict mode
          continue
        }
      }
    }

    if (Object.getOwnPropertySymbols) {
      const symbols = Object.getOwnPropertySymbols(parent)
      for (let i = 0; i < symbols.length; i++) {
        // Don't need to worry about cloning a symbol because it is a primitive,
        // like a number or string.
        const symbol = symbols[i]
        const descriptor = Object.getOwnPropertyDescriptor(parent, symbol)
        if (descriptor && !descriptor.enumerable && !includeNonEnumerable) {
          continue
        }
        child[symbol] = _clone(parent[symbol], depth - 1)
        if (descriptor) {
          Object.defineProperty(child, symbol, descriptor)
        }
      }
    }

    if (includeNonEnumerable) {
      const allPropertyNames = Object.getOwnPropertyNames(parent)
      for (let i = 0; i < allPropertyNames.length; i++) {
        const propertyName = allPropertyNames[i]
        const descriptor = Object.getOwnPropertyDescriptor(parent, propertyName)
        if (descriptor && descriptor.enumerable) {
          continue
        }
        child[propertyName] = _clone(parent[propertyName], depth - 1)
        if (descriptor) {
          Object.defineProperty(child, propertyName, descriptor)
        }
      }
    }

    return child
  }

  return _clone(parent, depth as number)
} as CloneFunction

/**
 * Simple flat clone using prototype, accepts only objects, usefull for property
 * override on FLAT configuration object (no nested props).
 *
 * USE WITH CAUTION! This may not behave as you wish if you do not know how this
 * works.
 */
clone.clonePrototype = function clonePrototype(parent: any): any {
  if (parent === null)
    return null

  // Define CustomConstructor with explicit constructor signature
  const CustomConstructor: { new(): object, prototype: any } = function (this: any) {
    // Empty constructor
  } as any
  CustomConstructor.prototype = parent
  return new CustomConstructor()
}

// Add utility functions to clone
clone.__objToStr = function __objToStr(o: any): string {
  return Object.prototype.toString.call(o)
}

clone.__isDate = function __isDate(o: any): boolean {
  return typeof o === 'object' && clone.__objToStr(o) === '[object Date]'
}

clone.__isArray = function __isArray(o: any): boolean {
  return typeof o === 'object' && clone.__objToStr(o) === '[object Array]'
}

clone.__isRegExp = function __isRegExp(o: any): boolean {
  return typeof o === 'object' && clone.__objToStr(o) === '[object RegExp]'
}

clone.__getRegExpFlags = function __getRegExpFlags(re: RegExp): string {
  let flags = ''
  if (re.global)
    flags += 'g'
  if (re.ignoreCase)
    flags += 'i'
  if (re.multiline)
    flags += 'm'
  return flags
}

export { clone }
