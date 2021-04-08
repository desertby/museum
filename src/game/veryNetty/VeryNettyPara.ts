import { Dictionary } from "../utility/dictionary";

export enum OpenMode {ilab, walkclass,direct}
export class VeryNettyPara
{
    public static GameTurnStart = false; //帧同步是否启动
    public static ProjectID = "jiawu"; //项目名，即网络通讯唯一标识ID，需要改成变量加载的方式，暂定下棋案例ID
    public static UserName="游客";
    public static UserID="007";
    public static taskId="";
    public static resId="";
    public static customId="";
    public static url2="";
    public static url="";
    public static roomIndex=0;
    public static valTime:Dictionary<string,number>=new Dictionary<string,number>();
    public static mode=OpenMode.direct;

    public static t=0;
    public static max=0;
    public static moveSpeed = 5;
    public static characterPath = "./model/1/1.babylon";
    public static characterPos = new BABYLON.Vector3(600, 160.8, -600);
    public static characterRot = new BABYLON.Vector3(0, -Math.PI / 2, 0);
    public static characterScal = new BABYLON.Vector3(3, 3, 3);
    public static characterHigh = 180;
    public static characterIsmove = false;
    public static haslogin:boolean = false;
    public static exchangeNotice:boolean = false;
}
