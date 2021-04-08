import { VeryNettyPara, OpenMode } from "./veryNetty/VeryNettyPara";
import MD5 from "./utility/md5";

export class xuebei {
    private static START_TIME: number;
    private static START_TIME_STR:string;
    private static END_TIME: number;
    public static userName: string;
    public static userId: string;
    private static appendix: string;
    private static serverAddress: string;
    private static role: string;
    private static id: string;
    private static content: string;
    private static _stepName: Array<string>;
    private static _stepScore: Array<number>;

    //学呗打开虚拟仿真网页时调用，认证信息
    public static StartCheck(schema: string): boolean {
        let strSplit = schema.split('&');
        // let timestamp:string="";
        let signature: string = "";
        for (let i = 0; i < strSplit.length; i++) {
            let paramSplit = strSplit[i].split('=');
            if (paramSplit.length == 2) {
                if (paramSplit[0] == "signature") {
                    signature = paramSplit[1];
                }
                else {
                    if (paramSplit[0] == "userName") {
                        xuebei.userName = paramSplit[1];
                    }
                    else if (paramSplit[0] == "userId") {
                        xuebei.userId = paramSplit[1];
                    }
                    else if (paramSplit[0] == "appendix") {
                        xuebei.appendix = paramSplit[1].replace(new RegExp("%7B","gm"),"{")
                        .replace(new RegExp("%22","gm"),"\"")
                        .replace(new RegExp("%3A","gm"),":")
                        .replace(new RegExp("%7D","gm"),"}")
                        .replace(new RegExp("%2C","gm"),",");
                    }
                    else if (paramSplit[0] == "serverAddress") {

                        xuebei.serverAddress = paramSplit[1].replace("%3A%2F%2F","://");
                    }
                    else if (paramSplit[0] == "role") {
                        xuebei.role = paramSplit[1];
                    }
                    else if (paramSplit[0] == "id") {
                        xuebei.id = paramSplit[1];
                    }
                    else if (paramSplit[0] == "content") {
                        xuebei.content = paramSplit[1];
                    }
                    else if (paramSplit[0] == "accessKey") {
                        xuebei.accessKey = paramSplit[1].replace(new RegExp("%7B","gm"),"{")
                        .replace(new RegExp("%22","gm"),"\"")
                        .replace(new RegExp("%3A","gm"),":")
                        .replace(new RegExp("%7D","gm"),"}")
                        .replace(new RegExp("%2C","gm"),",");
                    }
                    // else if (paramSplit[0] == "timestamp") {
                    //     timestamp = paramSplit[1];
                    // }
                }
            }
            // if (signature != "") {
            //     let signatureArray = CryptoJS.HmacSHA256(schema, xuebei.accessSecret);
            //     let signatureCheck = CryptoJS.enc.Base64.stringify(signatureArray);
            //     if (signature == signatureCheck) {
            //         return true;
            //     }
            // }
        }
        return true;
    }

    //考试开始时调用，假如没有开始按钮可以直接在打开网页时调用
    public static ExamStart() {
        if(VeryNettyPara.mode==OpenMode.walkclass){
            xuebei.START_TIME = new Date().getTime();
            xuebei._stepName=new Array<string>();
            xuebei._stepScore=new Array<number>();
        }
        else if(VeryNettyPara.mode==OpenMode.ilab){
            let date = new Date();
            xuebei._stepName=new Array<string>();
            xuebei._stepScore=new Array<number>();
            xuebei.START_TIME = date.getTime();
            xuebei.START_TIME_STR=xuebei.dateFormat("YYYY-mm-dd HH:MM:SS", date);
        }
    }

    //添加步骤和成绩
    public static AddStep(stepName:string,stepNumber:number){
        if(VeryNettyPara.mode!=OpenMode.direct){
        xuebei._stepName.push(stepName);
        xuebei._stepScore.push(stepNumber);
        }
    }
    //上传成绩
    public static Upload() {
       if(VeryNettyPara.mode==OpenMode.walkclass){
           xuebei.walkclassUp();
       }
       else if(VeryNettyPara.mode==OpenMode.ilab){
           xuebei.ilabUp();
       }
    }

    private static walkclassUp(){
        xuebei.END_TIME = new Date().getTime();
        let total = 0;
        for (let i = 0; i < xuebei._stepScore.length; i++) {
            total += xuebei._stepScore[i];
        }
        let uploadContent = "{\"userId\":\"" + xuebei.userId + "\",\"appendix\":" + xuebei.appendix + ",\"totalScore\":" + total + ",\"startTime\":" + xuebei.START_TIME
            + ",\"endTime\":" + xuebei.END_TIME +
            ",\"result\":{\"fieldMap\":{\"stepNo\":\"序号\",\"stepName\": \"步骤名称\"}" + ",\"content\":[";
        for (let i = 0; i < xuebei._stepName.length; i++) {
            if (i != 0) {
                uploadContent += ",";
            }
            uploadContent += "{\"stepNo\":" + (i + 1) + ",\"stepName\":\"" + xuebei._stepName[i] + "\",\"score\":" + xuebei._stepScore[i] + "}";
        }
        uploadContent += "]}}";
        axios.defaults.withCredentials = true;
        let headers = { 'Content-Type': 'application/json' };
        xuebei.GetJsonHeader(headers, uploadContent);
        console.log(uploadContent);
        axios.post(xuebei.serverAddress+"/openApi/vr/v2/results.json", uploadContent, { headers: headers })
            .then(function (response) {
                console.log(response);
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    private static accessKey = "";
    private static accessSecret = "6V0v6vWRWBwEWYvowckrFkNsQ3PROxwo";
    private static GetJsonHeader(headers, json: string) {
        let timeStamp = new Date().getTime();
        json = json + "&accessKey=" + xuebei.accessKey + "&timestamp=" + timeStamp;
        let signatureArray = CryptoJS.HmacSHA256(json, xuebei.accessSecret);
        let signature = CryptoJS.enc.Base64.stringify(signatureArray);

        headers["accessKey"] = xuebei.accessKey;
        headers["timestamp"] = timeStamp;
        headers["signature"] = signature;
    }

    public static ilabUp()
    {
        if(VeryNettyPara.url=="")
        return;
        let CopyTimeNow = "\"StartTime\":\"" + xuebei.START_TIME_STR + "\",";
        let examTime=(new Date().getTime()-xuebei.START_TIME)/1000;
        let ExamLength = "\"ExamLength\":\"" + examTime + "\",";
        let num= xuebei._stepName.length;
        let totalScore = num*20;
        let ExamInfo2Updata="";
        for (let i = 0; i < num; i++)
        {
            if (i == 0)
            {
                if(i==num-1)
                {
                    ExamInfo2Updata = "[{\"Index\":\"" + i + "\",\"StepName\":\"" + xuebei._stepName[i] + "\",\"Score\":\"" + xuebei._stepScore[i] + "\"}]";
                }
                else
                {
                    ExamInfo2Updata = "[{\"Index\":\"" + i + "\",\"StepName\":\"" + xuebei._stepName[i] + "\",\"Score\":\"" + xuebei._stepScore[i] + "\"},";
                }
            }
            else if (i != num-1)
            {
                ExamInfo2Updata += "{\"Index\":\"" + i + "\",\"StepName\":\"" + xuebei._stepName[i] + "\",\"Score\":\"" +  xuebei._stepScore[i]+ "\"},";
            }
            else
            {
                ExamInfo2Updata += "{\"Index\":\"" + i + "\",\"StepName\":\"" + xuebei._stepName[i] + "\",\"Score\":\"" + xuebei._stepScore[i] + "\"}]";
            }
        }
        let ExamScore = "\"TotalScore\":\"" + totalScore + "\"}],";
        let Updata = "{\"BaseInfo\":" + "[{\"customId\":\"" +  + "\",\"ID\":\""  + "\",\"UserName\":\"" + VeryNettyPara.UserName + "\",\"ResourceID\":\"" +  "\",\"TaskID\":\"" + "\"," + CopyTimeNow + ExamLength + ExamScore + "\"ExamInfo\":" + ExamInfo2Updata + "}";
         this.UploadScore(Updata);
    }
    private static UploadScore(score:string)
    {
            if (score != "")
            {
                let sign = new MD5().hex_md5(score + "BaPUEW9y9DECU/PfsNJrjA==");
                let postData = "param=" + score;
                postData += ("&sign=" + sign);
                axios.post(VeryNettyPara.url,postData,{headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'}})
                .then(function(response) {
                    console.log(response);
                  })
                  .catch(function(error) {
                    console.log(error);
                  });


            }
    }

    private static dateFormat(fmt, date) {
        let ret;
        const opt = {
            "Y+": date.getFullYear().toString(),        // 年
            "m+": (date.getMonth() + 1).toString(),     // 月
            "d+": date.getDate().toString(),            // 日
            "H+": date.getHours().toString(),           // 时
            "M+": date.getMinutes().toString(),         // 分
            "S+": date.getSeconds().toString()          // 秒
        };
        for (let k in opt) {
            ret = new RegExp("(" + k + ")").exec(fmt);
            if (ret) {
                fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
            };
        };
        return fmt;
    }
}