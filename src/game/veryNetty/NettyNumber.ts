import { ByteBuffer } from "./ByteBuffer";
import { SocketHandle } from "./SocketBusiness";

export class NettyNumber
{
    private value:number=0;
    private type:string="int";
    public static CreatNettyNumber(num:number,type:string)
    {
        let newNumber=new NettyNumber();
        newNumber.value=num;
        newNumber.type=type;
        return newNumber;
    }

    public IsDirect()
    {
        if(this.type==="byte")
        {
            if(this.value===SocketHandle.GameStart||this.value===SocketHandle.GetVal||this.value===SocketHandle.SaveVal)
            {
                return true;
            }
        }
        return false;
    }

    public WirteNumbr(byte:ByteBuffer)
    {
        if(this.type==="int")
        {
            byte.WriteInt(this.value);
        }
        else if(this.type==="float")
        {
            byte.WriteFloat(this.value);
        }
        else if(this.type==="byte")
        {
            byte.WriteByte(this.value);
        }
        else if(this.type==="")
        {
           
        }
    }
}