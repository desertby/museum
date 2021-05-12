import { Game } from "./game";
import { Photo360 } from "./photo360";
import { UIMain } from "./uiMain";
import { UIControl } from "./ui-control";
import { GameObject } from "../babylon";
import { GlobalControl } from "./globalControl";
import { ByteBuffer } from "./veryNetty/ByteBuffer";
import { SocketManager } from "./veryNetty/SocketManager";
import { VeryNettyPara } from "./veryNetty/VeryNettyPara";
import { CallBackManager } from "./veryNetty/CallBackManager";
import { NettyNumber } from "./veryNetty/NettyNumber";
import {VeryList,VeryString,VeryNumber,VeryBool,} from "./veryNetty/veryVariables";
import { IVeryVar } from "./veryNetty/IVeryVar";
import { RegisterAndLogin } from "./RegisterAndLogin";
import { visitDisplay } from "./visitDisplay";
import { Question } from "./question";
import { Language } from "./language";
import { AudioControl } from "./audioControl";
import { reloadnum } from "../main";
import OSS from "ali-oss";
import { off } from "process";
import {userLogin,registerCaptcha,userRegister,userReregister,userFindpwd,BindPersonTag,queryPersonTag,hasLogin,signout} from "./veryNetty/user";
import { VeryCharacter } from "./veryNetty/VeryCharacter";
const AColorPicker = require("a-color-picker");
import { tex_create } from "./360create"

export class Exhibits {
  private _canvas: HTMLCanvasElement;
  private _scene: BABYLON.Scene;

  private meshAdvancedTexture1!: BABYLON.GUI.AdvancedDynamicTexture;
  private meshAdvancedTexture2!: BABYLON.GUI.AdvancedDynamicTexture;
  private meshAdvancedTexture3!: BABYLON.GUI.AdvancedDynamicTexture;
  private _plane2!: BABYLON.AbstractMesh;

  private _plane2Size: number = 180;
  private _videoLength: number = 180;
  // private _plane2Distance: number = 175;

  private _record: { [key: string]: boolean } = {};
  private _lastName: string = "";

  private _parent!: BABYLON.TransformNode;
  private _parentObj!: GameObject;

  private spriteManager!: BABYLON.SpriteManager;
  private _size: number = 20;

  private _videoParent!: BABYLON.TransformNode;
  private _videoPlane: BABYLON.AbstractMesh;
  private _videoTex!: BABYLON.VideoTexture;
  private _videoClosePlane: BABYLON.AbstractMesh;
  private _videoCloseAdvancedTexture!: BABYLON.GUI.AdvancedDynamicTexture;
  private _initializedVideo: boolean = false;
  private _videoPlaying: boolean = false;
  private _lastVideo: string = "";

  private _picPlane!: BABYLON.AbstractMesh;
  private picAdvancedTexture!: BABYLON.GUI.AdvancedDynamicTexture;
  private _parentRect!: BABYLON.GUI.Rectangle;
  private _pictures: PictureData[] = [];
  private _uis: BABYLON.GUI.Rectangle[] = [];
  private _currentIndex: number = 1;
  private _picsuccess: boolean = false;
  private _picdata: any = null;
  private _textdata: TextData[] = [];
  private _textTitle: any;
  private _success: boolean = false;
  private _data: any = null;
  private _userData: any = null;
  private _loginPanel!: BABYLON.GUI.Rectangle;
  private _initScreen: number = 0;

  private visitNumber: VeryNumber = new VeryNumber("vistnum", 0);
  private visitText!: BABYLON.GUI.TextBlock;

  private _location: ExhibitsLocation = {
    y: 20,
    left: true,
    angle: new BABYLON.Vector3(90, 0, 0),
    position1: new BABYLON.Vector3(130, 20, 87),
    position2: new BABYLON.Vector3(130, 20, -10),
  };
  static _loginPanel: any;
  public static lang_flg: number;

  private _guideElement: UIControl = new UIControl();
  private _waiting: boolean = false;
  private _key: number = 0;
  private picParent: BABYLON.GUI.Rectangle = null;
  private _pics: BABYLON.GUI.Container[] = [];
  public json: any;
  public albumJson: any;
  public modelJson: any;
  private allowID: string[];
  public static assembleData: any;
  private fontFamily: string = "微软雅黑";
  private fontSize: number = 30;
  private fontColor: string = "#000";
  private fontFamilyChanged: boolean = false;
  private fontSizeChanged: boolean = false;
  private fontColorChanged: boolean = false;
  private titleFamily: string = "微软雅黑";
  private titleSize: number = 50;
  private titleColor: string = "#9C9C9C";
  private titleFamilyChanged: boolean = false;
  private titleSizeChanged: boolean = false;
  private titleColorChanged: boolean = false;
  public static _modelList: { [key: string]: BABYLON.Node } = {};
  private exhibits;
  private house;
  private houseLetter;
  private profile = new VeryString("profile", "");
  private museumProfile = new VeryList("museumProfile", new VeryString("", ""));
  private loginUserId: string;
  private _editParent: BABYLON.TransformNode[] = [];
  private num: any;
  private _doorscopy: BABYLON.AbstractMesh[] = [];
  private _reflectionData: any;
  private _fontData: any;
  private videoListNumber: number = 0;
  private leftVideoArrow: BABYLON.GUI.Button;
  private rightVideoArrow: BABYLON.GUI.Button;
  public static hasLogin:boolean = false;
  public static profileArray:string[] = [];
  public static loginData:any = [];
  public static findTag:any = [];
  public static isCommentAvailable:boolean = true;

  private isForwardBtnDwn:boolean = false;
  private isBackwardBtnDwn:boolean = false;
  private isLeftBtnDwn:boolean = false;
  private isRightBtnDwn:boolean = false;
  public static grid: BABYLON.GUI.Grid;
  public static forwardBtn:BABYLON.GUI.Button;
  public static backBtn:BABYLON.GUI.Button;
  public static leftBtn:BABYLON.GUI.Button;
  public static rightBtn:BABYLON.GUI.Button;

  public run3(): void {
    //根据项目id和个人id，获取个人信息，用于展示个人页面
    SocketManager.Instance.GetValues([this.profile],true,777,this.editProfile.bind(this));
    //根据个人id，获取所有的名片信息，展示在名片盒中
    SocketManager.Instance.GetOnlyValues([VeryCharacter.resumeProfile],true,776,this.creatResume.bind(this));
  }
  public creatResume() {
    if (VeryCharacter.resumeProfile.value.length > 0) {
      let resumeProfileArray = [];
        for (const item of VeryCharacter.resumeProfile.value) {
          resumeProfileArray.push(item.getValue().split(","));
        }
        resumeProfileArray.map((it) => {
          $("#cardcase-box-main").append(`
          <li class="business-card">
          <div class="icon-mingpiantouxiang-bg">
            <svg class="icon icon-mingpiantouxiang-01" aria-hidden="true">
              <use xlink:href="#icon-mingpiantouxiang-01"></use>
            </svg>
          </div>
          <div class="business-card-content">
            <p class="business-card-name">${it[0]}</p>
            <p>
              <svg class="icon icon-shouji" aria-hidden="true">
                <use xlink:href="#icon-shouji"></use>
              </svg>
              <span class="business-card-phone">${it[2]}</span>
            </p>
          </div>
          <div class="redirect-exhibition"><span>${it[4]}</span></div>
          <span class="information">${it}</span>
        </li>
          `);
        });
        //打开名片，出现收藏的名片页面
        $(".business-card").on("click",function(){
          //close all
          $(
            ".diy-model-change,.operating-instructions-box,#bg,.profile-box,.cardcase-box,.share-box,.profile-edit,.board-box,.diy-bgm,.diy-des,.diy-common,.diy-big,.diy-pic,.diy-pic-link,.diy-pic-video,.diy-pic-model,.diy-pic-360-link,.diy-album,.diy-album-add-box,.diy-pic-pdf,.diy-video,.diy-tietu,.diy-question,.diy-exhibitLink,.diy-model,.diy-model-model,.diy-material"
          ).hide();
          $("#bg").show();
          const ulBtnNode = $(
            ".share-btn,.support-btn,.resume-btn,.map-btn,.profile-btn,.signboard-btn,.common-btn,.bgm-btn,.commentary-btn,.caizhitihuan-btn,.initPostion-btn"
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
    }
  }

  //更换名片信息
  public updateResume() {
    console.log($("parent > child:last").text)
  }
  public async addMP() {
    let res = await axios.get("./data/assemble.json");
    this.exhibits = res.data;
    if (this.museumProfile.value.length > 0) {
      let veryStr = new VeryString(
        "",
        this.exhibits.lobby[0].museumProfile + "," + VeryNettyPara.ProjectID
      );
      let index = this.museumProfile.indexOf(veryStr);
      if (index === -1) {
        let veryStr = new VeryString(
          "",
          this.exhibits.lobby[0].museumProfile + "," + VeryNettyPara.ProjectID
        );
        this.museumProfile.add(veryStr);
        console.log(this.museumProfile);
        SocketManager.Instance.OperateOnlyPersonList(
          this.museumProfile,
          veryStr,
          true,
          "add"
        );
        let museumProfileArray = [];
        for (const item of this.museumProfile.value) {
          museumProfileArray.push(item.getValue().split(","));
        }
        museumProfileArray.map((it) => {
          $("#cardcase-box-main").append(`
          <li class="business-card">
          <div class="icon-mingpiantouxiang-bg">
            <svg class="icon icon-mingpiantouxiang-01" aria-hidden="true">
              <use xlink:href="#icon-mingpiantouxiang-01"></use>
            </svg>
          </div>
          <div class="business-card-content">
            <p class="business-card-name">${it[0]}</p>
            <p>
              <svg class="icon icon-shouji" aria-hidden="true">
                <use xlink:href="#icon-shouji"></use>
              </svg>
              <span class="business-card-phone">${it[1]}</span>
            </p>
          </div>
          <a href="http://ve.cool360.com/${it[2]}/index.html">
          <div class="redirect-exhibition"><span>立即进入</span></div></a>
        </li>
          `);
        });
      } else {
        console.log(this.museumProfile.value);
        let museumProfileArray = [];
        for (const item of this.museumProfile.value) {
          museumProfileArray.push(item.getValue().split(","));
        }
        museumProfileArray.map((it) => {
          $("#cardcase-box-main").append(`
          <li class="business-card">
          <div class="icon-mingpiantouxiang-bg">
            <svg class="icon icon-mingpiantouxiang-01" aria-hidden="true">
              <use xlink:href="#icon-mingpiantouxiang-01"></use>
            </svg>
          </div>
          <div class="business-card-content">
            <p class="business-card-name">${it[0]}</p>
            <p>
              <svg class="icon icon-shouji" aria-hidden="true">
                <use xlink:href="#icon-shouji"></use>
              </svg>
              <span class="business-card-phone">${it[1]}</span>
            </p>
          </div>
          <a href="http://ve.cool360.com/${it[3]}/index.html">
          <div class="redirect-exhibition"><span>立即进入</span></div></a>
        </li>
          `);
        });
      }
    } else {
      let veryStr = new VeryString("", this.exhibits.lobby[0].museumProfile);
      this.museumProfile.add(veryStr);
      console.log(this.museumProfile);
      console.log(this.museumProfile.value);
      SocketManager.Instance.OperateOnlyPersonList(
        this.museumProfile,
        veryStr,
        true,
        "add"
      );
    }
  }

  //更新显示profile页面
  public editProfile(): void {
    if (this.profile.value) {
      Exhibits.profileArray = this.profile.value.split(",");
      console.log(Exhibits.profileArray)
      let lang = parseInt(this.getCookie("language"));
      $("#profile-box-name").text(Exhibits.profileArray[0]);
      VeryNettyPara.UserName = Exhibits.profileArray[0];
      $("#profile-box-account").text(Exhibits.profileArray[2]);
      //性别显示
      if (Exhibits.profileArray[1] === "m") {
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
      //单位
      if(Exhibits.profileArray[3] && Exhibits.profileArray[3] !==""&& Exhibits.profileArray[3] !==undefined){
        $("#profile-box-unit").val(Exhibits.profileArray[3]);
      }
      //title
      if(Exhibits.profileArray[4] && Exhibits.profileArray[4] !==""&& Exhibits.profileArray[4] !==undefined){
        $("#profile-box-title").val(Exhibits.profileArray[4]);
      }
    }
  }

  public constructor(scene: BABYLON.Scene, canvas: HTMLCanvasElement,engine:BABYLON.Engine) {
    //创建360全景照片
    let creat360Photo = new  tex_create(engine,scene);
    //加载language cookie
    var user = this.getCookie("language");
    if (user != "" && user != null) {
      Exhibits.lang_flg = parseInt(user);
    } else Exhibits.lang_flg = 0;

    //初始位置设置
    $(".initPostion-btn").on("click", () => {
      let that = this;
      if (SocketManager.isPTP) {
        let posX = that._scene.getMeshByName("角色").absolutePosition.x;
        let posY = that._scene.getMeshByName("角色").absolutePosition.y;
        let posZ = that._scene.getMeshByName("角色").absolutePosition.z;
        Exhibits.assembleData.lobby[0].position = [posX, posY, posZ];
        // creat360Photo.set_position(that._scene.getMeshByName("角色").absolutePosition,engine,that._scene);
      } else {
        let posX = (that._scene.activeCamera as BABYLON.UniversalCamera).position.x;
        let posY = (that._scene.activeCamera as BABYLON.UniversalCamera).position.y;
        let posZ = (that._scene.activeCamera as BABYLON.UniversalCamera).position.z;
        Exhibits.assembleData.lobby[0].position = [posX, posY, posZ];
        // creat360Photo.set_position((that._scene.activeCamera as BABYLON.UniversalCamera).position,engine,that._scene);
      }

      let rotX = (that._scene.activeCamera as BABYLON.UniversalCamera).rotation.x;
      let rotY = (that._scene.activeCamera as BABYLON.UniversalCamera).rotation.y;
      let rotZ = (that._scene.activeCamera as BABYLON.UniversalCamera).rotation.z;
      Exhibits.assembleData.lobby[0].rotation = [rotX, rotY, rotZ];
      console.log(Exhibits.assembleData)
      let run = new Promise(function (resolve, reject) {
        resolve(that.updateDataAndJson("assemble"))
      })
        .then(function () {
          $(".system-success-text").text("修改初始位置成功");
          $(".system-success").show().delay(300).hide(500);
          $("#bg").hide();
          that.removeallbg();
        })
    })
    //方向按键
    Exhibits.grid = new BABYLON.GUI.Grid("screen-cameraMove");
    Exhibits.grid.isVisible = false;
    UIMain.advancedTexture.addControl(Exhibits.grid);
    Exhibits.grid.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    Exhibits.grid.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    Exhibits.grid.width = "342px";
    Exhibits.grid.height = "228px";
    Exhibits.grid.top = "-48px";
    Exhibits.grid.addRowDefinition(0.2);
    Exhibits.grid.addRowDefinition(0.2);
    UIMain.advancedTexture.addControl(Exhibits.grid);

    var newGrid = new BABYLON.GUI.Grid();
    newGrid.addColumnDefinition(0.5);
    newGrid.addColumnDefinition(0.5);
    newGrid.addColumnDefinition(0.5);
    Exhibits.grid.addControl(newGrid, 1, 0);

    Exhibits.forwardBtn = BABYLON.GUI.Button.CreateImageOnlyButton("forward", "images/system/forward.png");
    Exhibits.forwardBtn.width = 0.333;
    Exhibits.forwardBtn.height = 1;
    Exhibits.forwardBtn.thickness = 0;
    Exhibits.grid.addControl(Exhibits.forwardBtn, 0, 0);

    Exhibits.forwardBtn.onPointerDownObservable.add(() => {
      this.isForwardBtnDwn = true;
    });
    Exhibits.forwardBtn.onPointerUpObservable.add(() => {
      this.isForwardBtnDwn = false;
    });

    Exhibits.backBtn = BABYLON.GUI.Button.CreateImageOnlyButton("back", "images/system/back.png");
    Exhibits.backBtn.width = 1;
    Exhibits.backBtn.height = 1;
    Exhibits.backBtn.thickness = 0;
    newGrid.addControl(Exhibits.backBtn, 0, 1);

    Exhibits.backBtn.onPointerDownObservable.add(() => {
      this.isBackwardBtnDwn = true;
    });
    Exhibits.backBtn.onPointerUpObservable.add(() => {
      this.isBackwardBtnDwn = false;
    });

    Exhibits.leftBtn = BABYLON.GUI.Button.CreateImageOnlyButton("left", "images/system/left.png");
    Exhibits.leftBtn.width = 1;
    Exhibits.leftBtn.height = 1;
    Exhibits.leftBtn.thickness = 0;
    newGrid.addControl(Exhibits.leftBtn, 0, 0);

    Exhibits.leftBtn.onPointerDownObservable.add(() => {
      this.isLeftBtnDwn = true;
    });
    Exhibits.leftBtn.onPointerUpObservable.add(() => {
      this.isLeftBtnDwn = false;
    });

    Exhibits.rightBtn = BABYLON.GUI.Button.CreateImageOnlyButton("right", "images/system/right.png");
    Exhibits.rightBtn.width = 1;
    Exhibits.rightBtn.height = 1;
    Exhibits.rightBtn.thickness = 0;
    newGrid.addControl(Exhibits.rightBtn, 0, 2);

    Exhibits.rightBtn.onPointerDownObservable.add(() => {
      this.isRightBtnDwn = true;
    });
    Exhibits.rightBtn.onPointerUpObservable.add(() => {
      this.isRightBtnDwn = false;
    });

    let _forwardValue: number = 1;
    let _backValue: number = 1;
    let _leftValue: number = 1;
    let _rightValue: number = 1;

    scene.onBeforeRenderObservable.add(() => {
      if(!Exhibits.assembleData.lobby[0].PTP){
        if (this.isForwardBtnDwn) {
          (this._scene.activeCamera as BABYLON.UniversalCamera).cameraDirection.addInPlace((this._scene.activeCamera as BABYLON.UniversalCamera).getDirection(BABYLON.Vector3.Forward()).scale(_forwardValue));
        }
        if (this.isBackwardBtnDwn) {
          (this._scene.activeCamera as BABYLON.UniversalCamera).cameraDirection.addInPlace((this._scene.activeCamera as BABYLON.UniversalCamera).getDirection(BABYLON.Vector3.Backward()).scale(_backValue));
        }
        if (this.isRightBtnDwn) {
          (this._scene.activeCamera as BABYLON.UniversalCamera).cameraDirection.addInPlace((this._scene.activeCamera as BABYLON.UniversalCamera).getDirection(BABYLON.Vector3.Right()).scale(_leftValue));
        }
        if (this.isLeftBtnDwn) {
          (this._scene.activeCamera as BABYLON.UniversalCamera).cameraDirection.addInPlace((this._scene.activeCamera as BABYLON.UniversalCamera).getDirection(BABYLON.Vector3.Left().scale(_rightValue)));
        }
      }
    });

    //login界面
    $(".login-btn").on("click", () => {
      let that = this;
      userLogin({
        account: $("#account").val(),
        password: $("#password").val(),
        softwareId: VeryNettyPara.ProjectID
      })
        .then(function (response) {
          let data = response.data;
          if (data.code === "00000") {
            // 登录成功
            Exhibits.loginData = data.data;
            $(".system-success-text").text("登录成功");
            $(".login-box").hide();
            $("#bg").hide();
            that.removeallbg();
            $(".system-success").show().delay(500).hide(300);
            Exhibits.hasLogin = true;
            VeryNettyPara.haslogin = true;
            VeryNettyPara.UserName = data.data.userName;
            VeryNettyPara.UserID = data.data.phone;
            that.loginUserId = VeryNettyPara.UserID;
            console.log(data.data);
            that._doorscopy = [...Question._doors];
            console.log(that._doorscopy);

            (that._scene.activeCamera as BABYLON.UniversalCamera).speed = 10;
            (that._scene.activeCamera as BABYLON.UniversalCamera).inputs.attached.mouse.attachControl(that._canvas);

            SocketManager.Instance.OperateNum(that.onlineNumber, "+", 369, () => { });
            SocketManager.Instance.ValTimeStart("test", () => { });
            
            //名片和权限处理
            if (data.data.tags && (data.data.tags).indexOf("diy") !== -1) {
              $(".setup-btn").css("display", "inline-block");
            }
          } else {
            // 登录认证错误
            window.alert(data.message);
            $("#account").val("");
            $("#password").val("");
          }
        })
        .then(() => {
          queryPersonTag({ softwareId: "qiTestTag" }).then(function (response) {
            let data = response.data;
            if (data.code === "00000") {
              let findTag = data.data;
              if (findTag.length > 0) {
                that.profile.value = findTag[findTag.length-1];
                //根据项目id和个人id存储数据
                SocketManager.Instance.SaveValues([that.profile], true, 123);
              } else {
                if (Exhibits.loginData.tags) {
                  let tagResult = [];
                  Exhibits.loginData.tags.forEach((element) => {
                    if (
                      element.search(Exhibits.loginData.userName) !== -1
                    ) {
                      tagResult.push(element);
                    }
                  });
                  console.log(tagResult);
                  if (tagResult.length > 0) {
                    //原先账号中存储了信息，切换到固定软件id，绑定个人信息
                    BindPersonTag({tagName: tagResult[0],softwareId: "qiTestTag"});
                    that.profile.value = tagResult[0];
                    SocketManager.Instance.SaveValues([that.profile], true, 123);
                  } else {
                    //原先账号中没有存储信息,切换到固定软件id，绑定个人信息
                    let tags =Exhibits.loginData.userName +",m" +"," +Exhibits.loginData.phone;
                    console.log(tags);
                    BindPersonTag({ tagName: tags, softwareId: "qiTestTag" });
                    that.profile.value = tags;
                    SocketManager.Instance.SaveValues([that.profile], true, 123);
                  }
                }
              }
            }
          }) 
        })
        .then(()=>{
          that.run3();
        })
        .catch(function (error) {
          window.alert("登录超时，服务器未响应");
          console.log(error);
        });
    })

    //wander按钮
    $(".wander-btn").on("click", (e) => {
      $(e.target).parent().hide(150, "linear");
      $("#bg").hide();
      $(".login-box").hide();
      this.removeallbg()
    })
    //register btn
    $(".register-btn").on("click", () => {
      //默认选择第一个性别
      $('input:radio:first').attr('checked', 'checked');
      $(".icon--nan").css({
        'display': 'none'
      });
      //消息清空
      $(".register-box :text").each(function () {
        $(this).val("")
      });
      $(".login-box").hide();
      $(".register-box").show();
    })
    //Reregister btn
    $(".forget-password").on("click", () => {
      //消息清空
      $(".Reregister-box :text").each(function () {
        $(this).val("")
      });
      $(".login-box").hide();
      $(".Reregister-box").show();
    })
    //返回按钮
    $(".icon-fanhui1").on("click",(e)=>{
      $(e.target).parent().hide(150, "linear");
      $(".login-box").show(150, "linear");
    })

    //register captcha
    $(".register-Captcha-text").on("click",()=>{
      let that = this;
      registerCaptcha({
          phone: $("#register-account").val()
        })
          .then(function(response) {
            let data = response.data;
            if (data.code === "00000") {
              $(".system-success-text").text("验证码发送成功");
              $(".system-success").show().delay(500).hide(300);
            } else {
              // 登录认证错误
              window.alert(data.message);
            }
          })
          .catch(function(error) {
            window.alert("登录超时，服务器未响应");
            console.log(error);
          });
    })

    //find password
    $(".Reregister-Captcha-text").on("click",()=>{
      let that = this;
      userFindpwd({
          phone: $("#Reregister-account").val()
        })
          .then(function(response) {
            let data = response.data;
            if (data.code === "00000") {
              $(".system-success-text").text("验证码发送成功");
              $(".system-success").show().delay(500).hide(300);
            } else {
              // 登录认证错误
              window.alert(data.message);
            }
          })
          .catch(function(error) {
            window.alert("登录超时，服务器未响应");
            console.log(error);
          });
    })

    //register
    $(".register-confirm").on("click", () => {
      let that = this;
      if($("#register-name").val()!==""){
        let genderDefault = $("input[name='gender']:checked").val();
        if($("input[name='gender']:checked").val()==""){
          genderDefault = "f"
        }
        userRegister({
          phone: $("#register-account").val(),
          password: $("#register-password").val(),
          captcha: $("#register-Captcha").val(),
          userName: $("#register-name").val(),
          softwareId: VeryNettyPara.ProjectID,
          tag: $("#register-name").val() +","+ genderDefault+","+$("#register-account").val() +","+$("#register-unit").val()+","+$("#register-title").val()
        })
          .then(function(response) {
            let data = response.data;
            console.log(data,$("#register-name").val() +","+$("input[name='gender']:checked").val()+","+$("#register-account").val() +","+$("#register-unit").val()+","+$("#register-title").val());
            if (data.code === "00000") {
              $(".system-success-text").text("注册用户成功");
              $(".register-box").hide();
              $(".system-success").show().delay(500).hide(300);
              $(".login-box").show();
              console.log(data.data);
              let tagResult:string = $("#register-name").val() +","+$("input[name='gender']:checked").val()+","+$("#register-account").val() +","+$("#register-unit").val()+","+$("#register-title").val();
              BindPersonTag({ tagName:tagResult,softwareId: "qiTestTag" })
            } else {
              // 登录认证错误
              window.alert(data.message);
            }
          })
          .catch(function(error) {
            window.alert("登录超时，服务器未响应");
            console.log(error);
          });
      } else {
        window.alert("请完整填写后再次提交");
      }
    });

    //Reregister
    $(".Reregister-confirm").on("click", () => {
      userReregister({
        phone: $("#Reregister-account").val(),
        password: $("#Reregister-password").val(),
        captcha: $("#Reregister-Captcha").val()
      })
        .then(function(response) {
          let data = response.data;
          if (data.code === "00000") {
            $(".system-success-text").text("找回密码成功");
            $(".Reregister-box").hide();
            $(".system-success").show().delay(500).hide(300);
            $(".login-box").show();
            console.log(data.data);
          } else {
            // 登录认证错误
            window.alert(data.message);
            console.log(data)
          }
        })
        .catch(function(error) {
          window.alert("登录超时，服务器未响应");
          console.log(error);
        });
    });

    $(".profile-box-signout").on("click", () => {

    })
    //update profile
    $(".profile-box-confirm").on("click", () => {
      //获取当前信息
      let tagResult = [];
      let userName = Exhibits.profileArray[0];
      let account = Exhibits.profileArray[2];
      let gender:any;
      if($("input[name='gender']:checked").val() === undefined){
        gender = "m";
      } else {
        gender = $("input[name='gender']:checked").val();
      }
      let company = $("#profile-box-unit").val();
      let title = $("#profile-box-title").val();
      let result = [userName,gender,account,company,title].join(',');
      tagResult.push(result);
      
      //保存上传
      queryPersonTag({ softwareId: "qiTestTag" }).then(function (response) {
        let data = response.data;
            if (data.code === "00000") {
              BindPersonTag({tagName: tagResult[0],softwareId: "qiTestTag"});
              that.profile.value = tagResult[0];
              SocketManager.Instance.SaveValues([that.profile], true, 123);
            }
      })
      .then(()=>{
        $(".system-success-text").text("修改信息成功");
        $(".profile-box").hide(150, "linear");
        $("#bg").hide();
        that.removeallbg();
        $(".system-success").show().delay(500).hide(300);
      })
    })

    //update password
    $(".profile-box-forget-password").on("click", () => {
      //消息清空
      $(".Reregister-box :text").each(function () {
        $(this).val("")
      });
      $(".profile-box").hide();
      $(".Reregister-box").show();
    })

    this._scene = scene;
    this._canvas = canvas;

    let that = this;

    this._videoPlane = BABYLON.MeshBuilder.CreatePlane(
      "exhibit-video-plane",
      { width: this._videoLength, height: (this._videoLength * 9) / 16 },
      this._scene
    );
    this._videoClosePlane = BABYLON.MeshBuilder.CreatePlane(
      "exhibit-close-video-plane",
      { width: this._videoLength + 40, height: this._videoLength + 40 },
      this._scene
    );

    this._videoParent = new BABYLON.TransformNode(
      "exhibit-video-parent",
      this._scene
    );
    this._videoPlane.setParent(this._videoParent);
    this._videoClosePlane.setParent(this._videoParent);
    this._videoParent.setAbsolutePosition(new BABYLON.Vector3(-160, 158, 67));
    this._videoPlane.rotation = new BABYLON.Vector3(90, 0, 0).multiplyByFloats(
      Math.PI / 180,
      Math.PI / 180,
      Math.PI / 180
    );
    this._videoPlane.position = new BABYLON.Vector3(
      10 + this._videoLength / 2,
      0,
      0
    );
    this._videoClosePlane.rotation = new BABYLON.Vector3(
      90,
      0,
      0
    ).multiplyByFloats(Math.PI / 180, Math.PI / 180, Math.PI / 180);
    this._videoClosePlane.position = new BABYLON.Vector3(
      this._videoPlane.position.x,
      this._videoPlane.position.y,
      this._videoPlane.position.z
    );
    this._videoCloseAdvancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(
      this._videoClosePlane
    );
    // 关闭按钮
    let closeBtn = BABYLON.GUI.Button.CreateImageOnlyButton(
      "close",
      "images/exhibits/close.png"
    );
    closeBtn.top = "-260px";
    closeBtn.left = "-450px";
    closeBtn.width = "50px";
    closeBtn.height = "50px";
    closeBtn.color = "#FFFFFF00";
    closeBtn.background = "#FFFFFF00";
    closeBtn.children[0].color = "#696969";
    closeBtn.children[0].fontSize = 20;
    closeBtn.thickness = 0;
    closeBtn.onPointerClickObservable.add((info) => {
      // that.close();
      this.closeVideo();
    });
    this._videoCloseAdvancedTexture.addControl(closeBtn);
    this._videoParent.setEnabled(false);

    // 鼠标点击视频暂停控制
    this._scene.onPointerObservable.add((pInfo) => {
      if (that._videoPlaying) {
        if (pInfo.type === BABYLON.PointerEventTypes.POINTERPICK) {
          if (pInfo.pickInfo !== null && pInfo.pickInfo.pickedMesh !== null) {
            if (pInfo.pickInfo.pickedMesh === this._videoPlane) {
              if (this._videoTex.video.paused) {
                this._videoTex.video.play();
                GlobalControl.PauseAudio(true);
                GlobalControl.PauseScreenVideo();
              } else {
                this._videoTex.video.pause();
                GlobalControl.PauseAudio(false);
              }
            }
          }
        }
      }
    });

    //记住密码登录
    if (window.sessionStorage.getItem(window.location.href) !== null) {
      window.sessionStorage.removeItem(window.location.href)
      hasLogin({}).then(function (response) {
        let data = response.data;
        if (data.code === "00000") {
          // 登录成功
          Exhibits.loginData = data.data;
          Exhibits.hasLogin = true;
          VeryNettyPara.haslogin = true;
          VeryNettyPara.UserName = data.data.userName;
          VeryNettyPara.UserID = data.data.phone;
          that.loginUserId = VeryNettyPara.UserID;
          that._doorscopy = [...Question._doors];

          (that._scene.activeCamera as BABYLON.UniversalCamera).speed = 10;
          (that._scene.activeCamera as BABYLON.UniversalCamera).inputs.attached.mouse.attachControl(that._canvas);

          SocketManager.Instance.OperateNum(that.onlineNumber, "+", 369, () => { });
          SocketManager.Instance.ValTimeStart("test", () => { });

          //名片和权限处理
          if (data.data.tags && (data.data.tags).indexOf("diy") !== -1) {
            $(".setup-btn").css("display", "inline-block");
          }
        }
      })
        .then(() => {
          queryPersonTag({ softwareId: "qiTestTag" }).then(function (response) {
            let data = response.data;
            if (data.code === "00000") {
              let findTag = data.data;
              if (findTag.length > 0) {
                that.profile.value = findTag[findTag.length - 1];
                //根据项目id和个人id存储数据
                SocketManager.Instance.SaveValues([that.profile], true, 123);
              } else {
                if (Exhibits.loginData.tags) {
                  let tagResult = [];
                  Exhibits.loginData.tags.forEach((element) => {
                    if (
                      element.search(Exhibits.loginData.userName) !== -1
                    ) {
                      tagResult.push(element);
                    }
                  });
                  console.log(tagResult);
                  if (tagResult.length > 0) {
                    //原先账号中存储了信息，切换到固定软件id，绑定个人信息
                    BindPersonTag({ tagName: tagResult[0], softwareId: "qiTestTag" });
                    that.profile.value = tagResult[0];
                    SocketManager.Instance.SaveValues([that.profile], true, 123);
                  } else {
                    //原先账号中没有存储信息,切换到固定软件id，绑定个人信息
                    let tags = Exhibits.loginData.userName + ",m" + "," + Exhibits.loginData.phone;
                    console.log(tags);
                    BindPersonTag({ tagName: tags, softwareId: "qiTestTag" });
                    that.profile.value = tags;
                    SocketManager.Instance.SaveValues([that.profile], true, 123);
                  }
                }
              }
            }
          })
        })
        .then(() => {
          that.run3();
        })
        .catch(function (error) {
          window.alert("登录超时，服务器未响应");
          console.log(error);
        });
    }
    
    
    //初始界面出现login界面
    this._scene.onPointerObservable.add((pInfo) => {
      if (this._initScreen == 0 &&reloadnum == 0 &&pInfo.type === BABYLON.PointerEventTypes.POINTERDOWN && !Exhibits.hasLogin) {
        this._initScreen = 1;
        $(".login-box").toggle(200);
        BABYLON.Engine.audioEngine.unlock();
      } else if (reloadnum > 0 &&pInfo.type === BABYLON.PointerEventTypes.POINTERDOWN) {
        $(".login-box").toggle(200);
      }
    });
    //图集关闭
    this._scene.onPointerObservable.add((info) => {
      if (info.type === BABYLON.PointerEventTypes.POINTERDOWN &&info.event.button === 0) {
        if (this.picParent !== null) {
          if (info.pickInfo !== null && info.pickInfo.pickedMesh !== null) {
            that.closepicture();
            if (this._plane2) {
              if (this._plane2.isEnabled!) {
                this._plane2.setEnabled(true);
              }
            }
          }
        }
      }
    });
    this.loadData();
    this.loadPicData();
    this.loadTextData();
    this.initUI();
    this.showDiyButton();
  }

  private setCookie(cname: string, cvalue: number, exdays: number) {
    var d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }

  private getCookie(cname: string) {
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

  private Co(tag: boolean) {
    if (tag) {
      SocketManager.Instance.OperateNum(
        this.visitNumber,
        "+",
        25,
        this.Do.bind(this)
      );
    }
  }

  private Do() {
    this.visitText.text = this.visitNumber.value.toString();
    if (this.visitNumber.value < 100) {
      this.visitText.fontSize = "200px";
    }
    if (this.visitNumber.value < 1000 && this.visitNumber.value >= 100) {
      this.visitText.fontSize = "150px";
    }
    if (this.visitNumber.value >= 1000) {
      this.visitText.fontSize = "100px";
    }
  }

  private loadData(): void {
    let that = this;
    // 获取表格数据
    axios
      .get("./data/exhibits.json")
      .then(function (response) {
        that._data = response.data;
        that._success = true;
        //修改博物馆网页名称
        if (that._data["museumName"]) {
          document.title = that._data["museumName"];
        }
      })
      .catch(function (error) {
        console.log("load error: " + error);
      });
  }

  private pickedMesh!: BABYLON.AbstractMesh;
  public initUI(): void {
    let that = this;

    // GUI
    this._scene.onPointerObservable.add((info) => {
      if (
        info.type === BABYLON.PointerEventTypes.POINTERTAP &&
        info.event.button === 0
      ) {
        if (info.pickInfo && info.pickInfo.hit) {
          that.pickedMesh = info.pickInfo.pickedMesh!;
          // 判断当前点击画面是否包含展示信息
          if (
            this._success &&
            !this._record[that.pickedMesh.name] &&
            this._data &&
            this._data[that.pickedMesh.name]
          ) {
            // 若有展示信息，首先关闭之前打开的展示UI
            if (
              !CallBackManager.IsExitDirectSend(3) &&
              !CallBackManager.IsExitDirectSend(4)
            ) {
              this.close(this._lastName);
              this._lastName = that.pickedMesh.name;

              if (SocketManager.IsConnceted) {
                this.comments.clear();
                this.personlike.value = false;
                this.likecount.value = 0;
                this._tag = true;
                this.personlike.name = this._lastName + "personlike";
                this.comments.name = this._lastName + "comments";
                this.likecount.name = this._lastName + "likecount";
                this.openNumber.name = this._lastName + "openNumber";
                SocketManager.Instance.GetValues(
                  [this.personlike],
                  true,
                  4,
                  this.run1.bind(this)
                );
                SocketManager.Instance.OperateNum(
                  this.openNumber,
                  "+",
                  699,
                  () => void {}
                );
              } else {
                this.display(this.pickedMesh);
                this.openNumber.name = this._lastName + "openNumber";
                SocketManager.Instance.OperateNum(
                  this.openNumber,
                  "+",
                  699,
                  () => void {}
                );
              }

              // 相机定位
              let emptyPerson = new BABYLON.TransformNode("empty", this._scene);
              emptyPerson.setParent(that.pickedMesh);
              emptyPerson.rotation = BABYLON.Vector3.Zero();
              emptyPerson.position = new BABYLON.Vector3(
                0,
                230 / that.pickedMesh.scaling.y,
                0
              );
              emptyPerson.setParent(null);
              //if ptp
              if (Exhibits.assembleData.lobby[0].PTP) {
                VeryCharacter.SetPosition(emptyPerson.position.x, emptyPerson.position.z, that.pickedMesh.absolutePosition);
              } else {
                this._scene.activeCamera!.position.x = emptyPerson.position.x;
                this._scene.activeCamera!.position.z = emptyPerson.position.z;
                //展画有父物体，就需要设定绝对坐标
                (this._scene.activeCamera! as BABYLON.UniversalCamera).setTarget(
                  that.pickedMesh.absolutePosition
                );
              }
              emptyPerson.dispose();
            }
          }

          if (
            this._success &&
            this._record[that.pickedMesh.name] &&
            this._data &&
            this._data[that.pickedMesh.name]
          ) {
            that.close();
            that._tag = true;
            that.comments.clear();
          }
          // //空白处点击展画关闭
          // if (
          //   that.pickedMesh.name !== "_ui-exhibits-plane2" &&
          //   that.pickedMesh.name !== "exhibit-video-plane" &&
          //   that.pickedMesh.name !== "_ui-exhibits-PicPlane" &&
          //   that.pickedMesh.name !== "exhibit-close-video-plane"
          // ) {
          //   that.close();
          //   that._tag = true;
          //   that.comments.clear();
          // }
        }
      }
    });
  }

  private comments: VeryList = new VeryList("comments", new VeryString("", ""));
  private likecount: VeryNumber = new VeryNumber("likecount", 0);
  private personlike: VeryBool = new VeryBool("personlike", false);
  private onlineNumber: VeryNumber = new VeryNumber("onlineNumber", 0);
  private openNumber: VeryNumber = new VeryNumber("openNumber", 0);

  public run1() {
    SocketManager.Instance.GetValues(
      [this.comments, this.likecount],
      false,
      3,
      this.run2.bind(this)
    );
    console.log(this.comments);
  }

  public run2() {
    this.display(this.pickedMesh);
  }

  public display(exhibit: BABYLON.AbstractMesh): void {
    this._record[exhibit.name] = true;
    this.createParent(exhibit);
    // 根据名字提取展示信息
    let paras: any = this._data[exhibit.name];
    // 控制按钮
    this.createControlButton(paras,exhibit);
    // 展示面板显示
    this.createDisplayPanel(paras);

    // 若有语音，则关闭
    // if(GlobalControl.stopAudio) {
    //   GlobalControl.stopAudio();
    // }
  }

  private createParent(exhibit: BABYLON.AbstractMesh): void {
    this._parent = new BABYLON.TransformNode(
      "parent-" + exhibit.name,
      this._scene
    );
    this._parent.setParent(exhibit);
    this._parent.position = BABYLON.Vector3.Zero();
    this._parent.rotation = BABYLON.Vector3.Zero();
    this._parent.setParent(null);
    this._parent.scaling = new BABYLON.Vector3(1, 1, 1);
    this._parentObj = new GameObject("parent", null, this._parent);
    // TODO: 角度有点偏差如何处理
  }

  private createControlButton(paras: any,exhibit: BABYLON.AbstractMesh): void {
    let that = this;

    // 按钮是否在左侧
    this._location.left = true;
    if (paras.left !== undefined && paras.left === false) {
      // 按钮在左侧
      this._location.left = false;
    }
    if (this._location.left) {
      this._location.position1.x = 120;
      this._location.position2.x = 120;
    } else {
      this._location.position1.x = -120;
      this._location.position2.x = -120;
    }
    this._location.position1.z = 80;

    // y轴相对位置
    this._location.y = 20/exhibit.scaling.y;
    if (paras.y !== undefined) {
      // 按钮在左侧
      this._location.y = paras.y;
    }
    this._location.position1.y = this._location.y;
    this._location.position2.y = this._location.y;
  }

  private _tag = true;
  private createDisplayPanel(paras: any): void {
    let that = this;

    let plane2 = BABYLON.MeshBuilder.CreatePlane(
      "_ui-exhibits-plane2",
      { height: this._plane2Size, width: this._plane2Size },
      this._scene
    );
    let obj2 = new GameObject("plane2", plane2);
    obj2.transform.parent = this._parentObj.transform;
    obj2.transform.localPosition = this._location.position2;
    obj2.transform.localEulerAngles = this._location.angle;

    this._plane2 = plane2;

    this.meshAdvancedTexture2 = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(
      plane2
    );

    let composePanel = new BABYLON.GUI.StackPanel();
    composePanel.isPointerBlocker = true;
    composePanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    this.meshAdvancedTexture2.addControl(composePanel);

    // **文字信息展示区域** //
    let infoRect = new BABYLON.GUI.Rectangle("info-area");
    infoRect.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    // infoRect.top = "70px";
    // infoRect.width = "400px";
    // infoRect.height = "200px";
    infoRect.background = "#ffffffB2";
    infoRect.color = "#ffffffB2";
    infoRect.thickness = 0;
    infoRect.cornerRadius = 10;
    infoRect.width = "100%";
    infoRect.height = "600px";
    infoRect.paddingLeft = "50px";
    composePanel.addControl(infoRect);
    // 中文标题
    let chineseTitle = new BABYLON.GUI.TextBlock("title-chinese");
    chineseTitle.fontSize = 50;
    chineseTitle.fontStyle = "bold";
    chineseTitle.textHorizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    chineseTitle.horizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    chineseTitle.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    chineseTitle.text = paras.title;
    chineseTitle.color = "#404040E5";
    // chineseTitle.left = "0px";
    // chineseTitle.top = "0px";
    chineseTitle.width = "100%";
    chineseTitle.height = "120px";
    chineseTitle.paddingLeft = "30px";
    chineseTitle.paddingRight = "30px";
    infoRect.addControl(chineseTitle);

    // 英文标题
    if (paras.english !== undefined && paras.english !== "") {
      let englishTitle = new BABYLON.GUI.TextBlock("title-english");
      englishTitle.fontSize = 35;
      // englishTitle.fontStyle = "bold";
      englishTitle.textHorizontalAlignment =
        BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
      englishTitle.horizontalAlignment =
        BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
      englishTitle.verticalAlignment =
        BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
      englishTitle.text = paras.english;
      englishTitle.color = "#404040A5";
      let leftPos = chineseTitle.text.length * 46 + 40;
      englishTitle.left = Math.round(leftPos) + "px";
      englishTitle.top = "10px";
      englishTitle.width = "100%";
      englishTitle.height = "120px";
      englishTitle.paddingLeft = "30px";
      englishTitle.paddingRight = "30px";
      infoRect.addControl(englishTitle);
    }

    // 分隔线
    let titleLine = new BABYLON.GUI.TextBlock("title-line");
    titleLine.fontSize = 15;
    titleLine.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    titleLine.text =
      "_______________________________________________________________________________________________________________________________";
    titleLine.width = "100%";
    // titleLine.left = "-3px";
    titleLine.top = "100px";
    titleLine.height = "20px";
    titleLine.paddingLeft = "30px";
    titleLine.paddingRight = "30px";
    titleLine.color = "#404040";
    infoRect.addControl(titleLine);

    // 文字主体
    var sv = new BABYLON.GUI.ScrollViewer("info-scrollview");
    sv.barColor = "#ffffff00";
    sv.thickness = 0;
    sv.barSize = 0;
    sv.background = "#CCCCCC00";
    sv.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    sv.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    sv.top = "140px";
    sv.width = "100%";
    sv.height = "400px";
    sv.paddingLeft = "30px";
    sv.paddingRight = "30px";
    infoRect.addControl(sv);
    let body = new BABYLON.GUI.TextBlock("info-body");
    body.fontSize = 35;
    // indexTitle2.fontStyle = "bold";
    body.textHorizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    body.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

    body.text = paras.content;
    body.color = "#696969";
    // indexTitle2.left = "-14px";
    body.top = "0px";
    body.width = "100%";
    body.height = "400px";
    body.textWrapping = true;
    body.lineSpacing = "10px";
    sv.addControl(body);

    // 预先估算
    let tryH: number = Math.ceil(paras.content.length / 30);
    if (tryH > 7) {
      infoRect.height = "580px";
    } else {
      infoRect.height = tryH * 50 + 200 + 50 + "px";
    }

    let observor = this._scene.onBeforeCameraRenderObservable.add((info) => {
      if (body.lines) {
        let h: number = body.lines.length * 50;
        if (body.lines.length > 7) {
          body.height = h + "px";
          sv.height = "350px";
          infoRect.height = "580px";
        } else {
          body.height = h + "px";
          sv.height = h + "px";
          infoRect.height = body.lines.length * 50 + 200 + 50 + "px";
        }
      }
      this._scene.onBeforeCameraRenderObservable.remove(observor);
    });

    //功能按键
    let buttonPanel = new BABYLON.GUI.StackPanel("button-panel");
    buttonPanel.isVertical = false;
    //buttonPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    buttonPanel.verticalAlignment =
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    buttonPanel.width = "100%";
    buttonPanel.height = "80px";
    buttonPanel.paddingLeft = "30px";
    buttonPanel.paddingRight = "30px";
    infoRect.addControl(buttonPanel);

    // video按钮
    if (
      paras.video !== undefined &&
      paras.video !== "" &&
      paras.video.length !== 0
    ) {
      let videoBtn = BABYLON.GUI.Button.CreateImageOnlyButton(
        "video",
        "images/exhibits/videoButton.png"
      );
      videoBtn.horizontalAlignment =
        BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
      //videoBtn.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
      // videoBtn.thickness = 0;
      videoBtn.left = "0px";
      videoBtn.top = "0px";
      videoBtn.width = "50px";
      // videoBtn.cornerRadius = 100;
      videoBtn.height = "42px";
      videoBtn.color = "#FFFFFF00";
      videoBtn.background = "#FFFFFF00";
      videoBtn.children[0].color = "#696969";
      videoBtn.children[0].fontSize = 100;
      videoBtn.thickness = 0;
      videoBtn.onPointerClickObservable.add((info) => {
        // 播放视频
        console.log("播放视频: " + paras.video);
        that.videoSeries(paras.video);
      });
      buttonPanel.addControl(videoBtn);
    }

    // 360全景按钮
    if (paras.photo360 !== undefined && paras.photo360 !== "") {
      let Btn360 = BABYLON.GUI.Button.CreateImageOnlyButton(
        "360",
        "images/exhibits/360Button.png"
      );
      Btn360.horizontalAlignment =
        BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
      // Btn360.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
      // Btn360.thickness = 0;
      Btn360.left = "0px";
      Btn360.top = "0px";
      Btn360.width = "50px";
      // Btn360.cornerRadius = 100;
      Btn360.height = "42px";
      Btn360.color = "#FFFFFF00";
      Btn360.background = "#FFFFFF00";
      Btn360.children[0].color = "#696969";
      Btn360.children[0].fontSize = 100;
      Btn360.thickness = 0;
      Btn360.onPointerClickObservable.add((info) => {
        // 播放视频
        console.log("超链接: " + paras.link);
        if (/(http|https):\/\/([\w.]+\/?)\S*/g.test(paras.photo360)) {
          window.open(paras.photo360);
        } else {
          window.open("http://" + paras.photo360);
        }
      });
      buttonPanel.addControl(Btn360);
    }

    // 3D模型按钮
    if (
      paras.model3d !== undefined &&
      paras.model3d !== "" &&
      paras.model3d.length !== 0
    ) {
      let model3DBtn = BABYLON.GUI.Button.CreateImageOnlyButton(
        "model-3d",
        "images/exhibits/3DButton.png"
      );
      model3DBtn.horizontalAlignment =
        BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
      model3DBtn.left = "0px";
      model3DBtn.top = "0px";
      model3DBtn.width = "50px";
      model3DBtn.height = "42px";
      model3DBtn.color = "#FFFFFF00";
      model3DBtn.background = "#FFFFFF00";
      model3DBtn.children[0].color = "#696969";
      model3DBtn.children[0].fontSize = 100;
      model3DBtn.thickness = 0;
      model3DBtn.onPointerClickObservable.add((info) => {
        // 播放视频
        console.log("3d模型预览: " + paras.model3d);
        GlobalControl.OpenModelSeries(paras.model3d);
      });
      buttonPanel.addControl(model3DBtn);
    }

    //高清图片按钮 画集
    if (paras.highpic !== undefined && paras.highpic !== "") {
      let highpicBtn = BABYLON.GUI.Button.CreateImageOnlyButton(
        "high-pic",
        "images/exhibits/pictures.png"
      );
      highpicBtn.horizontalAlignment =
        BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
      highpicBtn.left = "0px";
      highpicBtn.top = "0px";
      highpicBtn.width = "50px";
      highpicBtn.height = "42px";
      highpicBtn.color = "#FFFFFF00";
      highpicBtn.background = "#FFFFFF00";
      highpicBtn.children[0].color = "#696969";
      highpicBtn.children[0].fontSize = 100;
      highpicBtn.thickness = 0;

      highpicBtn.onPointerClickObservable.add((info) => {
        console.log("画集:" + paras.highpic);
        that.initHighPic(paras.highpic);
      });
      buttonPanel.addControl(highpicBtn);
    }

    // 超链接按钮
    if (paras.link !== undefined && paras.link !== "") {
      let linkBtn = BABYLON.GUI.Button.CreateImageOnlyButton(
        "link",
        "images/exhibits/link.png"
      );
      linkBtn.horizontalAlignment =
        BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
      //linkBtn.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
      linkBtn.left = "0px";
      linkBtn.top = "0px";
      linkBtn.width = "50px";
      linkBtn.height = "42px";
      linkBtn.color = "#FFFFFF00";
      linkBtn.background = "#FFFFFF00";
      linkBtn.children[0].color = "#696969";
      linkBtn.children[0].fontSize = 100;
      linkBtn.thickness = 0;
      linkBtn.onPointerClickObservable.add((info) => {
        // 播放视频
        console.log("超链接: " + paras.link);
        if (/(http|https):\/\/([\w.]+\/?)\S*/g.test(paras.link)) {
          window.open(paras.link);
        } else {
          window.open("http://" + paras.link);
        }
      });
      buttonPanel.addControl(linkBtn);
    }
    //pdf链接
    if (paras.pdf !== undefined && paras.pdf !== "") {
      let pdflinkBtn = BABYLON.GUI.Button.CreateImageOnlyButton(
        "link",
        "images/exhibits/pdf.png"
      );
      pdflinkBtn.horizontalAlignment =
        BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
      //linkBtn.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
      pdflinkBtn.left = "0px";
      pdflinkBtn.top = "0px";
      pdflinkBtn.width = "50px";
      pdflinkBtn.height = "42px";
      pdflinkBtn.color = "#FFFFFF00";
      pdflinkBtn.background = "#FFFFFF00";
      pdflinkBtn.children[0].color = "#696969";
      pdflinkBtn.children[0].fontSize = 100;
      pdflinkBtn.thickness = 0;
      pdflinkBtn.onPointerClickObservable.add((info) => {
        // 播放视频
        console.log("pdf: " + paras.pdf);
        window.open(paras.pdf);
      });
      buttonPanel.addControl(pdflinkBtn);
    }
    // 淘宝链接按钮
    if (paras.taobao !== undefined && paras.taobao !== "") {
      let taobaolinkBtn = BABYLON.GUI.Button.CreateImageOnlyButton(
        "link",
        "images/exhibits/taobao.png"
      );
      taobaolinkBtn.horizontalAlignment =
        BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
      //linkBtn.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
      taobaolinkBtn.left = "0px";
      taobaolinkBtn.top = "0px";
      taobaolinkBtn.width = "50px";
      taobaolinkBtn.height = "42px";
      taobaolinkBtn.color = "#FFFFFF00";
      taobaolinkBtn.background = "#FFFFFF00";
      taobaolinkBtn.children[0].color = "#696969";
      taobaolinkBtn.children[0].fontSize = 100;
      taobaolinkBtn.thickness = 0;
      taobaolinkBtn.onPointerClickObservable.add((info) => {
        // 播放视频
        console.log("淘宝链接: " + paras.taobao);
        window.open(paras.taobao);
      });
      buttonPanel.addControl(taobaolinkBtn);
    }

    // **评论控制区域** //
    let operationContainer = new BABYLON.GUI.Container("operation-area");
    operationContainer.verticalAlignment =
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    operationContainer.background = "#FFE4E100";
    operationContainer.color = "#FFE4E100";
    operationContainer.width = "100%";
    operationContainer.height = "120px";
    operationContainer.paddingLeft = "50px";
    operationContainer.isVisible = Exhibits.isCommentAvailable;
    composePanel.addControl(operationContainer);

    // 评论图片标志
    let commentImage = new BABYLON.GUI.Image(
      "comment-image",
      "images/exhibits/comment2.png"
    );
    commentImage.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    commentImage.horizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    commentImage.top = "50px";
    commentImage.left = "0px";
    commentImage.width = "60px";
    commentImage.height = "60px";
    operationContainer.addControl(commentImage);

    // 评论数量
    let commentNumber = new BABYLON.GUI.TextBlock("comment-number");
    commentNumber.fontSize = 35;
    commentNumber.textHorizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    commentNumber.horizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    commentNumber.verticalAlignment =
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    commentNumber.text =
      Language.language[4][Exhibits.lang_flg] +
      "(" +
      this.comments.value.length +
      ")";
    if (this.comments.value.length >= 1000) {
      commentNumber.text = Language.language[4][Exhibits.lang_flg] + "(1k+)";
    }
    commentNumber.color = "#FFFFFFCC";
    commentNumber.top = "45px";
    commentNumber.left = "80px";
    commentNumber.width = "250px";
    commentNumber.height = "70px";
    operationContainer.addControl(commentNumber);

    let commentBut = BABYLON.GUI.Button.CreateSimpleButton("comment-image", "");
    commentBut.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    commentBut.thickness = 0;
    commentBut.color = "#FFE4E100";
    commentBut.horizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    commentBut.top = "50px";
    commentBut.left = "0px";
    commentBut.width = "330px";
    commentBut.height = "60px";
    commentBut.onPointerClickObservable.add(() => {
      if (this._tag) {
        if (this.comments.value.length > 0) {
          infoRect.isVisible = false;
          commentRect3.isVisible = false;
          sv2.isVisible = true;
          commentNumber.text =
            Language.language[5][Exhibits.lang_flg] +
            "(" +
            this.comments.value.length +
            ")";
          this._tag = false;
          if (this.comments.value.length >= 1000) {
            commentNumber.text =
              Language.language[5][Exhibits.lang_flg] + "(1k+)";
          }
        }
      } else {
        infoRect.isVisible = true;
        commentRect3.isVisible = true;
        sv2.isVisible = false;
        commentNumber.text =
          Language.language[4][Exhibits.lang_flg] +
          "(" +
          this.comments.value.length +
          ")";
        this._tag = true;
        if (this.comments.value.length >= 1000) {
          commentNumber.text =
            Language.language[4][Exhibits.lang_flg] + "(1k+)";
        }
      }
    });
    operationContainer.addControl(commentBut);

    // 点赞图片标志
    let likeImage = BABYLON.GUI.Button.CreateImageOnlyButton(
      "like-image",
      "images/exhibits/like-a.png"
    );
    let likeImage2 = BABYLON.GUI.Button.CreateImageOnlyButton(
      "like-image",
      "images/exhibits/like.png"
    );
    if (that.personlike.value) {
      likeImage2.isVisible = false;
    } else {
      likeImage.isVisible = false;
    }
    likeImage2.onPointerClickObservable.add(() => {
      this.likecount.value += 1;
      this.personlike.value = true;
      likeImage2.isVisible = false;
      likeImage.isVisible = true;
      likeNumber.text =
        Language.language[6][Exhibits.lang_flg] +
        "(" +
        this.likecount.value +
        ")";
      if (this.likecount.value >= 1000) {
        likeNumber.text = Language.language[6][Exhibits.lang_flg] + "(1k+)";
      }
      SocketManager.Instance.OperateNum(this.likecount, "+", 21, () => void {});
      SocketManager.Instance.SaveValues([this.personlike], true, 11);
    });
    likeImage.onPointerClickObservable.add(() => {
      this.likecount.value -= 1;
      this.personlike.value = false;
      likeImage2.isVisible = true;
      likeImage.isVisible = false;
      likeNumber.text =
        Language.language[6][Exhibits.lang_flg] +
        "(" +
        this.likecount.value +
        ")";
      if (this.likecount.value >= 1000) {
        likeNumber.text = Language.language[6][Exhibits.lang_flg] + "(1k+)";
      }
      SocketManager.Instance.OperateNum(this.likecount, "-", 20, () => void {});
      SocketManager.Instance.SaveValues([this.personlike], true, 10);
    });
    likeImage.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    likeImage.horizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    likeImage.thickness = 0;
    likeImage.top = "50px";
    likeImage.left = "-200px";
    likeImage.width = "60px";
    likeImage.height = "60px";
    operationContainer.addControl(likeImage);

    likeImage2.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    likeImage2.horizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    likeImage2.thickness = 0;
    likeImage2.top = "50px";
    likeImage2.left = "-200px";
    likeImage2.width = "60px";
    likeImage2.height = "60px";
    operationContainer.addControl(likeImage2);

    // 点赞数量
    let likeNumber = new BABYLON.GUI.TextBlock("like-number");
    likeNumber.fontSize = 35;
    likeNumber.textHorizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    likeNumber.horizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    likeNumber.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    likeNumber.text =
      Language.language[6][Exhibits.lang_flg] +
      "(" +
      this.likecount.value +
      ")";
    if (this.likecount.value >= 1000) {
      likeNumber.text = Language.language[6][Exhibits.lang_flg] + "(1k+)";
    }
    likeNumber.color = "#FFFFFFCC";
    likeNumber.top = "45px";
    likeNumber.left = "0px";
    likeNumber.width = "200px";
    likeNumber.height = "70px";
    operationContainer.addControl(likeNumber);

    // 发表评论图标
    let ping = new BABYLON.GUI.Image(
      "comment-image",
      "images/exhibits/ping.png"
    );
    ping.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    ping.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    ping.top = "50px";
    ping.left = "-70px";
    ping.width = "60px";
    ping.height = "60px";
    operationContainer.addControl(ping);

    // 发布评论
    let pingFa = new BABYLON.GUI.TextBlock("comment-number");
    pingFa.fontSize = 35;
    pingFa.textHorizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    pingFa.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    pingFa.horizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    pingFa.text = Language.language[7][Exhibits.lang_flg];
    pingFa.color = "#FFFFFFCC";
    pingFa.top = "45px";
    pingFa.left = "45px";
    pingFa.width = "170px";
    pingFa.height = "70px";
    operationContainer.addControl(pingFa);
    let htmlPing = window.document.getElementById("pinglun")!;
    let htmlCancel = window.document.getElementById("quxiao")!;
    let cancelValue: HTMLInputElement = window.document.getElementById(
      "quxiao"
    )! as HTMLInputElement;
    cancelValue.value = Language.language[20][Exhibits.lang_flg];
    htmlCancel.onclick = () => {
      composePanel.isVisible = true;
      htmlPing.style.display = "none";
    };
    let htmlOk = window.document.getElementById("fabiao")!;
    let submitValue: HTMLInputElement = window.document.getElementById(
      "fabiao"
    )! as HTMLInputElement;
    submitValue.value = Language.language[21][Exhibits.lang_flg];
    let htmlContent: HTMLInputElement = window.document.getElementById(
      "pingText"
    )! as HTMLInputElement;
    htmlOk.onclick = () => {
      if (htmlContent.value != "") {
        let i = this.comments.value.length;
        let veryStr = new VeryString(
          "",
          VeryNettyPara.UserName + ":" + htmlContent.value
        );
        this.comments.add(veryStr);
        console.log(this.comments.RecordTag + "--" + (1 << 15));
        SocketManager.Instance.OperateList(this.comments, veryStr, "add");
        let commentShow = new BABYLON.GUI.Image(
          "comment-show",
          "images/exhibits/kuang.png"
        );
        commentShow.verticalAlignment =
          BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        commentShow.horizontalAlignment =
          BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        commentShow.top = 160 * i + "px";
        commentShow.width = "100%";
        commentShow.height = "150px";
        commentRect2.addControl(commentShow);

        // 评论头像
        let commentTou = new BABYLON.GUI.Image(
          "comment-tou",
          "images/exhibits/tou.png"
        );
        commentTou.horizontalAlignment =
          BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        commentTou.verticalAlignment =
          BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        commentTou.top = 160 * i + 25 + "px";
        commentTou.left = "20px";
        commentTou.width = "100px";
        commentTou.height = "100px";
        commentRect2.addControl(commentTou);

        commentbodyq.text = VeryNettyPara.UserName + ":" + htmlContent.value;

        //评论内容
        let commentbody = new BABYLON.GUI.TextBlock("comment-body");
        commentbody.fontSize = 35;
        commentbody.horizontalAlignment =
          BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        commentbody.verticalAlignment =
          BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        commentbody.textHorizontalAlignment =
          BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        commentbody.textVerticalAlignment =
          BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        commentbody.text = VeryNettyPara.UserName + ":" + htmlContent.value;
        commentbody.color = "#696969";
        commentbody.top = 160 * i + 25 + "px";
        commentbody.left = "160px";
        commentbody.width = "80%";
        commentbody.height = "100px";
        commentbody.textWrapping = true;
        commentbody.lineSpacing = "10px";
        commentRect2.addControl(commentbody);
        let leng = Math.max(490, this.comments.value.length * 160 + 20);
        commentRect2.height = leng + "px";
        htmlContent.value = "";
        composePanel.isVisible = true;
        if (this.comments.value.length == 1) commentRect3.isVisible = true;
        htmlPing.style.display = "none";
        commentNumber.text =
          Language.language[4][Exhibits.lang_flg] +
          "(" +
          this.comments.value.length +
          ")";
      }
    };
    let pingBut = BABYLON.GUI.Button.CreateSimpleButton("comment-image", "");
    pingBut.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    pingBut.thickness = 0;
    pingBut.color = "#FFE4E100";
    pingBut.horizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    pingBut.top = "50px";
    pingBut.left = "0px";
    pingBut.width = "230px";
    pingBut.height = "60px";
    pingBut.onPointerClickObservable.add(() => {
      if (VeryNettyPara.UserName.slice(0, 2) !== "游客") {
        composePanel.isVisible = false;
        htmlPing.style.display = "block";
        window.document.getElementById("count")!.innerHTML = "0";
      } else {
        this._loginPanel.isVisible = true;
      }
    });
    operationContainer.addControl(pingBut);

    // **评论展示区域** //
    let commentRect = new BABYLON.GUI.Container("comment_rect");
    commentRect.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    commentRect.background = "#FFE4E100";
    commentRect.color = "#FFE4E100";
    commentRect.width = "100%";
    commentRect.height = "580px";
    commentRect.paddingLeft = "50px";
    commentRect.isVisible = Exhibits.isCommentAvailable;
    composePanel.addControl(commentRect);
    // 精彩评论
    let goodComment = new BABYLON.GUI.TextBlock("comment-good");
    goodComment.fontSize = 35;
    goodComment.textHorizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    goodComment.horizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    goodComment.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    goodComment.text = Language.language[8][Exhibits.lang_flg];
    goodComment.color = "#FFFFFFCC";
    goodComment.top = "10px";
    goodComment.left = "0px";
    goodComment.width = "250px";
    goodComment.height = "50px";
    commentRect.addControl(goodComment);

    // 分隔线
    let titleLine2 = new BABYLON.GUI.TextBlock("title-line2");
    titleLine2.fontSize = 15;
    titleLine2.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    titleLine2.text =
      "_______________________________________________________________________________________________________________________________";
    titleLine2.width = "100%";
    // titleLine.left = "-3px";
    titleLine2.top = "60px";
    titleLine2.height = "20px";
    titleLine2.paddingLeft = "0px";
    titleLine2.paddingRight = "0px";
    titleLine2.color = "#404040";
    commentRect.addControl(titleLine2);

    let commentRect3 = new BABYLON.GUI.Container("comment_rect");
    commentRect3.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    commentRect3.top = "90px";
    commentRect3.background = "#FFE4E100";
    commentRect3.color = "#FFE4E100";
    commentRect3.width = "100%";
    commentRect3.height = 170 + "px";
    commentRect.addControl(commentRect3);

    let commentShowq = new BABYLON.GUI.Image(
      "comment-show",
      "images/exhibits/kuang.png"
    );
    commentShowq.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    commentShowq.horizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    commentShowq.top = "0px";
    commentShowq.width = "100%";
    commentShowq.height = "150px";
    commentRect3.addControl(commentShowq);

    // 评论头像
    let commentTouq = new BABYLON.GUI.Image(
      "comment-tou",
      "images/exhibits/tou.png"
    );
    commentTouq.horizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    commentTouq.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    commentTouq.top = 25 + "px";
    commentTouq.left = "20px";
    commentTouq.width = "100px";
    commentTouq.height = "100px";
    commentRect3.addControl(commentTouq);

    //评论内容
    let commentbodyq = new BABYLON.GUI.TextBlock("comment-body");
    commentbodyq.fontSize = 35;
    commentbodyq.horizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    commentbodyq.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    commentbodyq.textHorizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    commentbodyq.textVerticalAlignment =
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    if (this.comments.value.length > 0)
      commentbodyq.text = this.comments.value[this.comments.value.length - 1]
        .getValue()
        .toString();
    else commentRect3.isVisible = false;
    commentbodyq.color = "#696969";
    commentbodyq.top = 25 + "px";
    commentbodyq.left = "160px";
    commentbodyq.width = "80%";
    commentbodyq.height = "100px";
    commentbodyq.textWrapping = true;
    commentbodyq.lineSpacing = "10px";
    commentRect3.addControl(commentbodyq);

    // 文字主体
    var sv2 = new BABYLON.GUI.ScrollViewer("info-scrollview");
    sv2.barColor = "#ffffff00";
    sv2.thickness = 0;
    sv2.barSize = 0;
    sv2.wheelPrecision = 0.008;
    sv2.background = "#CCCCCC00";
    sv2.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    sv2.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    sv2.top = "90px";
    sv2.width = "100%";
    sv2.height = "490px";
    commentRect.addControl(sv2);
    sv2.isVisible = false;

    let commentRect2 = new BABYLON.GUI.Container("comment_rect");
    commentRect2.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    commentRect2.background = "#FFE4E100";
    commentRect2.color = "#FFE4E100";
    commentRect2.width = "100%";
    let leng = Math.max(490, this.comments.value.length * 160 + 20);
    commentRect2.height = leng + "px";
    sv2.addControl(commentRect2);
    for (let i = 0; i < this.comments.value.length; i++) {
      // 评论留言区
      let commentShow = new BABYLON.GUI.Image(
        "comment-show",
        "images/exhibits/kuang.png"
      );
      commentShow.verticalAlignment =
        BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
      commentShow.horizontalAlignment =
        BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
      commentShow.top = 160 * i + "px";
      commentShow.width = "100%";
      commentShow.height = "150px";
      commentRect2.addControl(commentShow);

      // 评论头像
      let commentTou = new BABYLON.GUI.Image(
        "comment-tou",
        "images/exhibits/tou.png"
      );
      commentTou.horizontalAlignment =
        BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
      commentTou.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
      commentTou.top = 160 * i + 25 + "px";
      commentTou.left = "20px";
      commentTou.width = "100px";
      commentTou.height = "100px";
      commentRect2.addControl(commentTou);

      //评论内容
      let commentbody = new BABYLON.GUI.TextBlock("comment-body");
      commentbody.fontSize = 35;
      commentbody.horizontalAlignment =
        BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
      commentbody.verticalAlignment =
        BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
      commentbody.textHorizontalAlignment =
        BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
      commentbody.textVerticalAlignment =
        BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
      commentbody.text = this.comments.value[i].getValue().toString();
      commentbody.color = "#696969";
      commentbody.top = 160 * i + 25 + "px";
      commentbody.left = "160px";
      commentbody.width = "80%";
      commentbody.height = "100px";
      commentbody.textWrapping = true;
      commentbody.lineSpacing = "10px";
      commentRect2.addControl(commentbody);
    }
  }
  public videoSeries(videoList: [string]): void {
    let that = this;
    that.videoListNumber = 0;
    that.playVideo(videoList[that.videoListNumber]);

    that.leftVideoArrow = BABYLON.GUI.Button.CreateImageOnlyButton(
      "leftVideoArrow",
      "images/exhibits/left2.png"
    );
    that.leftVideoArrow.verticalAlignment =
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    that.leftVideoArrow.width = "60px";
    that.leftVideoArrow.height = "60px";
    that.leftVideoArrow.top = "0px";
    that.leftVideoArrow.left = "-457px";
    that.leftVideoArrow.thickness = 0;
    that.leftVideoArrow.onPointerClickObservable.add(() => {
      that.videoListNumber--;
      // console.log(that.videoListNumber);
      if (that.videoListNumber === 0) {
        that.leftVideoArrow.isVisible = false;
      }
      if (that.videoListNumber !== videoList.length - 1) {
        that.rightVideoArrow.isVisible = true;
      }
      that.playVideo(videoList[that.videoListNumber]);
    });
    that._videoCloseAdvancedTexture.addControl(that.leftVideoArrow);

    if (that.videoListNumber === 0) {
      that.leftVideoArrow.isVisible = false;
    }

    that.rightVideoArrow = BABYLON.GUI.Button.CreateImageOnlyButton(
      "rightVideoArrow",
      "images/exhibits/right2.png"
    );
    that.rightVideoArrow.verticalAlignment =
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    that.rightVideoArrow.width = "60px";
    that.rightVideoArrow.height = "60px";
    that.rightVideoArrow.top = "0px";
    that.rightVideoArrow.left = "457px";
    that.rightVideoArrow.thickness = 0;
    that.rightVideoArrow.onPointerClickObservable.add(() => {
      that.videoListNumber++;
      // console.log(that.videoListNumber);
      if (that.videoListNumber === videoList.length - 1) {
        that.rightVideoArrow.isVisible = false;
      }
      if (that.videoListNumber !== 0) {
        that.leftVideoArrow.isVisible = true;
      }
      that.playVideo(videoList[that.videoListNumber]);
    });
    that._videoCloseAdvancedTexture.addControl(that.rightVideoArrow);

    if (videoList.length === 1) {
      that.leftVideoArrow.isVisible = false;
      that.rightVideoArrow.isVisible = false;
    }
  }
  private playVideo(video_name: string): void {
    // UI隐藏
    this._plane2.setEnabled(false);
    // 视频显示
    this._videoParent.setEnabled(true);
    // 设置位置和角度
    this._videoParent.setParent(this._parent);
    this._videoParent.rotation = new BABYLON.Vector3(0, 0, 0);
    let x: number = this._location.position2.x - this._plane2Size / 2;
    if (this._location.position2.x < 0) {
      x = -(
        Math.abs(this._location.position2.x) -
        this._plane2Size / 2 +
        this._videoLength
      );
    }
    this._videoParent.position = new BABYLON.Vector3(
      x,
      this._location.position2.y,
      this._location.position2.z
    );
    this._videoParent.setParent(null);

    this._videoPlaying = true;

    if (!this._initializedVideo) {
      this._lastVideo = video_name;
      this._initializedVideo = true;
      this._videoTex = new BABYLON.VideoTexture(
        "exhibit-video-tex",
        "./video/" + video_name,
        this._scene,
        true,
        false,
        BABYLON.Texture.TRILINEAR_SAMPLINGMODE,
        { autoPlay: true, autoUpdateTexture: true, loop: true }
      );
      this._videoTex.coordinatesIndex = 0;
      // videoTex.vScale = -1;
      var videoMat = new BABYLON.StandardMaterial(
        "exhibit-video-mat",
        this._scene
      );
      videoMat.emissiveColor = BABYLON.Color3.White();
      videoMat.diffuseTexture = this._videoTex;
      videoMat.backFaceCulling = false;
      this._videoPlane.material = videoMat;
      this._videoTex.video.play();
      GlobalControl.PauseAudio(true);
      GlobalControl.PauseScreenVideo();
    } else {
      if (this._lastVideo !== video_name) {
        this._videoTex.updateURL("./video/" + video_name);
        this._lastVideo = video_name;
      }
      this._videoTex.video.play();
      GlobalControl.PauseAudio(true);
      GlobalControl.PauseScreenVideo();
    }
  }

  public pauseVideo(): void {
    if (this._videoTex && this._videoTex.video) {
      this._videoTex.video.pause();
    }
  }

  public closeVideo(): void {
    // 视频暂停
    this._videoTex.video.pause();
    // 语音介绍恢复
    if (!GlobalControl.screenVideoOn) {
      GlobalControl.PauseAudio(false);
    }
    // 视图关闭
    this._videoParent.setEnabled(false);
    // 重新显示UI
    this._plane2.setEnabled(true);

    this._videoPlaying = false;

    this.videoListNumber = 0;
    this.leftVideoArrow.dispose();
    this.rightVideoArrow.dispose();
  }

  public close(name?: string): void {
    if (name) {
      this._record[name] = false;
    } else {
      this._record[this._lastName] = false;
    }
    if (this._videoPlaying) {
      this.closeVideo();
    }
    // 销毁
    if (this._parent) {
      this._parent.getChildMeshes().forEach((mesh) => {
        mesh.material!.dispose();
      });
      this._parent.dispose();
    }

    // 回调函数取消关联
    if (this.meshAdvancedTexture1) {
      this.meshAdvancedTexture1.dispose();
    }
    if (this.meshAdvancedTexture2) {
      this.meshAdvancedTexture2.dispose();
    }
    if (this.picAdvancedTexture) {
      this.picAdvancedTexture.dispose();
    }
    this._uis = [];
    this._currentIndex = 1;
  }

  private createEmpty(width: string): BABYLON.GUI.Rectangle {
    let backgroundRect = new BABYLON.GUI.Rectangle("_empty_");
    // backgroundRect.width = this._canvas.width;
    backgroundRect.width = width;
    backgroundRect.background = "#FFFFFF00";
    backgroundRect.color = "#FFFFFF00";
    // backgroundRect.isPointerBlocker = true;
    return backgroundRect;
  }

  //图集函数
  private loadPicData(): void {
    let that = this;
    // 获取表格数据
    axios
      .get("./data/highPicture.json")
      .then(function (response) {
        that._picdata = response.data;
        that._picsuccess = true;
      })
      .catch(function (error) {
        console.log("load error: " + error);
      });
  }

  public initHighPic(intro: string): void {
    //读取json相对应的数据
    if (this._picdata[intro]) {
      this._pictures = [];
      for (let i: number = 0; i < this._picdata[intro].length; i++) {
        let para: PictureData = {
          name: this._picdata[intro][i].name,
          path: this._picdata[intro][i].path,
          introduct: this._picdata[intro][i].introduct,
        };
        this._pictures.push(para);
      }
      this.createPicUI(this._pictures);
      this._currentIndex = 1;
    }
  }

  //创建所对应的UI
  public createPicUI(intro: PictureData[]): void {
    let that = this;
    // UI隐藏
    this._plane2.setEnabled(false);

    //创建父plane
    // this._picPlane = BABYLON.MeshBuilder.CreatePlane('_ui-exhibits-PicPlane', { height: this._plane2Size, width: this._plane2Size }, this._scene);
    // let obj3 = new GameObject('picParentPlane', this._picPlane);
    // obj3.transform.parent = this._parentObj.transform;
    // obj3.transform.localPosition = this._location.position2;
    // obj3.transform.localEulerAngles = this._location.angle;
    // this.picAdvancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(this._picPlane);

    // 透明背景
    this.picParent = new BABYLON.GUI.Rectangle("pic-parent");
    this.picParent.horizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    this.picParent.verticalAlignment =
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    this.picParent.width = "1221px";
    this.picParent.height = "705px";
    this.picParent.paddingLeft = "0px";
    this.picParent.background = "#ffffff80";
    this.picParent.cornerRadius = 40;
    this.picParent.color = "#ffffff00";
    this.picParent.thickness = 0;
    this.picParent.isPointerBlocker = true;
    UIMain.advancedTexture.addControl(this.picParent);

    for (let i: number = 0; i < intro.length; i++) {
      let picPanel = new BABYLON.GUI.Rectangle("picture-panel-" + i);
      picPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
      picPanel.thickness = 0;
      this.picParent.addControl(picPanel);

      picPanel.addControl(this.creatBodyUI(i, intro[i], intro.length));

      if (i !== 0) {
        picPanel.isVisible = false;
      }
      this._uis.push(picPanel);
    }
  }

  private creatBodyUI(
    index: number,
    data: PictureData,
    count: number
  ): BABYLON.GUI.Container {
    let that = this;
    //container
    let pictureRec = new BABYLON.GUI.Rectangle("picture-body-Rectangle");
    pictureRec.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    pictureRec.width = "100%";
    pictureRec.height = "100%";
    pictureRec.background = "#ffffff00";
    pictureRec.color = "#ffffff00";
    pictureRec.thickness = 0;

    //图片
    let picContainer = new BABYLON.GUI.Container("picture-container");
    picContainer.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    picContainer.top = "0px";
    picContainer.height = "100%";
    picContainer.width = "100%";
    picContainer.background = "#ffffff00";
    picContainer.isPointerBlocker = true;
    this._pics.push(picContainer);
    pictureRec.addControl(picContainer);

    let pictureDisplay = new BABYLON.GUI.Image(
      "picture" + (index + 1),
      data.path
    );
    pictureDisplay.stretch = BABYLON.GUI.Image.STRETCH_UNIFORM;
    picContainer.addControl(pictureDisplay);

    //放大缩小移动功能

    /*
    鼠标滚轮事件
   */
    picContainer.onPointerEnterObservable.add((info) => {
      if (window.addEventListener)
        //FF,火狐浏览器会识别该方法
        window.addEventListener("DOMMouseScroll", wheel, false);
      window.onmousewheel = wheel; //W3C

      picContainer.onPointerOutObservable.add(() => {
        window.removeEventListener("DOMMouseScroll", wheel);
        window.onmousewheel = null;
      });
    });

    //统一处理滚轮滚动事件
    function wheel(event) {
      var delta = 0;
      if (!event) event = window.event;
      if (event.wheelDelta) {
        //IE、chrome浏览器使用的是wheelDelta，并且值为“正负120”
        delta = event.wheelDelta / 120;
        if (event.detail) delta = -event.detail / 3; //因为IE、chrome等向下滚动是负值，FF是正值，为了处理一致性，在此取反处理
      } else {
        //FF浏览器使用的是detail,其值为“正负3”

        delta = -delta;
      }
      if (delta) handle(delta);
    }
    //上下滚动时的具体处理函数
    function handle(delta) {
      if (delta < 0) {
        //向下滚动
        if (picContainer.scaleX >= 0.4) {
          picContainer.scaleX -= 0.1;
          picContainer.scaleY -= 0.1;
        }
      } else {
        //向上滚动
        picContainer.scaleX += 0.1;
        picContainer.scaleY += 0.1;
      }
    }

    //移动图片
    picContainer.onPointerDownObservable.add((info) => {
      let pEvent = info;
      let disX = pEvent.x - picContainer.leftInPixels;
      let disY = pEvent.y - picContainer.topInPixels;

      picContainer.onPointerMoveObservable.add((info) => {
        pEvent.x = info.x;
        pEvent.y = info.y;
        picContainer.left = pEvent.x - disX + "px";
        picContainer.top = pEvent.y - disY + "px";
      });

      picContainer.onPointerUpObservable.add(() => {
        picContainer.onPointerMoveObservable.clear();
      });

      picContainer.onPointerOutObservable.add(() => {
        picContainer.onPointerMoveObservable.clear();
      });
    });

    //左右按钮
    if (index + 1 !== 1) {
      let leftArrow = BABYLON.GUI.Button.CreateImageOnlyButton(
        "left-arrow",
        "images/exhibits/left2.png"
      );
      leftArrow.verticalAlignment =
        BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
      leftArrow.width = "74px";
      leftArrow.height = "74px";
      leftArrow.top = "0px";
      leftArrow.left = "-" + (1221 / 2 - 48) + "px";
      leftArrow.thickness = 0;
      leftArrow.onPointerClickObservable.add(() => {
        that.previous(index + 1);
      });
      pictureRec.addControl(leftArrow);
    }

    if (index + 1 !== count) {
      let rightArrow = BABYLON.GUI.Button.CreateImageOnlyButton(
        "right-arrow",
        "images/exhibits/right2.png"
      );
      rightArrow.verticalAlignment =
        BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
      rightArrow.width = "74px";
      rightArrow.height = "74px";
      rightArrow.top = "0px";
      rightArrow.left = 1221 / 2 - 48 + "px";
      rightArrow.thickness = 0;
      rightArrow.onPointerClickObservable.add(() => {
        that.next(index + 1);
      });
      pictureRec.addControl(rightArrow);
    }

    //关闭图集
    // let picCloseBtn = BABYLON.GUI.Button.CreateImageOnlyButton("high-pic-close", "images/exhibits/close.png");
    // picCloseBtn.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    // //picCloseBtn.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    // picCloseBtn.top = "7px"
    // picCloseBtn.left = "-383px";
    // picCloseBtn.width = "30px";
    // picCloseBtn.height = "30px";
    // picCloseBtn.thickness = 0;
    // picCloseBtn.onPointerClickObservable.add(() => {
    //   that.closepicture();
    // });
    // pictureRec.addControl(picCloseBtn);

    let indexTitle = new BABYLON.GUI.TextBlock("pic-index-title");
    indexTitle.textHorizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    indexTitle.horizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    indexTitle.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    indexTitle.text = index + 1 + "-" + count + " " + data.name;
    indexTitle.color = "white";
    indexTitle.left = "50px";
    indexTitle.top = "41px";
    indexTitle.resizeToFit = true;
    indexTitle.fontSize = 30;
    pictureRec.addControl(indexTitle);

    // 文字主体
    if (data.introduct !== "") {
      let pictureTextRec = new BABYLON.GUI.Rectangle("pictureIntroRec");
      pictureTextRec.verticalAlignment =
        BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
      pictureTextRec.background = "#3D3B38DD";
      //pictureTextRec.color = '#ffffffB2';
      pictureTextRec.thickness = 0;
      pictureTextRec.cornerRadius = 10;
      pictureTextRec.top = "-23px";
      pictureTextRec.width = "1132px";
      pictureTextRec.height = "90px";
      pictureRec.addControl(pictureTextRec);

      let pictureIntro = new BABYLON.GUI.ScrollViewer(
        "pictureIntro-scrollview"
      );
      pictureIntro.barColor = "#ffffff00";
      pictureIntro.thickness = 0;
      pictureIntro.barSize = 0;
      pictureIntro.background = "#CCCCCC00";
      pictureIntro.verticalAlignment =
        BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
      pictureIntro.top = "15px";
      pictureIntro.width = "1063px";
      pictureIntro.height = "90px";
      pictureTextRec.addControl(pictureIntro);

      let body = new BABYLON.GUI.TextBlock("pictureIntro-body");
      body.fontSize = 22;
      // indexTitle2.fontStyle = "bold";
      body.horizontalAlignment =
        BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
      body.textHorizontalAlignment =
        BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
      body.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
      body.text = data.introduct;
      body.color = "#ffffff";
      body.top = "0px";
      body.width = "1063px";
      body.height = "400px";
      body.textWrapping = true;
      body.lineSpacing = "7px";
      pictureIntro.addControl(body);

      // 预先估算
      let tryH: number = Math.ceil(data.introduct.length / 30);
      if (tryH > 2) {
        pictureTextRec.height = "90px";
      } else {
        pictureTextRec.height = tryH * 30 + 30 + "px";
      }

      let observor = this._scene.onBeforeCameraRenderObservable.add((info) => {
        let h: number = body.lines.length * 30;
        if (body.lines.length > 2) {
          body.height = h + 30 + "px";
          pictureIntro.height = "60px";
          pictureTextRec.height = "90px";
        } else {
          body.height = h + 10 + "px";
          pictureIntro.height = h + 10 + "px";
          pictureTextRec.height = body.lines.length * 30 + 30 + "px";
        }
        this._scene.onBeforeCameraRenderObservable.remove(observor);
      });
    }

    return pictureRec;
  }

  public next(current_index: number): void {
    if (current_index < this._pictures.length) {
      this._currentIndex++;
      this.show(this._currentIndex);
    }
  }

  public previous(current_index: number): void {
    if (current_index > 1) {
      this._currentIndex--;
      this.show(this._currentIndex);
    }
  }

  public show(current_index: number): void {
    this._uis.forEach((value, index) => {
      if (index + 1 === current_index) {
        value.isVisible = true;
      } else {
        value.isVisible = false;
      }
    });
  }

  public closepicture(): void {
    this._uis = [];
    this._currentIndex = 1;
    this._pics = [];
    this.picParent.dispose();
    this.picParent = null;
    // 重新显示UI
    if (this._plane2) {
      this._plane2.setEnabled(true);
    }
  }

  //guide部分
  public initGuideUI(): void {
    let that = this;

    this._key = 0;

    // GUI
    // 按钮展示流程，UI按逻辑，分成组
    let advancedTexture = UIMain.advancedTexture;

    // guide7 Container
    let guide2Container = new BABYLON.GUI.Container("guide2-container");
    guide2Container.width = "100%";
    guide2Container.height = "100%";
    guide2Container.background = "#D8D8D830";
    guide2Container.horizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    guide2Container.verticalAlignment =
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    advancedTexture.addControl(guide2Container);
    //image container
    let guide2imageContainer = new BABYLON.GUI.Container("guide2-imgContainer");
    guide2imageContainer.width = "40%";
    guide2imageContainer.height = "60%";
    guide2imageContainer.horizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    guide2imageContainer.verticalAlignment =
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    guide2Container.addControl(guide2imageContainer);
    // image
    let guide2 = new BABYLON.GUI.Image(
      "guide2",
      "images/guide/second" + Exhibits.lang_flg + ".png"
    );
    guide2.horizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    guide2.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    guide2.isPointerBlocker = true;
    guide2.stretch = BABYLON.GUI.Image.STRETCH_UNIFORM;
    guide2imageContainer.addControl(guide2);
    // btn
    let guide2Btn = BABYLON.GUI.Button.CreateSimpleButton(
      "guide2-btn",
      Language.language[22][Exhibits.lang_flg]
    );
    guide2Btn.cornerRadius = 10;
    guide2Btn.color = "white";
    guide2Btn.background = "#ffffff00";
    guide2Btn.top = "-50px";
    guide2Btn.width = "200px";
    guide2Btn.height = "70px";
    guide2Btn.horizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    guide2Btn.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    guide2Btn.children[0].color = "white";
    guide2Btn.children[0].fontSize = 38;
    guide2Btn.onPointerClickObservable.add(() => {
      that.timer("guide3", 10);
    });
    guide2Container.addControl(guide2Btn);

    // guide3 Container
    let guide3Container = new BABYLON.GUI.Container("guide3-container");
    guide3Container.width = "100%";
    guide3Container.height = "100%";
    guide3Container.background = "#D8D8D830";
    guide3Container.horizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    guide3Container.verticalAlignment =
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    advancedTexture.addControl(guide3Container);
    //image container
    let guide3imageContainer = new BABYLON.GUI.Container("guide3-imgContainer");
    guide3imageContainer.width = "40%";
    guide3imageContainer.height = "60%";
    guide3imageContainer.horizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    guide3imageContainer.verticalAlignment =
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    guide3Container.addControl(guide3imageContainer);
    // image
    let guide3 = new BABYLON.GUI.Image(
      "guide3",
      "images/guide/third" + Exhibits.lang_flg + ".png"
    );
    guide3.horizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    guide3.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    guide3.isPointerBlocker = true;
    guide3.stretch = BABYLON.GUI.Image.STRETCH_UNIFORM;
    guide3imageContainer.addControl(guide3);
    // btn
    let guide3Btn = BABYLON.GUI.Button.CreateSimpleButton(
      "guide3-btn",
      Language.language[23][Exhibits.lang_flg]
    );
    guide3Btn.cornerRadius = 10;
    guide3Btn.color = "white";
    guide3Btn.background = "#ffffff00";
    guide3Btn.top = "-50px";
    guide3Btn.width = "200px";
    guide3Btn.height = "70px";
    guide3Btn.horizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    guide3Btn.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    guide3Btn.children[0].color = "white";
    guide3Btn.children[0].fontSize = 38;
    guide3Btn.onPointerClickObservable.add(() => {
      that.timer("done", 10);
    });
    guide3Container.addControl(guide3Btn);

    // guide1 Container
    let guide1Container = new BABYLON.GUI.Container("guide1-container");
    guide1Container.width = "100%";
    guide1Container.height = "100%";
    guide1Container.background = "#D8D8D830";
    guide1Container.horizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    guide1Container.verticalAlignment =
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    advancedTexture.addControl(guide1Container);
    //image container
    let guide1imageContainer = new BABYLON.GUI.Container("guide1-imgContainer");
    guide1imageContainer.width = "40%";
    guide1imageContainer.height = "60%";
    guide1imageContainer.horizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    guide1imageContainer.verticalAlignment =
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    guide1Container.addControl(guide1imageContainer);
    // image
    let guide1 = new BABYLON.GUI.Image(
      "guide1",
      "images/guide/first" + Exhibits.lang_flg + ".png"
    );
    guide1.horizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    guide1.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    guide1.isPointerBlocker = true;
    guide1.stretch = BABYLON.GUI.Image.STRETCH_UNIFORM;
    guide1imageContainer.addControl(guide1);
    // btn
    let guide1Btn = BABYLON.GUI.Button.CreateSimpleButton(
      "guide1-btn",
      Language.language[22][Exhibits.lang_flg]
    );
    guide1Btn.cornerRadius = 10;
    guide1Btn.color = "white";
    guide1Btn.background = "#ffffff00";
    guide1Btn.top = "-50px";
    guide1Btn.width = "200px";
    guide1Btn.height = "70px";
    guide1Btn.horizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    guide1Btn.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    guide1Btn.children[0].color = "white";
    guide1Btn.children[0].fontSize = 38;
    guide1Btn.onPointerClickObservable.add(() => {
      that.timer("guide2", 10);
    });
    guide1Container.addControl(guide1Btn);

    this._guideElement.add("guide2", guide2Container);
    this._guideElement.add("guide3", guide3Container);
    this._guideElement.add("guide1", guide1Container);
    this._guideElement.init("guide1");
  }

  private timer(key: string, time: number = 1000): void {
    this._waiting = true;
    // 等待2秒钟
    setTimeout(this.wait.bind(this), time, key);
  }

  private wait(key: string): void {
    this._key++;
    this._guideElement.display(key);
    this._waiting = false;
  }

  private done(): void {
    this._guideElement.display("");
  }

  // DIY相关
  //视频编辑
  public diyVideoPlane(btnExhibitName) {
    $("#diy-video-prev-view").attr("src","./video/" +btnExhibitName +".mp4" +"?" +((Math.random() * 10000) >> 0));
    $(".diy-video").show();
    // 修改视频
    // 上传视频
    $(".diy-video-add-btn")
      .off("click")
      .click(() => {
        let filePath =
          VeryNettyPara.ProjectID + "/video/" + btnExhibitName + ".mp4";
        if (!GlobalControl.screenVideo._data[btnExhibitName]) {
          GlobalControl.screenVideo._data[btnExhibitName] = {
            video: "",
            lobby: false,
          };
        }
        GlobalControl.screenVideo._data[btnExhibitName]["video"] =
          btnExhibitName + ".mp4";
        let num = btnExhibitName.replace(/(?!^\d).*/g, "") ? false : true;
        GlobalControl.screenVideo._data[btnExhibitName]["lobby"] = num;
        GlobalControl.exhibits.uploadFile(
          GlobalControl.exhibits.applyTokenDo(),
          "diy-video-file",
          filePath,
          () => {
            let mesh = GlobalControl.screenVideo._scene.getMeshByName(
              btnExhibitName
            );
            GlobalControl.exhibits.updateDataAndJson("screen-video", () => {
              GlobalControl.screenVideo.loadVideo(mesh);
            });
          }
        );
      });
    // 删除视频
    $(".diy-pic-video-del-btn")
      .off("click")
      .click(() => {
        let filePath =
          VeryNettyPara.ProjectID +
          "/video/" +
          GlobalControl.screenVideo._data[btnExhibitName].video;
        GlobalControl.exhibits.deleteFile(
          filePath,
          GlobalControl.exhibits.applyTokenDo()
        );
        GlobalControl.screenVideo._data[btnExhibitName].video = "";
        $("#diy-video-prev-view").attr("src", "");
        GlobalControl.exhibits.updateDataAndJson("screen-video");
      });
  }
  // 反射编辑
  public diyReflection() {
    $(".diy-material-main").off("click");
    $(".caizhitihuan-btn")
      .off("click")
      .on("click", () => {
        this.closeall2();
        $(".diy-material").show();
        $(".diy-material-main").children().remove();
        for (let key in this._reflectionData) {
          let ischecked = this._reflectionData[key].open ? "checked" : "";
          let des = this._reflectionData[key].des;
          let levelValue = this._reflectionData[key].level;
          let visibilityValue = this._reflectionData[key].visibility;
          let html = `<div class="diy-material-box">
          <div class="diy-material-box-open">
            <p class="diy-material-box-title">${des}反射</p>
            <div class="togglePosition">
              <label class="toggle">
                <input type="checkbox" ${ischecked} class="open" />
                <div class="track">
                  <div class="handle"></div>
                </div>
              </label>
            </div>
          </div>
          
          <div class="diy-material-box-change">
            <span class="diy-material-box-title2">${des}反射参数</span>
            <input
              type="range"
              name=""
              class="range-level"
              max="2"
              min="0"
              step="0.1"
              value=${levelValue}
            />
            <span class="range-level-val">${levelValue}</span>
            
          </div>
          <div class="diy-material-box-change">
            <span class="diy-material-box-title2">${des}透明度参数</span>
            <input
              type="range"
              name=""
              class="range-visibility"
              max="1"
              min="0"
              step="0.1"
              value=${visibilityValue}
            />
            <span class="range-visibility-val">${visibilityValue}</span>
          </div>
        </div>`;
          $(".diy-material-main").append(html);
        }
      });
    $(".diy-material-main").on("input", ".range-level", (e) => {
      let val = $(e.target).val() as string;
      $(e.target).next(".range-level-val").text(val);
    });
    $(".diy-material-main").on("input", ".range-visibility", (e) => {
      let val = $(e.target).val() as string;
      $(e.target).next(".range-visibility-val").text(val);
    });
    $(".diy-material-save").on("click", () => {
      let vals = [];
      let visibilityvals = [];
      $(".range-level").each(function () {
        vals.push($(this).val());
      });
      $(".range-visibility").each(function () {
        visibilityvals.push($(this).val());
      });
      let openList = [];
      $(".open").each(function () {
        openList.push($(this).is(":checked"));
      });
      let index = 0;
      for (let key in this._reflectionData) {
        this._reflectionData[key]["open"] = openList[index];
        this._reflectionData[key]["level"] = +vals[index];
        this._reflectionData[key]["visibility"] = +visibilityvals[index];
        index++;
      }
      Game.reflectionData = this._reflectionData;
      let json = JSON.stringify(this._reflectionData);
      this.putBuffer(VeryNettyPara.ProjectID + "/data/reflection.json",this.applyTokenDo(),json,() => {
          for (var key in Game.reflectionData) {
            Game.reflectionFunc(
              key,
              Game.reflectionData[key].open,
              Game.reflectionData[key].level,
              Game.reflectionData[key].visibility,
              Game.reflectionData[key].isGround,
              this._scene
            );
          }
          $(".diy-material").hide();
          this.removeallbg();
          $("#bg").hide();
        }
      );
    });
  }
  public getExhibitData() {
    console.log(Game.reflectionData);
    this._reflectionData = Game.reflectionData;
    this._fontData = Game.fontData;
  }

  //贴图编辑
  public diyTietuPlane(btnExhibitName) {
    this.getHouse(btnExhibitName, () => {
      console.log(btnExhibitName,this.house,this.houseLetter)
      $("#diy-tietu-prev-view").attr("src",
        "." +this.house +this.houseLetter+"t_" +btnExhibitName.replace(/.*(!?\_)/g, "") +".jpg" +"?" +((Math.random() * 10000) >> 0));
    });
    $(".diy-tietu").show();

    // 上传贴图
    $(".diy-tietu-add-btn")
      .off("click")
      .click(() => {
        let filePath =VeryNettyPara.ProjectID +this.house +this.houseLetter+"t_" +btnExhibitName.replace(/.*(!?\_)/g, "") +".jpg";
        this.uploadFile(this.applyTokenDo(), "diy-tietu-file", filePath, () => {
          setTimeout(() => {
            let filePath1 ="." +this.house +this.houseLetter+"t_" +btnExhibitName.replace(/.*(!?\_)/g, "") +".jpg" +"?" +Date.now();
            axios.get(filePath1).then(() => {
              let mesh = GlobalControl.exhibits._scene.getMeshByName(
                btnExhibitName
              );
              mesh.material.getActiveTextures()[0].dispose();
              let newTexture = new BABYLON.Texture(
                filePath1,
                GlobalControl.exhibits._scene
              );

              newTexture.level = 2;
              let texture = "texture" + Date.now();
              let newMaterial = new BABYLON.StandardMaterial(
                texture,
                GlobalControl.exhibits._scene
              );
              newMaterial.diffuseTexture = newTexture;
              mesh.material = newMaterial;
              console.log("changetietu");
            });
          }, 1000);
        });
      });
    // 删除视频
    $(".diy-tietu-del-btnn")
      .off("click")
      .click(() => {
        let filePath =
          VeryNettyPara.ProjectID +
          this.house +
          "t_" +
          +btnExhibitName.replace(/.*(!?\_)/g, "") +
          ".jpg";
        GlobalControl.exhibits.deleteFile(
          filePath,
          GlobalControl.exhibits.applyTokenDo()
        );
        $("#diy-tietu-prev-view").attr("src", "");
      });
  }

  // BGM编辑
  public diyBGM() {
    $(".bgm-btn")
      .off("click")
      .click(() => {
        this.closeall2();
        $(".diy-bgm").show();
        $(".diy-bgm-exhibit").remove();
        console.log(Exhibits.assembleData);
        // 初始化展厅

        if (Exhibits.assembleData.lobby[0]["bgMusic"]) {
          $(".diy-bgm-lobby .diy-bgm-music-name").text(
            Exhibits.assembleData.lobby[0]["bgMusic"].match(
              /([^\\/]+)\.([^\\/]+)/g
            )[0]
          );
          $(".diy-bgm-lobby .icon-yinlejia").hide();
          $(".diy-bgm-lobby .diy-bgm-delete-music").show();
          $(".diy-bgm-file:first").val("");
        } else {
          $(".diy-bgm-lobby .diy-bgm-music-name").text("");
          $(".diy-bgm-lobby .icon-yinlejia").show();
          $(".diy-bgm-lobby .diy-bgm-delete-music").hide();
          $(".diy-bgm-file:first").val("");
        }
        if (Exhibits.assembleData.exhibits) {
          Exhibits.assembleData.exhibits.map((item, index) => {
            let htmlnode;
            let name = "";
            if (item["bgMusic"]) {
              name = item["bgMusic"].match(/([^\\/]+)\.([^\\/]+)/g)[0];
            }
            htmlnode = `<diy class="diy-bgm-exhibit" room=${item.index}>
                <span class="diy-bgm-room">展厅0${item.index}</span>
                <div class="diy-bgm-music-bg">
                  <span class="iconfont icon-yinlejia"></span>
                  <span class="diy-bgm-music-name">${name}</span>
                </div>
                <input
                  type="file"
                  accept="mp3"
                  id="diy-bgm-file1"
                  class="diy-bgm-file"
                />
                <span class="diy-bgm-delete-music">
                  <span class="iconfont icon-chacha"></span>
                </span>
              </diy>`;

            $(".diy-bgm-main").append(htmlnode);
            if (item["bgMusic"]) {
              $($(".diy-bgm-exhibit")[index]).find(".icon-yinlejia").hide();
              $($(".diy-bgm-exhibit")[index])
                .children(".diy-bgm-delete-music")
                .show();
            }
          });
        }
      });

    $(".diy-bgm-main")
      .off("click")
      .on("click", ".diy-bgm-delete-music", (e) => {
        let roomIndex = $(e.target).parent().parent().attr("room");
        let musicName = $(e.target)
          .parent()
          .parent()
          .find(".diy-bgm-music-name")
          .text();
        console.log(e.target);
        $(e.target).parent().parent().find(".diy-bgm-music-name").text("");
        $(e.target).parent().parent().find(".icon-yinlejia").show();
        $(e.target).parent().parent().find(".diy-bgm-delete-music").hide();
        $(e.target).parent().parent().find(".diy-bgm-file").val("");

        let filePath = VeryNettyPara.ProjectID + "/sound/" + musicName;

        this.deleteFile(filePath, this.applyTokenDo());
        if (roomIndex === "0") {
          Exhibits.assembleData.lobby[0].bgMusic = "";
        } else {
          Exhibits.assembleData.exhibits.map((it) => {
            if (it.index === roomIndex) {
              it.bgMusic = "";
            }
          });
        }
        this.updateDataAndJson("assemble");
        console.log(Exhibits.assembleData);
      });
    $(".diy-bgm-save")
      .off("click")
      .click(() => {
        let fileNodes: any = document.getElementsByClassName("diy-bgm-file");
        $(".progressNum").text("");
        $(".upload-alert").show();
        let filePath = VeryNettyPara.ProjectID + "/sound";
        for (let i = 0; i < fileNodes.length; i++) {
          if (fileNodes[i].files[0]) {
            if (i === 0) {
              Exhibits.assembleData.lobby[0].bgMusic =
                "./sound/" + fileNodes[i].files[0].name;
            } else {
              Exhibits.assembleData.exhibits[i - 1].bgMusic =
                "./sound/" + fileNodes[i].files[0].name;
            }
          }
        }

        console.log(Exhibits.assembleData);
        this.updateDataAndJson("assemble");
        this.uploadMusicFiles(this.applyTokenDo(), "diy-bgm-file", filePath);
      });
  }
  // BGM编辑
  public diyDes() {
    $(".commentary-btn")
      .off("click")
      .click(() => {
        this.closeall2();
        $(".diy-des").show();
        $(".diy-des-exhibit").remove();
        console.log(Exhibits.assembleData);
        // 初始化展厅

        if (Exhibits.assembleData.lobby[0]["descant"]) {
          $(".diy-des-lobby .diy-des-music-name").text(
            Exhibits.assembleData.lobby[0]["descant"].match(
              /([^\\/]+)\.([^\\/]+)/g
            )[0]
          );
          $(".diy-des-lobby .icon-yinlejia").hide();
          $(".diy-des-lobby .diy-des-delete-music").show();
          $(".diy-des-file:first").val("");
        } else {
          $(".diy-des-lobby .diy-des-music-name").text("");
          $(".diy-des-lobby .icon-yinlejia").show();
          $(".diy-des-lobby .diy-des-delete-music").hide();
          $(".diy-des-file:first").val("");
        }
        if (Exhibits.assembleData.exhibits) {
          Exhibits.assembleData.exhibits.map((item, index) => {
            let htmlnode;
            let name = "";
            if (item["descant"]) {
              name = item["descant"].match(/([^\\/]+)\.([^\\/]+)/g)[0];
            }
            htmlnode = `<diy class="diy-des-exhibit" room=${item.index}>
                <span class="diy-des-room">展厅0${item.index}</span>
                <div class="diy-des-music-bg">
                  <span class="iconfont icon-yinlejia"></span>
                  <span class="diy-des-music-name">${name}</span>
                </div>
                <input
                  type="file"
                  accept="mp3"
                  id="diy-des-file1"
                  class="diy-des-file"
                />
                <span class="diy-des-delete-music">
                  <span class="iconfont icon-chacha"></span>
                </span>
              </diy>`;

            $(".diy-des-main").append(htmlnode);
            if (item["descant"]) {
              $($(".diy-des-exhibit")[index]).find(".icon-yinlejia").hide();
              $($(".diy-des-exhibit")[index])
                .children(".diy-des-delete-music")
                .show();
            }
          });
        }
      });

    $(".diy-des-main")
      .off("click")
      .on("click", ".diy-des-delete-music", (e) => {
        let roomIndex = $(e.target).parent().parent().attr("room");
        let musicName = $(e.target)
          .parent()
          .parent()
          .find(".diy-des-music-name")
          .text();
        console.log(e.target);
        $(e.target).parent().parent().find(".diy-des-music-name").text("");
        $(e.target).parent().parent().find(".icon-yinlejia").show();
        $(e.target).parent().parent().find(".diy-des-delete-music").hide();
        $(e.target).parent().parent().find(".diy-des-file").val("");

        let filePath = VeryNettyPara.ProjectID + "/sound/" + musicName;

        this.deleteFile(filePath, this.applyTokenDo());
        if (roomIndex === "0") {
          Exhibits.assembleData.lobby[0].descant = "";
        } else {
          Exhibits.assembleData.exhibits.map((it) => {
            if (it.index === roomIndex) {
              it.descant = "";
            }
          });
        }
        this.updateDataAndJson("assemble");
        console.log(Exhibits.assembleData);
      });
    $(".diy-des-save")
      .off("click")
      .click(() => {
        let fileNodes: any = document.getElementsByClassName("diy-des-file");
        $(".progressNum").text("");
        $(".upload-alert").show();
        let filePath = VeryNettyPara.ProjectID + "/sound";
        for (let i = 0; i < fileNodes.length; i++) {
          if (fileNodes[i].files[0]) {
            if (i === 0) {
              Exhibits.assembleData.lobby[0].descant =
                "./sound/" + fileNodes[i].files[0].name;
            } else {
              Exhibits.assembleData.exhibits[i - 1].descant =
                "./sound/" + fileNodes[i].files[0].name;
            }
          }
        }

        console.log(Exhibits.assembleData);
        this.updateDataAndJson("assemble");
        this.uploadMusicFiles(this.applyTokenDo(), "diy-des-file", filePath);
      });
  }

  // 封面编辑
  public diyCoverPlane() {
    let filePath = VeryNettyPara.ProjectID + "/images/progress/bg.png";
    this.uploadFile(this.applyTokenDo(), "diy-cover-file", filePath, () => {
      axios
        .get("./images/progress/bg.png" + ((Math.random() * 10000) >> 0))
        .then(() => {
          $("#cover-img").attr(
            "scr",
            "./images/progress/bg.png" + ((Math.random() * 10000) >> 0)
          );
        });
    });
  }
  // 外景编辑
  public diyWaijingPlane() {
    if(Exhibits.assembleData.lobby[0].fileName[0] !== "A") return
    let filePath = VeryNettyPara.ProjectID + "/assemble/A00/全景照片.jpg";
    this.uploadFile(this.applyTokenDo(), "diy-waijing-file", filePath, () => {
      axios.get("./assemble/A00/全景照片.jpg").then(() => {
        let mesh = GlobalControl.exhibits._scene.getMeshByName("全景照片");
        mesh.material.getActiveTextures()[0].dispose();
        let newTexture = new BABYLON.Texture(
          "./assemble/A00/全景照片.jpg" + "?" + ((Math.random() * 10000) >> 0),
          GlobalControl.exhibits._scene
        );

        newTexture.level = 2;
        let texture = "texture" + Date.now();
        let newMaterial = new BABYLON.StandardMaterial(
          texture,
          GlobalControl.exhibits._scene
        );
        newMaterial.diffuseTexture = newTexture;
        mesh.material = newMaterial;
      });
    });
  }
  // 大标题编辑
  public diybig(btnExhibitName) {
    $(".diy-big").show();
    this.getHouse(btnExhibitName, () => {
      $(".diy-guan-title")
        .off("click")
        .on("click", "#diy-guan-title-color", (e) => {
          e.stopPropagation();
          $("#diy-guan-title-color-picker").show();
          var tag = $("#diy-guan-title-color-picker");
          var flag = true;
          $(document)
            .off("click")
            .on("click", function (e) {
              //点击空白处，设置的弹框消失
              var target = $(e.target);
              if (target.closest(tag).length == 0 && flag == true) {
                $(tag).hide();
                flag = false;
              }
            });
        });
      if (!this.titleColorChanged) {
        let color = this._fontData[this.houseLetter]["bigTitleColor"];
        $("#diy-guan-title-color").css("border-bottom-color", color); // #HEX
        $(".guan-font-example").css("color", color); // #HEX
      }
      if (!this.titleSizeChanged) {
        let size = this._fontData[this.houseLetter]["bigTitleSize"];
        $(".guan-font-example").css("font-size", size + "px");
        $("#diy-guan-title-fontsize").val(size);
      }
      if (!this.titleFamilyChanged) {
        let family = this._fontData[this.houseLetter]["bigTitleFamily"];
        $(".guan-font-example").css("font-family", family);
        $("#diy-guan-title-fontfamily").val(family);
      }
      if ($("#diy-guan-title-color-picker").children().length === 0) {
        $("#diy-guan-title-color")
          .off("click")
          .one("click", () => {
            let initalColor = "#000";
            if (!this.titleColorChanged) {
              initalColor = this._fontData[this.houseLetter].bigTitleColor;
            }
            let picker = AColorPicker.from("#diy-guan-title-color-picker", {
              color: initalColor,
            });
            picker.on("change", (picker, color) => {
              $("#diy-guan-title-color").css("border-bottom-color", color); // #HEX
              $(".guan-font-example").css("color", color); // #HEX
              this.titleColorChanged = true;
            });
          });
      }
      $("#diy-guan-title-fontfamily").on("change", () => {
        $(".guan-font-example").css("font-family",$("#diy-guan-title-fontfamily").val() as string);
        this.titleFamilyChanged = true;
      });
      $("#diy-guan-title-fontsize").on("change", () => {
        $(".guan-font-example").css("font-size",$("#diy-guan-title-fontsize").val() + "px");
        this.titleSizeChanged = true;
      });

      $(".diy-guan-save")
        .off("click")
        .on("click", () => {
          let title = $("#diy-guan-input").val() as string;
          if (title) {
            if (this.titleColorChanged) {
              this.titleColor = $(".guan-font-example").css("color");
            } else {
              this.titleColor = this._fontData[this.houseLetter].bigTitleColor;
            }
            if (this.titleSizeChanged) {
              this.titleSize = +$("#diy-guan-title-fontsize").val();
            } else {
              this.titleSize = this._fontData[this.houseLetter].bigTitleSize;
            }
            if (this.titleFamilyChanged) {
              this.titleFamily = $("#diy-guan-title-fontfamily").val() as string;
            } else {
              this.titleFamily = this._fontData[this.houseLetter].bigTitleFamily;
            }
            this.titleReplace(title, btnExhibitName,this.houseLetter);
            $(".diy-big").delay(500).hide();
            $("#bg").hide();
          } else {
            window.alert("标题不能为空");
          }
        });
    });
  }
  public diyCommonPlane() {
    $("#diy-cover-prev-view").attr(
      "src",
      "./images/progress/bg.png" + "?" + ((Math.random() * 10000) >> 0)
    );
    if(Exhibits.assembleData.lobby[0].fileName[0] == "A"){
      $("#diy-waijing-prev-view").attr(
        "src",
        "./assemble/A00/全景照片.jpg" + "?" + ((Math.random() * 10000) >> 0)
      );
    }

    $(".diy-hua-title")
      .off("click")
      .on("click", "#diy-hua-title-color", (e) => {
        e.stopPropagation();
        $("#diy-hua-title-color-picker").show();
        var tag = $("#diy-hua-title-color-picker");
        var flag = true;
        $(document)
          .off("click")
          .on("click", function (e) {
            //点击空白处，设置的弹框消失
            var target = $(e.target);
            if (target.closest(tag).length == 0 && flag == true) {
              $(tag).hide();
              flag = false;
            }
          });
      });
    if (!this.houseLetter) {
      this.houseLetter = "B";
    }
    if (!this.fontColorChanged) {
      let color = this._fontData[this.houseLetter]["smallTitleColor"];
      $("#diy-hua-title-color").css("border-bottom-color", color); // #HEX
      $(".hua-font-example").css("color", color); // #HEX
    }
    if (!this.fontSizeChanged) {
      let size = this._fontData[this.houseLetter]["smallTitleSize"];
      $(".hua-font-example").css("font-size", size + "px");
      $("#diy-hua-title-fontsize").val(size);
    }
    if (!this.fontFamilyChanged) {
      let family = this._fontData[this.houseLetter]["smallTitleFamily"];
      $(".hua-font-example").css("font-family", family);
      $("#diy-hua-title-fontfamily").val(family);
    }
    $("#diy-hua-title-fontfamily").on("change", () => {
      $(".font-example").css(
        "font-family",
        $("#diy-hua-title-fontfamily").val() as string
      );
      this.fontFamilyChanged = true;
    });
    $("#diy-hua-title-fontsize").on("change", () => {
      $(".font-example").css(
        "font-size",
        $("#diy-hua-title-fontsize").val() + "px"
      );
      this.fontSizeChanged = true;
    });
    if ($("#diy-hua-title-color-picker").children().length === 0) {
      $("#diy-hua-title-color")
        .off("click")
        .one("click", () => {
          let that = this;
          let picker = AColorPicker.from("#diy-hua-title-color-picker");
          picker.on("change", (picker, color) => {
            $("#diy-hua-title-color").css("border-bottom-color", color); // #HEX
            $(".font-example").css("color", color); // #HEX
            that.fontColorChanged = true;
          });
        });
    }
    $(".diy-common-save")
      .off("click")
      .on("click", () => {
        this.fontColor = $(".font-example").css("color");
        this.fontSize = +$("#diy-hua-title-fontsize").val();
        this.fontFamily = $("#diy-hua-title-fontfamily").val() as string;
        if ($("#diy-cover-file").val()) {
          this.diyCoverPlane();
        }
        if ($("#diy-waijing-file").val()) {
          this.diyWaijingPlane();
        }
        if ($("#diy-favicon-file").val()) {
          let filePath = VeryNettyPara.ProjectID + "/favicon.ico";
          this.uploadFile(
            this.applyTokenDo(),
            "diy-favicon-file",
            filePath,
            () => {
              axios.get(filePath);
            }
          );
        }
        $(".diy-common").delay(500).hide();
        this.removeallbg();
        $("#bg").hide();
      });
  }
  // 点击按钮进入编辑模式，数据初始化
  public showDiyButton(): void {
    let btnshow = false;
    $(".setup-btn")
      .off("click")
      .click(() => {
        if (!btnshow) {
          $(".caizhitihuan-btn,.commentary-btn,.bgm-btn,.common-btn,.initPostion-btn").css(
            "display",
            "inline-block"
          );
          btnshow = true;
          this.editModelButton("m_",25,25,0,"model",this,this.modelPlane.bind(this) );
          this.editHuaButton("hua_", 25, 25, 90, "hua");
          //texture button
          this.editTietuButton("t_", 25, 25, 90, "texture");
          //title button
          this.editTitleButton("title", 25, 25, 90, "title");
          //screen video button
          this.editButton("视频",50,50,90,"video",this,this.diyVideoPlane);
          //door button
          if(Exhibits.assembleData["lobby"][0].question !== false){
            this.editDoorButton();
          }
          this.diyBGM();
          this.diyDes();
          this.getExhibitData();
          this.diyReflection();
          this.diyCommonPlane();
          // GlobalControl.screenVideo.editVideoButton(this.diyVideoPlane);
          this.getTextFile("exhibits.json", this.applyTokenDo());
          this.getTextFile("screen-video.json", this.applyTokenDo());
          this.getTextFile("highPicture.json", this.applyTokenDo());
          axios.get("../modelcollection/modelLibary.json").then((res) => {
            this.modelJson = res.data;
          });
        } else {
          btnshow = false;
          $(".caizhitihuan-btn,.commentary-btn,.bgm-btn,.common-btn,.initPostion-btn").css(
            "display",
            "none"
          );
          this.closeall();
          this.hideBtn();
          $("#bg").hide();
          GlobalControl.screenVideo.hideVideoBtn();
        }
      });
    $(".diy-bgm-main").on("change", ".diy-bgm-file", (e: any) => {
      //获取文件对象
      let fileNode: any = e.target;
      let file = fileNode.files[0];
      if (file) {
        $(e.target)
          .prev()
          .children(".diy-bgm-music-name")
          .text(file.name || "");
        $(e.target).prev().children(".icon-yinlejia").hide();
        $(e.target).next().show();
      } else {
        $(e.target).prev().children(".diy-bgm-music-name").text("");
        $(e.target).prev().children(".icon-yinlejia").show();
        $(e.target).next().hide();
      }
    });
    $(".diy-des-main").on("change", ".diy-des-file", (e: any) => {
      //获取文件对象
      let fileNode: any = e.target;
      let file = fileNode.files[0];
      if (file) {
        $(e.target)
          .prev()
          .children(".diy-des-music-name")
          .text(file.name || "");
        $(e.target).prev().children(".icon-yinlejia").hide();
        $(e.target).next().show();
      } else {
        $(e.target).prev().children(".diy-des-music-name").text("");
        $(e.target).prev().children(".icon-yinlejia").show();
        $(e.target).next().hide();
      }
    });
    $("#diy-video-file").change((e: any) => {
      //获取文件对象
      let fileNode: any = document.getElementById("diy-video-file");
      let file = fileNode.files[0];
      if (this.detectFile(fileNode, 51200, "video/mp4")) {
        this.pervView(file, "diy-video-prev-view");
      }
    });
    $("#diy-pic-file").change((e: any) => {
      //获取文件对象
      let fileNode: any = document.getElementById("diy-pic-file");
      let file = fileNode.files[0];

      if (this.detectFile(fileNode, 500, "image/jpeg")) {
        this.pervView(file, "img-prev-view");
      }
    });
    $("#diy-tietu-file").change((e: any) => {
      //获取文件对象
      let fileNode: any = document.getElementById("diy-tietu-file");
      let file = fileNode.files[0];

      if (this.detectFile(fileNode, 500, "image/jpeg")) {
        this.pervView(file, "diy-tietu-prev-view");
      }
    });
    $("#diy-waijing-file").change((e: any) => {
      //获取文件对象
      let fileNode: any = document.getElementById("diy-waijing-file");
      let file = fileNode.files[0];

      if (this.detectFile(fileNode, 10240, "image/jpeg")) {
        this.pervView(file, "diy-waijing-prev-view");
      }
    });
    $("#diy-cover-file").change((e: any) => {
      //获取文件对象
      let fileNode: any = document.getElementById("diy-cover-file");
      let file = fileNode.files[0];

      if (this.detectFile(fileNode, 4096, "image/png")) {
        this.pervView(file, "diy-cover-prev-view");
      }
    });
    $("#album-pic-file").change((e: any) => {
      //获取文件对象
      let fileNode: any = document.getElementById("album-pic-file");
      let file = fileNode.files[0];

      if (this.detectFile(fileNode, 500, "image/jpeg")) {
        this.pervView(file, "album-prev-view");
      }
    });
    $("#pic-video-file").change((e: any) => {
      //获取文件对象
      let fileNode: any = document.getElementById("pic-video-file");
      let file = fileNode.files[0];

      if (this.detectFile(fileNode, 51200, "video/mp4")) {
        this.pervView(file, "pic-video-prev-view");
      }
    });
    $("#pic-model-file").change((e: any) => {
      //获取文件对象
      let fileNode: any = document.getElementById("pic-model-file");
      let file;
      for (let i = 0; i < fileNode.files.length; i++) {
        if (fileNode.files[i].name === "model.jpg") {
          file = fileNode.files[i];
        }
      }
      this.pervView(file, "pic-model-prev-view");
      this.detectFile(fileNode, 5120);
    });
  }
  // 展画编辑
  public diyPicPlane(btnExhibitName: string, meshProfile): void {
    //获取该展画对应贴图名称
    //需要对修改后的名称进行处理--，删除最后一个斜线前和问号后的内容
    let mesh = GlobalControl.exhibits._scene.getMeshByName(btnExhibitName);
    let textureList = mesh.material.getActiveTextures();
    let temp0 = textureList[0].name;
    let temp1 = temp0.replace(/.*(!?\/)/g,"");
    let urlName = temp1.replace(/(?=\?).*/g,"");
    // 初始化diy面板
    $("#img-prev-view").attr(
      "src",
      "./pic/" + btnExhibitName + ".jpg" + "?" + ((Math.random() * 10000) >> 0)
    );
    $("#diy-pic-title-input").val(meshProfile["title"]);
    $("#diy-pic-en-title-input").val(meshProfile["title_en"]);
    $("#diy-pic-des-input").val(meshProfile["content"]);
    $("#diy-pic-des-en-input").val(meshProfile["content_en"]);
    if (meshProfile["link"]) {
      $(".icon-lianjie-DIY").parent().addClass("icon-lianjie-DIY-bgc");
      $(".diy-pic-link-input").val(meshProfile["link"]);
    } else {
      $(".icon-lianjie-DIY").parent().removeClass("icon-lianjie-DIY-bgc");
      $(".diy-pic-link-input").val("");
    }
    if (meshProfile["photo360"]) {
      $(".icon-360-DIY").parent().addClass("icon-360-DIY-bgc");
      $(".diy-pic-360-link-input").val(meshProfile["photo360"]);
    } else {
      $(".icon-360-DIY").parent().removeClass("icon-360-DIY-bgc");
      $(".diy-pic-360-link-input").val("");
    }
    if (meshProfile["model3d"].length > 0) {
      $(".icon-3D-DIY").parent().addClass("icon-3D-DIY-bgc");
    } else {
      $(".icon-3D-DIY").parent().removeClass("icon-3D-DIY-bgc");
    }
    if (meshProfile["video"].length > 0) {
      $(".icon-shipin-DIY").parent().addClass("icon-shipin-DIY-bgc");
    } else {
      $(".icon-shipin-DIY").parent().removeClass("icon-shipin-DIY-bgc");
    }
    if (meshProfile["highpic"]) {
      $(".icon-tuji-DIY").parent().addClass("icon-tuji-DIY-bgc");
    } else {
      $(".icon-tuji-DIY").parent().removeClass("icon-tuji-DIY-bgc");
    }
    if (meshProfile["pdf"]) {
      $(".icon-pdf-DIY").parent().addClass("icon-pdf-DIY-bgc");
    } else {
      $(".icon-pdf-DIY").parent().removeClass("icon-pdf-DIY-bgc");
    }
    if (meshProfile["left"]) {
      $(".switch-pic-show-direction").prop("checked", true);
    } else {
      $(".switch-pic-show-direction").prop("checked", false);
    }
    this.getHouse(btnExhibitName);
    // 修改展画，标题，内容
    $(".diy-pic-save")
      .off("click")
      .click(() => {
        GlobalControl.exhibits.json[btnExhibitName].title = $(
          "#diy-pic-title-input"
        ).val();
        GlobalControl.exhibits.json[btnExhibitName].title_en = $(
          "#diy-pic-en-title-input"
        ).val();
        GlobalControl.exhibits.json[btnExhibitName].content = $(
          "#diy-pic-des-input"
        ).val();
        GlobalControl.exhibits.json[btnExhibitName].content_en = $(
          "#diy-pic-des-en-input"
        ).val();
        GlobalControl.exhibits.json[btnExhibitName].left = $(
          ".switch-pic-show-direction"
        ).prop("checked");
        let filePath =
          VeryNettyPara.ProjectID + "/pic/" + btnExhibitName + ".jpg";

        let fileVal = $("#diy-pic-file").val();
        if (fileVal) {
          this.uploadFile(this.applyTokenDo(), "diy-pic-file", filePath, () => {
            let url1 = "./pic/" + btnExhibitName + ".jpg";

            let para1 = {name: btnExhibitName,url: url1,title: $("#diy-pic-title-input").val(),index: +btnExhibitName.replace(/.*(!?\_)/g, ""),};
            let num = +btnExhibitName.replace(/.*(!?\_)/g, "") - 1;
            if (this._textTitle[btnExhibitName.replace(/(?=\_).*/g, "")] ===undefined) {
              this._textTitle[btnExhibitName.replace(/(?=\_).*/g, "")] = [];
            }
            this._textTitle[btnExhibitName.replace(/(?=\_).*/g, "")][num] = para1;
            this._textdata = this._textTitle[btnExhibitName.replace(/(?=\_).*/g, "")];
            // 判断小标题文字属性是否改变，没有的话，就从初始文件读取

            if (!this.fontSizeChanged) {
              this.fontSize = this._fontData[this.houseLetter].smallTitleSize;
            }
            if (!this.fontColorChanged) {
              this.fontColor = this._fontData[this.houseLetter].smallTitleColor;
            }
            if (!this.fontFamilyChanged) {
              this.fontFamily = this._fontData[
                this.houseLetter
              ].smallTitleFamily;
            }

            console.log(this._textdata)
            this.textReplace(this._textdata,urlName,num, (titleName: string) => {
              setTimeout(
                (titleName: string) => {
                  console.log("title刚开始");
                  let url2 = "." + this.house + titleName + "?" + Date.now();
                  axios.get(url2).then(() => {
                    console.log(btnExhibitName.replace(/hua/g, "xiaobiaoti"));
                    let mesh = GlobalControl.exhibits._scene.getMeshByName(
                      btnExhibitName.replace(/hua/g, "xiaobiaoti")
                    );
                    let newTexture = new BABYLON.Texture(
                      url2,
                      GlobalControl.exhibits._scene
                    );
                    newTexture.level = 2;
                    newTexture.hasAlpha = true;
                    let texture = "texture" + Date.now();
                    let newMaterial = new BABYLON.StandardMaterial(
                      texture,
                      GlobalControl.exhibits._scene
                    );
                    newMaterial.diffuseTexture = newTexture;
                    mesh.material = newMaterial;
                    console.log("changed标题");
                  });
                },
                1000,
                titleName
              );
            });

            this.textureRepalce(this._textdata,urlName, num, (picName: string) => {
              setTimeout(
                (picName: string) => {
                  console.log("pic刚开始");
                  let url2 = "." + this.house + picName + "?" + Date.now();
                  axios.get(url2).then(() => {
                    let mesh = GlobalControl.exhibits._scene.getMeshByName(
                      btnExhibitName
                    );
                    let newTexture = new BABYLON.Texture(
                      url2,
                      GlobalControl.exhibits._scene
                    );
                    newTexture.level = 2;
                    let texture = "texture" + Date.now();
                    let newMaterial = new BABYLON.StandardMaterial(
                      texture,
                      GlobalControl.exhibits._scene
                    );
                    newMaterial.diffuseTexture = newTexture;
                    mesh.material = newMaterial;
                    console.log("changed展画");
                  });
                },
                1000,
                picName
              );
            });
            this.updateDataAndJson("picdata");
            this.updateDataAndJson("exhibits");
            $("#bg").hide();
          });
        } else {
          let para1 = {
            title: $("#diy-pic-title-input").val() as string,
            index: +btnExhibitName.replace(/.*(!?\_)/g, ""),
          };
          let num = +btnExhibitName.replace(/.*(!?\_)/g, "") - 1;
          console.log(this._textTitle[btnExhibitName.replace(/(?=\_).*/g, "")])
          if (this._textTitle[btnExhibitName.replace(/(?=\_).*/g, "")] ===undefined) {
            this._textTitle[btnExhibitName.replace(/(?=\_).*/g, "")] = [];
          }
          if(this._textTitle[btnExhibitName.replace(/(?=\_).*/g, "")][num] ===undefined){
            this._textTitle[btnExhibitName.replace(/(?=\_).*/g, "")][num] = {};
          }
          this._textTitle[btnExhibitName.replace(/(?=\_).*/g, "")][num]["title"] = para1.title;
          this._textTitle[btnExhibitName.replace(/(?=\_).*/g, "")][num]["index"] = para1.index;
          this._textdata = this._textTitle[btnExhibitName.replace(/(?=\_).*/g, "")];
          // 判断小标题文字属性是否改变，没有的话，就从初始文件读取

          if (!this.fontSizeChanged) {
            this.fontSize = this._fontData[this.houseLetter].smallTitleSize;
          }
          if (!this.fontColorChanged) {
            this.fontColor = this._fontData[this.houseLetter].smallTitleColor;
          }
          if (!this.fontFamilyChanged) {
            this.fontFamily = this._fontData[this.houseLetter].smallTitleFamily;
          }
          console.log(this._textdata)
          this.textReplace(this._textdata,urlName,num, (picName: string) => {
            setTimeout(
              (picName: string) => {
                console.log("单独标题" + btnExhibitName);
                let url2 = "." + this.house + picName + "?" + Date.now();
                axios.get(url2).then(() => {
                  let mesh = GlobalControl.exhibits._scene.getMeshByName(
                    btnExhibitName.replace(/hua/g, "xiaobiaoti")
                  );
                  let newTexture = new BABYLON.Texture(
                    url2,
                    GlobalControl.exhibits._scene
                  );
                  newTexture.level = 2;
                  newTexture.hasAlpha = true;
                  let texture = "texture" + Date.now();
                  let newMaterial = new BABYLON.StandardMaterial(
                    texture,
                    GlobalControl.exhibits._scene
                  );
                  newMaterial.diffuseTexture = newTexture;
                  mesh.material = newMaterial;
                  console.log("changed标题");
                });
              },
              1000,
              picName
            );
          });
          this.updateDataAndJson("picdata");
          this.updateDataAndJson("exhibits");
          $("#bg").hide();
        }
      });

    // 修改链接
    // 保存链接
    $(".diy-pic-link-save")
      .off("click")
      .click(() => {
        if ($(".diy-pic-link-input").val()) {
          GlobalControl.exhibits.json[btnExhibitName].link = $(
            ".diy-pic-link-input"
          ).val();
          if (
            !$(".icon-lianjie-DIY").parent().hasClass("icon-lianjie-DIY-bgc")
          ) {
            $(".icon-lianjie-DIY").parent().addClass("icon-lianjie-DIY-bgc");
          }
          this.updateDataAndJson("exhibits", () => {
            $("#bg").hide();
            $(".diy-pic-link").hide();
          });
        } else {
          window.alert("网址不能为空");
        }
      });
    // 删除链接
    $(".diy-pic-link-cancel")
      .off("click")
      .click(() => {
        $(".icon-lianjie-DIY").parent().removeClass("icon-lianjie-DIY-bgc");
        GlobalControl.exhibits.json[btnExhibitName].link = "";
        $(".diy-pic-link-input").val("");
        this.updateDataAndJson("exhibits");
      });

    // 修改pdf
    // 上传pdf
    $(".diy-pic-pdf-add-btn")
      .off("click")
      .click(() => {
        if ($("#pic-pdf-file").val()) {
          let filePath =
            VeryNettyPara.ProjectID + "/pdf/" + btnExhibitName + ".pdf";
          let file = $("#pic-pdf-file").val();
          if (file) {
            GlobalControl.exhibits.json[btnExhibitName].pdf =
              window.location.origin + "/" + filePath;

            this.uploadFile(
              this.applyTokenDo(),
              "pic-pdf-file",
              filePath,
              () => {
                $("#bg").hide();
                $(".diy-pic-pdf").hide();
              }
            );
            if (!$(".icon-pdf-DIY").parent().hasClass("icon-pdf-DIY-bgc")) {
              $(".icon-pdf-DIY").parent().addClass("icon-pdf-DIY-bgc");
            }
            this.updateDataAndJson("exhibits");
          }
        } else {
          window.alert("pdf文件不能为空");
        }
      });
    // 删除pdf
    $(".diy-pic-pdf-del-btn")
      .off("click")
      .click(() => {
        let filePath =
          VeryNettyPara.ProjectID + "/pdf/" + btnExhibitName + ".mp4";
        this.deleteFile(filePath, this.applyTokenDo());
        GlobalControl.exhibits.json[btnExhibitName].pdf = "";
        $("#pic-pdf-prev-view").attr("src", "");
        $(".icon-pdf-DIY").parent().removeClass("icon-pdf-DIY-bgc");
        this.updateDataAndJson("exhibits");
      });
    // 修改360链接
    // 保存360链接
    $(".diy-pic-360-link-save")
      .off("click")
      .click(() => {
        if ($(".diy-pic-360-link-input").val()) {
          GlobalControl.exhibits.json[btnExhibitName].photo360 = $(
            ".diy-pic-360-link-input"
          ).val();
          if (!$(".icon-360-DIY").parent().hasClass("icon-360-DIY-bgc")) {
            $(".icon-360-DIY").parent().addClass("icon-360-DIY-bgc");
          }
          this.updateDataAndJson("exhibits", () => {
            $("#bg").hide();
            $(".diy-pic-360-link").hide();
          });
        } else {
          window.alert("链接不能为空");
        }
      });
    // 删除链接
    $(".diy-pic-360-link-cancel")
      .off("click")
      .click(() => {
        $(".icon-360-DIY").parent().removeClass("icon-360-DIY-bgc");
        GlobalControl.exhibits.json[btnExhibitName].photo360 = "";
        $(".diy-pic-360-link-input").val("");
        this.updateDataAndJson("exhibits");
      });
    this.videosEdit(btnExhibitName);
    this.modelsEdit(btnExhibitName);
    this.albumEdit(btnExhibitName);
  }
  // 视频集编辑
  private videosEdit(btnExhibitName) {
    if (GlobalControl.exhibits.json[btnExhibitName]) {
      if (GlobalControl.exhibits.json[btnExhibitName].video.length > 0) {
        if (!$(".icon-shipin-DIY").parent().hasClass("icon-shipin-bgc")) {
          $(".icon-shipin-DIY").parent().addClass("icon-shipin-DIY-bgc");
        }
      }
    } else {
      $(".icon-shipin-DIY").parent().removeClass("icon-shipin-DIY-bgc");
    }
    // 初始化视频集box
    $(".icon-shipin-DIY").click(() => {
      $(".diy-videos-box").not(":last").remove();
      if (GlobalControl.exhibits.json[btnExhibitName].video) {
        GlobalControl.exhibits.json[btnExhibitName].video.map((it, index) => {
          var htmlnode = `<div class="diy-videos-box">
        <span class="iconfont icon-jian" name="${it}" index="${index}" path = "video/${it}"></span>
        <video src="video/${it}" autoplay muted alt="" class="diy-videos-pic">
        </div>`;
          $(".diy-videos-box:last").before(htmlnode);
        });
      }
    });
    // 右上角删除
    $(".diy-videos-main")
      .off("click")
      .on("click", ".icon-jian", (e) => {
        console.log(e.target);
        let name = e.target.getAttribute("name");
        let index = e.target.getAttribute("index");
        let filePath =
          VeryNettyPara.ProjectID + "/" + e.target.getAttribute("path");
        $(e.target).parent().remove();
        GlobalControl.exhibits.json[
          btnExhibitName
        ].video = GlobalControl.exhibits.json[btnExhibitName].video.filter(
          (item) => item != name
        );
        if (GlobalControl.exhibits.json[btnExhibitName].video.length === 0) {
          $(".icon-shipin-DIY").parent().removeClass("icon-shipin-DIY-bgc");
          GlobalControl.exhibits.json[btnExhibitName].video = [];
          this.updateDataAndJson("exhibits");
        }
        // this._picdata = GlobalControl.exhibits.albumJson;
        this.deleteFile(filePath, this.applyTokenDo());
        // this.updateDataAndJson("highPicture");
      });
    // 点击加号出现图集图片添加页面
    $(".icon-tianjia1")
      .off("click")
      .click(() => {
        $(".diy-pic-video").toggle();
      });
    // 上传视频
    $(".diy-pic-video-add-btn")
      .off("click")
      .click(() => {
        let videoName =
          btnExhibitName + ((Math.random() * 10000) >>> 0) + ".mp4";
        if ($("#pic-video-file").val()) {
          let filePath = VeryNettyPara.ProjectID + "/video/" + videoName;
          let filePath2 = "./video/" + videoName;
          GlobalControl.exhibits.json[btnExhibitName].video.push(videoName);
          this.uploadFile(
            this.applyTokenDo(),
            "pic-video-file",
            filePath,
            () => {
              $("#bg").hide();
              $(".diy-pic-video").hide();
              $("#pic-video-prev-view").attr("src", "");
              setTimeout(() => {
                axios.get(filePath2).then(() => {
                  var htmlnode = `<div class="diy-videos-box">
        <span class="iconfont icon-jian" name="${videoName}"  path = "video/${videoName}"></span>
        <video src="video/${videoName}" autoplay muted alt="" class="diy-videos-pic">
        </div>`;
                  if ($(".diy-videos-main div").length === 20) {
                    $(".diy-videos-box:last").before(htmlnode);
                    $(".diy-videos-box:last").remove();
                  } else {
                    $(".diy-videos-box:last").before(htmlnode);
                  }
                });
              }, 500);
            }
          );
          if (
            !$(".icon-shipin-DIY").parent().hasClass("icon-lianjie-DIY-bgc")
          ) {
            $(".icon-shipin-DIY").parent().addClass("icon-lianjie-DIY-bgc");
          }
          this.updateDataAndJson("exhibits");
        } else {
          window.alert("视频文件不能为空");
        }
      });
    $(".diy-videos-btn-save")
      .off("click")
      .click(() => {
        $("#bg").hide();
        $(".diy-videos").toggle();
      });
  }
  private modelsEdit(btnExhibitName) {
    if (GlobalControl.exhibits.json[btnExhibitName]) {
      if (GlobalControl.exhibits.json[btnExhibitName].model3d.length > 0) {
        if (!$(".icon-3D-DIY").parent().hasClass("icon-3D-bgc")) {
          $(".icon-3D-DIY").parent().addClass("icon-3D-DIY-bgc");
        }
      }
    } else {
      $(".icon-3D-DIY").parent().removeClass("icon-3D-DIY-bgc");
    }
    // 初始化模型集box
    $(".icon-3D-DIY")
      .off("click")
      .click(() => {
        $(".diy-models-box").not(":last").remove();
        if (GlobalControl.exhibits.json[btnExhibitName].model3d) {
          GlobalControl.exhibits.json[btnExhibitName].model3d.map(
            (it, index) => {
              var htmlnode = `<div class="diy-models-box">
                <span class="iconfont icon-jian" name="${it}" index="${index}" path = picModel/${it}"></span>
                <img src="picModel/${it.replace(
                  /[^/]+(?!.*\/)/g,
                  "model.jpg"
                )}" alt="" class="diy-models-pic">
              </div>`;
              $(".diy-models-box:last").before(htmlnode);
            }
          );
        }
      });
    // 右上角删除
    $(".diy-models-main")
      .off("click")
      .on("click", ".icon-jian", (e) => {
        console.log(e.target);
        let name = e.target.getAttribute("name");
        let index = e.target.getAttribute("index");
        let filePath =
          VeryNettyPara.ProjectID +
          "/" +
          e.target.getAttribute("path").replace(/.[^/]+(?!.*\/)/g, "model.jpg");
        $(e.target).parent().remove();
        GlobalControl.exhibits.json[
          btnExhibitName
        ].model3d = GlobalControl.exhibits.json[btnExhibitName].model3d.filter(
          (item) => item != name
        );
        if (GlobalControl.exhibits.json[btnExhibitName].model3d.length === 0) {
          $(".icon-3D-DIY").parent().removeClass("icon-3D-DIY-bgc");
          GlobalControl.exhibits.json[btnExhibitName].model3d = [];
          this.updateDataAndJson("exhibits");
        }
        this.deleteFile(filePath, this.applyTokenDo());
      });
    // 点击加号出现图集图片添加页面
    $(".diy-models-box .icon-tianjia1")
      .off("click")
      .click(() => {
        $(".diy-pic-model").toggle();
      });
    // 修改模型
    // 上传模型
    $(".diy-pic-model-add-btn")
      .off("click")
      .click(() => {
        if ($("#pic-model-file").val()) {
          let randombtnExhibitName =
            btnExhibitName + ((Math.random() * 10000) >>> 0);
          let filePath =
            VeryNettyPara.ProjectID + "/picModel/" + randombtnExhibitName;
          let filePath2 = "./picModel/" + randombtnExhibitName + "/model.jpg";
          let fileNode: any = document.getElementById("pic-model-file");
          if (fileNode.value) {
            $(".progressNum").text("");
            $(".upload-alert").show();
            let babylonName: string;
            for (let i = 0; i < fileNode.files.length; i++) {
              let suffix = fileNode.files[i].webkitRelativePath.match(
                /(?<=\.).*$/g
              )[0];
              if (suffix === "babylon") {
                babylonName = fileNode.files[i].webkitRelativePath.match(
                  /(?<=\/).+(?=\.)/g
                )[0];
              }
            }
            GlobalControl.exhibits.json[btnExhibitName].model3d.push(
              randombtnExhibitName + "/" + babylonName + ".babylon"
            );
            this.uploadFiles(
              this.applyTokenDo(),
              "pic-model-file",
              filePath,
              () => {
                $("#bg").hide();
                $(".diy-pic-model").hide();
                $("#pic-model-file").val("");
                $(".diy-models-pic").attr("src", "");
                setTimeout(() => {
                  axios.get(filePath2).then(() => {
                    var htmlnode = `<div class="diy-models-box">
                      <span class="iconfont icon-jian" name="${randombtnExhibitName}"  path = "picModel/${randombtnExhibitName}"></span>
                      <img src="picModel/${randombtnExhibitName}/model.jpg" alt="" class="diy-models-pic">
                    </div>`;
                    if ($(".diy-models-main div").length === 20) {
                      $(".diy-models-box:last").before(htmlnode);
                      $(".diy-models-box:last").remove();
                    } else {
                      $(".diy-models-box:last").before(htmlnode);
                    }
                  });
                }, 500);
              }
            );
            if (!$(".icon-3D-DIY").parent().hasClass("icon-3D-DIY-bgc")) {
              $(".icon-3D-DIY").parent().addClass("icon-3D-DIY-bgc");
            }
            this.updateDataAndJson("exhibits");
          }
        } else {
          window.alert("模型文件不能为空");
        }
      });
    // 删除模型
    // $(".diy-pic-model-del-btn")
    //   .off("click")
    //   .click(() => {
    //     let filePath = VeryNettyPara.ProjectID + "/picModel/" + btnExhibitName;
    //     this.deleteFile(filePath, this.applyTokenDo());
    //     GlobalControl.exhibits.json[btnExhibitName].model3d = "";
    //     $(".icon-3D-DIY").parent().removeClass("icon-3D-DIY-bgc");
    //     this.updateDataAndJson("exhibits");
    //   });
    $(".diy-models-btn-save")
      .off("click")
      .click(() => {
        $("#bg").hide();
        $(".diy-models").toggle();
      });
  }

  // 图集编辑
  private albumEdit(btnExhibitName) {
    if (GlobalControl.exhibits.albumJson[btnExhibitName]) {
      if (GlobalControl.exhibits.albumJson[btnExhibitName].length > 0) {
        if (!$(".icon-tuji-DIY").parent().hasClass("icon-tuji-bgc")) {
          $(".icon-tuji-DIY").parent().addClass("icon-tuji-DIY-bgc");
        }
      }
    } else {
      $(".icon-tuji-DIY").parent().removeClass("icon-tuji-DIY-bgc");
    }
    // 初始化图集box
    $(".icon-tuji-DIY")
      .off("click")
      .click(() => {
        $(".diy-album-box").not(":last").remove();
        if (GlobalControl.exhibits.albumJson[btnExhibitName]) {
          GlobalControl.exhibits.albumJson[btnExhibitName].map((it) => {
            var htmlnode = `<div class="diy-album-box">
        <span class="iconfont icon-jian" name="${it.name}" path = "${it.path}"></span>
        <img src="${it.path}" alt="" class="diy-album-pic">
        </div>`;
            $(".diy-album-box:last").before(htmlnode);
          });
        }
      });
    // 右上角删除
    $(".diy-album-main")
      .off("click")
      .on("click", ".icon-jian", (e) => {
        console.log(e.target);
        let name = e.target.getAttribute("name");
        let filePath =
          VeryNettyPara.ProjectID + "/" + e.target.getAttribute("path");
        $(e.target).parent().remove();
        GlobalControl.exhibits.albumJson[
          btnExhibitName
        ] = GlobalControl.exhibits.albumJson[btnExhibitName].filter(
          (item) => item.name != name
        );
        if (GlobalControl.exhibits.albumJson[btnExhibitName].length === 0) {
          $(".icon-tuji-DIY").parent().removeClass("icon-tuji-DIY-bgc");
          GlobalControl.exhibits.json[btnExhibitName].highpic = "";
          this.updateDataAndJson("exhibits");
        }
        this._picdata = GlobalControl.exhibits.albumJson;
        this.deleteFile(filePath, this.applyTokenDo());
        this.updateDataAndJson("highPicture");
      });
    // 点击加号出现图集图片添加页面
    $(".icon-tianjia")
      .off("click")
      .click(() => {
        $(".diy-album-add-box").toggle();
      });
    // 图集图片添加页面保存按钮
    $(".diy-album-add-save")
      .off("click")
      .click(() => {
        if (!$("#diy-album-add-box-title-input").val()) {
          alert("必须填写标题");
          return;
        }
        let fileName = btnExhibitName+(Math.round(Math.random() * 100))+(document.getElementById("album-pic-file") as any).files[0].name;
          console.log(fileName)
        let filePath1 = VeryNettyPara.ProjectID + "/images/highPic/" + fileName;
        let filePath2 = "./images/highPic/" + fileName;
        let name = $("#diy-album-add-box-title-input").val();
        let introduct = $("#diy-album-add-box-des-input").val();
        let nameEn = $("#diy-album-add-box-en-title-input").val();
        let introductEn = $("#diy-album-add-box-en-des-input").val();
        if (GlobalControl.exhibits.albumJson[btnExhibitName]) {
          GlobalControl.exhibits.albumJson[btnExhibitName].push({
            name: name,
            name_en: nameEn,
            path: filePath2,
            introduct: introduct,
            introduct_en: introductEn,
          });
        } else {
          GlobalControl.exhibits.albumJson[btnExhibitName] = [
            {
              name: name,
              name_en: nameEn,
              path: filePath2,
              introduct: introduct,
              introduct_en: introductEn,
            },
          ];
        }

        this._picdata = GlobalControl.exhibits.albumJson;
        this.uploadFile(
          this.applyTokenDo(),
          "album-pic-file",
          filePath1,
          () => {
            setTimeout(() => {
              axios.get(filePath2).then(() => {
                let htmlnode = `<div class="diy-album-box">
              <span class="iconfont icon-jian" name="${name}" path = "${filePath2}"></span>
              <img src="${filePath2}" alt="" class="diy-album-pic">
              </div>`;
                if ($(".diy-album-main div").length === 20) {
                  $(".diy-album-box:last").before(htmlnode);
                  $(".diy-album-box:last").remove();
                } else {
                  $(".diy-album-box:last").before(htmlnode);
                }
              });
            }, 500);
          }
        );
        $("#diy-album-add-box-title-input").val("");
        $("#diy-album-add-box-des-input").val("");
        $("#diy-album-add-box-en-title-input").val("");
        $("#diy-album-add-box-en-des-input").val("");
        $("#album-prev-view").attr("src", "");

        GlobalControl.exhibits.json[btnExhibitName].highpic = btnExhibitName;
        console.log(GlobalControl.exhibits.json);
        this.updateDataAndJson("exhibits");

        this.updateDataAndJson("highPicture");
        if (GlobalControl.exhibits.albumJson[btnExhibitName].length > 0) {
          if (!$(".icon-tuji-DIY").parent().hasClass("icon-tuji-DIY-bgc")) {
            $(".icon-tuji-DIY").parent().addClass("icon-tuji-DIY-bgc");
          }
        }
      });

    $(".diy-album-btn-save")
      .off("click")
      .click(() => {
        $("#bg").hide();
        $(".diy-album").toggle();
      });

    $(".diy-album-add-cancel,.diy-album-add-save").click(() => {
      $("album-pic-file").val("");
      $("diy-album-add-box-title-input").val("");
      $("diy-album-add-box-des-input").val("");
      $(".diy-album-add-box").hide();
    });
  }
  // 图片视频预览
  private pervView(file, targetId: string) {
    var blob = new Blob([file]), // 文件转化成二进制文件
      url = URL.createObjectURL(blob); //转化成url
    if (/image/g.test(file.type)) {
      const img = document.getElementById(targetId);
      img.setAttribute("src", url);
      img.onload = function (e) {
        URL.revokeObjectURL(url); // 释放createObjectURL创建的对象
      };
    } else if (/video/g.test(file.type)) {
      var video = document.getElementById(targetId);
      video.setAttribute("src", url);
      video.onload = function (e) {
        URL.revokeObjectURL(url); // 释放createObjectURL创建的对象
      };
    }
  }

  //按钮销毁
  public hideBtn(): void {
    if (GlobalControl.exhibits._editParent.length >= 1) {
      for (let i = 0; i < GlobalControl.exhibits._editParent.length; i++) {
        // GlobalControl.exhibits._editParent[i]
        //   .getChildMeshes()
        //   .forEach((mesh) => {
        //     mesh.material!.dispose();
        //   });
        GlobalControl.exhibits._editParent[i].dispose();
      }
    }
    GlobalControl.exhibits._editParent = [];
  }
  // 问题编辑
  public diyQuestion(btnExhibitName) {
    $(".diy-question").show();
    $(".diy-question-main").off("click");
    let num: number;
    this._doorscopy.map((it, index) => {
      if (it.name === btnExhibitName) {
        num = index + 1;
      }
    });
    console.log(this._doorscopy)

    let house = "house" + num;
    console.log(house);
    console.log(Question._data[house]);
    $(".diy-question-main")
      .html(this.createQuestionMain(Question._data[house]) as any)
      .append(
        `<div class="diy-question-box-add">----------------------------点击添加问答题----------------------------</div>`
      );
    $(".diy-question-main").on(
      "click",
      ".diy-question-answer-bg .icon-chacha",
      (e) => {
        $(e.target)
          .parents(".diy-question-answer")
          .siblings(".diy-question-answer").length === 3
          ? $(e.target)
              .parents(".diy-question-answers")
              .siblings(".diy-question-function")
              .find(".diy-question-answer-add")
              .show()
          : "";
        $(e.target).parents(".diy-question-answer").remove();
      }
    );
    $(".diy-question-main").on("click", ".diy-question-answer-add", (e) => {
      let answerNode = `<div class="diy-question-answer">
                <input type="checkbox" name="" id="" />
                <div class="diy-question-answer-bg">
                  <input
                    type="text"
                    class="diy-question-answer-text"
                    autofocus
                    placeholder="请输入选项，并在正确选项前勾选"
                  />
                  <span class="iconfont icon-chacha"></span>
                </div>
              </div>`;
      $(e.target)
        .parents(".diy-question-function")
        .siblings(".diy-question-answers")
        .append(answerNode);
      $(e.target)
        .parents(".diy-question-function")
        .siblings(".diy-question-answers")
        .children(".diy-question-answer").length === 4
        ? $(e.target).parents(".diy-question-answer-add").hide()
        : "";
    });
    $(".diy-question-main").on("click", ".icon-timushanchu", (e) => {
      let question = $(e.target)
        .parents(".diy-question-box")
        .attr("data-answer");
      let qa = [];
      Question._data[house].map((it, index) => {
        if (it.question !== question) {
          qa.push(it);
        }
      });
      GlobalControl.question.update.call(GlobalControl.question);
      Question._data[house] = qa;
      console.log(qa);
      $(e.target).parents(".diy-question-box").remove();
      $(".diy-question-box .diy-question-no").each((index, e) => {
        $(e).text(index + 1 < 10 ? "0" + (index + 1) : index + 1);
      });
    });
    $(".diy-question-main").on("click", ".diy-question-box-add", (e) => {
      let box = `<div class="diy-question-box">
            <div class="diy-question-q">
              <span class="diy-question-no">01</span>
              <div class="diy-question-input-bg">
                <input
                  type="text"
                  class="diy-question-input"
                  autofocus
                  placeholder="请输入问题"
                />
              </div>
            </div>
            <div class="diy-question-answers">
              <div class="diy-question-answer">
                <input
                  type="checkbox"
                  name=""
                  id=""
                  class="diy-question-answer-checkbox"
                />
                <div class="diy-question-answer-bg">
                  <input
                    type="text"
                    class="diy-question-answer-text"
                    autofocus
                    placeholder="请输入选项，并在正确选项前勾选"
                  />
                  <span class="iconfont icon-chacha"></span>
                </div>
              </div>
              <div class="diy-question-answer">
                <input type="checkbox" name="" id="" />
                <div class="diy-question-answer-bg">
                  <input
                    type="text"
                    class="diy-question-answer-text"
                    autofocus
                    placeholder="请输入选项，并在正确选项前勾选"
                  />
                  <span class="iconfont icon-chacha"></span>
                </div>
              </div>
            </div>
            <div class="diy-question-function">
              <div class="diy-question-answer-add">
                <span class="iconfont icon-wentijia"></span>
                <span class="diy-question-answer-add-text">添加选项</span>
              </div>
              <span class="iconfont icon-timushanchu"></span>
            </div>
          </div>`;
      $(".diy-question-box-add").before(box);
      $(".diy-question-box .diy-question-no").each((index, e) => {
        $(e).text(index + 1 < 10 ? "0" + (index + 1) : index + 1);
      });
    });
    $(".diy-question-save")
      .off("click")
      .click(() => {
        let answerObj = [];
        $(".diy-question-box").each((index, e) => {
          $(e).find(".diy-question-no").text();
          let question;
          question =
            `（${index + 1}）` + $(e).find(".diy-question-input").val();
          let options = [];
          let zimu = ["A. ", "B. ", "C. ", "D. "];
          $(e)
            .find(".diy-question-answer-text")
            .each((index, e) => {
              options.push(zimu[index] + $(e).val());
            });
          let answer = [];
          $(e)
            .find("input[type='checkbox']")
            .each((index, e) => {
              if ($(e).prop("checked")) {
                answer.push(index + 1);
              }
            });
          let type;
          let answerName = "answer";
          if (answer.length > 1) {
            type = "多选题";
            answerName = "answers";
          } else if (answer.length === 1 && options.length > 2) {
            type = "单选题";
            answer = answer[0];
          } else {
            type = "判断题";
            answer = answer[0];
          }

          let obj = {
            type: type,
            index: +index + 1,
            question: question,
            options: options,
          };
          obj[answerName] = answer;
          answerObj.push(obj);
        });
        GlobalControl.question.update.call(GlobalControl.question);
        Question._data[house] = answerObj;
        this.updateDataAndJson("question", () => {
          $(".upload-success").show().delay(500).hide(300);
          $(".diy-question").hide(300);
          $("#bg").hide();
        });
      });
  }
  private createQuestionMain(houseArr) {
    let quboxNodes = [];
    if (houseArr) {
      houseArr.map((item, index) => {
        quboxNodes.push(this.createQuestion(item, index));
      });
    }
    return quboxNodes;
  }
  private createQuestion(obj, index) {
    let correctArr = [];
    if (obj["answer"]) {
      correctArr[0] = obj["answer"];
    } else {
      correctArr = obj["answers"];
    }
    let htmlNodes = this.createAnswers(obj.options, correctArr).join("");
    let title = obj["question"].replace(/^.*?[）]/g, "");
    let html = `<div class="diy-question-box" data-answer=${obj["question"]}>
        <div class="diy-question-q">
          <span class="diy-question-no">${
            index + 1 < 10 ? "0" + (index + 1) : index + 1
          }</span>
          <div class="diy-question-input-bg">
            <input
              type="text"
              class="diy-question-input"
              autofocus
              placeholder="请输入问题"
              value=${title}
            />
          </div>
        </div>
        <div class="diy-question-answers">
        ${htmlNodes}
        </div>
        <div class="diy-question-function">
          <div class="diy-question-answer-add" ${
            obj.options.length === 4 ? `style = display:none` : ""
          }>
              <span class="iconfont icon-wentijia"></span>
              <span class="diy-question-answer-add-text">添加选项</span>
            </div>
            <span class="iconfont icon-timushanchu"></span>
          </div>
      </div>`;
    return html;
  }
  private createAnswers(optionsArr, correctArr) {
    let htmlNodes = [];
    optionsArr.map((it, index) => {
      let check = "";
      if (correctArr.includes(index + 1)) {
        check = "checked";
      }
      console.log(it);
      let htmlNode = `<div class="diy-question-answer">
            <input type="checkbox" name="" id="" ${check} class="diy-question-answer-checkbox"/>
            <div class="diy-question-answer-bg">
              <input
                type="text"
                class="diy-question-answer-text"
                autofocus
                placeholder="请输入选项，并在正确选项前勾选"
                value = ${it.replace(/^\w.(\s?)*/g, "")}
              />
              <span class="iconfont icon-chacha"></span>
            </div>
          </div>`;
      htmlNodes.push(htmlNode);
    });
    return htmlNodes;
    console.log(htmlNodes);
  }

  //问答题后跳转链接编辑
  public diyExhibitLink() {
    let that = this;
    //关闭其他页面，打开编辑页面
    this.closeall2();
    $(".diy-exhibitLink").show();
    if(Exhibits.assembleData.lobby[0].link && Exhibits.assembleData.lobby[0].link !== "" && Exhibits.assembleData.lobby[0].link !== null){
      $(".diy-exhibitLink-input").val(Exhibits.assembleData.lobby[0].link);
    }

    // 修改链接
    // 保存链接
    $(".diy-exhibitLink-save")
      .off("click")
      .click(() => {
        if (!$(".diy-exhibitLink-input").val()) {
          window.alert("网址为空,保存后展厅将没有跳转链接");
          $(".diy-exhibitLink-input").val("")
        }
        Exhibits.assembleData.lobby[0].link = $(".diy-exhibitLink-input").val();
        let run = new Promise(function (resolve, reject) {
          resolve(that.updateDataAndJson("assemble"))
        })
          .then(function () {
            $(".upload-success").show().delay(500).hide(300);
            $(".diy-exhibitLink").hide(300);
            $("#bg").hide();
          })
      });

      //清空输入框内容
      $(".diy-exhibitLink-delete-link")
      .off("click")
      .click(() => {
        if ($(".diy-exhibitLink-input").val()) {
          $(".diy-exhibitLink-input").val("");
        }
      });


  }

  // 更新json
  private updateDataAndJson(jsonName: string, callback?: () => void): void {
    //修改内容
    let bb;
    if (jsonName === "exhibits") {
      this._data = GlobalControl.exhibits.json;
      bb = JSON.stringify(GlobalControl.exhibits.json);
    } else if (jsonName === "screen-video") {
      GlobalControl.screenVideo._data = GlobalControl.screenVideo._data;
      bb = JSON.stringify(GlobalControl.screenVideo._data);
    } else if (jsonName === "highPicture") {
      this._picdata = GlobalControl.exhibits.albumJson;
      bb = JSON.stringify(GlobalControl.exhibits.albumJson);
    } else if (jsonName === "assemble") {
      // AudioControl._bgMusicList = Exhibits.assembleData;
      bb = JSON.stringify(Exhibits.assembleData);
    } else if (jsonName === "question") {
      bb = JSON.stringify(Question._data);
    } else if (jsonName === "picdata") {
      console.log(this._textTitle);
      bb = JSON.stringify(this._textTitle);
    }
    this.putBuffer(
      VeryNettyPara.ProjectID + "/data/" + jsonName + ".json",
      this.applyTokenDo(),
      bb,
      () => {
        if (jsonName === "exhibits") {
          this.getTextFile("exhibits.json", this.applyTokenDo());
        } else if (jsonName === "screen-video") {
          this.getTextFile("screen-video.json", this.applyTokenDo());
        } else if (jsonName === "highPicture") {
          this.getTextFile("highPicture.json", this.applyTokenDo());
        } else if (jsonName === "assemble") {
          this.getTextFile("assemble.json", this.applyTokenDo());
        }
        if (callback) {
          callback();
        }
      }
    );
  }
  // 判断文件类型
  private detectFile(
    filevalue: HTMLInputElement,
    size: number,
    type?: string
  ): boolean {
    const file = filevalue.files[0];
    var fileSize = (file.size / 1024) >> 0; // 取整
    var fileType = file.type;
    if (type) {
      let alertName;
      if (type === "image/jpeg") {
        alertName = "jpg";
      } else if (type === "image/png") {
        alertName = "png";
      } else {
        alertName = "mp4";
      }
      if (fileType !== type) {
        alert("请上传" + alertName + "文件");
        $(filevalue).val("");
        return false;
      }
    }
    if (fileSize > size) {
      alert("上传文件超出限制大小,限制为" + size + "K");
      $(filevalue).val("");
      return false;
    }
    return true;
  }
  //oss方法
  private send_request(): any {
    let xmlhttp = null;
    if (window.XMLHttpRequest) {
      xmlhttp = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    if (xmlhttp != null) {
      // serverUrl是 用户获取 '签名和Policy' 等信息的应用服务器的URL，请将下面的IP和Port配置为您自己的真实信息。
      let serverUrl = "https://cooltoken.cool360.com/";

      xmlhttp.open("GET", serverUrl, false);
      xmlhttp.send(null);
      return xmlhttp.responseText;
    } else {
      alert("Your browser does not support XMLHTTP.");
    }
  }

  private bucket = "veryexpo";
  private region = "oss-cn-hangzhou";
  private ossClient: any;
  private ossJSON: string;

  //请求token
  private applyTokenDo(): any {
    let that = this;
    let body = this.send_request();
    let creds = JSON.parse(body);
    let client = new OSS({
      region: that.region,
      accessKeyId: creds.AccessKeyId,
      accessKeySecret: creds.AccessKeySecret,
      stsToken: creds.SecurityToken,
      bucket: that.bucket,
    });

    this.ossClient = client;

    return client;
  }

  //上传文件
  private uploadFile(
    client,
    fileName: string,
    filePath: string,
    callback = () => {}
  ) {
    let uploadFileClient;
    if (!uploadFileClient || Object.keys(uploadFileClient).length === 0) {
      uploadFileClient = client;
    }

    let file: HTMLInputElement = document.getElementById(
      fileName
    ) as HTMLInputElement;

    const options = {
      // partSize: 100 * 1024,
      progress: function (p) {
        console.log(p);

        $(".upload-alert").show();

        p = (p * 100) >> 0;
        $(".progressNum").text(p + "%");
        if (p === 100) {
          $(".upload-alert").hide();
          $(".upload-success").show().delay(1000).hide(300);
          callback();
        }
      },
      meta: { year: 2020, people: "test" },
      headers: { "Cache-Control": "no-cache" },
    };

    client
      .multipartUpload(filePath, file.files[0], options)
      .then((res) => {
        console.log("upload success: %j", res);
        uploadFileClient = null;
        file.value = "";
      })
      .catch((err) => {
        if (uploadFileClient && uploadFileClient.isCancel()) {
          console.log("stop-upload!");
          console.error(err);
        } else {
          console.error(err);
        }
      });
  }

  // 上传文件夹
  private uploadFiles(
    client,
    fileName: string,
    targetPath: string,
    callback = () => {}
  ): any {
    let uploadFileClient;
    if (!uploadFileClient || Object.keys(uploadFileClient).length === 0) {
      uploadFileClient = client;
    }

    let file: HTMLInputElement = document.getElementById(
      fileName
    ) as HTMLInputElement;
    let flag = 0;
    for (let i = 0; i < file.files.length; i++) {
      let filePath =
        targetPath +
        "/" +
        (file.files[i] as any).webkitRelativePath.match(/(?<=\/).*$/g)[0];
      const options = {
        partSize: 100 * 1024,
        progress: function (p, cpt, res) {},
        meta: { year: 2020, people: "test" },
        headers: { "Cache-Control": "no-cache" },
      };
      client
        .multipartUpload(filePath, file.files[i], options)
        .then((res) => {
          console.log("upload success: %j", res);
          uploadFileClient = null;
          flag++;
          if (flag === file.files.length) {
            $(".upload-alert").hide();
            $(".upload-success").show().delay(1000).hide(300);
            callback();
          }
        })
        .catch((err) => {
          if (uploadFileClient && uploadFileClient.isCancel()) {
            console.log("stop-upload!");
            console.error(err);
          } else {
            console.error(err);
          }
        });
    }
  }
  // 上传音乐
  private uploadMusicFiles(client, fileName: string, targetPath: string): any {
    let uploadFileClient;
    if (!uploadFileClient || Object.keys(uploadFileClient).length === 0) {
      uploadFileClient = client;
    }
    let fileNodes: any = document.getElementsByClassName(fileName);
    let musicFiles = [];
    for (let item of fileNodes) {
      if (item.files.length) {
        musicFiles.push(item);
      }
    }
    if (musicFiles.length === 0) {
      $(".upload-alert").hide();
      $(".upload-success").show().delay(1000).hide(300);
      $(".diy-des").hide(300);
      $(".diy-bgm").hide(300);
    }
    let flag = 0;
    let filePath = targetPath + "/";
    for (let i = 0; i < musicFiles.length; i++) {
      if (musicFiles[i].files[0]) {
        filePath = targetPath + "/" + musicFiles[i].files[0].name;
      }
      const options = {
        partSize: 100 * 1024,
        progress: function (p, cpt, res) {},
        meta: { year: 2020, people: "test" },
        headers: { "Cache-Control": "no-cache" },
      };
      client
        .multipartUpload(filePath, musicFiles[i].files[0], options)
        .then((res) => {
          console.log("upload success: %j", res);
          uploadFileClient = null;
          flag++;
          if (flag === musicFiles.length) {
            $(".upload-alert").hide();
            $(".upload-success").show().delay(500).hide(300);
          }
        })
        .catch((err) => {
          if (uploadFileClient && uploadFileClient.isCancel()) {
            console.log("stop-upload!");
            console.error(err);
          } else {
            console.error(err);
          }
        });
    }
  }
  //list and copy objects
  public async copyRenameFiles(dir: string, copy: string, client) {
    const result = await client.list({
      prefix: dir,
    });

    result.objects.forEach((obj) => {
      client
        .copy(copy + obj.name.slice(dir.length), obj.name)
        .then((res) => {
          console.log(res);
        })
        .catch((e) => {
          console.log(e);
        });
    });
  }

  //delete object
  public async deleteFile(obj: string, client) {
    try {
      let result = await client.delete(obj);
      console.log(result);
    } catch (e) {
      console.log(e);
    }
  }

  //获取json文件内容
  public async getTextFile(fileName: string, client: any) {
    //文件路径，根据动态路劲进行调整
    // let filePath = VeryNettyPara.ProjectID + "/data/"
    let filePath = VeryNettyPara.ProjectID + "/data/";
    filePath = filePath + fileName;
    let url = client.signatureUrl(filePath, { expires: 3600 });
    let r = await axios.get(url, { responseType: "blob" });
    let data = r.data;
    var reader = new FileReader();
    reader.readAsText(data, "utf-8");
    reader.onload = function (e) {
      // act(reader.result.toString());
      // console.log(reader.result.toString())
      var content = JSON.parse(reader.result.toString());
      // GlobalControl.exhibits.json = content;
      if (fileName === "exhibits.json") {
        GlobalControl.exhibits.json = content;
        console.log(content);
      } else if (fileName === "screen-video.json") {
        GlobalControl.screenVideo._data = content;
        console.log(content);
      } else if (fileName === "highPicture.json") {
        GlobalControl.exhibits.albumJson = content;
        console.log(content);
      }
    };
  }

  //上传内容
  public async putBuffer(
    filename: string,
    client: any,
    content: string,
    callback?: any
  ) {
    try {
      let result = await client.put(filename, new Buffer(content), {
        headers: { "Cache-Control": "no-cache" },
      });
      console.log(result);
      callback();
    } catch (e) {
      console.log(e);
    }
  }
  private loadTextData(): void {
    let that = this;
    that._textTitle = {};
  }

  // public initTextData(intro: string): void {
  //   //读取json相对应的数据
  //   if (this._textTitle[intro]) {
  //     this._textdata = [];
  //     for (let i: number = 0; i < this._textTitle[intro].length; i++) {
  //       let para: TextData = {
  //         url: this._textTitle[intro][i].url,
  //         title: this._textTitle[intro][i].title,
  //         index: this._textTitle[intro][i].index,
  //       };
  //       this._textdata.push(para);
  //     }
  //     this.textReplace(this._textdata);
  //   }
  // }

  //创建文字插入
  public textReplace(
    exhibit: TextData[],
    urlName:string,
    picIndex:number,
    callback?: (titleName: string) => void
  ): void {
    let that = this;
    let txtCanvas = document.createElement("canvas");
    let txtCtx = txtCanvas.getContext("2d");
    let txtWidth = 1024;
    let txtHeight = 256;
    console.log(urlName)
    let titleName = urlName.substring(0,6)+"名称.png"; //标题16
    if (urlName.substring(1,3) !== "10") {
      txtHeight = 640;
    }

    txtCanvas.width = txtWidth;
    txtCanvas.height = txtHeight;

    let img = new Image();
    img.src = "." + that.house + titleName + "?" + ((Math.random() * 10000) >>> 0);
    img.onload = function () {
      txtCtx.drawImage(img,0,0,img.width,img.height,0,0,txtWidth,txtHeight);
      txtCtx.font = that.fontSize + "px" + " " + that.fontFamily;
      txtCtx.fillStyle = that.fontColor;
      console.log(that.fontFamily, that.fontColor);
      let textX;
      let textY;
      if (exhibit[picIndex]) {
        textX = ((exhibit[picIndex].index - 1) % 4) * 256 + 5;
        textY = 64 * Math.floor((exhibit[picIndex].index - 1) / 4) + 33;
        txtCtx.clearRect(((exhibit[picIndex].index - 1) % 4) * 256,64 * Math.floor((exhibit[picIndex].index - 1) / 4),256,64);
        txtCtx.fillText(exhibit[picIndex].title, textX, textY);
      }
      let base64Data = txtCanvas.toDataURL("image/png", 1.0);
      GlobalControl.exhibits.uploadBase64Img(base64Data,VeryNettyPara.ProjectID + that.house + titleName,GlobalControl.exhibits.applyTokenDo(),callback(titleName));
    };
  }

  //创建画布
  public textureRepalce(
    exhibit: TextData[],
    urlName:string,
    picIndex: number,
    callback: (picName: string) => void
  ): void {
    let that = this;
    let width;
    let height;
    let xPos;
    let yPos;
    let reXPos;
    let reYPos;
    let imgS;
    let scale = 1;
    let picName = urlName;
    width = 4096;
    height = 4096;

    let picCanvas = document.createElement("canvas");
    let ctx = picCanvas.getContext("2d");
    picCanvas.width = width;
    picCanvas.height = height;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);
    console.log("展画开始")

    //创建贴图
    function drawing(picIndex) {
      if (picIndex < exhibit.length) {
        let img = new Image();
        if (exhibit[picIndex]) {
          img.src = exhibit[picIndex].url;
        } else {
          img.src = "./pic/pic.jpg";
        }

        img.onload = function () {
          if (exhibit[picIndex]) {
            if (picName.substring(1,3) === "10") {
              imgS = 1024;
              if (img.width >= img.height) {
                scale = imgS / img.width;
                xPos = ((exhibit[picIndex].index - 1) % 4) * imgS;
                yPos = Math.floor((exhibit[picIndex].index - 1) / 4) * imgS +(imgS - scale * img.height) / 2;
              } else {
                scale = imgS / img.height;
                xPos = ((exhibit[picIndex].index - 1) % 4) * imgS +(imgS - scale * img.width) / 2;
                yPos = Math.floor((exhibit[picIndex].index - 1) / 4) * imgS;
              }
              reXPos = ((exhibit[picIndex].index - 1) % 4)* imgS;
              reYPos = Math.floor((exhibit[picIndex].index - 1) / 4) * imgS;
            } else {
              imgS = 585.143;
              if (img.width >= img.height) {
                scale = imgS / img.width;
                xPos = ((exhibit[picIndex].index - 1) % 7) * imgS;
                yPos = Math.floor((exhibit[picIndex].index - 1) / 7) * imgS +(imgS - scale * img.height) / 2;
              } else {
                scale = imgS / img.height;
                xPos = ((exhibit[picIndex].index - 1) % 7) * imgS +(imgS - scale * img.width) / 2;
                yPos = Math.floor((exhibit[picIndex].index - 1) / 7) * imgS;
              }
              reXPos = ((exhibit[picIndex].index - 1) % 7)* imgS;
              reYPos = Math.floor((exhibit[picIndex].index - 1) / 7) * imgS;
            }
            ctx.fillStyle = "#4A4A4A";
            ctx.fillRect(reXPos,reYPos,imgS,imgS);
            ctx.drawImage(img,0,0,img.width,img.height,xPos,yPos,scale * img.width,scale * img.height);
          }

          let base64Data = picCanvas.toDataURL("image/jpeg", 1.0);
          GlobalControl.exhibits.uploadBase64Img(
            base64Data,
            VeryNettyPara.ProjectID + that.house + picName,
            GlobalControl.exhibits.applyTokenDo(),
            callback(picName)
          );
        };
      }
    }
    let img = new Image();
    img.src = "." + that.house + picName + "?" + Date.now();
    img.onload = function () {
      ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, width, height);
      drawing(picIndex);
    };
  }

  public dataURLtoFile(dataurl, filename) {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime }); // if env support File, also can use this: return new File([u8arr], filename, { type: mime });
  }

  // client表示OSS client实例
  public uploadBase64Img(base64Content, file, client, callback?) {
    // base64格式的内容
    const filename = "img.png";
    const imgfile = this.dataURLtoFile(base64Content, filename);
    //key表示上传的object key ,imgFile表示dataURLtoFile处理后返回的图片
    const options = {
      // partSize: 100 * 1024,
      progress: function (p) {
        p = (p * 100) >> 0;
        if (p === 100) {
          if (callback) {
            $(".upload-alert").hide();
            $(".upload-success").show().delay(1000).hide(300);
          }
        }
      },
      headers: { "Cache-Control": "no-cache" },
    };
    client
      .multipartUpload(file, imgfile, options)
      .then(callback)
      .catch((err) => {
        console.error(err);
      });
  }
  public modelPlane(buttonName) {
    let path: string;
    let name: string;
    let imgSrc: string;
    this.closeall();
    $(".diy-model").show();
    $(".diy-model-main").empty();
    $(".diy-model-main").append(`<div class="diy-model-box diy-model-add">
    <span class="iconfont icon-tianjia"></span>
  </div>`);
    if ($(".diy-model-category-ul").children().length === 0) {
      $(".diy-model-category-ul").empty();
      $(".diy-model-category-ul").append(
        `<span class="diy-model-category-li diy-model-category-li-active">全部</span>`
      );
      for (let key in this.modelJson) {
        let htmlnode = `<span class="diy-model-category-li">${key}</span>`;
        $(".diy-model-category-ul").append(htmlnode);
      }
    } else {
      $(".diy-model-category-li").removeClass("diy-model-category-li-active");
      $(".diy-model-category-li:first-child").addClass(
        "diy-model-category-li-active"
      );
    }
    let allModel = [];
    for (let key in this.modelJson) {
      allModel = [...allModel, ...this.modelJson[key]];
    }
    allModel.map((it) => {
      let htmlnode = `<div class="diy-model-box" path=${it.path} name=${it.name}>
             <img src=${it.img} alt="" class="diy-model-img" />
             <span class="diy-model-name">${it.modelName}</span>
           </div>`;
      $(".diy-model-add").before(htmlnode);
    });
    $(".diy-model-category-box")
      .off("click")
      .on("click", ".diy-model-category-li", (e) => {
        $(".diy-model-category-li").removeClass("diy-model-category-li-active");
        $(e.target).addClass("diy-model-category-li-active");
        $(".diy-model-main").empty();
        $(".diy-model-main").append(`<div class="diy-model-box diy-model-add">
      <span class="iconfont icon-tianjia"></span>
    </div>`);
        let key = $(e.target).text();
        if (key === "全部") {
          allModel.map((it) => {
            let htmlnode = `<div class="diy-model-box" path=${it.path} name=${it.name}>
                 <img src=${it.img} alt="" class="diy-model-img" />
                 <span class="diy-model-name">${it.modelName}</span>
               </div>`;
            $(".diy-model-add").before(htmlnode);
          });
        } else {
          this.modelJson[key].map((it) => {
            let htmlnode = `<div class="diy-model-box" path=${it.path} name=${it.name}>
                 <img src=${it.img} alt="" class="diy-model-img" />
                 <span class="diy-model-name">${it.modelName}</span>
               </div>`;
            $(".diy-model-add").before(htmlnode);
          });
        }
      });

    $(".diy-model-main")
      .off("click")
      .on("click", ".diy-model-box:not(.diy-model-box:last)", (e) => {
        path = $(e.target).parent().attr("path");
        name = $(e.target).parent().attr("name");
        imgSrc = $(e.target).parent().children("img").attr("src");
        let modelName = $(e.target).parent().children("span").text();
        this.modelLoad(buttonName, path, name, 1, 0, 0, 0, 0);
        $(".diy-model").hide();
        $("#bg").hide();
        $(".diy-model-change").show();
        $("#diy-model-change-size").val(0);
        $("#diy-model-change-rotation").val(0);
        $("#diy-model-change-x").val(0);
        $("#diy-model-change-y").val(0);
        $("#diy-model-change-z").val(0);
        $(".diy-model-change-dispalybox-img").attr("src", imgSrc);
        $(".diy-model-change-dispalybox-modelname").text(modelName);
      });

    $(".diy-model-change-reset")
      .off("click")
      .on("click", (e) => {
        $(e.target).parent().prev("input").val(0).change();
      });

    $("#diy-model-change-size")
      .off("change")
      .on("change", (e) => {
        let scale = +$("#diy-model-change-size").val() as number;
        let rotation = +$("#diy-model-change-rotation").val() as number;
        let x = +$("#diy-model-change-x").val() as number;
        let y = +$("#diy-model-change-y").val() as number;
        let z = +$("#diy-model-change-z").val() as number;
        if (scale < 0) {
          scale = 1 - (-1 * (scale - 1)) / 5;
        } else {
          scale = 1 + scale;
        }
        rotation = (rotation * Math.PI) / 180;
        this.modelLoad(buttonName, path, name, scale, rotation, x, y, z);
      });
    $("#diy-model-change-rotation")
      .off("change")
      .on("change", (e) => {
        let scale = +$("#diy-model-change-size").val() as number;
        let rotation = +$("#diy-model-change-rotation").val() as number;
        let x = +$("#diy-model-change-x").val() as number;
        let y = +$("#diy-model-change-y").val() as number;
        let z = +$("#diy-model-change-z").val() as number;
        if (scale < 0) {
          scale = 1 - (-1 * (scale - 1)) / 5;
        } else {
          scale = 1 + scale;
        }
        rotation = (rotation * Math.PI) / 180;
        this.modelLoad(buttonName, path, name, scale, rotation, x, y, z);
      });

    $("#diy-model-change-x")
      .off("change")
      .on("change", (e) => {
        let scale = +$("#diy-model-change-size").val() as number;
        let rotation = +$("#diy-model-change-rotation").val() as number;
        let x = +$("#diy-model-change-x").val() as number;
        let y = +$("#diy-model-change-y").val() as number;
        let z = +$("#diy-model-change-z").val() as number;
        if (scale < 0) {
          scale = 1 - (-1 * (scale - 1)) / 5;
        } else {
          scale = 1 + scale;
        }
        rotation = (rotation * Math.PI) / 180;
        this.modelLoad(buttonName, path, name, scale, rotation, x, y, z);
      });
    $("#diy-model-change-y")
      .off("change")
      .on("change", (e) => {
        let scale = +$("#diy-model-change-size").val() as number;
        let rotation = +$("#diy-model-change-rotation").val() as number;
        let x = +$("#diy-model-change-x").val() as number;
        let y = +$("#diy-model-change-y").val() as number;
        let z = +$("#diy-model-change-z").val() as number;
        if (scale < 0) {
          scale = 1 - (-1 * (scale - 1)) / 5;
        } else {
          scale = 1 + scale;
        }
        rotation = (rotation * Math.PI) / 180;
        this.modelLoad(buttonName, path, name, scale, rotation, x, y, z);
      });
    $("#diy-model-change-z")
      .off("change")
      .on("change", (e) => {
        let scale = +$("#diy-model-change-size").val() as number;
        let rotation = +$("#diy-model-change-rotation").val() as number;
        let x = +$("#diy-model-change-x").val() as number;
        let y = +$("#diy-model-change-y").val() as number;
        let z = +$("#diy-model-change-z").val() as number;
        if (scale < 0) {
          scale = 1 - (-1 * (scale - 1)) / 5;
        } else {
          scale = 1 + scale;
        }
        rotation = (rotation * Math.PI) / 180;
        this.modelLoad(buttonName, path, name, scale, rotation, x, y, z);
      });

    $(".diy-model-main").on("click", ".diy-model-add", (e) => {
      $(".diy-model-model").show();
    });
    $(".diy-model-change-save")
      .off("click")
      .on("click", () => {
        let scale = +$("#diy-model-change-size").val() as number;
        let rotation = +$("#diy-model-change-rotation").val() as number;
        let x = +$("#diy-model-change-x").val() as number;
        let y = +$("#diy-model-change-y").val() as number;
        let z = +$("#diy-model-change-z").val() as number;
        if (scale < 0) {
          scale = 1 - (-1 * (scale - 1)) / 5;
        } else {
          scale = 1 + scale;
        }
        rotation = (rotation * Math.PI) / 180;
        Game.modelData[buttonName] = {
          File: path,
          fileName: name,
          scale,
          rotation,
          x,
          y,
          z,
        };
        let bb = JSON.stringify(Game.modelData);
        this.putBuffer(
          VeryNettyPara.ProjectID + "/data/model.json",
          this.applyTokenDo(),
          bb,
          () => {
            this.closeall();
            $("#bg").hide();
          }
        );
      });
    $(".diy-model-delete")
      .off("click")
      .on("click", () => {
        delete Game.modelData[buttonName];
        let bb = JSON.stringify(Game.modelData);
        this.putBuffer(
          VeryNettyPara.ProjectID + "/data/model.json",
          this.applyTokenDo(),
          bb,
          () => {
            Exhibits._modelList[buttonName].dispose();
          }
        );
      });
    $(".diy-model-model-add-btn")
      .off("click")
      .click(() => {
        if ($("#model-model-file").val()) {
          let filePath = VeryNettyPara.ProjectID + "/model/" + buttonName;
          let fileNode: any = document.getElementById("model-model-file");
          if (fileNode.value) {
            $(".progressNum").text("");
            $(".upload-alert").show();
            let babylonName: string;
            for (let i = 0; i < fileNode.files.length; i++) {
              let suffix = fileNode.files[i].webkitRelativePath.match(
                /(?<=\.).*$/g
              )[0];
              if (suffix === "babylon") {
                babylonName = fileNode.files[i].webkitRelativePath.match(
                  /(?<=\/).+(?=\.)/g
                )[0];
              }
            }
            this.uploadFiles(
              this.applyTokenDo(),
              "model-model-file",
              filePath,
              () => {
                Game.modelData[buttonName] = {
                  File: "./model/" + buttonName + "/",
                  fileName: babylonName + ".babylon",
                };
                let bb = JSON.stringify(Game.modelData);
                this.putBuffer(
                  VeryNettyPara.ProjectID + "/data/model.json",
                  this.applyTokenDo(),
                  bb,
                  () => {
                    this.modelLoad(
                      buttonName,
                      "./model/" + buttonName + "/",
                      babylonName + ".babylon",
                      1,
                      0,
                      0,
                      0,
                      0
                    );
                    this.closeall();
                    $("#bg").hide();
                  }
                );
              }
            );
            this.updateDataAndJson("exhibits");
          }
        } else {
          window.alert("模型文件不能为空");
        }
      });
  }

  public modelLoad(
    buttonName: string,
    path: string,
    name: string,
    scale: number,
    rotation: number,
    x: number,
    y: number,
    z: number
  ): void {
    //原先要是有模型，先删除
    let that = this;
    if (Exhibits._modelList[buttonName]) {
      Exhibits._modelList[buttonName].dispose();
      delete Exhibits._modelList[buttonName];
      delete Game.modelData[buttonName];
    }
    let port1 = that._scene.getMeshByName(buttonName);
    let namePrefix: string = "";
    if (buttonName.length == 3) {
      namePrefix = "0" + buttonName[2];
    } else
      namePrefix =
        buttonName.substring(0, buttonName.indexOf("m")) +
        buttonName[buttonName.length - 1];
    var assetsManager = new BABYLON.AssetsManager(that._scene);
    assetsManager.useDefaultLoadingScreen = false;
    var meshTask = assetsManager.addMeshTask("", "", path, name);
    meshTask.onSuccess = function (task) {
      task.loadedMeshes.forEach((value) => {
        value.isPickable = true;
        value.checkCollisions = true;
        value.name = namePrefix + value.name;
      });

      let port2 = that._scene.getMeshByName(namePrefix + "n_0");
      Exhibits._modelList[buttonName] = port2.parent;
      let parentName = port2.parent.name;
      let parentMesh = that._scene.getMeshByName(parentName);
      parentMesh.scaling = new BABYLON.Vector3(scale, scale, scale);
      parentMesh.rotation = new BABYLON.Vector3(0, rotation, 0);
      console.log(parentMesh);
      let parentPos = that._scene
        .getMeshByName(parentName)
        .getAbsolutePosition()
        .clone();

      //移动拼接
      var xDif =
        port2.getAbsolutePosition().clone().x -
        port1.getAbsolutePosition().clone().x;
      var yDif =
        port2.getAbsolutePosition().clone().y -
        port1.getAbsolutePosition().clone().y;
      var zDif =
        port2.getAbsolutePosition().clone().z -
        port1.getAbsolutePosition().clone().z;
      var posX = parentPos.x;
      var posY = parentPos.y;
      var posZ = parentPos.z;
      var newPos = that._scene
        .getMeshByName(parentName)
        .setAbsolutePosition(
          new BABYLON.Vector3(posX - xDif, posY - yDif, posZ - zDif)
        );
      parentMesh.position.x = parentMesh.position.x + x;
      parentMesh.position.y = parentMesh.position.y + y;
      parentMesh.position.z = parentMesh.position.z + z;
    };
    meshTask.onError = function (task, message, exception) {
      console.log(message, exception);
    };
    assetsManager.onTaskSuccessObservable.add(function (task) {});
    assetsManager.load();
  }

  public editDoorButton(): void {
    let that = this;
    //3D GUI
    let manager = new BABYLON.GUI.GUI3DManager(this._scene);
    if (Question._doors) {
      Question._doors.forEach((key,index) => {
        let panel = new BABYLON.GUI.PlanePanel();
        manager.addControl(panel);
        let anchor = new BABYLON.TransformNode(key.name);
        panel.linkToTransformNode(anchor);
        let button = new BABYLON.GUI.HolographicButton("orientation");
        panel.addControl(button);
        button.backMaterial.alpha = 0.5;
        button.backMaterial.albedoColor = BABYLON.Color3.FromHexString("#0091FF");
        let image = new BABYLON.GUI.Image(key.name,"images/exhibits/edit2.png");
        image.width = "30%";
        image.height = "30%"
        image.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        image.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        button.content = image;

        button.onPointerClickObservable.add((info) => {
          //TO DO
          this.closeall();
          this.diyQuestion(btnExhibit.name);
        });
        //set parent
        let btnExhibit: BABYLON.AbstractMesh = key;
        anchor.setParent(btnExhibit);
        anchor.position = BABYLON.Vector3.Zero();
        anchor.rotation = BABYLON.Vector3.Zero();
        anchor.setParent(null);
        anchor.scaling = new BABYLON.Vector3(1, 1, 1);
        GlobalControl.exhibits._editParent.push(anchor);
        anchor.getChildMeshes()[0].position = new BABYLON.Vector3(0,20,0);
        anchor.getChildMeshes()[0].rotation = new BABYLON.Vector3(Math.PI/2,0,0);
        anchor.getChildMeshes()[0].scaling = new BABYLON.Vector3(20, 20, 20);
        
      });
      //最后一个门增加跳转链接编辑按钮
      //判断是否为拼接类型中的拼接回路成功，如果是返回，不是执行以下操作
      if(Exhibits.assembleData['exhibits'] && Game.isLoop(Game._ports2[0], Game._ports2[Game._ports2.length - 1])) return
      let finalDoor = Question._doors[Question._doors.length -1];
      let panel = new BABYLON.GUI.PlanePanel();
      manager.addControl(panel);
      let anchor = new BABYLON.TransformNode(finalDoor.name);
      panel.linkToTransformNode(anchor);
      let button = new BABYLON.GUI.HolographicButton("orientation");
      panel.addControl(button);
      button.backMaterial.alpha = 0.5;
      button.backMaterial.albedoColor = BABYLON.Color3.FromHexString("#0091FF");
      let image = new BABYLON.GUI.Image(finalDoor.name,"images/question/link.png");
      image.width = "30%";
      image.height = "30%"
      image.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
      image.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
      button.content = image;

      button.onPointerClickObservable.add((info) => {
        //TO DO
        this.closeall();
        this.diyExhibitLink();
      });
      //set parent
      let btnExhibit: BABYLON.AbstractMesh = finalDoor;
      anchor.setParent(btnExhibit);
      anchor.position = BABYLON.Vector3.Zero();
      anchor.rotation = BABYLON.Vector3.Zero();
      anchor.setParent(null);
      anchor.scaling = new BABYLON.Vector3(1, 1, 1);
      GlobalControl.exhibits._editParent.push(anchor);
      anchor.getChildMeshes()[0].position = new BABYLON.Vector3(0,20,-40);
      anchor.getChildMeshes()[0].rotation = new BABYLON.Vector3(Math.PI/2,0,0);
      anchor.getChildMeshes()[0].scaling = new BABYLON.Vector3(20, 20, 20);

    }
  }

  public editButton(
    name: string,
    height: number,
    width: number,
    angle: number,
    buttonname: string,
    arg?: any,
    callback?: Function
  ): BABYLON.AbstractMesh[] {
    let that = this;
    let _List: BABYLON.AbstractMesh[] = [];
    let _button: BABYLON.GUI.Button[] = [];
    _List = Game.diyMeshList[buttonname];
    //3D GUI
    let manager = new BABYLON.GUI.GUI3DManager(this._scene);
    if (_List) {
      _List.forEach((key,index) => {
        let panel = new BABYLON.GUI.PlanePanel();
        manager.addControl(panel);
        let anchor = new BABYLON.TransformNode(key.name);
        panel.linkToTransformNode(anchor);
        let button = new BABYLON.GUI.HolographicButton("orientation");
        panel.addControl(button);
        button.backMaterial.alpha = 0.5;
        button.backMaterial.albedoColor = BABYLON.Color3.FromHexString("#0091FF");
        let image = new BABYLON.GUI.Image(key.name,"images/exhibits/edit2.png");
        image.width = "30%";
        image.height = "30%"
        image.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        image.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        button.content = image;

        button.onPointerClickObservable.add((info) => {
          //TO DO
          this.closeall();
          callback.call(arg, btnExhibit.name);
        });
        //set parent
        let btnExhibit: BABYLON.AbstractMesh = key;
        anchor.setParent(btnExhibit);
        anchor.position = BABYLON.Vector3.Zero();
        anchor.rotation = BABYLON.Vector3.Zero();
        anchor.setParent(null);
        anchor.scaling = new BABYLON.Vector3(1, 1, 1);
        GlobalControl.exhibits._editParent.push(anchor);
        anchor.getChildMeshes()[0].position = new BABYLON.Vector3(0,10,0);
        anchor.getChildMeshes()[0].rotation = new BABYLON.Vector3(Math.PI/2,0,0);
        anchor.getChildMeshes()[0].scaling = new BABYLON.Vector3(20, 20, 20);
      });
    }
    return _List;
  }
  public editTitleButton(
    name: string,
    height: number,
    width: number,
    angle: number,
    buttonname: string,
    arg?: any,
    callback?: Function
  ): BABYLON.AbstractMesh[] {
    let that = this;
    let _List: BABYLON.AbstractMesh[] = [];
    let _button: BABYLON.GUI.Button[] = [];
    _List = Game.diyMeshList["title"];
    //3D GUI
    let manager = new BABYLON.GUI.GUI3DManager(this._scene);
    if (_List) {
      _List.forEach((key,index) => {
        let panel = new BABYLON.GUI.PlanePanel();
        manager.addControl(panel);
        let anchor = new BABYLON.TransformNode(key.name);
        panel.linkToTransformNode(anchor);
        let button = new BABYLON.GUI.HolographicButton("orientation");
        panel.addControl(button);
        button.backMaterial.alpha = 0.5;
        button.backMaterial.albedoColor = BABYLON.Color3.FromHexString("#0091FF");
        let image = new BABYLON.GUI.Image(key.name,"images/exhibits/edit2.png");
        image.width = "30%";
        image.height = "30%"
        image.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        image.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        button.content = image;

        button.onPointerClickObservable.add((info) => {
          //TO DO
          this.closeall();
          this.diybig(btnExhibit.name);
        });

        //set parent
        let btnExhibit: BABYLON.AbstractMesh = key;
        anchor.setParent(btnExhibit);
        anchor.position = BABYLON.Vector3.Zero();
        anchor.rotation = BABYLON.Vector3.Zero();
        anchor.setParent(null);
        anchor.scaling = new BABYLON.Vector3(1, 1, 1);
        GlobalControl.exhibits._editParent.push(anchor);
        anchor.getChildMeshes()[0].position = new BABYLON.Vector3(0,1,0);
        anchor.getChildMeshes()[0].rotation = new BABYLON.Vector3(Math.PI/2,0,0);
        anchor.getChildMeshes()[0].scaling = new BABYLON.Vector3(20, 20, 20);
      });
    }
    return _List;
  }
  public editTietuButton(
    name: string,
    height: number,
    width: number,
    angle: number,
    buttonname: string
  ): BABYLON.AbstractMesh[] {
    let that = this;
    let _List: BABYLON.AbstractMesh[] = [];
    let _button: BABYLON.GUI.Button[] = [];
    _List = Game.diyMeshList["texture"];
    //3D GUI
    let manager = new BABYLON.GUI.GUI3DManager(this._scene);
    if (_List) {
      _List.forEach((key,index) => {
        let panel = new BABYLON.GUI.PlanePanel();
        manager.addControl(panel);
        let anchor = new BABYLON.TransformNode(key.name);
        panel.linkToTransformNode(anchor);
        let button = new BABYLON.GUI.HolographicButton("orientation");
        panel.addControl(button);
        button.backMaterial.alpha = 0.5;
        button.backMaterial.albedoColor = BABYLON.Color3.FromHexString("#0091FF");
        let image = new BABYLON.GUI.Image(key.name,"images/exhibits/edit2.png");
        image.width = "30%";
        image.height = "30%"
        image.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        image.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        button.content = image;

        button.onPointerClickObservable.add((info) => {
          //TO DO
          this.closeall();
          this.diyTietuPlane(btnExhibit.name);
        });

        //set parent
        let btnExhibit: BABYLON.AbstractMesh = key;
        anchor.setParent(btnExhibit);
        anchor.position = BABYLON.Vector3.Zero();
        anchor.rotation = BABYLON.Vector3.Zero();
        anchor.setParent(null);
        anchor.scaling = new BABYLON.Vector3(1, 1, 1);
        GlobalControl.exhibits._editParent.push(anchor);
        anchor.getChildMeshes()[0].position = new BABYLON.Vector3(0,1,0);
        anchor.getChildMeshes()[0].rotation = new BABYLON.Vector3(Math.PI/2,0,0);
        anchor.getChildMeshes()[0].scaling = new BABYLON.Vector3(20, 20, 20);
      });
    }
    return _List;
  }
  public editModelButton(
    name: string,
    height: number,
    width: number,
    angle: number,
    buttonname: string,
    arg?: any,
    callback?: Function
  ): BABYLON.AbstractMesh[] {
    let that = this;
    let _List: BABYLON.AbstractMesh[] = [];
    let _button: BABYLON.GUI.Button[] = [];
    //3D GUI
    let manager = new BABYLON.GUI.GUI3DManager(this._scene);
    _List = Game.diyMeshList["model"];
    if (_List) {
      _List.forEach((key,index) => {
        let panel = new BABYLON.GUI.PlanePanel();
        manager.addControl(panel);
        let anchor = new BABYLON.TransformNode(key.name);
        panel.linkToTransformNode(anchor);
        let button = new BABYLON.GUI.HolographicButton("orientation");
        panel.addControl(button);
        button.backMaterial.alpha = 0.5;
        button.backMaterial.albedoColor = BABYLON.Color3.FromHexString("#0091FF");
        let image = new BABYLON.GUI.Image(key.name,"images/exhibits/edit2.png");
        image.width = "30%";
        image.height = "30%"
        image.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        image.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        button.content = image;

        button.onPointerClickObservable.add((info) => {
          //TO DO
          this.closeall();
          callback.call(arg, btnExhibit.name);
        });

        //set parent
        let btnExhibit: BABYLON.AbstractMesh = key;
        anchor.setParent(btnExhibit);
        anchor.position = BABYLON.Vector3.Zero();
        anchor.rotation = BABYLON.Vector3.Zero();
        anchor.setParent(null);
        anchor.scaling = new BABYLON.Vector3(1, 1, 1);
        GlobalControl.exhibits._editParent.push(anchor);
        anchor.getChildMeshes()[0].position = new BABYLON.Vector3(0,10,-100);
        anchor.getChildMeshes()[0].rotation = new BABYLON.Vector3(0,0,0);
        anchor.getChildMeshes()[0].scaling = new BABYLON.Vector3(20, 20, 20);
        
      });
    }
    return _List;
  }

  public editHuaButton(name: string,height: number,width: number,angle: number,buttonname: string): BABYLON.AbstractMesh[] {
    let that = this;
    let _List: BABYLON.AbstractMesh[] = [];
    let _button: BABYLON.GUI.Button[] = [];
    _List = Game.diyMeshList["hua"];
    //3D GUI
    var manager = new BABYLON.GUI.GUI3DManager(this._scene);
    if (_List) {
      _List.forEach((key,index) => {
        var panel = new BABYLON.GUI.PlanePanel();
        manager.addControl(panel);
        var anchor = new BABYLON.TransformNode(key.name);
        panel.linkToTransformNode(anchor);
        var button = new BABYLON.GUI.HolographicButton("orientation");
        panel.addControl(button);
        button.backMaterial.alpha = 0.5;
        button.backMaterial.albedoColor = BABYLON.Color3.FromHexString("#0091FF");
        let image = new BABYLON.GUI.Image(key.name,"images/exhibits/edit2.png");
        image.width = "30%";
        image.height = "30%"
        image.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        image.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        button.content = image;

        button.onPointerClickObservable.add((info) => {
          this.closeall();
          $("#bg").show();
          $(".diy-pic").show();
          if (!GlobalControl.exhibits.json[btnExhibit.name]) {
            GlobalControl.exhibits.json[btnExhibit.name] = {
              title: "",
              title_en: "",
              english: "",
              content: "",
              content_en: "",
              link: "",
              photo360: "",
              model3d: [],
              video: [],
              left: true,
              highpic: "",
              pdf: "",
            };
          }

          this.diyPicPlane(
            btnExhibit.name,
            GlobalControl.exhibits.json[btnExhibit.name]
          );
        });
        //set parent
        let btnExhibit: BABYLON.AbstractMesh = key;
        anchor.setParent(btnExhibit);
        anchor.position = BABYLON.Vector3.Zero();
        anchor.rotation = BABYLON.Vector3.Zero();
        anchor.setParent(null);
        anchor.scaling = new BABYLON.Vector3(1, 1, 1);
        GlobalControl.exhibits._editParent.push(anchor);
        anchor.getChildMeshes()[0].position = new BABYLON.Vector3(0,1,-30);
        anchor.getChildMeshes()[0].rotation = new BABYLON.Vector3(Math.PI/2,0,0);
        anchor.getChildMeshes()[0].scaling = new BABYLON.Vector3(20, 20, 20);
      });
    }
    return _List;
  }

  //创建title文字插入
  public titleReplace(title: string,btnExhibitName,houseLetter:string,callback = () => {}): void {
    let that = this;
    let txtCanvas = document.createElement("canvas");
    let txtCtx = txtCanvas.getContext("2d");
    let txtWidth = 512;
    let txtHeight = 128;

    txtCanvas.width = txtWidth;
    txtCanvas.height = txtHeight;

    let img = new Image();
    img.src = "." + that.house +houseLetter+ btnExhibitName.replace(/^(\d*)/g, "") + ".png";
    console.log(img.src)
    img.onload = function () {
      //判断标题贴图是否为竖直
      if (img.width < img.height) {
        //竖直标题
        txtWidth = 128;
        txtHeight = 512;
        txtCanvas.width = txtWidth;
        txtCanvas.height = txtHeight;
        txtCtx.drawImage(img, 0, 0, img.width, img.height, 0, 0, txtWidth, txtHeight);
        txtCtx.font = that.titleSize + "px" + " " + that.titleFamily;
        txtCtx.fillStyle = that.titleColor;
        let textX = txtWidth / 2;
        let textY = txtHeight / 2 - title.length * that.titleSize / 2 + that.titleSize;

        txtCtx.textAlign = "center";
        txtCtx.clearRect(0, 0, txtWidth, txtHeight);
        Exhibits.canvasCtxWrap(txtCanvas, title, textX, textY, that.titleSize, that.titleSize)
      } else if(img.width > img.height) {
        //普通标题
        txtCtx.drawImage(img, 0, 0, img.width, img.height, 0, 0, txtWidth, txtHeight);
        txtCtx.font = that.titleSize + "px" + " " + that.titleFamily;
        txtCtx.fillStyle = that.titleColor;
        let textX = txtWidth / 2;
        let textY = txtHeight / 2 + that.titleSize / 3;

        txtCtx.textAlign = "center";
        txtCtx.clearRect(0, 0, txtWidth, txtHeight);
        txtCtx.fillText(title, textX, textY);
      } else if(img.width = img.height){
        //换行标题
        txtWidth = 512;
        txtHeight = 512;
        txtCanvas.width = txtWidth;
        txtCanvas.height = txtHeight;
        txtCtx.drawImage(img, 0, 0, img.width, img.height, 0, 0, txtWidth, txtHeight);
        txtCtx.font = that.titleSize + "px" + " " + that.titleFamily;
        txtCtx.fillStyle = that.titleColor;
        let textX = txtWidth / 2;

        // txtCtx.textAlign = "center";
        txtCtx.clearRect(0, 0, txtWidth, txtHeight);
        let line = Exhibits.canvasCtxWrap(txtCanvas, title, 0, that.titleSize, txtWidth, that.titleSize);
        let textY = txtHeight / 2 - line * that.titleSize / 2 + that.titleSize;
        txtCtx.clearRect(0, 0, txtWidth, txtHeight);
        Exhibits.canvasCtxWrap(txtCanvas, title, 0, textY, txtWidth, that.titleSize);
      }
    
      //上传title的贴图
      var base64Data = txtCanvas.toDataURL("image/png", 1.0);
      let path = VeryNettyPara.ProjectID + that.house +houseLetter+ btnExhibitName.replace(/^(\d*)/g, "") +".png";
      GlobalControl.exhibits.uploadBase64Img(base64Data,path,GlobalControl.exhibits.applyTokenDo(),() => {
          setTimeout(() => {
            let filePath ="." +that.house +houseLetter+btnExhibitName.replace(/^(\d*)/g, "") +".png" +"?" +Date.now();
            let mesh = GlobalControl.exhibits._scene.getMeshByName(btnExhibitName);
            let newTexture = new BABYLON.Texture(filePath,GlobalControl.exhibits._scene);
            newTexture.level = 2;
            newTexture.hasAlpha = true;
            let texture = "texture" + Date.now();
            let newMaterial = new BABYLON.StandardMaterial(texture,GlobalControl.exhibits._scene);
            newMaterial.diffuseTexture = newTexture;
            newMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
            mesh.material = newMaterial;
          }, 1000);
        }
      );
    };
  }
  //自动换行
  public static canvasCtxWrap(canvas: HTMLCanvasElement, text: string, x: number, y: number, maxWidth?: number, lineHeight?: number) {

    let context = canvas.getContext("2d");
    let _canvas = context.canvas;
    let _line:number = 0;

    if (typeof maxWidth == 'undefined') {
      maxWidth = (_canvas && _canvas.width) || 300;
    }
    if (typeof lineHeight == 'undefined') {
      lineHeight = (_canvas && parseInt(window.getComputedStyle(_canvas).lineHeight)) || parseInt(window.getComputedStyle(document.body).lineHeight);
    }
    let arrText = text.split('');
    let line = '';

    for (let n = 0; n < arrText.length; n++) {
      let testLine = line + arrText[n];
      let metrics = context.measureText(testLine);
      let testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        _line++;
        context.fillText(line, x, y);
        line = arrText[n];
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    context.fillText(line, x, y);
    _line++;
    return _line;
  }
  //根据btn拿到该展厅的前缀
  public getHouse(btnExhibitName, callback?) {
    let that = this;
    if (!that.exhibits) {
      axios
        .get("./data/assemble.json")
        .then((res) => {
          that.exhibits = res.data;
        })
        .then(() => {
          let num = btnExhibitName.replace(/(?=[a-zA-Z]).*/g, "");
          this.num = +num;
          console.log(num);
          if (num) {
            that.exhibits["exhibits"].map((it) => {
              if (it.index === num) {
                that.house = it.sceneFile.substring(1);
                console.log("-----------字母-----");
                that.houseLetter = it.fileName.substring(0, 1);
                console.log(that.houseLetter);
                if (callback) {
                  callback();
                }
              }
            });
          } else {
            that.house = that.exhibits["lobby"][0].sceneFile.substring(1);
            that.houseLetter = that.exhibits["lobby"][0].fileName.substring(0, 1);
            console.log(that.houseLetter);
            if (callback) {
              callback();
            }
          }
        });
    } else {
      let num = btnExhibitName.replace(/(?=[a-zA-Z]).*/g, "");
      this.num = +num;
      if (num) {
        that.exhibits["exhibits"].map((it) => {
          if (it.index === num) {
            that.house = it.sceneFile.substring(1);
            that.houseLetter = it.fileName.substring(0, 1);
            console.log(that.houseLetter);
            if (callback) {
              callback();
            }
          }
        });
      } else {
        that.house = that.exhibits["lobby"][0].sceneFile.substring(1);
        that.houseLetter = that.exhibits["lobby"][0].fileName.substring(0, 1);
        console.log(that.houseLetter);
        if (callback) {
          callback();
        }
      }
    }
  }
  private closeall() {
    $(
      ".diy-model-change,.operating-instructions-box,#bg,.profile-box,.login-box,.register-box,.Reregister-box,.cardcase-box,.share-box,.profile-edit,.board-box,.diy-bgm,.diy-des,.diy-common,.diy-big,.diy-pic,.diy-pic-link,.diy-pic-video,.diy-pic-model,.diy-pic-360-link,.diy-album,.diy-album-add-box,.diy-pic-pdf,.diy-video,.diy-tietu,.diy-question,.diy-exhibitLink,.diy-model,.diy-model-model,.diy-material"
    ).hide();
    $("#bg").show();
    this.removeallbg();
  }
  private closeall2() {
    $(
      ".diy-model-change,.operating-instructions-box,#bg,.profile-box,.login-box,.register-box,.Reregister-box,.cardcase-box,.share-box,.profile-edit,.board-box,.diy-bgm,.diy-des,.diy-common,.diy-big,.diy-pic,.diy-pic-link,.diy-pic-video,.diy-pic-model,.diy-pic-360-link,.diy-album,.diy-album-add-box,.diy-pic-pdf,.diy-video,.diy-tietu,.diy-question,.diy-exhibitLink,.diy-model,.diy-model-model,.diy-material"
    ).hide();
    $("#bg").show();
  }
  public removeallbg() {
    const ulBtnNode = $(
      ".share-btn,.support-btn,.resume-btn,.map-btn,.profile-btn,.signboard-btn,.common-btn,.bgm-btn,.commentary-btn,.caizhitihuan-btn,.initPostion-btn"
    );
    ulBtnNode.removeClass("btn-selected");
  }
}

export interface ExhibitsLocation {
  left: boolean;
  y: number;
  position1: BABYLON.Vector3;
  position2: BABYLON.Vector3;
  angle: BABYLON.Vector3;
}

export interface PictureData {
  name: string;
  path: string;
  introduct: string;
}
export interface TextData {
  url: string;
  title: string;
  index: number;
}
