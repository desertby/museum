import { ByteBuffer } from "../veryNetty/ByteBuffer";

export interface IVeryVar {
  discriminator:"IVeryVar";
  varType: string;
  name: string;
  setValue(val: any): void;
  getValue(): any;
  GetBytes():ByteBuffer;
  setBuf(buf:ByteBuffer):void;
  clone():IVeryVar;
}