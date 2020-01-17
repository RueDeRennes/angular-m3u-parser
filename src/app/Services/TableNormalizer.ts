export class TableNormalizer {
  public normalize<T extends Object>(data: T | Array<T>): T | Array<T> {
    if (Array.isArray(data)) {
       return data.map(x => this.toFlat(data));
    }else {
      return this.toFlat(data);
    }
  }

  public denormalize<T>(data: T): void {
    throw new Error('NOT IMPLEMENTED');
  }

  private toFlat(self: object): any {
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
