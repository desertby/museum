export class ByteBuffer
{
    //字节缓存区
    private buf!:ArrayBuffer;
    private bufView!:DataView;
    //读取索引
    private readIndex:number=0;
    //写入索引
    private writeIndex:number=0;
    //读取索引标记
    private markReadIndex:number=0;
    //写入索引标记
    private markWirteIndex:number=0;
    //缓存区字节数组的长度
    private capacity!:number;

    //对象池
    private static pool:Array<ByteBuffer> = new Array<ByteBuffer>();
    private static poolMaxCount:number = 200;
    //此对象是否池化
    private isPool:boolean = false;

    private static IslittleEndian=false;

    public constructor(capacity:number|ArrayBuffer)
    {
        if(typeof capacity==='number')
        {
            this.buf = new ArrayBuffer(capacity);
            this.bufView=new DataView(this.buf);
            this.capacity = capacity;
            this.readIndex = 0;
            this.writeIndex = 0;
        }
        else
        {
            this.capacity = capacity.byteLength;
            this.buf = capacity;
            this.bufView=new DataView(this.buf);
            this.readIndex = 0;
            this.writeIndex = this.capacity;
        }
    }

    /// <summary>
    /// 构建一个capacity长度的字节缓存区ByteBuffer对象
    /// </summary>
    /// <param name="capacity">初始容量</param>
    /// <returns>ByteBuffer对象</returns>
    public static  Allocate(capacity:number|number[]):ByteBuffer
    {
        if(typeof capacity ==='number')
            return new ByteBuffer(capacity);
        else
        {
            let buf=new ByteBuffer(capacity.length);
            buf.WriteBytes(capacity);
            return buf;
        }
    }

    /// <summary>
    /// 获取可读的字节数组
    /// </summary>
    /// <returns>字节数据</returns>
    public ToArray():ArrayBuffer
    {
        length=this.ReadableBytes();
        let arr=this.buf.slice(this.readIndex,this.readIndex+length);
        return arr;
    }

    public ToBytes()
    {
        let bytes:number[]=new Array();
        for(let i=0;i<this.ReadableBytes();i++)
        {
           bytes.push(this.bufView.getUint8(i+this.readIndex));
        }
        return bytes;
    }
    /// <summary>
    /// 获取一个池化的ByteBuffer对象，池化的对象必须在调用Dispose后才会推入池中，否则此方法等同于Allocate(int capacity)方法，此方法为线程安全的
    /// </summary>
    /// <param name="capacity">ByteBuffer对象的初始容量大小，如果缓存池中没有对象，则对象的容量大小为此值，否则为池中对象的实际容量值</param>
    /// <returns></returns>
    public static GetFromPool(capacity:number):ByteBuffer
    {
        let bbuf:ByteBuffer;
        if (this.pool.length == 0)
        {
            bbuf = ByteBuffer.Allocate(capacity);
            bbuf.isPool = true;
            return bbuf;
        }
        let lastIndex =this.pool.length - 1;
        bbuf = this.pool[lastIndex];
        this.pool.splice(lastIndex,1);
        if (!bbuf.isPool)
        {
            bbuf.isPool = true;
        }
        return bbuf;
    }

    /// <summary>
    /// 根据length长度，确定大于此leng的最近的2次方数，如length=7，则返回值为8
    /// </summary>
    /// <param name="length">参考容量</param>
    /// <returns>比参考容量大的最接近的2次方数</returns>
    private  FixLength(length:number):number
    {
        let n = 2;
        let b = 2;
        while (b < length)
        {
            b = 2 << n;
            n++;
        }
        return b;
    }

    
    /// <summary>
    /// 确定内部字节缓存数组的大小
    /// </summary>
    /// <param name="currLen">当前容量</param>
    /// <param name="futureLen">将来的容量</param>
    /// <returns>当前缓冲区的最大容量</returns>
    private  FixSizeAndReset(currLen:number, futureLen:number):number
    {
        if (futureLen > currLen)
        {
            //以原大小的2次方数的两倍确定内部字节缓存区大小
            let size = this.FixLength(currLen) * 2;
            if (futureLen > size)
            {
                //以将来的大小的2次方的两倍确定内部字节缓存区大小
                size = this.FixLength(futureLen) * 2;
            }
            let newbuf:ArrayBuffer = new ArrayBuffer(size);
            this.Copy(this.buf, 0, newbuf, 0, currLen);
            this.buf = newbuf;
            this.bufView=new DataView(this.buf);
            this.capacity = newbuf.byteLength;
        }
        return futureLen;
    }

    /// <summary>
    /// 将bytes字节数组从startIndex开始的length字节写入到此缓存区
    /// </summary>
    /// <param name="bytes">待写入的字节数据</param>
    /// <param name="startIndex">写入的开始位置</param>
    /// <param name="length">写入的长度</param>
    public  WriteBytes(bytes:number[], startIndex:number=0, length:number=-1)
    {
        if(bytes.length==0)
            return;
        if(length===-1)
        {
            startIndex=0;
            length=bytes.length;
        }
        if(startIndex+length>bytes.length)
            return;
        let len = this.buf.byteLength;
        this.FixSizeAndReset(len, this.writeIndex+length);
        for(let i=0;i<length;i++)
        {
            this.bufView.setUint8(this.writeIndex,bytes[i+startIndex]);
            this.writeIndex+=1;
        }
    }

    /// <summary>
    /// 写入一个String数据
    /// </summary>
    /// <param name="value">String数据</param>
    public WriteString(value:string)
    {
        let tmp = this.UTF8GetBytes(value);
        let length = tmp.length;
        this.WriteInt(length);
        this.WriteBytes(tmp);
    }

    /// <summary>
    /// 读取一个String数据
    /// </summary>
    public ReadString():string
    {
        let length = this.ReadInt();
        let value=new Array(length);
        this.ReadBytes(value, 0, length);
        return this.UTF8GetString(value);
    }


    /// <summary>
    /// 写入一个int32数据
    /// </summary>
    /// <param name="value">int数据</param>
    public  WriteInt(value:number)
    {
        this.bufView.setInt32(this.writeIndex,value,ByteBuffer.IslittleEndian);
        this.writeIndex+=4;
    }
    /// <summary>
    /// 从读取索引位置开始读取len长度的字节到disbytes目标字节数组中
    /// </summary>
    /// <param name="disbytes">读取的字节将存入此字节数组</param>
    /// <param name="disstart">目标字节数组的写入索引</param>
    /// <param name="len">读取的长度</param>
    public ReadBytes(disbytes:number[], disstart:number, len:number)
    {
        let size = disstart + len;
        for (let i = disstart; i < size; i++)
        {
            disbytes[i] = this.ReadByte();
        }
    }

    /// <summary>
    /// 读取一个字节
    /// </summary>
    /// <returns>字节数据</returns>
    public ReadByte():number
    {
        let b = this.bufView.getUint8(this.readIndex);
        this.readIndex++;
        return b;
    }

    /// <summary>
    /// 以UTF8方式获取bytes[]
    /// </summary>
    /// <param name="value">要被转化的string类型</param>
    UTF8GetBytes(str:string) {
        let back = [];
        for (let i = 0; i < str.length; i++) {
            let code = str.charCodeAt(i);
            if (0x00 <= code && code <= 0x7f) {
                  back.push(code);
            } else if (0x80 <= code && code <= 0x7ff) {
                  back.push((192 | (31 & (code >> 6))));
                  back.push((128 | (63 & code)));
            } else if ((0x800 <= code && code <= 0xd7ff) 
                    || (0xe000 <= code && code <= 0xffff)) {
                  back.push((224 | (15 & (code >> 12))));
                  back.push((128 | (63 & (code >> 6))));
                  back.push((128 | (63 & code)));
            }
         }
         for (let i = 0; i < back.length; i++) {
              back[i] &= 0xff;
         }
         return back;
    }

    /// <summary>
    /// 以UTF8方式将bytes[]转化为string
    /// </summary>
    /// <param name="value">要被转化的bytes[]</param>
    UTF8GetString(arr:number[]):string {
        let UTF = '';
        for (let i = 0; i < arr.length; i++) {
            let one = arr[i].toString(2),
                v = one.match(/^1+?(?=0)/);
            if (v && one.length == 8) {
                let bytesLength = v[0].length;
                let store = arr[i].toString(2).slice(7 - bytesLength);
                for (let st = 1; st < bytesLength; st++) {
                    store += arr[st + i].toString(2).slice(2)
                }
                UTF += String.fromCharCode(parseInt(store, 2));
                i += bytesLength - 1
            } else {
                UTF += String.fromCharCode(arr[i])
            }
        }
        return UTF
    }

    /// <summary>
    ///  从指定的源索引开始，复制 ArrayBuffer中的一系列元素，将它们粘贴到另一 ArrayBuffer 中（从指定的目标索引开始）
    /// </summary>
    private Copy(origin:ArrayBuffer,startIndex:number,dest:ArrayBuffer,start:number,length:number)
    {
        let originView=new Int8Array(origin);
        let destView=new Int8Array(dest);
        for(let i=0;i<length;i++)
        {
            destView[i+start]=originView[startIndex+i];
        }
    }

    /// <summary>
    /// 将一个ByteBuffer的有效字节区写入此缓存区中
    /// </summary>
    /// <param name="buffer">待写入的字节缓存区</param>
    public Write(buffer:ArrayBuffer|ByteBuffer)
    {
        if (buffer == null) return;
        if(buffer instanceof ArrayBuffer)
        {
            this.Copy(buffer,0,this.buf,this.writeIndex,buffer.byteLength);
            this.writeIndex+=buffer.byteLength;
        }
        else
        {
            this.Copy(buffer.ToArray(),buffer.readIndex,this.buf,this.writeIndex,buffer.ReadableBytes());
            this.writeIndex+=buffer.ReadableBytes();
        }
    }

    /// <summary>
    /// 写入一个int16数据
    /// </summary>
    /// <param name="value">short数据</param>
    public  WriteShort(value:number)
    {
        this.bufView.setInt16(this.writeIndex,value,ByteBuffer.IslittleEndian);
        this.writeIndex+=2;
    }

    /// <summary>
    /// 写入一个uint16数据
    /// </summary>
    /// <param name="value">ushort数据</param>
    public WriteUshort(value:number)
    {
        this.bufView.setUint16(this.writeIndex,value,ByteBuffer.IslittleEndian);
        this.writeIndex+=2;
    }

    /// <summary>
    /// 写入一个uint32数据
    /// </summary>
    /// <param name="value">uint数据</param>
    public WriteUint(value:number)
    {
        this.bufView.setUint32(this.writeIndex,value,ByteBuffer.IslittleEndian);
        this.writeIndex+=4;
    }

    /// <summary>
    /// 写入一个int64数据
    /// </summary>
    /// <param name="value">long数据</param>
    public WriteLong(value:bigint)
    {
        // this.bufView.setBigInt64(this.writeIndex,value,ByteBuffer.IslittleEndian);
        // this.writeIndex+=8;
    }

    /// <summary>
    /// 写入一个uint64数据
    /// </summary>
    /// <param name="value">ulong数据</param>
    public WriteUlong(value:bigint)
    {
        // this.bufView.setBigUint64(this.writeIndex,value,ByteBuffer.IslittleEndian);
        // this.writeIndex+=8;
    }

    /// <summary>
    /// 写入一个float数据
    /// </summary>
    /// <param name="value">float数据</param>
    public WriteFloat(value:number)
    {
        this.bufView.setFloat32(this.writeIndex,value,ByteBuffer.IslittleEndian);
        this.writeIndex+=4;
    }

    /// <summary>
    /// 写入一个byte数据
    /// </summary>
    /// <param name="value">byte数据</param>
    public WriteByte(value:number)
    {
        this.bufView.setUint8(this.writeIndex,value);
        this.writeIndex+=1;
    }

    /// <summary>
    /// 写入一个double类型数据
    /// </summary>
    /// <param name="value">double数据</param>
    public WriteDouble(value:number)
    {
        this.bufView.setFloat64(this.writeIndex,value,ByteBuffer.IslittleEndian);
        this.writeIndex+=8;
    }

    /// <summary>
    /// 写入一个字符
    /// </summary>
    /// <param name="value"></param>
    public WriteChar(value:number)
    {
        this.WriteUshort(value);
    }

    /// <summary>
    /// 写入一个布尔型数据
    /// </summary>
    /// <param name="value"></param>
    public WriteBoolean(value:boolean)
    {
        let key=0;
        if(value)
            key=1;
        this.bufView.setUint8(this.writeIndex,key);
        this.writeIndex+=1;
    }

    /// <summary>
    /// 从读取索引位置开始读取len长度的字节数组
    /// </summary>
    /// <param name="len">待读取的字节长度</param>
    /// <returns>字节数组</returns>
    private Read(len:number):number[]
    {
        let bytes = new Array();
        for(let i=0;i<len;i++)
        {
            bytes.push(this.ReadByte());
        }
        return bytes;
    }

    /// <summary>
    /// 读取一个uint16数据
    /// </summary>
    /// <returns>ushort数据</returns>
    public ReadUshort():number
    {
        let value=this.bufView.getUint16(this.readIndex,ByteBuffer.IslittleEndian);
        this.readIndex+=2;
        return value;
    }

    /// <summary>
    /// 读取一个int16数据
    /// </summary>
    /// <returns>short数据</returns>
    public ReadShort():number
    {
        let value=this.bufView.getInt16(this.readIndex,ByteBuffer.IslittleEndian);
        this.readIndex+=2;
        return value;
    }

    /// <summary>
    /// 读取一个uint32数据
    /// </summary>
    /// <returns>uint数据</returns>
    public ReadUint()
    {
        let value=this.bufView.getUint32(this.readIndex,ByteBuffer.IslittleEndian);
        this.readIndex+=4;
        return value;
    }

    /// <summary>
    /// 读取一个int32数据
    /// </summary>
    /// <returns>int数据</returns>
    public ReadInt()
    {
        let value=this.bufView.getInt32(this.readIndex,ByteBuffer.IslittleEndian);
        this.readIndex+=4;
        return value;
    }

    /// <summary>
    /// 读取一个uint64数据
    /// </summary>
    /// <returns>ulong数据</returns>
    public ReadUlong()
    {
        // let value=this.bufView.getBigUint64(this.readIndex,ByteBuffer.IslittleEndian);
        // this.readIndex+=8;
        // return value;
    }

    /// <summary>
    /// 读取一个long数据
    /// </summary>
    /// <returns>long数据</returns>
    public ReadLong()
    {
        // let value=this.bufView.getBigInt64(this.readIndex,ByteBuffer.IslittleEndian);
        // this.readIndex+=8;
        // return value;
    }

    /// <summary>
    /// 读取一个float数据
    /// </summary>
    /// <returns>float数据</returns>
    public ReadFloat()
    {
        let value=this.bufView.getFloat32(this.readIndex,ByteBuffer.IslittleEndian);
        this.readIndex+=4;
        return value;
    }



    /// <summary>
    /// 读取一个double数据
    /// </summary>
    /// <returns>double数据</returns>
    public ReadDouble()
    {
        let value=this.bufView.getFloat64(this.readIndex,ByteBuffer.IslittleEndian);
        this.readIndex+=8;
        return value;
    }

    /// <summary>
    /// 读取一个字符
    /// </summary>
    /// <returns></returns>
    public ReadChar()
    {
        return this.ReadUshort;
    }

    /// <summary>
    /// 读取布尔型数据
    /// </summary>
    /// <returns></returns>
    public ReadBoolean()
    {
        let key=this.bufView.getUint8(this.readIndex);
        this.readIndex++;
        if(key===0)
            return false;
        else
            return true;
    }
    /// <summary>
    /// 截取当前Buffer的Length长度生成新的 ByteBuffer
    /// </summary>
    /// <param name="length"> 目标长度</param>
    /// <returns></returns>
    public ReadRetainedSlice(length?:number):ByteBuffer
    {
        if(length!=undefined)
        {
            let arr=this.buf.slice(this.readIndex,this.readIndex+length);
            this.readIndex+=length;
            return new ByteBuffer(arr);
        }
        else
        {
            length=this.ReadableBytes();
            let arr=this.buf.slice(this.readIndex,this.readIndex+length);
            this.readIndex+=length;
            return new ByteBuffer(arr);
        }
    }

    /// <summary>
    /// 可读的有效字节数
    /// </summary>
    /// <returns>可读的字节数</returns>
    public ReadableBytes():number
    {
        return this.writeIndex - this.readIndex;
    }

    /// <summary>
    /// 清除已读字节并重建缓存区
    /// </summary>
    public DiscardReadBytes()
    {
        if (this.readIndex <= 0) return;
        let len = this.buf.byteLength - this.readIndex;
        let newbuf = new ArrayBuffer(len);
        this.Copy(this.buf, this.readIndex, newbuf, 0, len);
        this.buf = newbuf;
        this.writeIndex -= this.readIndex;
        this.markReadIndex -= this.readIndex;
        if (this.markReadIndex < 0)
        {
            //markReadIndex = readIndex;
            this.markReadIndex = 0;
        }
        this.markWirteIndex -= this.readIndex;
        if (this.markWirteIndex < 0 || this.markWirteIndex < this.readIndex || this.markWirteIndex < this.markReadIndex)
        {
            this.markWirteIndex = this.writeIndex;
        }
        this.readIndex = 0;
    }

    /// <summary>
    /// 清空此对象，但保留字节缓存数组（空数组）
    /// </summary>
    public Clear()
    {
        this.buf = new ArrayBuffer(this.buf.byteLength)
        this.readIndex = 0;
        this.writeIndex = 0;
        this.markReadIndex = 0;
        this.markWirteIndex = 0;
        this.capacity = this.buf.byteLength;
    }

    /// <summary>
    /// 释放对象，清除字节缓存数组，如果此对象为可池化，那么调用此方法将会把此对象推入到池中等待下次调用
    /// </summary>
    public Dispose()
    {
        this.readIndex = 0;
        this.writeIndex = 0;
        this.markReadIndex = 0;
        this.markWirteIndex = 0;
        if (this.isPool)
        {
            if (ByteBuffer.pool.length < ByteBuffer.poolMaxCount)
            {
                ByteBuffer.pool.push(this);
            }
        }
        else
        {
            this.capacity = 0;
            this.buf =new ArrayBuffer(0);
        }
    }

    /// <summary>
    /// 设置/获取读指针位置
    /// </summary>
    public get ReaderIndex()
    {
        return this.readIndex;
    }

    public set ReaderIndex(value:number)
    {
        if(value<0) return;
        this.readIndex=value;
    }

    /// <summary>
    /// 设置/获取写指针位置
    /// </summary>
    public get WriterIndex()
    {
        return this.writeIndex;
    }

    public set WriterIndex(value:number)
    {
        if(value<0) return;
        this.writeIndex=value;
    }

    /// <summary>
    /// 标记读取的索引位置
    /// </summary>
    public MarkReaderIndex()
    {
        this.markReadIndex = this.readIndex;
    }

    /// <summary>
    /// 标记写入的索引位置
    /// </summary>
    public MarkWriterIndex()
    {
        this.markWirteIndex = this.writeIndex;
    }

    /// <summary>
    /// 将读取的索引位置重置为标记的读取索引位置
    /// </summary>
    public ResetReaderIndex()
    {
        this.readIndex = this.markReadIndex;
    }

    /// <summary>
    /// 将写入的索引位置重置为标记的写入索引位置
    /// </summary>
    public ResetWriterIndex()
    {
        this.writeIndex = this.markWirteIndex;
    }


    /// <summary>
    /// 获取缓存区容量大小
    /// </summary>
    /// <returns>缓存区容量</returns>
    public GetCapacity()
    {
        return this.capacity;
    }

    /// <summary>
    /// 复制一个对象，具有与原对象相同的数据，不改变原对象的数据，不包括已读数据
    /// </summary>
    /// <returns></returns>
    public Clone():ByteBuffer
    {
        if (this.buf == null)
        {
            return new ByteBuffer(16);
        }
        if (this.readIndex < this.writeIndex)
        {
            let newbytes = new ArrayBuffer(this.writeIndex-this.readIndex);
            this.Copy(this.buf, this.readIndex, newbytes, 0, newbytes.byteLength);
            let buffer = new ByteBuffer(newbytes);
            return buffer;
        }
        return new ByteBuffer(16);
    }
}