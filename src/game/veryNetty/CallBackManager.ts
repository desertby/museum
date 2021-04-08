import { ByteBuffer } from "./ByteBuffer";
import { Dictionary } from "./../utility/dictionary";
import { action1 } from "./../utility/action";

export class CallBackManager {
    private static _veryAct2Number = new Dictionary<string, number>();
    private static _callBackAction: Dictionary<number, action1<ByteBuffer>> = new Dictionary<number, action1<ByteBuffer>>();

    private static _recordDirectSend=new Array<number>();

    public static AddCallBackRecord(name: string) {
        if (!CallBackManager._veryAct2Number.ContainsKey(name)) {
            let index = CallBackManager._veryAct2Number.count + 10;
            CallBackManager._veryAct2Number.Add(name, index);
        }
    }
    public static AddCallBackAction(para: number | string, action: (action1: ByteBuffer) => void,isDirect:boolean) {
        let index=0;
        if (typeof (para) === "number") {
            index=para;
        }
        else {
            let num = CallBackManager._veryAct2Number.GetValue(para);
            if (num != null) {
                index=num;
            }
            else
            {
                return -1;
            }
        }
        if(isDirect){
            if(CallBackManager._recordDirectSend.indexOf(index)>=0){
                console.log("少侠莫急，慢慢按"+index);
                return -1;
            }
            else{
                CallBackManager._recordDirectSend.push(index);
            }
        }
        if (!CallBackManager._callBackAction.ContainsKey(index)) {
            CallBackManager._callBackAction.Add(index, new action1<ByteBuffer>());
            if(isDirect)
            {
                CallBackManager._callBackAction.GetValue(index)!.add(function(){
                    //console.log("回调完成，少侠可以继续按了"+index);
                    CallBackManager.RemoveDirectSend(index);
                });
            }
        }
        CallBackManager._callBackAction.GetValue(index)!.add(action);
        return index;
    }
    public static IsExitDirectSend(index:number):boolean{
        return CallBackManager._recordDirectSend.indexOf(index)>=0;
    }
    public static RemoveDirectSend(index:number)
    {
        let i=CallBackManager._recordDirectSend.indexOf(index)
        if(i>=0){
            CallBackManager._recordDirectSend.splice(i,1);
        }
    }
    public static CallBackAceppt(buf: ByteBuffer) {
        let index = buf.ReadInt();
        if (CallBackManager._callBackAction.ContainsKey(index)) {
            let obj = CallBackManager._callBackAction.GetValue(index)!;
            obj.run(buf);
        }
    }

    public static BackMessage(index: number) {
        switch (index) {
            case 1:
                return "创建房间发生错误，错误代码001";
            case 2:
                return "创建房间发生错误，房间名已存在";
            case 3:
                return "加入房间发生错误，错误代码003";
            case 4:
                return "加入房间发生错误，人数已满";
            case 5:
                return "加入房间发生错误，房间名不存在";
            case 6:
                return "账号登录发生错误，登录人数超过节点";
            case 7:
                return "账号登录发生错误，账号密码不符";
            case 8:
                return "发送验证码失败";
            case 9:
                return "注册失败";
            case 10:
                return "数组添加单元，数据库中该数组不存在";
            case 11:
                return "账号已存在";
            default:
                return "返回信息类型不存在!";
        }
    }
}