import { Unique } from "./../Models/Unique";

class TableSchema {
  private readonly _skeleton: Object;
  private readonly _id: string;
  constructor(id: string, skeleton: Object) {
    this._id = id;
    this._skeleton = skeleton;
  }

  get id(): string {
    return this._id;
  }

  get skeleton(): Object {
    return this._skeleton;
  }
}

export class TableNormalizer {
  private readonly _cache: Array<TableSchema>;

  public normalize<T extends Object>(
    data: T | Array<T>
  ): Promise<T | Array<T>> {
    // find a why to store the object schema.
    const schema = new TableSchema(Unique.new(), this.createSchema(data));

    return new Promise((resolve, reject) => {
      if (Array.isArray(data)) {
        const result = data.map(x => this.toFlat(x));
        resolve(result);
      } else {
        const result = this.toFlat(data);
        resolve(result);
      }
    });
  }

  public denormalize<T>(data: T): void {
    throw new Error("NOT IMPLEMENTED");
  }

  private toFlat(self: object): any {
    return Object.assign(
      {},
      ...(function flatten(x: object): any {
        return [].concat(
          ...Object.keys(x).map(k => {
            // Convert trainCase to camelCase
            // k = k.replace(/-([a-z])/g, g => {
            //   return g[1].toUpperCase();
            // });
            return typeof x[k] === "object" ? flatten(x[k]) : { [k]: x[k] };
          })
        );
      })(self)
    );
  }

  private createSchema<T>(data: T | Array<T>): Object {
    return {};
  }
}
