export class BitConverter
{
    public static ToInt32(value:number[],index:number):number
    {
        let re=(value[index]<<24);
        re+=(value[index+1]<<16);
        re+=(value[index+2]<<8);
        re+=(value[index+3]);
        return re;
    }

    public static GetBytesInt32(value:number):number[]
    {
        let bytes:number[]=new  Array(4);
        bytes[0]=value>>24;
        bytes[1]=(value>>16)-(bytes[0]<<8);
        bytes[2]=(value>>8)-(bytes[1]<<8)-(bytes[0]<<16);
        bytes[3]=value-(bytes[2]<<8)-(bytes[1]<<16)-(bytes[0]<<24);
        return bytes;
    }
}