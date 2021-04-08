export * from "./index";

import { Game } from "./game";
import { uiBtnEvent } from "./game/uiBtnEvent";
import { VeryNettyPara, OpenMode } from "./game/veryNetty/VeryNettyPara";
import { xuebei } from "./game/xuebei";
import { fileURLToPath } from "url";
import { ImageCode } from "./game/imageCode";
import $ from "jquery";

let game!: Game;
let initFlag: boolean = false;
let _data: any;
let _uiBtnEvent: uiBtnEvent;

/**
 * 初始化入口；
 */
function initGame(): void {
  let canvas = <HTMLCanvasElement>document.getElementById("renderCanvas");
  if (canvas !== null) {
    game = new Game(canvas);
    game.createScene().animate(); // 链式调用
    _uiBtnEvent = new uiBtnEvent();
  }
}
export let reloadnum = 0;
export function runBtn(): void {
  if (game) {
    game.createScene().animate();
    reloadnum++;
  }
}

function toggleDebug(): void {
  if (game) {
    game.toggleDebug();
  }
}
var data = window.location.href;
let str = data.split("?");

if (str.length > 1) {
  VeryNettyPara.mode = OpenMode.walkclass;
  let split = str[1].split("&");
  for (let i = 0; i < split.length; i++) {
    if (split[i].startsWith("token=")) {
      data = split[i].slice(6);
      var key = CryptoJS.enc.Latin1.parse("abcdef0123456789"); //秘药
      var iv = CryptoJS.enc.Latin1.parse("0123456789abcdef"); //向量

      //解密
      var decrypted = CryptoJS.AES.decrypt(data, key, {
        iv: iv,
        padding: CryptoJS.pad.ZeroPadding,
      });
      var jsonstr2 = decrypted.toString(CryptoJS.enc.Utf8);
      var jsonData = JSON.parse(jsonstr2);
      VeryNettyPara.UserID = jsonData.ID;
      VeryNettyPara.UserName = jsonData.username;
      VeryNettyPara.url = jsonData.URL;
      VeryNettyPara.taskId = jsonData.Task;
      VeryNettyPara.resId = jsonData.ResourceID;
      VeryNettyPara.url2 = jsonData.URL2;
      VeryNettyPara.customId = jsonData.customId.split(":")[1];
      VeryNettyPara.mode = OpenMode.ilab;
      axios
        .get(
          VeryNettyPara.url2 +
            "?userId=" +
            VeryNettyPara.UserID +
            "&taskId=" +
            VeryNettyPara.taskId +
            "&resourceId=" +
            VeryNettyPara.resId +
            "&customId=" +
            VeryNettyPara.customId
        )
        .then(function (response) {
          console.log(response);
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  }
  if (VeryNettyPara.mode == OpenMode.walkclass) {
    xuebei.StartCheck(str[1]);
    //解码href中的中文
    VeryNettyPara.UserName = decodeURIComponent(xuebei.userName);
    VeryNettyPara.UserID = xuebei.userId;
  }
  xuebei.ExamStart();
}
// 启动引擎

// 第一次启动时，先异步加载数据后再初始化，后期可以直接点击按钮进行加载；

$(".cover").show();
$("#cover-img").attr("src", ImageCode.splash).css("z-index", 0);
initGame();
axios.defaults.headers.post["Content-Type"] = "application/json";
