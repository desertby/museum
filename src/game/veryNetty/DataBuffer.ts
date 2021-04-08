import {BitConverter} from "./../utility/BitConverter";

export enum LoginCommand
{
    binary_login = 0x1000,
    protobuf_login = 0x2000,
}

export class SocketData
{
    public Data!:number[];
    //public LoginCommand LoginType;
    public TagName!:number;
    public BuffLength!:number;
}

export class Constants
{
    //消息：数据总长度(4byte) + 数据类型(1byte) + 数据(N byte)
    public static HEAD_DATA_LEN = 4;
    public static HEAD_TYPE_LEN = 1;
    public static get HEAD_LEN()//5byte
    {
        return this.HEAD_DATA_LEN + this.HEAD_TYPE_LEN;
    }
}

export class DataBuffer
{//自动大小数据缓存器
    private _minBuffLen!:number;
    private _buff!:number[];
    private _curBuffPosition:number=0;
    private _buffLength = 0;
    private _dataLength:number=0;
    private _tagName:number=0;

    /// <summary>
    /// 构造函数
    /// </summary>
    /// <param name="_minBuffLen">最小缓冲区大小</param>
    constructor(_minBuffLen:number = 1024)
    {
        if (_minBuffLen <= 0)
        {
            this._minBuffLen = 1024;
        }
        else
        {
            this._minBuffLen = _minBuffLen;
        }
        this._buff = new Array<number>(this._minBuffLen);
    }

    /// <summary>
    /// 添加缓存数据
    /// </summary>
    /// <param name="_data"></param>
    /// <param name="_dataLen"></param>
    public AddBuffer(_data:number[])
    {
        let dataLen = _data.length
        if (dataLen > this._buff.length - this._curBuffPosition)//超过当前缓存
        {
            let _tmpBuff = new Array<number>(this._curBuffPosition + dataLen);
            this.Copy(this._buff, 0, _tmpBuff, 0, this._curBuffPosition);
            this.Copy(_data, 0, _tmpBuff, this._curBuffPosition, dataLen);
            this._buff = _tmpBuff;
        }
        else
        {
            this.Copy(_data, 0, this._buff, this._curBuffPosition, dataLen);
        }

        this._curBuffPosition += dataLen;//修改当前数据标记
    }

    /// <summary>
    /// 更新数据长度
    /// </summary>
    public UpdateDataLength()
    {
        if (this._dataLength == 0 && this._curBuffPosition >= Constants.HEAD_DATA_LEN)
        {
            let tmpDataLen = new Array<number>(Constants.HEAD_DATA_LEN);
            this.Copy(this._buff, 0, tmpDataLen, 0, Constants.HEAD_DATA_LEN);
            this._dataLength = BitConverter.ToInt32(tmpDataLen, 0);
            this._tagName = this._buff[Constants.HEAD_DATA_LEN];

            this._buffLength = this._dataLength + Constants.HEAD_DATA_LEN;
        }
    }

    /// <summary>
    /// 获取一条可用数据，返回值标记是否有数据
    /// </summary>
    /// <param name="_tmpSocketData"></param>
    /// <returns></returns>
    public GetData(_tmpSocketData:SocketData):boolean
    {
        if (this._buffLength <= 0)
        {
            this.UpdateDataLength();
        }

        if (this._buffLength > 0 && this._curBuffPosition >=this._buffLength)
        {
            _tmpSocketData.BuffLength = this._buffLength;
            _tmpSocketData.TagName = this._tagName;
            _tmpSocketData.Data = new Array<number>(this._dataLength - Constants.HEAD_TYPE_LEN);
            this.Copy(this._buff, Constants.HEAD_LEN, _tmpSocketData.Data, 0, this._dataLength - Constants.HEAD_TYPE_LEN);
            this._curBuffPosition -= this._buffLength;
            let _tmpBuff = new Array<number>(this._curBuffPosition < this._minBuffLen ? this._minBuffLen : this._curBuffPosition);
            this.Copy(this._buff, this._buffLength, _tmpBuff, 0, this._curBuffPosition);
            this._buff = _tmpBuff;

            this._buffLength = 0;
            this._dataLength = 0;
            return true;
        }
        return false;
    }

    public Copy(origin:number[],startIndex:number,dest:number[],start:number,length:number)
    {
        for(let i=0;i<length;i++)
        {
            dest[i+start]=origin[i+startIndex];
        }
    }

}