// Global type declarations for Next.js compatibility

declare global {
  interface ObjectConstructor {
    new (value?: any): Object;
    (): any;
    (value: any): any;
    readonly prototype: Object;
  }

  var Object: ObjectConstructor;
}

export {};
