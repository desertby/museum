import $ from "jquery";
import { GlobalControl } from "./globalControl";
import { VeryNettyPara } from "./veryNetty/VeryNettyPara";
import { SocketManager } from "./veryNetty/SocketManager";
import { VeryList, VeryString, VeryNumber } from "./veryNetty/veryVariables";
import { Exhibits } from "./exhibits";
import { Game, runBtn } from "../main";
import PerfectScrollbar from "perfect-scrollbar";
import QRCode from "qrcode";
//界面按钮注册事件
export class uiBtnEvent {
  private isMute: boolean = false;
  private onlineNumber = new VeryNumber("onlineNumber", 0);
  private profile = new VeryString("profile", "");
  private profileValue: String;
  private profileArray;

  constructor() {
    // 菜单按钮点击切换菜单显示隐藏
    $(".menu").on("click", () => {
      $(".menu img").toggle();
      $(".menu .icon-arrow-up").toggle();
      $(".menu-list").slideToggle(300);
      $(".share-btn,.support-btn,.map-btn,.profile-btn,.translate-btn,.resume-btn").removeClass(
        "btn-selected"
      );
      $(".profile-box,.map-box,.share-box,.board-box").hide();
    });
    // 信息填写界面提交
    // $("#profile-submit").on("click", () => {
    //   let strArr: (string | number | string[])[] = [];
    //   $(".profile :text").each(function () {
    //     strArr.push($(this).val());
    //   });
    //   strArr.splice(1, 0, $(":checked").val());
    //   if (strArr.indexOf("") != -1) {
    //     window.alert("请完整填写后再次提交");
    //   } else {
    //     this.updateProfile(strArr);
    //     let str = strArr.join(",");
    //     this.profile.value = str;
    //     //根据项目id和个人id存储数据
    //     SocketManager.Instance.SaveValues([this.profile], true, 123);
    //     $(".profile").hide();
    //   }
    // });

    //性别选择
    $("input[type='radio']").on("click",function () {
      if($("input[name='gender']:checked").val()=="m"){
        $(".icon--nan").css({
          'display': 'none'
        });
        $(".icon--nv").css({
          'display': 'inline-block'
        })
      }else{
        $(".icon--nv").css({
          'display': 'none'
        });
        $(".icon--nan").css({
          'display': 'inline-block'
        })
      }
  })
    // 修改信息填写界面提交
    // $("#profile-edit-submit").on("click", () => {
    //   let strArr: (string | number | string[])[] = [];
    //   $(".profile-edit :text").each(function () {
    //     strArr.push($(this).val());
    //   });
    //   strArr.splice(1, 0, $(":checked").val());
    //   if (strArr.indexOf("") != -1) {
    //     window.alert("请完整填写后再次提交");
    //   } else {
    //     this.updateProfile(strArr);
    //     let str = strArr.join(",");
    //     this.profile.value = str;
    //     SocketManager.Instance.SaveValues([this.profile], true, 10089);
    //     $(".profile-edit").hide();
    //   }
    // });

    // 功能按钮点击变色，打开对应功能面板，并关闭其他面板
    const ulBtnNode = $(
      ".share-btn,.support-btn,.resume-btn,.map-btn,.profile-btn,.signboard-btn,.common-btn,.bgm-btn,.commentary-btn,.caizhitihuan-btn,.initPostion-btn"
    );
    ulBtnNode.on("click", (e) => {
      let htmlNode: JQuery<HTMLElement>;
      if (e.target.tagName === "SPAN") {
        htmlNode = $(e.target).parent();
      } else {
        htmlNode = $(e.target);
      }
      ulBtnNode.removeClass("btn-selected");
      htmlNode.toggleClass("btn-selected");
      
    });
    $(".setup-btn,.sound-Mute-btn").on("click", (e) => {
      let htmlNode: JQuery<HTMLElement>;
      if (e.target.tagName === "SPAN") {
        htmlNode = $(e.target).parent();
      } else {
        htmlNode = $(e.target);
      }
      htmlNode.toggleClass("btn-selected");
    });
    //交换名片面板
    $(".exchange-refuse").on("click", () => {
      $(".exchange").hide();
    });
    $(".exchange-agree").on("click", () => {
      $(".exchange").hide();
    });

    //隐藏对话框
    $(".begin").on("click",()=>{
      $(".messagePar").hide();

      $(".messageHidePar").show();
    })
    //展开对话框
    $(".mhClose").on("click",()=>{
      $(".messagePar").show();

      $(".messageHidePar").hide();
    })
    // 打开个人信息面板
    $(".profile-btn").on("click", () => {
      this.closeall();
      if(!Exhibits.hasLogin){
        $(".login-box :text").each(function () {
          $(this).val("")
        });
        $(".login-box").toggle(200);
      } else {
        $(".profile-box").toggle(200);
      }
    });
    // 名片盒

    // 设置滚动条
    const cardcaseScrollbar = new PerfectScrollbar("#cardcase-box-main", {
      suppressScrollX: true,
    });
    const onlineChatScrollbar = new PerfectScrollbar("#online-chat-list", {
      suppressScrollX: true,
    });

    //打开名片盒面板
    $(".resume-btn").on("click", () => {

      this.closeall();
      $(".cardcase-box").show();
      $(".profile-box").hide();
    });
    // 打开切换展馆面板
    $(".map-btn").on("click",() => {
      this.closeall();
      $(".icon-daohang,.icon-daohangw").toggleClass(
        "icon-daohang icon-daohangw"
      );
      $("#tepCanvas").toggle(200);
      
    });
    // 点击切换语言
    if (this.getCookie("language") === "0") {
      $(".translate-btn .iconfont").addClass("icon-multi-language-02");
    } else {
      $(".translate-btn .iconfont").addClass("icon-multi-language-01");
    }
    $(".translate-btn").on("click", () => {

      $(".caizhitihuan-btn,.commentary-btn,.bgm-btn,.common-btn,.initPostion-btn").css(
        "display",
        "none"
      );
      $(".setup-btn").removeClass("btn-selected")
      this.removeallbg()
      this.closeall()
      $("#bg").hide()
      let flag = $(".translate-btn .iconfont").hasClass(
        "icon-multi-language-02"
      );
      if (flag) {
        $(".translate-btn .iconfont").removeClass("icon-multi-language-02");
        $(".translate-btn .iconfont").addClass("icon-multi-language-01");
      } else {
        $(".translate-btn .iconfont").removeClass("icon-multi-language-01");
        $(".translate-btn .iconfont").addClass("icon-multi-language-02");
      }
      let lang = parseInt(this.getCookie("language"));
      if (lang) {
        this.setCookie("language", 0, 365);
      } else {
        this.setCookie("language", 1, 365);
      }
      runBtn();
    });
    // 打开分享面板
    $(".share-btn").on("click", () => {
      this.closeall();
      let qrcode: any = document.getElementById("qrcode");
      let localURL = window.location.href;
      QRCode.toCanvas(
        qrcode,
        localURL,
        {
          errorCorrectionLevel: "H",
          type: "image/jpeg",
          quality: 0.3,
          width: 148,
          margin: 1,
        },
        function (error) {
          if (error) console.error(error);
          console.log("success!");
        }
      );
      let dataURL = qrcode.toDataURL("image/png");
      $("#share-link-text").val(localURL);
      $("#save-qr-btn").attr("href", dataURL);
      $(".share-box").toggle(200);
    });
    // 打开技术支持页面
    $(".support-btn").on("click", () => {
      this.closeall();
      $(".support-box").toggle(200);
    });

    // 是否静音
    $(".sound-Mute-btn").on("click", () => {
      this.isMute = !this.isMute;
      $(".icon-sound-Mute,.icon-sound-filling").toggleClass(
        "icon-sound-Mute icon-sound-filling"
      );
      GlobalControl.mute(this.isMute);
    });

    //面板右上角小叉，点击关闭对应的面板
    $(".close").on("click", (e) => {
      $(e.target).parent().hide(150, "linear");
      $("#bg").hide();
      this.removeallbg()
    })
    //login close btn
    $(".icon-guanbi1").on("click", (e) => {
      $(".login-box").hide(150, "linear");
      $("#bg").hide();
      this.removeallbg()
    })
    //面板右上角小叉，点击关闭对应的面板
    $(".close2").on("click", (e) => {
      $(e.target).parent().hide(150, "linear");
    })
    // 点击打开封面编辑
    $(".common-btn").on("click", () => {
      this.closeall();
      $(".diy-common").show();
    });
    // 打开公告栏，并获取数据
    $(".signboard-btn").on("click", () => {
      this.closeall();
      if ($(".board-box").is(":hidden")) {
        SocketManager.Instance.ValTimeCount("test",false,null,null,true,
          (data) => {
            let count = data.count;
            let total = data.total;
            let avgTime = (total / count / 60) >> 0;
            $(".views-total p.num").text(count);
            $(".avg-time p.num").text(avgTime + '"');
            $(
              ".views-total .sk-fading-circle, .avg-time .sk-fading-circle"
            ).hide();
          }
        );
        SocketManager.Instance.ValTimeCount("test",false,null,null,false,
          (data) => {
            let count = data.count;
            $(".views-today p.num").text(count);
            $(".views-today .sk-fading-circle").hide();
          }
        );
        SocketManager.Instance.GetValues([this.onlineNumber],false,812,
          () => {
            $(".online-total p.num").text(this.onlineNumber.value);
            $(".online-total .sk-fading-circle").hide();
          }
        );
      }

      $(".board-box").toggle();
    });
    // 打开帮助提示
    $(".shubiao-btn").on("click", () => {
      this.closeall();
      this.removeallbg()
      $(".operating-instructions-box").show();
    });
    // 复制分享链接
    $(".share-link-copy").on("click", () => {
      var obj = $("#share-link-text");
      //选择当前对象
      obj.select();
      try {
        //进行复制到剪切板
        if (document.execCommand("copy", false, null)) {
          //如果复制成功
          alert("复制成功！");
        } else {
          //如果复制失败
          alert("复制失败！");
        }
      } catch (err) {
        //如果报错
        alert("复制错误！");
      }
    });
    // diy界面出现隐藏

    $(".diy-pic-cancel").on("click", () => {
      $(".diy-pic").hide();
      $("#diy-pic-title-input").val("");
      $("#diy-pic-en-title-input").val("");
      $("#diy-pic-des-input").val("");
      $("#diy-pic-des-en-input").val("");
      $("#diy-pic-file").val("");
      $("#bg").hide()
    });
    $(".diy-pic-save").on("click", () => {
      $(".diy-pic").hide();
    });
    $(".icon-lianjie-DIY").on("click", () => {
      $("#bg").show();
      $(".diy-pic-link").toggle(200);
    });
    $(".icon-shipin-DIY").on("click", () => {
      $("#bg").show();
      $(".diy-videos").toggle(200);
    });
    $(".icon-3D-DIY").on("click", () => {
      $("#bg").show();
      $(".diy-models").toggle(200);
    });
    $(".icon-360-DIY").on("click", () => {
      $("#bg").show();
      $(".diy-pic-360-link").toggle(200);
    });

    $(".icon-tuji-DIY").on("click", () => {
      $("#bg").show();
      $(".diy-album").toggle(200);
    });
    $(".icon-pdf-DIY").on("click", () => {
      $("#bg").show();
      $(".diy-pic-pdf").toggle(200);
    });

    $(".diy-pic-link-cancel").on("click", () => {
      $("#bg").hide();
      $(".diy-pic-link").toggle(200);
    });
    $(".diy-pic-360-link-cancel").on("click", () => {
      $("#bg").hide();
      $(".diy-pic-360-link").toggle(200);
    });
    $(
      ".diy-pic-language .diy-pic-chinese,.diy-pic-language .diy-pic-english"
    ).on("click", (e) => {
      $(
        ".diy-pic-language .diy-pic-chinese,.diy-pic-language .diy-pic-english"
      ).removeClass("btn-selected");
      $(e.target).addClass("btn-selected");
      if (e.target.innerText === "EN") {
        $(".diy-pic-des").css("margin-top", "-203px");
      } else {
        $(".diy-pic-des").css("margin-top", "0px");
      }
    });
    // 图集UI显示隐藏
    $(
      ".diy-album-add-language .diy-album-add-chinese,.diy-album-add-language .diy-album-add-english"
    ).on("click", (e) => {
      $(
        ".diy-album-add-language .diy-album-add-chinese,.diy-album-add-language .diy-album-add-english"
      ).removeClass("btn-selected");
      $(e.target).addClass("btn-selected");
      if (e.target.innerText === "EN") {
        $(".diy-album-cn-box").css("margin-top", "-185px");
      } else {
        $(".diy-album-cn-box").css("margin-top", "0px");
      }
    });

    // $("#bg").on("click", () => {
    //   if (!$(".diy-album-add-box").is(":hidden")) {
    //     return;
    //   } else {
    //     $("#bg").hide();
    //     $(".diy-pic-link").hide();
    //     $(".diy-pic-video").hide();
    //     $(".diy-pic-model").hide();
    //     $(".diy-pic-360-link").hide();
    //     $(".diy-album").hide();
    //   }
    // });
    // 
    $(".exchange-agree").on("click",()=>{
      if($("#auto").attr("src")){
        const auto = $("#auto").get(0) as HTMLAudioElement
        auto.play()
      }else{
        $("#auto").attr("src", "./信息交换提示音.mp3");
      }
    })
    const that = this;
    window.addEventListener("beforeunload", function () {
      if (VeryNettyPara.UserName !== "游客") {
        SocketManager.Instance.OperateNum(that.onlineNumber, "-", 811, () => {
          console.log(that.onlineNumber);
        });
      }
      SocketManager.Instance.valTimeClose();
      return "关闭提示";
    });
  }
  //更新个人信息面板
  // public updateProfile(arr: any) {
  //   let profileArray = arr;
  //   let lang = parseInt(this.getCookie("language"));
  //   $(".profile-box-name").text(profileArray[0]);
  //   if (profileArray[1] === "f") {
  //     $("profile-box-sex").toggleClass("icon-nan");
  //     $("profile-box-sex").toggleClass("icon-nv");
  //   }
  //   $(".profile-box-edit-text").text(lang === 0 ? "修改资料" : "Edit");
  //   $(".profile-box-email-text").text(profileArray[3]);
  //   $(".profile-box-company-text").text(profileArray[4]);
  //   $(".profile-box-position-text").text(profileArray[5]);
  //   $(".profile-box-phone-text").text(profileArray[2]);
  // }
  //切换按钮状态
  public btnSwitch(htmlnode: string) {
    return $(htmlnode).on("click", (e) => {
      $(htmlnode).removeClass("btn-selected");
      $(e.target).addClass("btn-selected");
    });
  }
  //初始化筛选区域文字
  public initArea(num: number, lang: number) {
    const arr = [0, 1, 2];
    const newArr: number[] = arr.slice(num);
    let initAlert = lang
      ? ["Area", "Category", "Company"]
      : ["选择展区", "选择展会", "选择展台"];
    let initnode = ["selector-area", "selector-category", "selector-company"];
    newArr.map((it) => {
      let node = initnode[it];
      $(`div.${node}`).text(initAlert[it]);
      $(`ul.${node}`).empty().hide();
    });
  }

  //根据文字渲染选择展区的选项
  // public showAreaList(lang: number) {
  //   this.initArea(0, lang);
  //   const areaList = areaData
  //     .map((it) => "<li>" + it.name[lang] + "</li>")
  //     .join("");
  //   $("ul.selector-area").html(areaList);
  // }
  //设置cookie
  private closeall() {
    $(
      ".operating-instructions-box,#bg,#tepCanvas,.profile-box,.login-box,.register-box,.Reregister-box,.cardcase-box,.share-box,.profile-edit,.board-box,.diy-bgm,.diy-des,.diy-common,.diy-big,.diy-pic,.diy-pic-link,.diy-pic-video,.diy-pic-model,.diy-pic-360-link,.diy-album,.diy-album-add-box,.diy-pic-pdf,.diy-video,.diy-tietu,.diy-question,.diy-exhibitLink,.diy-model,.diy-model-model,.diy-material"
    ).hide();
    $("#bg").show()
  }
  private removeallbg() {
    const ulBtnNode = $(
      ".share-btn,.support-btn,.resume-btn,.map-btn,.profile-btn,.signboard-btn,.common-btn,.bgm-btn,.commentary-btn,.caizhitihuan-btn,.initPostion-btn"
    );
    ulBtnNode.removeClass("btn-selected");
  }
  public setCookie(cname: string, cvalue: number, exdays: number) {
    var d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }

  public getCookie(cname: string) {
    var name = cname + "=";
    var ca = document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }
}
