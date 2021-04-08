import { MonoBehaviourMessageCenter } from "./MonoBehaviourMessageCenter";
import { SocketHandle } from "./SocketBusiness";
import { CallBackManager } from "./CallBackManager";
import { VeryNettyPara } from "./VeryNettyPara";
import { DataBuffer, SocketData, Constants } from "./DataBuffer";
import { ByteBuffer } from "./ByteBuffer";
import { BitConverter } from "../utility/BitConverter";
import { action1 } from "../utility/action";
import { IVeryVar } from "./IVeryVar";
import { NettyNumber } from "./NettyNumber";
import { VeryNumber, VeryList } from "./veryVariables";
import { qsPost,jsonPost, qsListPost } from "./axios";
import { VeryCharacter } from "./VeryCharacter";
import { Game } from "../game";
import { Exhibits } from "../exhibits";
export class SocketManager {
  private static _instance: SocketManager | null = null;

  public static get Instance() {
    if (SocketManager._instance == null) {
      SocketManager._instance = new SocketManager();
    }
    return SocketManager._instance;
  }

  private constructor() {
    this.GetProjectNetID();
    MonoBehaviourMessageCenter.Instance.AddObserverEvent(SocketHandle.CallBack,CallBackManager.CallBackAceppt);
    MonoBehaviourMessageCenter.Instance.AddObserverEvent(SocketHandle.Valid,this.ValidUser);

    MonoBehaviourMessageCenter.Instance.AddObserverEvent(SocketHandle.GameTurn,VeryCharacter.Aceppt);
    MonoBehaviourMessageCenter.Instance.AddObserverEvent(SocketHandle.NextTurn,VeryCharacter.nextTurn);
  }

  private ValidUser(buf: ByteBuffer) {
    let isValid = buf.ReadBoolean();
    if (isValid) {
      SocketManager._isConnected = true;
      console.log("连接成功");
      SocketManager.Instance.connectEvent.run(true);
      if(SocketManager.isPTP){
        const pos = new BABYLON.Vector3(Exhibits.assembleData['lobby'][0].position[0], Exhibits.assembleData['lobby'][0].position[1], Exhibits.assembleData['lobby'][0].position[2]);
        const rot = new BABYLON.Vector3(Exhibits.assembleData['lobby'][0].rotation[0], Exhibits.assembleData['lobby'][0].rotation[1], Exhibits.assembleData['lobby'][0].rotation[2]);
        VeryNettyPara.characterPos = pos;
        VeryNettyPara.characterRot = rot;
        VeryCharacter.SendCreatCharacterRes(VeryNettyPara.characterPos);
      }
    } else {
      console.log("非法用户，禁止登录");
    }
  }
  private GetProjectNetID() {
    //    if(File.Exists(Application.streamingAssetsPath+"/VeryNettyID.txt"))
    //    {
    //    VeryNettyPara.ProjectID="software0";
    //    }
  }
  private _currIP!: string;
  private _currPort!: number;

  public static isPTP:boolean =false;

  private static _isConnected = false;
  public static get IsConnceted() {
    return SocketManager._isConnected;
  }

  private clientSocket: WebSocket | null = null;

  private static _databuffer = new DataBuffer();

  private static _socketData = new SocketData();

  /// <summary>
  /// 断开
  /// </summary>
  private close() {
    if (!SocketManager._isConnected) return;

    SocketManager._isConnected = false;
    this.SendMsg(SocketHandle.Exit);

    if (this.clientSocket != null && this.clientSocket.readyState == 1) {
      this.clientSocket.close();
      this.clientSocket = null;
    }
  }
  private OnClose() {
    this.close();
  }
  private connectEvent: action1<boolean> = new action1<boolean>();
  private OnError(e: Event) {
    console.error("[ERROR] " + e.type);
    this.connectEvent.run(false);
    this.close();
  }

  private ReConnect() {}

  public AddConnectEvent(event: (action: boolean) => void) {
    this.connectEvent.add(event);
  }

  /// <summary>
  /// 连接
  /// </summary>
  private onConnet() {
    try {
      this.clientSocket = new WebSocket(
        "ws://" + this._currIP + ":" + this._currPort + "/ws"
      );
      this.clientSocket.onopen = this.onConnectSucess.bind(this);
      this.clientSocket.onclose = this.OnClose;
      this.clientSocket.onmessage = this.onReceiveSocket;
      this.clientSocket.onerror = this.OnError;
      this.clientSocket.binaryType = "arraybuffer";
    } catch (e) {
      console.error(e);
      this.onConnectFail();
    }
  }

  private onConnectSucess() {
    let byteValue = ByteBuffer.Allocate(1024);
    this.WriteObject(
      byteValue,
      NettyNumber.CreatNettyNumber(SocketHandle.Valid, "byte")
    );
    this.WriteObject(byteValue, NettyNumber.CreatNettyNumber(841483552, "int"));
    this.SendMsg(byteValue);
  }

  private onConnectFail() {
    this.close();
  }

  /// <summary>
  /// 接受网络数据
  /// </summary>
  private onReceiveSocket(e: MessageEvent) {
    try {
      let result = new Uint8Array(e.data);
      let num: number[] = new Array();
      for (let i = 0; i < result.length; i++) {
        num.push(result[i]);
      }
      SocketManager._databuffer.AddBuffer(num); //将收到的数据添加到缓存器中
      while (SocketManager._databuffer.GetData(SocketManager._socketData)) {
        //取出一条完整数据
        let socketBuf = ByteBuffer.Allocate(SocketManager._socketData.Data);
        let socketHandle = SocketManager._socketData.TagName;
        // if(socketHandle!=SocketHandle.NextTurn)
        // {
        //     console.log(socketHandle+":"+SocketManager._socketData.Data);
        // }
        //锁死消息中心消息队列，并添加数据
        MonoBehaviourMessageCenter.Instance.AddObseverMessage(
          socketHandle,
          socketBuf
        );
      }
    } catch (e) {
      if (this.clientSocket != null) {
        this.clientSocket.close();
        this.clientSocket = null;
      }
    }
  }

  /// <summary>
  /// 合并协议，数据
  /// </summary>
  /// <param name="_protocalType"></param>
  /// <param name="_data"></param>
  /// <returns></returns>
  private DataToBytes(_data: number[]): number[] {
    let buffLength = BitConverter.GetBytesInt32(
      Constants.HEAD_DATA_LEN + _data.length
    );
    let tmpBuff = new Array<number>(Constants.HEAD_DATA_LEN + _data.length);
    this.Copy(buffLength, 0, tmpBuff, 0, Constants.HEAD_DATA_LEN); //缓存总长度
    this.Copy(_data, 0, tmpBuff, Constants.HEAD_DATA_LEN, _data.length); //协议数据
    return tmpBuff;
  }

  public Copy(
    origin: number[],
    startIndex: number,
    dest: number[],
    start: number,
    length: number
  ) {
    for (let i = 0; i < length; i++) {
      dest[i + start] = origin[i + startIndex];
    }
  }

  /// <summary>
  /// 连接服务器
  /// </summary>
  /// <param name="_currIP"></param>
  /// <param name="_currPort"></param>
  public Connect(_currIP: string, _currPort: number) {
    if (!SocketManager.IsConnceted) {
      this._currIP = _currIP;
      this._currPort = _currPort;
      this.onConnet();
    }
  }

  private _sendPool: number[] = new Array(0);

  /// <summary>
  /// 以池的方式间隔发送消息基本方法
  /// </summary>
  public SendMsgBase() {
    if (this.clientSocket == null || this.clientSocket.readyState != 1) {
      this.ReConnect();
      return;
    }
    // Debug.Log("")
    if (this._sendPool == null || this._sendPool.length == 0) {
      this.SendMsg(SocketHandle.NextTurn);
    } else {
      this.Send(this._sendPool);
      this._sendPool = new Array(0);
    }
  }

  /// <summary>
  /// 直接发送基本数据
  /// </summary>
  /// <param name="_data"></param>
  public SendMsg(_data: number[] | SocketHandle | ByteBuffer) {
    if (this.clientSocket == null || this.clientSocket.readyState != 1) {
      this.ReConnect();
      return;
    }
    let data: number[] = new Array();
    if (typeof _data === "number") {
      data.push(_data);
    } else if (_data instanceof ByteBuffer) {
      data = _data.ToBytes();
    } else {
      data = _data;
    }
    let _msgdata = this.DataToBytes(data);
    this.Send(_msgdata);
  }

  private Send(_data: number[]) {
    let buf = ByteBuffer.Allocate(_data);
    if (this.clientSocket != null) this.clientSocket.send(buf.ToArray());
  }

  /// <summary>
  /// 以池方式发送
  /// </summary>
  /// <param name="_byteStreamBuff"></param>
  public PoolSendMsg(_byteStreamBuff: ByteBuffer | number[]) {
    if (VeryNettyPara.GameTurnStart) {
      let _msgdata: number[];
      if (_byteStreamBuff instanceof ByteBuffer) {
        _msgdata = this.DataToBytes(_byteStreamBuff.ToBytes());
      } else {
        _msgdata = this.DataToBytes(_byteStreamBuff);
      }
      let tmp = new Array<number>(this._sendPool.length + _msgdata.length);
      this.Copy(this._sendPool, 0, tmp, 0, this._sendPool.length);
      this.Copy(_msgdata, 0, tmp, this._sendPool.length, _msgdata.length);
      this._sendPool = tmp;
    }
  }

  public PoolSendMsg2(_byteStreamBuff: ByteBuffer, ...para: string[]) {
    let buf = ByteBuffer.Allocate(1024);
    for (let i = 0; i < para.length; i++) {
      buf.WriteString(para[i]);
    }
    buf.Write(_byteStreamBuff);
    this.PoolSendMsg(buf);
  }

  private SendMsg2(_byteStreamBuff: ByteBuffer, ...para: string[]) {
    let buf = ByteBuffer.Allocate(1024);
    for (let i = 0; i < para.length; i++) {
      buf.WriteString(para[i]);
    }
    buf.Write(_byteStreamBuff);
    this.SendMsg(buf);
  }

  public CreatCallbackPromise(
    fullname: string | number,
    socketHandle: NettyNumber,
    ...value: any[]
  ): Promise<ByteBuffer> {
    let byteValue = ByteBuffer.Allocate(1024);
    let isDirect = true;
    let index = -1;
    let promise = new Promise<ByteBuffer>(
      function (resolve) {
        index = CallBackManager.AddCallBackAction(fullname, resolve, isDirect);
        //tode reject  Callback里面需要包含服务器返回错误时，做reject处理
        if (index >= 0) {
          this.WriteObject(byteValue, socketHandle);
          byteValue.WriteInt(index);
          for (let i = 0; i < value.length; i++) {
            this.WriteObject(byteValue, value[i]);
          }
          if (!isDirect) this.PoolSendMsg(byteValue);
          else {
            this.SendMsg(byteValue);
          }
        }
      }.bind(this)
    );

    return promise;
  }

  private WriteObject(buf: ByteBuffer, value: any, tag = false) {
    if (typeof value === "string") {
      buf.WriteString(value);
    } else if (typeof value === "boolean") {
      buf.WriteBoolean(value);
    } else if (value instanceof NettyNumber) {
      (value as NettyNumber).WirteNumbr(buf);
    } else if (this.IsIVeryVal(value)) {
      buf.WriteString(value.name); //变量名
      let childBuf = value.GetBytes();
      if (tag) {
        buf.WriteInt(childBuf.ReadableBytes());
      }
      buf.Write(childBuf); //记录的内容值二进制方式记录
    } else if (value instanceof Array) {
      for (let j = 0; j < value.length; j++) {
        this.WriteObject(buf, value[j], true);
      }
    }
  }

  public IsIVeryVal(object: any): object is IVeryVar {
    return object.discriminator === "IVeryVar";
  }

  public Close() {
    this.close();
  }

  //#region 登录
  public Login(
    phone: string,
    password: string,
    act: (user?: any) => void,
    act2?: (str: string) => void
  ) {
    if (phone.length == 0 || password.length == 0) {
      if (act2) {
        act2("账号密码不符合要求");
      }
      return;
    }
    // console.log(phone + "," + password + "," + VeryNettyPara.ProjectID);
    qsPost("/User/Login", {
      account: phone,
      password: password,
      softwareId: VeryNettyPara.ProjectID,
    })
      .then(
        function (response) {
          let data = response.data;
          if (data.code === "00000") {
            act(data.data);
          } else {
            if (act2) {
              act2(data.message);
            }
          }
        }.bind(SocketManager._instance)
      )
      .catch(function (error) {
        if (act2) {
          act2(error);
        }
      });
  }

  //注册
  public Regist(
    phone: string,
    password: string,
    captcha: string,
    username: string,
    act: (user?: any) => void,
    act2?: (str: string) => void
  ) {
    if (phone.length != 11 || password.length == 0 || captcha.length != 4) {
      if (act2) {
        act2("账号密码验证码不符合要求");
      }
      return;
    }
    qsPost("/User/TelRegister", {
      phone: phone,
      password: password,
      captcha: captcha,
      userName: username,
    })
      .then(function (response) {
        let data = response.data;
        if (data.code === "00000") {
          act(data.data);
        } else {
          if (act2) {
            act2(data.message);
          }
        }
      })
      .catch(function (error) {
        if (act2) {
          act2(error);
        }
      });
  }

  //验证码
  public SendCaptcha(
    phone: string,
    act: () => void,
    act2?: (str: string) => void
  ) {
    if (phone.length != 11) {
      if (act2) {
        act2("账号密码不符合要求");
      }
      return;
    }
    qsPost("/User/Captcha", {phone: phone })
      .then(function (response) {
        let data = response.data;
        if (data.code === "00000") {
          act();
        } else {
          if (act2) {
            act2(data.message);
          }
        }
      })
      .catch(function (error) {
        if (act2) {
          act2(error);
        }
      });
  }
  //邮箱注册
  public MailRegist(
    mail: string,
    password: string,
    captcha: string,
    username: string,
    act: (user?: any) => void,
    act2?: (str: string) => void
  ) {
    if (mail.length == 0 || password.length == 0 || captcha.length != 4) {
      if (act2) {
        act2("账号密码验证码不符合要求");
      }
      return;
    }
    qsPost("/User/MailRegister", {
      mail: mail,
      pwd: password,
      captcha: captcha,
      username: username,
    })
      .then(function (response) {
        let data = response.data;
        if (data.code === "00000") {
          act(data.data);
        } else {
          if (act2) {
            act2(data.message);
          }
        }
      })
      .catch(function (error) {
        if (act2) {
          act2(error);
        }
      });
  }

  //邮箱验证码
  public SendMailCaptcha(
    mail: string,
    act: () => void,
    act2?: (str: string) => void
  ) {
    if (mail.length == 0) {
      if (act2) {
        act2("账号密码不符合要求");
      }
      return;
    }
    qsPost("/User/mailCaptcha", { mail: mail })
      .then(function (response) {
        let data = response.data;
        if (data.code === "00000") {
          act();
        } else {
          if (act2) {
            act2(data.message);
          }
        }
      })
      .catch(function (error) {
        if (act2) {
          act2(error);
        }
      });
  }

  //判断是否已经登录
  public HasLogin(act: (user?: any) => void, act2?: (str: string) => void) {
    qsPost("/User/HasLogin")
      .then(
        function (response) {
          let data = response.data;
          if (data.code === "00000") {
            act(data.data);
          } else {
            if (act2) {
              act2(data.message);
            }
          }
        }.bind(SocketManager._instance)
      )
      .catch(function (error) {
        if (act2) {
          act2(error);
        }
      });
  }

  //重新输入新的密码
  public ReRegister(
    phone: string,
    password: string,
    captcha: string,
    act: (user?: any) => void,
    act2?: (str: string) => void
  ) {
    if (phone.length != 11 || password.length == 0 || captcha.length != 4) {
      if (act2) {
        act2("账号密码验证码不符合要求");
      }
      return;
    }
    qsPost("/User/ReRegister", { tel: phone, pwd: password, captcha: captcha })
      .then(
        function (response) {
          let data = response.data;
          if (data.code === "00000") {
            act(data.data);
          } else {
            if (act2) {
              act2(data.message);
            }
          }
        }.bind(SocketManager._instance)
      )
      .catch(function (error) {
        if (act2) {
          act2(error);
        }
      });
  }

  //找回密码
  public FindPwd(phone: string, act: () => void, act2?: (str: string) => void) {
    if (phone.length != 11) {
      if (act2) {
        act2("账号不符合要求");
      }
      return;
    }
    qsPost("/User/FindPwd", { phone: phone })
      .then(function (response) {
        let data = response.data;
        if (data.code === "00000") {
          act();
        } else {
          if (act2) {
            act2(data.message);
          }
        }
      })
      .catch(function (error) {
        if (act2) {
          act2(error);
        }
      });
  }

  //邮箱重新输入新的密码
  public MailReRegister(
    mail: string,
    password: string,
    captcha: string,
    act: (user?: any) => void,
    act2?: (str: string) => void
  ) {
    if (mail.length == 0 || password.length == 0 || captcha.length != 4) {
      if (act2) {
        act2("账号密码验证码不符合要求");
      }
      return;
    }
    qsPost("/User/mailReRegister", {
      mail: mail,
      pwd: password,
      captcha: captcha,
    })
      .then(
        function (response) {
          let data = response.data;
          if (data.code === "00000") {
            act(data.data);
          } else {
            if (act2) {
              act2(data.message);
            }
          }
        }.bind(SocketManager._instance)
      )
      .catch(function (error) {
        if (act2) {
          act2(error);
        }
      });
  }

  //邮箱找回密码
  public MailFindPwd(mail: string,act: () => void,act2?: (str: string) => void) {
    if (mail.length == 0) {
      if (act2) {
        act2("账号不符合要求");
      }
      return;
    }
    qsPost("/User/findMailPwd", { mail: mail })
      .then(function (response) {
        let data = response.data;
        if (data.code === "00000") {
          act();
        } else {
          if (act2) {
            act2(data.message);
          }
        }
      })
      .catch(function (error) {
        if (act2) {
          act2(error);
        }
      });
  }
  //退出登录
  public Signout(act: () => void, act2?: (str: string) => void) {
    qsPost("/User/SignOut")
      .then(
        function (response) {
          let data = response.data;
          if (data.code === "00000") {
            act();
            this.db.close();
          } else {
            if (act2) {
              act2(data.message);
            }
          }
        }.bind(SocketManager._instance)
      )
      .catch(function (error) {
        if (act2) {
          act2(error);
        }
      });
  }
  //获取变量
  public GetValues(vals: Array<IVeryVar>,isperson: boolean,index: number,act: () => void) {
    if (vals.length == 0) {
      return;
    }
    let byteValue = ByteBuffer.Allocate(1024);
    this.WriteObject(byteValue,VeryNettyPara.ProjectID);
    let personName = "";
    if (isperson) {
      personName = VeryNettyPara.UserID;
    }
    this.WriteObject(byteValue,personName);
    for (let i = 0; i < vals.length; i++) {
      this.WriteObject(byteValue,vals[i].name);
    }
    var xhr = new XMLHttpRequest;
    xhr.withCredentials = true;
    xhr.open("POST", "https://utp.veryengine.cn/Value/GetValues", true);
    xhr.responseType='arraybuffer';
    xhr.send(byteValue.ToArray());
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) { 
        if (xhr.status === 200) {
          var buf=new ByteBuffer((xhr.response) as ArrayBuffer);
          let result=buf.ReadByte();
          if(result==1){
            let index=0;
            while(buf.ReadableBytes()>0){
              let len=buf.ReadInt();
              if(len!=0){
                vals[index].setBuf(buf.ReadRetainedSlice(len));
              }
              index++;
            }
            if(act)
              act();
          }
          else{
            console.error('error');
          }
        } else {
          console.error("Error", xhr.statusText);
        }
      }
    };
  }
  //获取具体id下的变量
  public GetValuesByID(vals: Array<IVeryVar>,isperson: boolean,ID:string,index: number,act: () => void) {
    if (vals.length == 0) {
      return;
    }
    let byteValue = ByteBuffer.Allocate(1024);
    this.WriteObject(byteValue,VeryNettyPara.ProjectID);
    let personName = "";
    if (isperson) {
      personName = ID;
    }
    this.WriteObject(byteValue,personName);
    for (let i = 0; i < vals.length; i++) {
      this.WriteObject(byteValue,vals[i].name);
    }
    var xhr = new XMLHttpRequest;
    xhr.withCredentials = true;
    xhr.open("POST", "https://utp.veryengine.cn/Value/GetValues", true);
    xhr.responseType='arraybuffer';
    xhr.send(byteValue.ToArray());
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) { 
        if (xhr.status === 200) {
          var buf=new ByteBuffer((xhr.response) as ArrayBuffer);
          let result=buf.ReadByte();
          if(result==1){
            let index=0;
            while(buf.ReadableBytes()>0){
              let len=buf.ReadInt();
              if(len!=0)
                vals[index].setBuf(buf.ReadRetainedSlice(len));
              index++;
            }
            if(act)
              act();
          }
          else{
            console.error('error');
          }
        } else {
          console.error("Error", xhr.statusText);
        }
      }
    };
  }
  
  public GetOnlyValues(vals: Array<IVeryVar>,isperson: boolean,index: number,act: () => void) {
    if (vals.length == 0) {
      return;
    }
    let byteValue = ByteBuffer.Allocate(1024);
    this.WriteObject(byteValue,'commonvars');
    let personName = "";
    if (isperson) {
      personName = VeryNettyPara.UserID;
    }
    this.WriteObject(byteValue,personName);
    for (let i = 0; i < vals.length; i++) {
      this.WriteObject(byteValue,vals[i].name);
    }
    var xhr = new XMLHttpRequest;
    xhr.withCredentials = true;
    xhr.open("POST", "https://utp.veryengine.cn/Value/GetValues", true);
    xhr.responseType='arraybuffer';
    xhr.send(byteValue.ToArray());
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) { 
        if (xhr.status === 200) {

          var buf=new ByteBuffer((xhr.response) as ArrayBuffer);
          let result=buf.ReadByte();
          if(result==1){
            let index=0;
            while(buf.ReadableBytes()>0){
              let len=buf.ReadInt();
              if(len!=0)
                vals[index].setBuf(buf.ReadRetainedSlice(len));
              index++;
            }
            if(act)
            act();
          }
          else{
            console.error('error');
          }
        } else {
          console.error("Error", xhr.statusText);
        }
      }
    };
  }

  //储存变量 list变量无法直接储存
  public SaveValues(vals: Array<IVeryVar>, isperson: boolean, index: number) {
    if (vals.length == 0) {
      return;
    }
    let byteValue = ByteBuffer.Allocate(1024);
    this.WriteObject(byteValue,VeryNettyPara.ProjectID);
    let personName = "";
    if (isperson) {
      personName = VeryNettyPara.UserID;
    }
    this.WriteObject(byteValue,personName);
    for(let i=0;i<vals.length;i++){
      this.WriteObject(byteValue,vals[i],true);
    }
    var xhr = new XMLHttpRequest;
    xhr.withCredentials = true;
    xhr.open("POST", "https://utp.veryengine.cn/Value/SaveValues", true);
    xhr.responseType='arraybuffer';
    xhr.send(byteValue.ToArray());
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) { 
        if (xhr.status === 200) {
          console.log('储存成功');
        } else {
          console.error("Error", xhr.statusText);
        }
      }
    };
  }
  
  //储存变量
  public SaveOnlyValues(vals: Array<IVeryVar>, isperson: boolean, index: number) {
    if (vals.length == 0) {
      return;
    }
    let byteValue = ByteBuffer.Allocate(1024);
    this.WriteObject(byteValue,"commonvars");
    let personName = "";
    if (isperson) {
      personName = VeryNettyPara.UserID;
    }
    this.WriteObject(byteValue,personName);
    for(let i=0;i<vals.length;i++){
      this.WriteObject(byteValue,vals[i],true);
    }
    var xhr = new XMLHttpRequest;
    xhr.withCredentials = true;
    xhr.open("POST", "https://utp.veryengine.cn/Value/SaveValues", true);
    xhr.responseType='arraybuffer';
    xhr.send(byteValue.ToArray());
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) { 
        if (xhr.status === 200) {
          console.log('储存成功');
        } else {
          console.log("Error", xhr.statusText);
        }
      }
    };
  }

  //数字操作 +1 -1
  public OperateNum(
    val: VeryNumber,
    operate: string,
    index: number,
    act: () => void | null
  ) {
    let byteValue = ByteBuffer.Allocate(1024);
    this.WriteObject(byteValue,VeryNettyPara.ProjectID);
    let personName = "";
    this.WriteObject(byteValue,personName);
    if(operate=='+')
      this.WriteObject(byteValue,NettyNumber.CreatNettyNumber(0,'byte'));
    else if(operate==='-')
      this.WriteObject(byteValue,NettyNumber.CreatNettyNumber(1,'byte'));
    this.WriteObject(byteValue,val.name);
    var xhr = new XMLHttpRequest;
    xhr.withCredentials = true;
    xhr.open("POST", "https://utp.veryengine.cn/Value/OperateNum", true);
    xhr.responseType='arraybuffer';
    xhr.send(byteValue.ToArray());
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) { 
        if (xhr.status === 200) {
          if(operate=='+')
            val.value=val.value+1;
          else if(operate==='-')
            val.value=val.value-1;
          if (act) act();
        } else {
          console.error("Error", xhr.statusText);
        }
      }
    };
  }

  //数组添加单元
  public OperateList(listVal: VeryList, unit: IVeryVar, operate: string) {
    let byteValue = ByteBuffer.Allocate(1024);
    this.WriteObject(byteValue,VeryNettyPara.ProjectID);
    let personName = "";
    this.WriteObject(byteValue,personName);
    if(operate=='add')
      this.WriteObject(byteValue,NettyNumber.CreatNettyNumber(0,'byte'));
    this.WriteObject(byteValue,listVal.name);
    let childBuf = unit.GetBytes();
    byteValue.WriteInt(childBuf.ReadableBytes());
    byteValue.Write(childBuf);
    var xhr = new XMLHttpRequest;
    xhr.withCredentials = true;
    xhr.open("POST", "https://utp.veryengine.cn/Value/OperateList", true);
    xhr.responseType='arraybuffer';
    xhr.send(byteValue.ToArray());
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) { 
        if (xhr.status === 200) {
        } else {
          console.error("Error", xhr.statusText);
        }
      }
    };
  }
  //数组添加单元并绑定用户id
  public OperatePersonList(listVal: VeryList,unit: IVeryVar,isperson: boolean,operate: string) {
    let byteValue = ByteBuffer.Allocate(1024);
    this.WriteObject(byteValue,VeryNettyPara.ProjectID);
    let personName = "";
    if(isperson)
      personName=VeryNettyPara.UserID;
    this.WriteObject(byteValue,personName);
    if(operate=='add')
      this.WriteObject(byteValue,NettyNumber.CreatNettyNumber(0,'byte'));
    this.WriteObject(byteValue,listVal.name);
    let childBuf = unit.GetBytes();
    byteValue.WriteInt(childBuf.ReadableBytes());
    byteValue.Write(childBuf);
    var xhr = new XMLHttpRequest;
    xhr.withCredentials = true;
    xhr.open("POST", "https://utp.veryengine.cn/Value/OperateList", true);
    xhr.responseType='arraybuffer';
    xhr.send(byteValue.ToArray());
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) { 
        if (xhr.status === 200) {
        } else {
          console.error("Error", xhr.statusText);
        }
      }
    };
  }
  //数组添加单元并绑定用户id
  public OperateOnlyPersonList(listVal: VeryList,unit: IVeryVar,isperson: boolean,operate: string) {
    let byteValue = ByteBuffer.Allocate(1024);
    this.WriteObject(byteValue,'commonvars');
    let personName = "";
    if(isperson)
      personName=VeryNettyPara.UserID;
    this.WriteObject(byteValue,personName);
    if(operate=='add')
      this.WriteObject(byteValue,NettyNumber.CreatNettyNumber(0,'byte'));
    this.WriteObject(byteValue,listVal.name);
    let childBuf = unit.GetBytes();
    byteValue.WriteInt(childBuf.ReadableBytes());
    byteValue.Write(childBuf);
    var xhr = new XMLHttpRequest;
    xhr.withCredentials = true;
    xhr.open("POST", "https://utp.veryengine.cn/Value/OperateList", true);
    xhr.responseType='arraybuffer';
    xhr.send(byteValue.ToArray());
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) { 
        if (xhr.status === 200) {
        } else {
          console.error("Error", xhr.statusText);
        }
      }
    };
  }
  //开始时间
  public ValTimeStart(valName:string,act:()=>void,act2?:(str:string)=>void){
    let data={softwareId:VeryNettyPara.ProjectID,varName:valName,userId:VeryNettyPara.UserID};
    jsonPost('/ValueTime/Start',data).then(function(response){
        let data = response.data;
        if (data.code === "00000"){
            if(!VeryNettyPara.valTime.SetValue(valName,data.data))
                VeryNettyPara.valTime.Add(valName,data.data);
            act();
        }
        else{
            if(act2){
                act2(data.message);
            }
        }
    }).catch(function(error) {
        if(act2){
            act2(error);
        }
    });
}

//结束时间
public ValTimeEnd(valName:string,act:()=>void,act2?:(str:string)=>void){
    let id=VeryNettyPara.valTime.GetValue(valName);
    if(!id)
    {
        act2(valName+"，该变量对应的时间从未开始!");
        return;
    }
    jsonPost('/ValueTime/End',{id:id}).then(function(response){
        let data = response.data;
        if (data.code === "00000"){
            VeryNettyPara.valTime.Remove(valName);
            act();
        }
        else{
            if(act2){
                act2(data.message);
            }
        }
    }).catch(function(error) {
        if(act2){
            act2(error);
        }
    });
}

//浏览器关闭是调用

public valTimeClose(){
    let ids=VeryNettyPara.valTime.GetValues();
    if(ids.length>0)
    qsListPost('/ValueTime/Close',{id:ids});
}

//时间个数
public ValTimeCount(valName:string,isPerson:boolean,start:Date|null,end:Date|null,isAll:boolean,act:(count:{count:number,total:number})=>void,act2?:(str:string)=>void){
    let data={softwareId:VeryNettyPara.ProjectID,varName:valName,userId:VeryNettyPara.UserID,start:start,end:end,flag:isAll};
    if(!isPerson)
        delete(data.userId);
    jsonPost('/ValueTime/Count',data).then(function(response){
        let data = response.data;
        if (data.code === "00000"){
            act(data.data);
        }
        else{
            if(act2){
                act2(data.message);
            }
        }
    }).catch(function(error) {
        if(act2){
            act2(error);
        }
    });
}
}
