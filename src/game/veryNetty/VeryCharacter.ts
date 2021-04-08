
import { MonoBehaviourMessageCenter } from "./MonoBehaviourMessageCenter";
import { SocketHandle, VerySendMode, VeryEngineNode } from "./SocketBusiness";
import { ByteBuffer } from "./ByteBuffer";
import { SocketManager } from "./SocketManager";
import { VeryNettyPara } from "./VeryNettyPara";
import { Dictionary } from "../utility/dictionary";
import { Game } from "../game";
import { Exhibits } from "../exhibits";
import $ from "jquery";
import {VeryList,VeryString,VeryNumber,VeryBool,} from "../veryNetty/veryVariables";

export class VeryCharacter
{
    private _modelPath:string;
    private _modelName:string;
    private _person:BABYLON.AbstractMesh|BABYLON.UniversalCamera;
    private _virtual:BABYLON.Mesh;
    private _recordPos:BABYLON.Vector3;
    private _dirMoveDic={"up":false,"down":false,"left":false,"right":false};
    private _posInfoHeap:{time:number,dir:BABYLON.Vector3}[]=[];
    private _currentTarget:{time:number,dir:BABYLON.Vector3}|undefined;
    private _recordTarget:{time:number,dir:BABYLON.Vector3}|undefined;
    private _lastTarget:{time:number,dir:BABYLON.Vector3}|undefined;
    private _loadState=0;
    private  rTime=0;
    private _moveState=false;
    private _moveState2=false;
    private _moveCache=false;
    private mTime=0;
    private _button:BABYLON.GUI.Button;

    private static _allCharacters:Dictionary<number,VeryCharacter>=new Dictionary<number,VeryCharacter>();
    private static _myCharacterIndex:number;
    public static _scence:BABYLON.Scene;
    // private static _forceMove=false;
    private static _forceMove:number[]=[];
    private static _moveStart=false;
    private static _moveEnd=false;

    public static profile = new VeryString("profile", "");
    public static resumeProfile = new VeryList("personalProfile", new VeryString("", ""));
    private _message:BABYLON.GUI.TextBlock;
    private _mesh:BABYLON.TransformNode;
    public static _timer:any;
    private _msTimer:any;
    private _ballMesh:BABYLON.AbstractMesh;
    private static _moveType=1;

    private IsNotMove(tag){
        let result= !this._dirMoveDic["up"]&&!this._dirMoveDic["down"]&&!this._dirMoveDic["left"]&&!this._dirMoveDic["right"];
        if(tag)
        {
            if(result){
                this.rTime=new Date().getTime();
                this.time3=this.rTime;
                VeryCharacter._moveStart=true;
                VeryCharacter._moveEnd=false;
            }
        }
        else{
            if(result){
                VeryCharacter._moveEnd=true;
            }
        }

    }
    private time3=0;
    private vec3sDiff=BABYLON.Vector3.Zero();
    private timesRevise=0;


    public constructor(self:boolean,pos:BABYLON.Vector3,characterIndex:number){
        let that=this;
        if(VeryNettyPara.characterPath==undefined||VeryNettyPara.characterPath===""){
            console.error("人物模型位置信息未配置！！");
            return;
        }
        let tmpSplit=VeryNettyPara.characterPath.split("/|\\");

        this._modelPath=tmpSplit[0];
        this._modelName=tmpSplit[1];
        if(self){
            this.CreatVirtual(pos);
             VeryCharacter._scence.onKeyboardObservable.add(kbInfo => {
                if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN) {
                    if(kbInfo.event.keyCode === 87 ){
                        this.IsNotMove(true);
                        this._dirMoveDic["up"]=true;
                    }
                    else if(kbInfo.event.keyCode===83){
                        that.IsNotMove(true);
                        this._dirMoveDic["down"]=true;
                    }
                    if(kbInfo.event.keyCode === 65 ){
                        this.IsNotMove(true);
                        this._dirMoveDic["left"]=true;
                    }
                    else  if(kbInfo.event.keyCode === 68 ){
                        this.IsNotMove(true);
                        this._dirMoveDic["right"]=true;
                    }
                }
                if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYUP) {
                    if(kbInfo.event.keyCode === 87 ){
                        that._dirMoveDic["up"]=false;
                        that.IsNotMove(false);
                    }
                    else if(kbInfo.event.keyCode===83){
                        this._dirMoveDic["down"]=false;
                        this.IsNotMove(false);
                    }
                    if(kbInfo.event.keyCode === 65 ){
                        this._dirMoveDic["left"]=false;
                        this.IsNotMove(false);
                    }
                    else  if(kbInfo.event.keyCode === 68 ){
                        this._dirMoveDic["right"]=false;
                        this.IsNotMove(false);
                    }
                    
                }
            });
            VeryCharacter._scence.onBeforeRenderObservable.add(function(){
                if(that._virtual!=undefined&&that._person!=undefined){
                    let t=new Date().getTime();
                    let tmp=(VeryCharacter._scence.activeCamera as BABYLON.UniversalCamera).rotation;
                    let tmpV3=new BABYLON.Vector3(0,0,0)
                    if(that._dirMoveDic["up"]){
                        tmpV3=tmpV3.add(new BABYLON.Vector3(Math.sin(tmp.y),0,Math.cos(tmp.y)));
                    }
                    if(that._dirMoveDic["down"]){
                        tmpV3=tmpV3.add(new BABYLON.Vector3(-Math.sin(tmp.y),0,-Math.cos(tmp.y)));
                    }
                    if(that._dirMoveDic["left"]){
                        tmpV3=tmpV3.add(new BABYLON.Vector3(-Math.cos(tmp.y),0,Math.sin(tmp.y)));
                    }
                    if(that._dirMoveDic["right"]){
                        tmpV3=tmpV3.add(new BABYLON.Vector3(Math.cos(tmp.y),0,-Math.sin(tmp.y)));
                    }
                    if(tmpV3.length()!=0)
                    {
                        let tmpSpeed=(t-that.time3)/20*VeryNettyPara.moveSpeed;
                        tmpV3=tmpV3.normalize().multiplyByFloats(tmpSpeed,0,tmpSpeed);
                        tmpV3.y=-9.8;
                        let a:BABYLON.UniversalCamera;
                        that._virtual.moveWithCollisions(tmpV3);
                    }
                    that.time3=t;
                }
            });
        }
        VeryCharacter._scence.onBeforeRenderObservable.add(function () {
            let nowTime=new Date().getTime();
            if(that._moveState||that._moveState2&& that._person != undefined){
                if (that._posInfoHeap.length >0 && that._currentTarget === undefined) {
                    that._moveCache=true;
                    that.nextTarget.apply(that);
                }
                let timeDiff2=nowTime-that.mTime;
                if (that._currentTarget) {
                    if(that._lastTarget&&that._lastTarget.time!=0){
                        let vec3Diff=that._currentTarget.dir.multiplyByFloats(that._currentTarget.time,0,that._currentTarget.time)
                        .subtract(that._lastTarget.dir.multiplyByFloats(that._lastTarget.time,0,that._lastTarget.time));
                        let timeRevise=that._currentTarget.time-that._lastTarget.time;
                        that._lastTarget.time=0;
                        that.timesRevise=timeRevise+that.timesRevise;
                        that.vec3sDiff=that.vec3sDiff.add(vec3Diff);
                        while(that.timesRevise<=0)
                        {
                            that.nextTarget.apply(that);
                            if(!that._currentTarget)
                                break;
                            that.vec3sDiff=that.vec3sDiff.add(that._currentTarget.dir.multiplyByFloats(that._currentTarget.time,0,that._currentTarget.time));
                            that.timesRevise=that.timesRevise+that._currentTarget.time;
                        }
                        if(that._currentTarget!=null){
                            that._currentTarget.dir=that.vec3sDiff.multiplyByFloats(1/that.timesRevise,0,1/that.timesRevise);
                            that._currentTarget.time=that.timesRevise;
                            that.vec3sDiff=BABYLON.Vector3.Zero();
                            that.timesRevise=0;
                        }
                    }
                    if(that._currentTarget){
                        let targetTime=that._currentTarget.time-timeDiff2;
                        while(targetTime<=0&&that._currentTarget!=null){
                            that._person.position=that._person.position.add(that._currentTarget.dir.multiplyByFloats(that._currentTarget.time,0,that._currentTarget.time));
                            // console.log("1:"+that._currentTarget.dir.length()+"--"+that._currentTarget.time);
                            timeDiff2=-targetTime;
                            that.nextTarget.apply(that);
                            if(that._currentTarget!=null)
                                targetTime=that._currentTarget.time-timeDiff2;

                        }
                        if(that._currentTarget!=null){
                            that._person.position=that._person.position.add(that._currentTarget.dir.multiplyByFloats(timeDiff2,0,timeDiff2));
                            // console.log("2:"+that._currentTarget.dir.length()+"--"+timeDiff2);
                            that._currentTarget.time=targetTime;
                        }
                    }
                }
                if(!that._currentTarget&&that._moveCache&&that._lastTarget!=null){
                    that._person.position=that._person.position.add(that._lastTarget.dir.multiplyByFloats(timeDiff2,0,timeDiff2));
                    // console.log("3:"+that._lastTarget.dir.length()+"--"+timeDiff2+"--"+that._lastTarget.time);
                    that._lastTarget.time+=timeDiff2;
                }
            }
            that.mTime=nowTime;
        })
        this.CreatCharacter(pos,VeryNettyPara.characterRot,VeryNettyPara.characterScal,self,characterIndex);
        if(self){
            VeryCharacter.AddCustom();
            VeryCharacter._scence.onPointerObservable.add((info) => {
                if (info.type === BABYLON.PointerEventTypes.POINTERDOUBLETAP && info.event.button === 0) {
                    if (info.pickInfo && info.pickInfo.hit) {
                        for(let i=0;i<VeryCharacter._allCharacters.GetValues().length;i++){
                            if(VeryCharacter._allCharacters.GetValueByIndex(i).Isyou(info.pickInfo.pickedMesh)){
                                console.log('点击第'+VeryCharacter._allCharacters.GetKeyByIndex(i)+'号选手');
                                console.log(VeryNettyPara.haslogin)
                                //双击之后发送打招呼的消息
                                if(VeryNettyPara.haslogin){
                                    window.document.getElementsByClassName("oldMessage")[0].innerHTML = "您已打了个招呼";
                                    VeryCharacter.GetUserName.SendSingle(VeryCharacter._allCharacters.GetKeyByIndex(i));
                                    VeryCharacter._scence.onBeforeRenderObservable.add(function () {
                                        if((VeryCharacter._allCharacters.GetValueByIndex(i)) && VeryCharacter._allCharacters.GetValueByIndex(i)._mesh){
                                            (VeryCharacter._allCharacters.GetValueByIndex(i)._mesh.parent as BABYLON.Mesh).rotation.y = (VeryCharacter._scence.activeCamera as BABYLON.UniversalCamera).rotation.y;
                                        }
                                    })
                                    break;
                                }
                            }
                        }
                    }
                }
                //发送消息
                if(info.type === BABYLON.PointerEventTypes.POINTERTAP && info.event.button === 0){
                    $(".send").on("click",()=>{
                        let content = window.document.getElementsByClassName("inputContent")[0] as HTMLInputElement;
                        let message = window.document.getElementsByClassName("oldMessage")[0];
                        if(content.value.length >0 && VeryNettyPara.haslogin){
                            message.innerHTML = Exhibits.profileArray[0]+ ": " + content.value;
                            VeryCharacter.SendMessage.SendOthers(VeryCharacter._myCharacterIndex,content.value);
                            content.value = "";
                        } 
                    })
                }
            });
            //实例化在自己登录后展馆中的角色
            let aa:boolean = false;
            VeryCharacter._scence.onBeforeRenderObservable.add(function () {
                if (VeryNettyPara.haslogin && !aa && Exhibits.profileArray[0]) {
                    aa= true;
                    VeryCharacter.updateIDAfter.SendOthers(VeryCharacter._myCharacterIndex,Exhibits.profileArray[0]+ ","+Exhibits.profileArray[1]);
                }
                
            })
            
        }
        MonoBehaviourMessageCenter.Instance.AddUpdateEvent(this.sendPosInfo.bind(this));
    }

    public Isyou(virtual){
        if(this._person===virtual){
            return true;
        }
        else if(!virtual.parent){
            return false;
        }
        else if(virtual.parent===this._person){
            return true;
        }
        else{
            return this.Isyou(virtual.parent);
        }
    }
    public CreatVirtual(pos:BABYLON.Vector3){
        this._virtual= BABYLON.MeshBuilder.CreateSphere("角色",{diameter: 40, diameterY: VeryNettyPara.characterHigh},VeryCharacter._scence);
        this._virtual.visibility=0;
        this._virtual.position=new BABYLON.Vector3(pos.x,VeryNettyPara.characterHigh,pos.z);
        this._virtual.ellipsoid=new BABYLON.Vector3(8,80,8);
        this._virtual.ellipsoidOffset=new BABYLON.Vector3(0,80-VeryNettyPara.characterHigh,0);
        this._virtual.checkCollisions=true;
        this._virtual.isVisible = false;
    }

    private Destory(){
        if(this._person)
        this._person.dispose();
    }

    private CreatCharacter(pos:BABYLON.Vector3,rot:BABYLON.Vector3,scal:BABYLON.Vector3,self:boolean,characterIndex:number){
        let that=this;
        if(self){
            that._person=VeryCharacter._scence.activeCamera as BABYLON.UniversalCamera;
            VeryCharacter._scence.activeCamera.position.x=pos.x;
            VeryCharacter._scence.activeCamera.position.z=pos.z;
            that._loadState=2;
            if(VeryCharacter._moveType==1){
                that._person.parent=that._virtual;
                VeryCharacter._scence.activeCamera.position.x=0;
                VeryCharacter._scence.activeCamera.position.z=0;
                VeryCharacter._scence.activeCamera.position.y=-20;
            }
            // BABYLON.SceneLoader.ImportMesh("",this._modelPath,this._modelName,VeryCharacter._scence,function(newMeshes){
            //     if(newMeshes.length>0){
            //         newMeshes[0].parent=that._person;
            //         newMeshes[0].rotation=BABYLON.Vector3.Zero();
            //         newMeshes[0].scaling=scal;
            //         newMeshes[0].position=new BABYLON.Vector3(0,-100,100);
            //     }
            // });
        }
        else{
            if(pos){
                BABYLON.SceneLoader.ImportMesh("",this._modelPath,this._modelName,VeryCharacter._scence,function(newMeshes){
                    if(newMeshes.length>0){
                        that._person=newMeshes[0];
                        newMeshes[0].rotation=rot;
                        newMeshes[0].scaling=scal;
                        newMeshes[0].position=pos;
                        console.log(newMeshes[0].position,newMeshes[0].name,that._person.position)
                        newMeshes[0].isPickable = true;
                        newMeshes[1].isPickable = true;
                        newMeshes[2].isPickable = false;
                        newMeshes[2].isVisible = false;
                        newMeshes[1].visibility = 0.8;
                        let aa = Game.messagePanel(newMeshes[2].parent,"plane","游客",180, 180, 0, VeryCharacter._scence)
                        that._button = aa[0];
                        that._message = aa[1];
                        that._mesh = aa[2];
                        that._ballMesh = newMeshes[1];
                        //button
                        that._button.onPointerClickObservable.add(() => {
                            if (VeryNettyPara.haslogin && Exhibits.profileArray[0]) {
                                window.document.getElementsByClassName("oldMessage")[0].innerHTML = "你已发送交换名片请求";
                                VeryCharacter.SendExchangeNotice.SendSingle(characterIndex);
                            }
                        })
                    }
                    that._loadState=1;
                })
            }
        }
    }

    public static nextTurn(){
        VeryNettyPara.GameTurnStart = true;
        if(VeryCharacter._moveStart){
            // let buf=ByteBuffer.Allocate(2);
            // buf.WriteByte(SocketHandle.FrameMove);
            // buf.WriteBoolean(true);
            // SocketManager.Instance.PoolSendMsg(buf);
            VeryCharacter._moveStart=false;
        }
        if(VeryCharacter._moveEnd){
            let buf=ByteBuffer.Allocate(2);
            buf.WriteByte(SocketHandle.FrameMove);
            buf.WriteBoolean(false)
            SocketManager.Instance.PoolSendMsg(buf);
            VeryCharacter._moveEnd=false;
        }
        MonoBehaviourMessageCenter.Instance.NextTurn();
        SocketManager.Instance.SendMsgBase();
    }

    private nextTarget(){
        if(this._posInfoHeap.length>0){
            if(this._loadState!=0){
                if(this._loadState==2){
                    if(this._currentTarget!=null){
                        this._lastTarget=this._recordTarget;
                        this._lastTarget.time=0;
                    }
                    this._currentTarget=this._posInfoHeap.shift();
                    this._recordTarget={time:this._currentTarget.time,dir:this._currentTarget.dir};
                }
                else{
                    let count=this._posInfoHeap.length;
                    //模型加载完直接定位到最新位置
                    for(let i=0;i<count-1;i++){
                        this._currentTarget=this._posInfoHeap.shift();
                        this._recordTarget={time:this._currentTarget.time,dir:this._currentTarget.dir};
                        this._person.position=this._person.position.add(this._currentTarget.dir.multiplyByFloats(this._currentTarget.time,0,this._currentTarget.time));
                    }
                    if(count>1){
                        if(this._currentTarget!=null){
                            this._lastTarget=this._recordTarget;
                            
                            this._lastTarget.time=0;
                        }
                        this._currentTarget=this._posInfoHeap.shift();
                        this._recordTarget={time:this._currentTarget.time,dir:this._currentTarget.dir};
                    }
                    this._loadState=2;
                }
            }
        }
        else{
            if(this._moveState2){
                this._moveState2=false;
                if(this.timesRevise!=0){
                    this._person.position=this._person.position.add(this.vec3sDiff);
                    this.vec3sDiff=BABYLON.Vector3.Zero();
                    this.timesRevise=0
                }
                this._lastTarget=undefined;
            }
            this._currentTarget=undefined;
        }
    }

    private GetPlayIndex(play:VeryCharacter){
        let keys=VeryCharacter._allCharacters.GetKeys();
        for(let i=0;i<keys.length;i++){
            if(VeryCharacter._allCharacters.GetValue(keys[i])==play){
                return keys[i];
            }
        }
        return -1;
    }
    public static SetPosition(x:number,z:number,obj?){


            let buf =ByteBuffer.Allocate(29);

            let index=VeryCharacter._myCharacterIndex;
            let tmp:VeryCharacter=VeryCharacter._allCharacters.GetValue(index);
            tmp._recordPos.x=x;
            tmp._recordPos.z=z;
            tmp._virtual.position.x=x;
            tmp._virtual.position.z=z;
            if(VeryCharacter._moveType==0){
                tmp._person.position.x=x;
                tmp._person.position.z=z;
            }
            buf.WriteByte(SocketHandle.GameTurn);
            buf.WriteInt(VerySendMode.Other);
            buf.WriteByte(VeryEngineNode.Pos);
            if(index<0){
                console.log("当前玩家尚未计入在线统计中,请联系程序猿！");
            }
            else{
                buf.WriteInt(index);

                buf.WriteFloat(tmp._recordPos.x);
                buf.WriteFloat(tmp._recordPos.y);
                buf.WriteFloat(tmp._recordPos.z);
                SocketManager.Instance.PoolSendMsg(buf);
            }
            if(VeryCharacter._moveType==1)
            {
                tmp._person.parent=null;
                tmp._person.position=new BABYLON.Vector3(tmp._virtual.position.x,160,tmp._virtual.position.z);
            }
            if(obj){
                (tmp._person as BABYLON.UniversalCamera).setTarget(obj);
            }
            if(VeryCharacter._moveType==1)
            {
                tmp._person.parent=tmp._virtual;
                tmp._person.position=new BABYLON.Vector3(0,-20,0);
            }
    }
    private sendPosInfo(){
        if(this._virtual){
            if(!this._recordPos){
                let buf =ByteBuffer.Allocate(29);
                this._recordPos=this._virtual.position.clone();
                buf.WriteByte(SocketHandle.GameTurn);
                buf.WriteInt(VerySendMode.Other);
                buf.WriteByte(VeryEngineNode.Pos);
                //todo 角色识别
                let index=this.GetPlayIndex(this);
                if(index<0){
                    console.log("当前玩家尚未计入在线统计中,请联系程序猿！");
                }
                else{
                    buf.WriteInt(index);

                    buf.WriteFloat(this._recordPos.x);
                    buf.WriteFloat(this._recordPos.y);
                    buf.WriteFloat(this._recordPos.z);
                    SocketManager.Instance.PoolSendMsg(buf);
                }

            }
            else if(!this._recordPos.equalsWithEpsilon(this._virtual.position))
            {
                let nowTime=new Date().getTime();
                let timeDiff=nowTime-this.rTime;
                // console.log(timeDiff);
                if(timeDiff>20){
                    this.rTime=nowTime;
                    let dirDiff=this._virtual.position.subtract(this._recordPos).multiplyByFloats(1/timeDiff,1/timeDiff,1/timeDiff);
                    this._recordPos=this._virtual.position.clone();

                    let buf =ByteBuffer.Allocate(29);

                    buf.WriteByte(SocketHandle.GameTurn);
                    if(VeryCharacter._moveType==0)
                        buf.WriteInt(VerySendMode.All);
                    else if(VeryCharacter._moveType===1)
                        buf.WriteInt(VerySendMode.Other);
                    buf.WriteByte(VeryEngineNode.Move);
                    //todo 角色识别
                    let index=this.GetPlayIndex(this);
                    if(index<0){
                        console.log("当前玩家尚未计入在线统计中,请联系程序猿！");
                    }
                    else{
                        buf.WriteInt(index);

                        buf.WriteFloat(dirDiff.x);
                        buf.WriteFloat(dirDiff.y);
                        buf.WriteFloat(dirDiff.z);
                        buf.WriteInt(timeDiff);
                        SocketManager.Instance.PoolSendMsg(buf);
                    }
                }
            }

            if(VeryCharacter._forceMove.length!=0){
                let buf =ByteBuffer.Allocate(29);
                this._recordPos=this._virtual.position.clone();
                for(let i=0;i<VeryCharacter._forceMove.length;i++){
                    buf.WriteByte(SocketHandle.GameTurn);
                    buf.WriteInt(VeryCharacter._forceMove[i]);
                    buf.WriteByte(VeryEngineNode.Pos);
                    //todo 角色识别
                    let index=this.GetPlayIndex(this);
                    if(index<0){
                        console.log("当前玩家尚未计入在线统计中,请联系程序猿！");
                    }
                    else{
                        buf.WriteInt(index);

                        buf.WriteFloat(this._recordPos.x);
                        buf.WriteFloat(this._recordPos.y);
                        buf.WriteFloat(this._recordPos.z);
                        SocketManager.Instance.PoolSendMsg(buf);
                    }
                }
                VeryCharacter._forceMove=[];
            }
        }
    }

    public static AddBusiness(business:any){
        let node=business.Node;
        business.Send=function(...param){
            let buf = ByteBuffer.Allocate(300);
            buf.WriteByte(SocketHandle.GameTurn);
            buf.WriteInt(VerySendMode.All);
            buf.WriteByte(node);
            business.WriteValue(buf,...param);
            SocketManager.Instance.PoolSendMsg(buf);
        }
        business.SendOthers=function(...param){
            let buf = ByteBuffer.Allocate(300);
            buf.WriteByte(SocketHandle.GameTurn);
            buf.WriteInt(VerySendMode.Other);
            buf.WriteByte(node);
            business.WriteValue(buf,...param);
            SocketManager.Instance.PoolSendMsg(buf);
        }
        business.SendSingle=function(index,...param){
            let buf = ByteBuffer.Allocate(300);
            buf.WriteByte(SocketHandle.GameTurn);
            buf.WriteInt(index);
            buf.WriteByte(node);
            business.WriteValue(buf,...param);
            SocketManager.Instance.PoolSendMsg(buf);
        }
        VeryCharacter.customAccept[node]=function(buf){
            business.Accept(buf);
        }
    }
    private static customAccept:{[index:number]:(buf:ByteBuffer)=>void}={};
    public static Aceppt(buf:ByteBuffer){
        let mode= buf.ReadInt();
        let type = buf.ReadByte();
        if (type == VeryEngineNode.Pos)
        {
            let index = buf.ReadInt();
            let x=buf.ReadFloat(); 
            let y=buf.ReadFloat(); 
            let z=buf.ReadFloat();
            
            if(!VeryCharacter._allCharacters.ContainsKey(index)){
                VeryCharacter._allCharacters.Add(index,new VeryCharacter(false,new BABYLON.Vector3(x,VeryNettyPara.characterPos.y,z),index));
            }
            else{
                VeryCharacter._allCharacters.GetValue(index)._person.position=new BABYLON.Vector3(x,VeryNettyPara.characterPos.y,z)
            }
        }
        else if (type == VeryEngineNode.Move)
        {
            let index = buf.ReadInt();
            let x=buf.ReadFloat(); 
            let y=buf.ReadFloat(); 
            let z=buf.ReadFloat();
            let rtime=buf.ReadInt();
            if(VeryCharacter._allCharacters.ContainsKey(index)){
                let tmp={time:rtime,dir:new BABYLON.Vector3(x,y,z)};
                VeryCharacter._allCharacters.GetValue(index)._posInfoHeap.push(tmp);
                VeryCharacter._allCharacters.GetValue(index)._moveState=true;
            }
            // else{
            //     VeryCharacter._allCharacters.Add(index,new VeryCharacter(false,new BABYLON.Vector3(x,VeryNettyPara.characterPos.y,z),index));
            // }
        }
        else if(type===VeryEngineNode.MoveSate){
            let index=buf.ReadInt();
            let result=buf.ReadBoolean();
            if(VeryCharacter._allCharacters.ContainsKey(index)){
                if(result)
                    VeryCharacter._allCharacters.GetValue(index)._moveState=true;
                else{
                    VeryCharacter._allCharacters.GetValue(index)._moveState=false;
                    VeryCharacter._allCharacters.GetValue(index)._moveCache=false;
                    VeryCharacter._allCharacters.GetValue(index)._moveState2=true;
                }
            }
        }
        else if(type===VeryEngineNode.Character){
            let index = buf.ReadInt();
            let self=(mode!=0)
            let x=buf.ReadFloat();
            let y=buf.ReadFloat();
            let z=buf.ReadFloat();
            
            //如果自身登录，需要将实例化所有已登录的角色
            if(self){
                
            }
            //如果非自身登录，需要将自己的位置信息发给服务器
            else{
                VeryCharacter._forceMove.push(index);
                //实例化在自己登录前展馆中的角色
                VeryCharacter.updateIDBefore.SendSingle(index);
            }
            let newCharacter=new VeryCharacter(self,new BABYLON.Vector3(x,y,z),index);
            if(self){
                VeryCharacter._myCharacterIndex=index;
            }
            VeryCharacter._allCharacters.Add(index,newCharacter);
        }
        else if(type===VeryEngineNode.Exit){
            let index = buf.ReadInt();
            if(VeryCharacter._allCharacters.ContainsKey(index)){
                VeryCharacter._allCharacters.GetValue(index).Destory();
                VeryCharacter._allCharacters.Remove(index);
            }
            
        }
        else if(VeryCharacter.customAccept[type]){
            VeryCharacter.customAccept[type](buf);
        }
    }


    public static SendCreatCharacterRes(pos:BABYLON.Vector3){
        let buf = ByteBuffer.Allocate(200);
        buf.WriteByte(SocketHandle.JoinGame);
        buf.WriteInt(-1);
        buf.WriteString(VeryNettyPara.ProjectID);
        buf.WriteBoolean(false);
        buf.WriteFloat(pos.x);
        buf.WriteFloat(pos.y);
        buf.WriteFloat(pos.z);
        SocketManager.Instance.SendMsg(buf);
    }

    public static AddCustom(){
        VeryCharacter.AddBusiness(VeryCharacter.GetUserId);
        VeryCharacter.AddBusiness(VeryCharacter.GetUserName);
        VeryCharacter.AddBusiness(VeryCharacter.Keydown);
        VeryCharacter.AddBusiness(VeryCharacter.SendExchangeNotice);
        VeryCharacter.AddBusiness(VeryCharacter.SendMessage);
        VeryCharacter.AddBusiness(VeryCharacter.updateIDBefore);
        VeryCharacter.AddBusiness(VeryCharacter.updateIDAfter);
        VeryCharacter.AddBusiness(VeryCharacter.SendExchangeBack);
        VeryCharacter.AddBusiness(VeryCharacter.refuseExchange);
    }
    public static GetUserId:any={
        Node:4,
        WriteValue:(buf:ByteBuffer,index:number)=>{
            buf.WriteString(VeryNettyPara.UserID);
            buf.WriteInt(index);
        },
        Accept:(buf)=>{
            let userId=buf.ReadString();
            console.log(userId+"向你打招呼",buf.ReadInt());
            //读取对应id下个人信息
            SocketManager.Instance.GetValuesByID([VeryCharacter.profile],true,userId,130,(()=>{
                console.log(VeryCharacter.profile.value)
            }))
        }
    }

    public static Keydown:any={
        Node:5,
        WriteValue:(buf:ByteBuffer,index:number,dir:string)=>{
            buf.WriteInt(index);
            buf.WriteString(dir);
        },
        Accept:(buf)=>{
            let index=buf.ReadInt();
            let dir=buf.ReadString();
            console.log(index+"号选手："+dir);
        }
    }

    public static GetUserName:any={
        Node:6,
        WriteValue:(buf:ByteBuffer)=>{
            buf.WriteString(Exhibits.profileArray[0]);
        },
        Accept:(buf)=>{
            let userName=buf.ReadString();
            let message = window.document.getElementsByClassName("oldMessage")[0];
            if(VeryNettyPara.haslogin){
                message.innerHTML = userName+"向你打招呼";
            }
        }
    }

    public static SendExchangeNotice:any={
        Node:7,
        WriteValue:(buf:ByteBuffer)=>{
            buf.WriteString(VeryNettyPara.UserID+","+Exhibits.profileArray[0]+","+VeryCharacter._myCharacterIndex);
        },
        Accept:(buf)=>{
            let string=buf.ReadString().split(",");
            let id = string[0];
            let userName = string[1];
            let exchange = window.document.getElementsByClassName("exchange")[0] as HTMLElement;
            let exchangeName = window.document.getElementsByClassName("exchange-name")[0] as HTMLElement;
            if(VeryNettyPara.haslogin){
                exchange.style.display = "block";
                exchangeName.innerHTML = userName;
                //同意之后的操作
                $(".exchange-agree").on("click",()=>{
                    SocketManager.Instance.GetValuesByID([VeryCharacter.profile],true,id,130,(()=>{
                        console.log(VeryCharacter.profile.value);
                        let index = VeryCharacter.resumeProfile.indexOf(VeryCharacter.profile)
                        if (index === -1) {
                            //添加数据到存储数组中
                            VeryCharacter.resumeProfile.add(VeryCharacter.profile);
                            console.log(VeryCharacter.resumeProfile.value)
                            SocketManager.Instance.OperateOnlyPersonList(VeryCharacter.resumeProfile, VeryCharacter.profile, true, "add");
                            //更新当时通讯录中页面
                            let resume = VeryCharacter.profile.value.split(",")
                            $("#cardcase-box-main").append(`
                            <li class="business-card">
                            <div class="icon-mingpiantouxiang-bg">
                                <svg class="icon icon-mingpiantouxiang-01" aria-hidden="true">
                                <use xlink:href="#icon-mingpiantouxiang-01"></use>
                                </svg>
                            </div>
                            <div class="business-card-content">
                                <p class="business-card-name">${resume[0]}</p>
                                <p>
                                <svg class="icon icon-shouji" aria-hidden="true">
                                    <use xlink:href="#icon-shouji"></use>
                                </svg>
                                <span class="business-card-phone">${resume[2]}</span>
                                </p>
                            </div>
                            <div class="redirect-exhibition"><span>${resume[4]}</span></div>
                            <span class="information">${resume}</span>
                            </li>
                            `);
                            window.document.getElementsByClassName("oldMessage")[0].innerHTML = resume[0]+"的名片已保存至通讯录"

                            $(".business-card").on("click",function(){
                                //close all
                                $(
                                  ".diy-model-change,.operating-instructions-box,#bg,.profile-box,.cardcase-box,.share-box,.profile-edit,.board-box,.diy-bgm,.diy-des,.diy-common,.diy-big,.diy-pic,.diy-pic-link,.diy-pic-video,.diy-pic-model,.diy-pic-360-link,.diy-album,.diy-album-add-box,.diy-pic-pdf,.diy-video,.diy-tietu,.diy-question,.diy-model,.diy-model-model,.diy-material"
                                ).hide();
                                $("#bg").show();
                                const ulBtnNode = $(
                                  ".share-btn,.map-btn,.profile-btn,.signboard-btn,.common-btn,.bgm-btn,.commentary-btn,.caizhitihuan-btn"
                                );
                                ulBtnNode.removeClass("btn-selected");
                                //update resume-box
                                let resumeMessage = $(this).find(".information").text().split(",");
                                $(".resume-box-name").text(resumeMessage[0]);
                                if (resumeMessage[1] === "f") {
                                  $("resume-box-sex").toggleClass("icon-nan");
                                  $("resume-box-sex").toggleClass("icon-nv");
                                }
                                $(".resume-box-email-text").text(resumeMessage[3]);
                                $(".resume-box-company-text").text(resumeMessage[4]);
                                $(".resume-box-position-text").text(resumeMessage[5]);
                                $(".resume-box-phone-text").text(resumeMessage[2]);
                                $(".resume-box").show();
                            })
                        } else {
                            window.document.getElementsByClassName("oldMessage")[0].innerHTML = userName+"的名片已存在";
                        }
                    }))
                    VeryCharacter.SendExchangeBack.SendSingle(string[2]);
                })
                //拒绝之后的操作
                $(".exchange-refuse").on("click", () => {
                    window.document.getElementsByClassName("oldMessage")[0].innerHTML = "您已拒绝和"+userName+"交换名片";
                    VeryCharacter.refuseExchange.SendSingle(string[2]);
                  });
            }
        }
    }

    public static SendExchangeBack:any={
        Node:10,
        WriteValue:(buf:ByteBuffer)=>{
            buf.WriteString(VeryNettyPara.UserID+","+Exhibits.profileArray[0]+","+VeryCharacter._myCharacterIndex);
        },
        Accept:(buf)=>{
            let string=buf.ReadString().split(",");
            let id = string[0];
            let userName = string[1];
            if(VeryNettyPara.haslogin){
                //同意之后的操作
                SocketManager.Instance.GetValuesByID([VeryCharacter.profile],true,id,131,(()=>{
                    console.log(VeryCharacter.profile.value);
                    let index = VeryCharacter.resumeProfile.indexOf(VeryCharacter.profile)
                    if (index === -1) {
                        //添加数据到存储数组中
                        VeryCharacter.resumeProfile.add(VeryCharacter.profile);
                        console.log(VeryCharacter.resumeProfile.value)
                        SocketManager.Instance.OperateOnlyPersonList(VeryCharacter.resumeProfile, VeryCharacter.profile, true, "add");
                        //更新当时通讯录中页面
                        let resume = VeryCharacter.profile.value.split(",")
                        $("#cardcase-box-main").append(`
                        <li class="business-card">
                        <div class="icon-mingpiantouxiang-bg">
                            <svg class="icon icon-mingpiantouxiang-01" aria-hidden="true">
                            <use xlink:href="#icon-mingpiantouxiang-01"></use>
                            </svg>
                        </div>
                        <div class="business-card-content">
                            <p class="business-card-name">${resume[0]}</p>
                            <p>
                            <svg class="icon icon-shouji" aria-hidden="true">
                                <use xlink:href="#icon-shouji"></use>
                            </svg>
                            <span class="business-card-phone">${resume[2]}</span>
                            </p>
                        </div>
                        <div class="redirect-exhibition"><span>${resume[4]}</span></div>
                        <span class="information">${resume}</span>
                        </li>
                        `);
                        window.document.getElementsByClassName("oldMessage")[0].innerHTML = resume[0]+"的名片已保存至通讯录"

                        $(".business-card").on("click",function(){
                            //close all
                            $(
                              ".diy-model-change,.operating-instructions-box,#bg,.profile-box,.cardcase-box,.share-box,.profile-edit,.board-box,.diy-bgm,.diy-des,.diy-common,.diy-big,.diy-pic,.diy-pic-link,.diy-pic-video,.diy-pic-model,.diy-pic-360-link,.diy-album,.diy-album-add-box,.diy-pic-pdf,.diy-video,.diy-tietu,.diy-question,.diy-model,.diy-model-model,.diy-material"
                            ).hide();
                            $("#bg").show();
                            const ulBtnNode = $(
                              ".share-btn,.map-btn,.profile-btn,.signboard-btn,.common-btn,.bgm-btn,.commentary-btn,.caizhitihuan-btn"
                            );
                            ulBtnNode.removeClass("btn-selected");
                            //update resume-box
                            let resumeMessage = $(this).find(".information").text().split(",");
                            $(".resume-box-name").text(resumeMessage[0]);
                            if (resumeMessage[1] === "f") {
                              $("resume-box-sex").toggleClass("icon-nan");
                              $("resume-box-sex").toggleClass("icon-nv");
                            }
                            $(".resume-box-email-text").text(resumeMessage[3]);
                            $(".resume-box-company-text").text(resumeMessage[4]);
                            $(".resume-box-position-text").text(resumeMessage[5]);
                            $(".resume-box-phone-text").text(resumeMessage[2]);
                            $(".resume-box").show();
                        })
                    } else {
                        window.document.getElementsByClassName("oldMessage")[0].innerHTML = userName+"的名片已存在"
                    }
                    
                }))
            }
        }
    }

    public static refuseExchange:any={
        Node:11,
        WriteValue:(buf:ByteBuffer)=>{
            buf.WriteString(VeryNettyPara.UserID+","+Exhibits.profileArray[0]+","+VeryCharacter._myCharacterIndex);
        },
        Accept:(buf)=>{
            let string=buf.ReadString().split(",");
            let id = string[0];
            let userName = string[1];
            if(VeryNettyPara.haslogin){
                window.document.getElementsByClassName("oldMessage")[0].innerHTML = userName+"拒绝了您的名片交换请求";
            }
        }
    }

    public static SendMessage:any={
        Node:8,
        WriteValue:(buf:ByteBuffer,index:number,message:string)=>{
            buf.WriteInt(index);
            buf.WriteString(message);
        },
        Accept:(buf)=>{
            let index=buf.ReadInt();
            let message=buf.ReadString();
            if(VeryCharacter._allCharacters.GetValue(index)._msTimer){
                clearTimeout(VeryCharacter._allCharacters.GetValue(index)._msTimer);
            }
            VeryCharacter._allCharacters.GetValue(index)._message.text = "  "+message+"  ";
            VeryCharacter._allCharacters.GetValue(index)._msTimer = setTimeout(() => {
                VeryCharacter._allCharacters.GetValue(index)._message.text ="";
            }, 5000);
        }
    }
    
    public static updateIDBefore: any = {
        Node: 9,
        WriteValue: (buf: ByteBuffer) => {
            buf.WriteInt(VeryCharacter._myCharacterIndex);
            let name: string;
            if (Exhibits.profileArray[0]) {
                name = Exhibits.profileArray[0]+ ","+Exhibits.profileArray[1];
            } else name = VeryNettyPara.UserName + "," +"m";
            buf.WriteString(name);
        },
        Accept: (buf) => {
            let index = buf.ReadInt();
            let str = buf.ReadString().split(",");
            let bb:boolean = false;
            VeryCharacter._scence.onBeforeRenderObservable.add(() => {
                if (VeryCharacter._allCharacters.GetValue(index) && VeryCharacter._allCharacters.GetValue(index)._button &&!bb) {
                    bb=true;
                    VeryCharacter._allCharacters.GetValue(index)._button.textBlock.text = str[0];
                    if(str[1]==="f"){
                        let ballMaterial = (VeryCharacter._allCharacters.GetValue(index)._ballMesh.material) as BABYLON.StandardMaterial;
                        ballMaterial.diffuseTexture = new BABYLON.Texture("./model/1/2.jpg",VeryCharacter._scence);
                        VeryCharacter._allCharacters.GetValue(index)._button.background = "#E500FF65";
                    }
                }
            })


        }
    }

    public static updateIDAfter: any = {
        Node: 12,
        WriteValue: (buf: ByteBuffer,index:number,str:string) => {
            buf.WriteInt(index);
            buf.WriteString(str);
        },
        Accept: (buf) => {
            let index = buf.ReadInt();
            let str = buf.ReadString().split(",");
            let bb:boolean = false;
            VeryCharacter._scence.onBeforeRenderObservable.add(() => {
                if (VeryCharacter._allCharacters.GetValue(index) && VeryCharacter._allCharacters.GetValue(index)._button &&!bb) {
                    bb=true;
                    VeryCharacter._allCharacters.GetValue(index)._button.textBlock.text = str[0];
                    if(str[1]==="f"){
                        let ballMaterial = (VeryCharacter._allCharacters.GetValue(index)._ballMesh.material) as BABYLON.StandardMaterial;
                        ballMaterial.diffuseTexture = new BABYLON.Texture("./model/1/2.jpg",VeryCharacter._scence);
                        VeryCharacter._allCharacters.GetValue(index)._button.background = "#E500FF65";
                    }
                }
            })
        }
    }

}