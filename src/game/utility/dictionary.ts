/**字典数据结构类 */
export class Dictionary<KT, VT> {
  private _keys: KT[] = [];
  private _values: VT[] = [];
  public get count(): number {
    return this.Count();
  }

  public constructor() {
  }

  public clear()
  {
    this._keys=[];
    this._values=[];
  }

  /**给字典增加一条数据,返回字典的长度 */
  public Add(key: KT, value:VT): number {
    this._keys.push(key);
    return this._values.push(value);
  }

  public Remove(key: KT) {
    var index = this._keys.indexOf(key, 0);
    this._keys.splice(index, 1);
    this._values.splice(index, 1);
  }

  public RemoveAt(index:number)
  {
    this._keys.splice(index, 1);
    this._values.splice(index, 1);
  }

  private Count(): number {
    return this._keys.length;
  }

  /**直接使用SetValue()修改已经存在的字典数据项 */
  public SetValue(key: KT, value: VT): boolean {
    var index = this._keys.indexOf(key, 0);
    if (index != -1) {
      this._keys[index] = key;
      this._values[index] = value;
      return true;
    }
    return false;
  }

	/**
	 *返回字典数据；
	 */
  public GetValue(key: KT): VT | null {
    var index = this._keys.indexOf(key, 0);
    if (index != -1) {
      return this._values[index];
    } else {
      return null;
    }
  }

  public GetValueByIndex(index:number): VT | null
  {
    if (index > -1&&index<this.count) {
      return this._values[index];
    } else {
      return null;
    }
  }

  public GetKeyByIndex(index:number): KT | null
  {
    if (index > -1&&index<this.count) {
      return this._keys[index];
    } else {
      return null;
    }
  }

  public ContainsKey(key: KT): boolean {
    let ks = this._keys;
    for (let i = 0; i < ks.length; ++i) {
      if (ks[i] == key) {
        return true;;
      }
    }
    return false;
  }

  public ContainsValue(value: VT): boolean {
    let vs = this._values;
    for (let i = 0; i < vs.length; ++i) {
      if (vs[i] == value) {
        return true;;
      }
    }
    return false;
  }

  public GetKeys(): KT[] {
    return this._keys;
  }

  public GetValues(): VT[] {
    return this._values;
  }
}