export class TableNormalizer {
  
  public static normalize<T extends Object>(data: T): void {
    return this.toFlat(data);
  }

  public static denormalize<T>(data: T): void {
    
  }

  private static toFlat(self: object): any {
    return Object.assign(
      {},
      ...(function flatten(x: object): any {
        return [].concat(
          ...Object.keys(x).map(k =>
            typeof x[k] === "object" ? flatten(x[k]) : { [k]: x[k] }
          )
        );
      })(self)
    );
  }
}
