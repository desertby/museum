import { ByteBuffer } from "../veryNetty/ByteBuffer";

export interface IVeryVar {
  varType: string;
  className: string;
  name:string;
  ID: string;
  setValue(val: any): void;
  getValue(): any;
  GetBytes():ByteBuffer;
  setBuf(buf:ByteBuffer):void;
  clone(): IVeryVar;
}
export class VeryBool implements IVeryVar {
  public get varType(): string {
    return "bool";
  }

  public get className(): string {
    return "VeryBool";
  }

  public get ID(): string {
    return 'bool|开关';
  }

  public name: string = '';


  public get value(): boolean {
    return this._value;
  }
  public set value(val: boolean) {
    this._value = val;
  }
  private _value: boolean = false;

  constructor() {
    this._value = false;
  }

  public setValue(val: any): void {
    this._value = val;
  }

  public getValue(): any {
    return this._value;
  }


  public clone(): IVeryVar {
    let varClone: VeryBool = new VeryBool();
    varClone.setValue(this._value);
    return varClone;
  }

  public GetBytes():ByteBuffer
  {
     let buf=ByteBuffer.Allocate(1);
     buf.WriteBoolean(this._value);
     return buf;
  }
  public setBuf(buf:ByteBuffer):void
  {
    this._value=buf.ReadBoolean();
  }
}

export class VeryNumber implements IVeryVar {
  public get varType(): string {
    return "number";
  }

  public get className(): string {
    return "VeryNumber";
  }

  public get ID(): string {
    return 'number|数字';
  }

  public name: string = '';


  public get value(): number {
    return this._value;
  }
  public set value(val: number) {
    this._value = val;
  }
  private _value: number = 0;

  constructor() {
    this._value = 0;
  }

  public setValue(val: number): void {
    this._value = val;
  }


  public getValue(): any {
    return this._value;
  }

  public clone(): IVeryVar {
    let varClone: VeryNumber = new VeryNumber();
    varClone.setValue(this._value);
    return varClone;
  }

  public GetBytes():ByteBuffer
  {
     let buf=ByteBuffer.Allocate(4);
     buf.WriteInt(this._value);
     return buf;
  }
  public setBuf(buf:ByteBuffer):void
  {
    this._value=buf.ReadInt();
  }
}

export class VeryString implements IVeryVar {
  public get varType(): string {
    return "string";
  }

  public get className(): string {
    return "VeryString";
  }

  public get ID(): string {
    return 'string|字符串';
  }

  public name: string = '';


  public get value(): string {
    return this._value;
  }
  public set value(val: string) {
    this._value = val;
  }
  private _value: string = "";

  constructor() {
    this._value = "";
  }

  public getValue(): any {
    return this._value;
  }

  public setValue(val: any): void {
    this._value = val;
  }

  

  public clone(): IVeryVar {
    let varClone: VeryString = new VeryString();
    varClone.setValue(this._value);
    return varClone;
  }


  public GetBytes():ByteBuffer
  {
     let buf=ByteBuffer.Allocate(1024);
     buf.WriteString(this._value);
     return buf;
  }
  public setBuf(buf:ByteBuffer):void
  {
    this._value=buf.ReadString();
  }
}

export class VeryVector3 implements IVeryVar {
  public get varType(): string {
    return "Vector3";
  }

  public get className(): string {
    return "VeryVector3";
  }

  public get ID(): string {
    return 'Vector3|向量';
  }

  public name: string = '';

  public get value(): BABYLON.Vector3 {
    return this._value;
  }
  public set value(val: BABYLON.Vector3) {
    this._value = val;
  }
  private _value: BABYLON.Vector3 = BABYLON.Vector3.Zero();

  constructor() {
    this._value = BABYLON.Vector3.Zero();
  }

  public getValue(): any {
    return this._value;
  }

  public setValue(val: any) {
    this._value = val;
  }

  public clone(): IVeryVar {
    let varClone: VeryVector3 = new VeryVector3();
    let r: BABYLON.Vector3 = new BABYLON.Vector3(
      this._value.x,
      this._value.y,
      this._value.z
    );
    varClone.setValue(r);
    return varClone;
  }

  public GetBytes():ByteBuffer
  {
     let buf=ByteBuffer.Allocate(12);
     buf.WriteFloat(this._value.x);
     buf.WriteFloat(this._value.y);
     buf.WriteFloat(this._value.z);
     return buf;
  }
  public setBuf(buf:ByteBuffer):void
  {
    this._value.x=buf.ReadFloat();
    this._value.y=buf.ReadFloat();
    this._value.z=buf.ReadFloat();
  }
}


export class VeryList implements IVeryVar
{
  public get varType(): string {
    return "List";
  }

  public get className(): string {
    return "VeryList";
  }

  public get ID(): string {
    return 'List|数组';
  }

  public static IsList(t:string):boolean
  {
      if(t.toLowerCase()=='list'||t=="数组")
      {
        return true;
      }
      else
      {
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
  private _value: Array<IVeryVar> = new Array<IVeryVar>();

  constructor() {
    this._value = new Array<IVeryVar>();
  }

  public getValue(): any {
    return this._value;
  }

  public setValue(val: any) {
    this._value=new Array<IVeryVar>();
    let tmpValue:Array<IVeryVar>=val as Array<IVeryVar>;
    for(let i=0;i<tmpValue.length;i++)
    {
      this._value.push(tmpValue[i]);
    }
  }


  private strSplit:Array<string>=new Array();
  public systemChildType:string="";
  private isVeryVal=true;




  public clone(): IVeryVar {
    let varClone=new Array<IVeryVar>();
    if(this.isVeryVal)
    {
      for(let i=0;i<this._value.length;i++)
      {
        varClone.push((this._value[i] as IVeryVar).clone())
      }
    }
    let realClone=new VeryList();
    realClone.setValue(varClone);
    return realClone;
  }

  public add(blue_var:IVeryVar,need_clone=true)
  {

        this._value.push(blue_var);
  }

  public insert(i:number,blue_var:IVeryVar,need_clone=true)
  {
    if(i<0||i>=this._value.length)
    {
      console.error(this.name+" 在数组中插入元素的下标:"+i+",超出范围!");
      return;
    }
    this._value.splice(i,0,blue_var);
  }

  public addRange(blue_list:VeryList)
  {
     let arrList=blue_list.value;
     for(let i=0;i<arrList.length;i++)
     {
       this._value.push(arrList[i]);
     }
  }

  public contains(blue_value:IVeryVar):boolean
  {
    if(this.isVeryVal)
    {
      for(let i=0;i<this._value.length;i++)
      {
        if((this._value[i] as IVeryVar).getValue()==blue_value.getValue())
        {
          return true;
        }
      }
    }
    return false;
  }

  public indexOf(blue_value:IVeryVar):number
  {
    if(this.isVeryVal)
    {
      for(let i=0;i<this._value.length;i++)
      {
        if((this._value[i] as IVeryVar).getValue()==blue_value.getValue())
        {
          return i;
        }
      }
    }
    return -1;
  }
  public insertRange(index:number,blue_list:VeryList)
  {
    if(index<0||index>=this._value.length)
    {
      console.error(this.name+" 在数组中插入元素的下标:"+index+",超出范围!");
      return;
    }
    let arrList=blue_list.value;
    for(let i=0;i<arrList.length;i++)
    {
      this._value.splice(index+i,0,arrList[i]);
    }
  }

  public removeAt(index:number)
  {
     this._value.splice(index,1);
  }

  public clear()
  {
    this._value=new Array<IVeryVar>();
  }

  public getValueByIndex(index:number):IVeryVar
  {
      return ((this._value[index]) as IVeryVar);
  }

  public setValueByIndex(index:number,val:IVeryVar)
  {
      this._value[index]=val;
  }

  public GetBytes():ByteBuffer
  {
    let buffer = ByteBuffer.Allocate(8192);
    for (let i = 0; i < this._value.length; i++)
    {
      let bytes=(this._value[i] as IVeryVar).GetBytes();
      buffer.Write(bytes);
    }
    return buffer;
  }
  public setBuf(buf:ByteBuffer):void
  {
    let index = 0;
    let count = this._value.length;
    while (buf.ReadableBytes() > 0)
    {
        if (index < count)
        {
            (this._value[index] as IVeryVar).setBuf(buf);
        }
        index++;
    }
    while (index < count)
    {
        this._value.splice(index,1);
        index++;
    }
  }
}
