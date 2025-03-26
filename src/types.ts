export interface CloneOptions {
  circular?: boolean
  depth?: number
  prototype?: any
  includeNonEnumerable?: boolean
}

export interface CloneFunction {
  (parent: any, circular?: boolean, depth?: number, prototype?: any, includeNonEnumerable?: boolean): any
  (parent: any, options: CloneOptions): any
  clonePrototype: (parent: any) => any
  __objToStr: (o: any) => string
  __isDate: (o: any) => boolean
  __isArray: (o: any) => boolean
  __isRegExp: (o: any) => boolean
  __getRegExpFlags: (re: RegExp) => string
}
