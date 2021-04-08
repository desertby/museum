import { IVeryVar } from "./IVeryVar";
import { ByteBuffer } from "../veryNetty/ByteBuffer";
import { Dictionary } from "../utility/dictionary";

export class VarTools
{
  private static _record=new Dictionary<string,IVeryVar>();
  public static addVar(val:IVeryVar):void
  {
    if(this._record.ContainsKey(val.name))
    {
      console.error(val.name+"该变量已经存在，请勿重复创建!");
    }
    else
    {
      this._record.Add(val.name,val);
    }
  }

  public static GetVeryVar(name:string)
  {
    return this._record.GetValue(name);
  }
}
export class VeryBool implements IVeryVar {
  discriminator: "IVeryVar"="IVeryVar";
  public get varType(): string {
    return "bool";
  }

  public name: string = '';


  public get value(): boolean {
    return this._value;
  }
  public set value(val: boolean) {
    this._value = val;
  }
  private _value: boolean = false;

  constructor(name:string,value:boolean) {
    this.name=name;
    this._value = value;
  }

  public setValue(val: any): void {
    this._value = val;
  }

  public getValue(): any {
    return this._value;
  }


  public GetBytes(): ByteBuffer {
    let buf = ByteBuffer.Allocate(2);
    buf.WriteBoolean(this._value);
    return buf;
  }
  public setBuf(buf: ByteBuffer): void {
    this._value = buf.ReadBoolean();
  }

  public clone():IVeryVar
  {
    return new VeryBool(this.name,this._value);
  }
}

export class VeryNumber implements IVeryVar {
  discriminator: "IVeryVar"="IVeryVar";
  public get varType(): string {
    return "number";
  }

  public name: string = '';
  public get value(): number {
    return this._value;
  }
  public set value(val: number) {
    this._value = val;
  }
  private _value: number = 0;

  constructor(name:string,value:number) {
    this.name=name;
    this._value = value;
  }

  public setValue(val: number): void {
    this._value = val;
  }


  public getValue(): any {
    return this._value;
  }
  public GetBytes(): ByteBuffer {
    let buf = ByteBuffer.Allocate(10);
    if(this._value.toString().indexOf('.')<0)
    {
      buf.WriteInt(this._value);
    }
    else
      buf.WriteFloat(this._value);
    return buf;
  }
  public setBuf(buf: ByteBuffer): void {
    if(this._value.toString().indexOf('.')<0)
    {
      this._value = buf.ReadInt();
    }
    else
      this._value=buf.ReadFloat();
  }
  public clone():IVeryVar
  {
    return new VeryNumber(this.name,this._value);
  }
}

export class VeryString implements IVeryVar {
  discriminator: "IVeryVar"="IVeryVar";
  public get varType(): string {
    return "string";
  }


  public name: string = '';

  public get value(): string {
    return this._value;
  }
  public set value(val: string) {
    this._value = val;
  }
  private _value: string = "";

  constructor(name:string,value:string) {
    this.name=name;
    this._value = value;
  }

  public getValue(): any {
    return this._value;
  }

  public setValue(val: any): void {
    this._value = val;
  }


  public GetBytes(): ByteBuffer {
    let buf = ByteBuffer.Allocate(1024);
    buf.WriteString(this._value);
    return buf;
  }
  public setBuf(buf: ByteBuffer): void {
    this._value = buf.ReadString();
  }

  public clone():IVeryVar
  {
    return new VeryString(this.name,this._value);
  }
}



export class VeryList implements IVeryVar {
  discriminator: "IVeryVar"="IVeryVar";
  public get varType(): string {
    return "List";
  }


  public static IsList(t: string): boolean {
    if (t.toLowerCase() == 'list' || t == "数组") {
      return true;
    }
    else {
      return false;
    }
  }

  public name: string = '';


  public get value(): Array<IVeryVar> {
    return this._value;
  }
  public set value(val: Array<IVeryVar>) {
    this._value = val;
  }
  private _value: Array<IVeryVar > = new Array<IVeryVar>();
  private _record:Array<number>=new Array<number>();
  private _maxIndex:number=0;
  private _recordTag=0;
  public get RecordTag():number
  {
    return this._recordTag;
  }
  private _type:IVeryVar;
  constructor(name:string,type:IVeryVar) {
    this.name=name;
    this._type=type;
    this._value = new Array<IVeryVar>();
  }

  public getValue(): any {
    return this._value;
  }

  public setValue(val: any) {
    this._value = new Array<IVeryVar >();
    this._record=new Array<number>();
    let tmpValue: Array<IVeryVar> = val as Array<IVeryVar >;
    for (let i = 0; i < tmpValue.length; i++) {
      this._value.push(tmpValue[i]);
      this._record.push(i<<15);
    }
  }

  public add(blue_var: IVeryVar) {
      this._value.push(blue_var);
      this._maxIndex=this._maxIndex+(1<<15);
      this._recordTag=this._maxIndex;
      this._record.push(this._maxIndex);
  }

  public insert(i: number, blue_var: IVeryVar) {
    if (i < 0 || i >= this._value.length) {
      console.error(this.name + " 在数组中插入元素的下标:" + i + ",超出范围!");
      return;
    }
    this._value.splice(i, 0, blue_var);
    let insrtValue=this._record[i]-1;
    this._recordTag=insrtValue;
    this._record.splice(i,0,insrtValue);
  }

  public addRange(blue_list: VeryList) {
    let arrList = blue_list.value;
    for (let i = 0; i < arrList.length; i++) {
      this._value.push(arrList[i]);
      this._maxIndex=this._maxIndex+(1<<15);
      if(i==0)
      {
        this._recordTag=this._maxIndex;
      }
      this._record.push(this._maxIndex);
    }
  }

  public contains(blue_value: IVeryVar): boolean {
      for (let i = 0; i < this._value.length; i++) {
        if ((this._value[i] as IVeryVar).getValue() == blue_value.getValue()) {
          return true;
        }
      }
    return false;
  }

  public indexOf(blue_value: IVeryVar): number {
      for (let i = 0; i < this._value.length; i++) {
        if ((this._value[i] as IVeryVar).getValue() == blue_value.getValue()) {
          return i;
        }
      }
    return -1;
  }
  public insertRange(index: number, blue_list: VeryList) {
    if (index < 0 || index >= this._value.length) {
      console.error(this.name + " 在数组中插入元素的下标:" + index + ",超出范围!");
      return;
    }
    let arrList = blue_list.value;
    for (let i = 0; i < arrList.length; i++) {
      this._value.splice(index + i, 0, arrList[i]);
      let insrtValue=this._record[index+i]-1;
      this._record.splice(index+i,0,insrtValue);
    }
  }

  public removeAt(index: number) {
    this._recordTag=this._record[index];
    this._value.splice(index, 1);
    this._record.splice(index,1);
  }

  public clear() {
    this._value = new Array<IVeryVar>();
    this._record=new Array<number>();
    this._recordTag = 0;
    this._maxIndex =0;
  }

  public getValueByIndex(index: number): IVeryVar  {
      return ((this._value[index]) as IVeryVar);
  }

  public setValueByIndex(index: number, val: IVeryVar ) {
      (this._value[index] as IVeryVar).setValue(val.getValue());
  }

  private _netOperate=true;
  public ConvertNetMode()
  {
    this._netOperate=true;
  }
  public GetBytes(): ByteBuffer {
    let buffer = ByteBuffer.Allocate(8192);
    for (let i = 0; i < this._value.length; i++) {
      let bytes = (this._value[i] as IVeryVar).GetBytes();
      if(this._netOperate)
      {
        buffer.WriteInt(bytes.ReadableBytes());
        buffer.WriteInt(this._record[i]);
      }
      buffer.Write(bytes);
    }
    return buffer;
  }

  public setBuf(buf: ByteBuffer): void {
    let index = 0;
    let count = this._value.length;
    while (buf.ReadableBytes() > 0) {
      if (index < count) {
        if(this._netOperate)
        {
          this._record[index]=buf.ReadInt();
          if(this._maxIndex<this._record[index])
            this._maxIndex=this._record[index];
        }
        (this._value[index] as IVeryVar).setBuf(buf);
      }
      else {
        let realVar = this._type.clone();
        if(this._netOperate)
        {
          this._record.push(buf.ReadInt());
          if(this._maxIndex<this._record[index])
            this._maxIndex=this._record[index];
        }
        realVar.setBuf(buf);
        this._value.push(realVar);
      }
      index++;
    }
    while (index < count) {
      this._value.splice(index, 1);
      index++;
    }
  }

  public clone():IVeryVar
  {
    let tmp=new VeryList(this.name,this._type);
    tmp.addRange(this);
    return tmp;
  }
}
