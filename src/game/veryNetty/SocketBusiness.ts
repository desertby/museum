export class ErrorInfo {

  public isRight: boolean = true;
  public message: string = '';

  constructor() {
    
  }

  public clear(): void {
    this.isRight = true;
    this.message = '';
  }

}
export enum VerySendMode
{
  All = 255, Other = 254, Diff=253
}
export enum SocketHandle
{
  Login = 0, JoinGame = 1, GameTurn = 2, NextTurn = 3, CreatRoom = 4, GameStart = 5, GetIdentity = 6, CreatTemplet = 7, GetRoomID = 8, Exit = 9, CallBack = 10,SendCaptcha=11,Regist=12,
  SaveVal=13,GetVal=14,ListOp=15,NumOp=16,FrameMove=17, Empty = 99,Valid=127
}

//和引擎对接的接口
export enum VeryEngineNode
{
  VeryGameObject = 2, VeryString = 3, Var = 97, Action = 98, Trigger = 99,Move=100,Character=101,Exit=102,GetIdentity =103,Pos=104,MoveSate=105
}
