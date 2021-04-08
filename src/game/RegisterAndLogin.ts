
export class RegisterAndLogin
{
    // public static GameTurnStart = false; //帧同步是否启动
    public static ProjectID = "69"; //项目名，即网络通讯唯一标识ID，需要改成变量加载的方式，暂定下棋案例ID
    public static loginStatus : boolean = false;
    public static loginData : any = "";
    public static registerData : any = "";

    

    public static  UploadLogin(info:string)
    {
        if (info != "")
        {
              let url = "http://qust.walkclass.com/webvr/login.jason?";
              let postData = "projectId=" + this.ProjectID + "&" + info;
              axios.post(url,postData,{headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'}})
              .then(function(response) {
               // RegisterAndLogin.loginData = response.data;
                })
                .catch(function(error) {
                  console.log(error);
                });

        }
    }

    public static  UploadRegister(info:string)
    {
        if (info != "")
        {
              let url = "http://qust.walkclass.com/webvr/register.jason?";
              let postData = "projectId=" + this.ProjectID + "&" + info;
              axios.post(url,postData,{headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'}})
              .then(function(response) {
                RegisterAndLogin.registerData = response.data;
                })
                .catch(function(error) {
                  console.log(error);
                });

        }
    }
}