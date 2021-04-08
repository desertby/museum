export class EventProxy {

  private _names: string[] = [];
  private _flags: boolean[] = [];

  public constructor() {

  }

  public add(name: string): void {
    this._names.push(name);
    this._flags.push(false);
  }

  public done(name: string): boolean {
    let index: number = this._names.indexOf(name);
    if (index > -1) {
      this._flags[index] = true;
      for (let i: number = 0; i < this._flags.length; i++) {
        if (!this._flags[i]) {
          return false;
        }
      }
      return true;
    } else {
      return false;
    }
  }

  public resume(): void {
    for (let i: number = 0; i < this._flags.length; i++) {
      this._flags[i] = false;
    }
  }

  public clear(): void {
    this._flags = [];
    this._names = [];
  }

}