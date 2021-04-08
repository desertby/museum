import {ByteBuffer} from "./ByteBuffer";
import { SocketHandle } from "./SocketBusiness";
import { action0,action1,action2 } from "./../utility/action";
import {Dictionary} from "./../utility/dictionary";
import {VerySendMode,VeryEngineNode} from "./SocketBusiness";
import {IVeryVar} from "./IVeryVar";

export class VE_ActionBehaviour
{

}
export class VE_TriggerBehaviour
{

}
export class VeryEngineMessage
{
    public index!:number;
    public value!:ByteBuffer;
}

export class CallbackNetMessage
{
    public type!:SocketHandle;
    public value!:ByteBuffer ;
}

export class MonoBehaviourMessageCenter
{
    private static sInstance:MonoBehaviourMessageCenter;
    private static IsCreate = false;

    public static get Instance():MonoBehaviourMessageCenter
    {
        MonoBehaviourMessageCenter.CreateInstance();
        return MonoBehaviourMessageCenter!.sInstance;
    }

    public static CreateInstance()
    {
        if (MonoBehaviourMessageCenter.IsCreate == true)
            return;

        MonoBehaviourMessageCenter.IsCreate = true;
        this.sInstance=new MonoBehaviourMessageCenter();

    }
    private constructor()
    {
        
    }

    //自身的网络信息接受激活部分
        private lockStepTurnID = 0;
        public get LockStepTurnID():number
        { 
            return this.lockStepTurnID; 
        }

        private _upDate:action0=new action0();
        public NextTurn()
        {
            if (this._upDate.count != 0)
                this._upDate.run();
            this.lockStepTurnID++;
        }
        private _netMessageEventList:Dictionary<SocketHandle,action1<ByteBuffer>>  = new Dictionary<SocketHandle,action1<ByteBuffer>>();
        private  NetMessageData = new Array<CallbackNetMessage>();

        //和二代对接的网络信息部分  void代理 主要用于二代触发
        private  _veryEngineVoidEvent = new Dictionary<number, action0>();

        //bool bool代理 主要用于二代响应
        private _veryEngineBoolEvent = new Dictionary<number, action2<boolean,boolean>>();
        //buffer代理，主要用于变量转换
        private _veryEngineBufEvent = new Dictionary<number, action1<ByteBuffer>>();
        //记录所有二代有关网络部分触发响应发送的模式：全局发送、除自己以外发送、指定对象发送
        private _recordSendMode = new Dictionary<number, number>();
        //记录所有二代有关网络部分触发响应变量
        private _recordVeryEngine = new Dictionary<VE_ActionBehaviour|VE_TriggerBehaviour|IVeryVar, number>();
        private count = 0;
        //为了保证触发和响应综合的激活顺序一致，以结构的方式记录
        //如果分开写，则必会发送先激活一遍所有触发或者先激活一遍所有响应
        private VeryEngineData = new Array<VeryEngineMessage>();


        public GetVeryEngineIndex (target:VE_ActionBehaviour|VE_TriggerBehaviour|IVeryVar):number
        {
            if (this._recordVeryEngine.ContainsKey(target))
            {
                return this._recordVeryEngine.GetValue(target)!;
            }
            else
            {
                return -1;
            }
        }

        public GetSendMode(index:number):number
        {
            if (this._recordSendMode.ContainsKey(index))
            {
                return this._recordSendMode.GetValue(index)!;
            }
            else
            {
                return VerySendMode.All;
            }
        }

        public GetVeryEngineVar(index:number):IVeryVar|null
        {
            let keys=this._recordVeryEngine.GetKeys();
            for(let i=0;i<keys.length;i++)
            {
                let key=keys[i];
                if(this._recordVeryEngine.GetValue(key) === index)
                    return (key as IVeryVar);
            }
            return null;
        }

        //添加变量网络传递事件
        public AddVeryEngineVeryVarEvent(obj:IVeryVar, handle:(buf:ByteBuffer)=>void):number
        {
            if (!this._recordVeryEngine.ContainsKey(obj))
            {
                let index = this.count++ + 100;
                this._recordVeryEngine.Add(obj, index);
                this._veryEngineBufEvent.Add(index, new action1<ByteBuffer>());
                this._veryEngineBufEvent.GetValue(index)!.add(handle);
            }
            return this._recordVeryEngine.GetValue(obj)!;
        }

        //添加关联引擎触发事件
        public AddVeryEngineTriggerEvent(obj:VE_TriggerBehaviour, handle:()=>void, mode:VerySendMode)
        {
            if (!this._recordVeryEngine.ContainsKey(obj))
            {
                let index = this.count++ + 100;
                this._recordVeryEngine.Add(obj, index);
                this._veryEngineVoidEvent.Add(index,new action0());
                this._veryEngineVoidEvent.GetValue(index)!.add(handle);
                this._recordSendMode.Add(index, mode);
            }
        }

        //特殊类型的关联触发事件
        public AddVeryEngineTriggerSpecial(obj:VeryEngineNode , handle:()=>void)
        {
            if(!this._veryEngineVoidEvent.ContainsKey(obj))
                this._veryEngineVoidEvent.Add(obj,new action0());
            this._veryEngineVoidEvent.GetValue(obj)!.add(handle);
        }

        //添加关联引擎响应事件
        public AddVeryEngineActionEvent(obj:VE_ActionBehaviour, handle:(b1:boolean,b2:boolean)=>void, mode:VerySendMode)
        {
            if (!this._recordVeryEngine.ContainsKey(obj))
            {
                let index = this.count++ + 100;
                this._recordVeryEngine.Add(obj, index);
                this._veryEngineBoolEvent.Add(index, new action2<boolean,boolean>());
                this._veryEngineBoolEvent.GetValue(index)!.add(handle);
                this._recordSendMode.Add(index, mode);
            }
        }

        //添加网络事件观察者
        public AddObserverEvent( handle_type:SocketHandle,  call_back:(action:ByteBuffer)=>void)
        {
            if (!this._netMessageEventList.ContainsKey(handle_type))
            {
                this._netMessageEventList.Add(handle_type, new action1<ByteBuffer>());
            }
            this._netMessageEventList.GetValue(handle_type)!.add(call_back);
        }

        //删除网络事件观察者
        public removeObserver( handle_type:SocketHandle,  call_back:(buf:ByteBuffer)=>void)
        {
            if (this._netMessageEventList.ContainsKey(handle_type))
            {
                this._netMessageEventList.GetValue(handle_type)!.remove(call_back);
                if (this._netMessageEventList.GetValue(handle_type)!.count)
                {
                    this._netMessageEventList.Remove(handle_type);
                }
            }
        }
        //接收触发信号
        public AddTriggerMessage(index:number)
        {
            let tmpMessage = new VeryEngineMessage();
            tmpMessage.index = index;
            tmpMessage.value=ByteBuffer.Allocate(0);
            this.VeryEngineData.push(tmpMessage);
        }

        //接收特殊类型触发信号
        public AddTriggerSpecial(node:VeryEngineNode)
        {
            let tmpMessage = new VeryEngineMessage();
            tmpMessage.index = node;
            tmpMessage.value=ByteBuffer.Allocate(0);
            this.VeryEngineData.push(tmpMessage);
        }

        //接收响应信号
        public AddActionMessage(index:number, buf: ByteBuffer)
        {
            let tmpMessage = new VeryEngineMessage();
            tmpMessage.index = index;
            tmpMessage.value = buf;
            this.VeryEngineData.push(tmpMessage);
        }

        //接收变量信号
        public AddValMessage(index:number,  buf:ByteBuffer)
        {
            let tmpMessage = new VeryEngineMessage();
            tmpMessage.index = index;
            tmpMessage.value = buf;
            this.VeryEngineData.push(tmpMessage);
        }


        //接收普通信号（无需帧同步的信号）
        public AddObseverMessage(handle_type:SocketHandle,  buf?:ByteBuffer)
        {
            let callbackNetMessage = new CallbackNetMessage();
            callbackNetMessage.type = handle_type;
            if(buf!=undefined)
                callbackNetMessage.value = buf;
            else
                callbackNetMessage.value=ByteBuffer.Allocate(0);
            this.NetMessageData.push(callbackNetMessage);
        }


        public  AddUpdateEvent(update:()=>void)
        {
            if(this._upDate!=undefined)
                this._upDate.add(update);
        }

        public update()
        {
            if(MonoBehaviourMessageCenter.IsCreate)
            {
                while (this.NetMessageData.length > 0)
                {
                    let tmpNetMessageData = this.NetMessageData.shift()!;
                    if (this._netMessageEventList.ContainsKey(tmpNetMessageData.type))
                    {
                        //this._netMessageEventList.GetValue(tmpNetMessageData.type)!.run(tmpNetMessageData.value);
                        let obj=this._netMessageEventList.GetValue(tmpNetMessageData.type);
                        obj!.run(tmpNetMessageData.value);
                    }
                }
                while (this.VeryEngineData.length > 0)
                {
                    let tmpVeryEngineMessage = this.VeryEngineData.shift()!;
                    let tmpIndex = tmpVeryEngineMessage.index;
                    if (this._veryEngineVoidEvent.ContainsKey(tmpIndex))
                    {
                        let obj=this._veryEngineVoidEvent.GetValue(tmpIndex)!;
                        obj.run();
                    }
                    else if (this._veryEngineBoolEvent.ContainsKey(tmpIndex))
                    {
                        this._veryEngineBoolEvent.GetValue(tmpIndex)!.run(tmpVeryEngineMessage.value.ReadBoolean(), tmpVeryEngineMessage.value.ReadBoolean());
                    }
                    else if (this._veryEngineBufEvent.ContainsKey(tmpIndex))
                    {
                        this._veryEngineBufEvent.GetValue(tmpIndex)!.run(tmpVeryEngineMessage.value);
                    }
                    else
                    {
                        //Debug.LogWarning(tmpIndex);
                    }
                }
            }
        }
        public RuningNow(tmpIndex:number, buf:ByteBuffer)
        {
            if (this._veryEngineBufEvent.ContainsKey(tmpIndex))
            {
                this._veryEngineBufEvent.GetValue(tmpIndex)!.run(buf);
            }
            else if (this._veryEngineBoolEvent.ContainsKey(tmpIndex))
            {
                this._veryEngineBoolEvent.GetValue(tmpIndex)!.run(buf.ReadBoolean(), buf.ReadBoolean());
            }
        }
}