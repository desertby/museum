import { Museum } from "./museum";
import { UIMain } from "./uiMain";
import { CameraControl } from "./cameraControl";
import { CustomLoadingScreen } from "./loading";
import { GlobalControl } from "./globalControl";
import { MonoBehaviourMessageCenter } from "./veryNetty/MonoBehaviourMessageCenter";
import { SocketManager } from "./veryNetty/SocketManager";
import { EventProxy } from "./eventProxy";
import { Question } from "./question";
import { VeryNettyPara } from "./veryNetty/VeryNettyPara";
import { hua_kuang } from "./huakuang";
import { AudioControl } from "./audioControl";
import { Exhibits } from "./exhibits";
import { GameObject } from "../babylon";
import  { VeryCharacter } from "./veryNetty/VeryCharacter"

export class Game {
  private _canvas: HTMLCanvasElement;
  private _engine!: BABYLON.Engine;
  private _scene!: BABYLON.Scene;
  private _fps: HTMLElement;
  public static _ports: BABYLON.AbstractMesh[] = [];
  public static _ports2: BABYLON.AbstractMesh[] = [];

  private _museum!: Museum;
  public static modelData: any = null;
  public _data: any = null;
  private _exhibits: ExhibitsData[] = [];
  private dot: number;
  public static _key: boolean = false;
  public static _finishLoaded: boolean = false;
  public static _isAssemble: boolean = true;
  public static reflectionData: any = null;
  public static fontData: any = null;
  public static diyMeshList: any;
  public static picData: any;

  public static exhibits: any;
  public static step: any[];
  public static style: any;
  public static diyData: any;
  public static ports: any;
  public static postions: any;
  public static picCanvas: any;
  public static ctx: any;
  public static degreeList: any;
  public static x1: any;
  public static y1: any;
  public static isCancel: boolean = true;
  public static width: number = 1080;
  public static height: number = 700;
  public static rangeArray:{[key:string]:number[][]}={};
  public static stepArray:string[]=[];
  public static diyStyleName:string = "";
  public static initPos:BABYLON.Vector3 = new BABYLON.Vector3(0, 160.8, 0);
  public static initRot:BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0);
  public static commentbody: BABYLON.GUI.TextBlock;
  public static bucket = "veryexpo";
  

  constructor(canvasElement: HTMLCanvasElement) {
    this._canvas = canvasElement;
    this._fps = document.getElementById("fpsLabel")!;
  }

  /**
   * 创建场景，并且启动
   */
  public createScene(): Game {
    if (this._engine) {
      this._engine.dispose();
    }
    this._engine = new BABYLON.Engine(this._canvas, true);
    // Resize
    let engine = this._engine;
    window.addEventListener("resize", function () {
      engine.resize();
      var orientation =
        window.innerWidth > window.innerHeight ? "landscape" : "portrait";
      if (orientation === "portrait") {
        //竖屏
      } else {
        //横屏
      }
    });

    // TODO: 加载过度动画开
    var loadingScreen = new CustomLoadingScreen("");
    loadingScreen.waitAMoment = true;
    engine.loadingScreen = loadingScreen;

    this._scene = new BABYLON.Scene(this._engine);
    this._scene.gravity = new BABYLON.Vector3(0, -9.81, 0);
    this._scene.collisionsEnabled = true;

    let that = this;

    let cameraControl = new CameraControl(this._scene, this._canvas);
    GlobalControl.cameraChange = cameraControl;

    let sceneLoaded: boolean = false;
    let fake: boolean = false;
    let timer: number = 100;
    let limiter: number = 9;
    let currentPercent: number = limiter;
    var fakeProgress = () => {
      currentPercent++;
      if (!Game._finishLoaded && !loadingScreen.waiting) {
        // window.document.getElementById("id-progress1")!.style.width = currentPercent + "%";
        window.document.getElementById("id-progress2")!.innerHTML =
          "loading..." + currentPercent + "%";
      }
      if (
        currentPercent < 99 &&
        !sceneLoaded &&
        !Game._finishLoaded &&
        !loadingScreen.waiting
      ) {
        setTimeout(fakeProgress, timer);
      }
    };

    let progressFunc = function (evt: BABYLON.SceneLoaderProgressEvent): void {
      if (fake) {
        return;
      }
      var loadedPercent: number = 0;
      var loadedPercentStr: string = "0%";

      if (evt.lengthComputable) {
        loadedPercent = (evt.loaded * 100) / evt.total;
        if (loadedPercent >= limiter) {
          if (!fake) {
            fake = true;
            setTimeout(fakeProgress, timer);
          }
          loadedPercentStr = "loading..." + limiter + "%";
        } else {
          loadedPercentStr = "loading..." + loadedPercent.toFixed() + "%";
        }
      } else {
        var dlCount = evt.loaded / (1024 * 1024);
        loadedPercent = Math.floor(dlCount * 100.0) / 100.0;
        if (loadedPercent >= limiter) {
          if (!fake) {
            fake = true;
            setTimeout(fakeProgress, timer);
          }
          loadedPercentStr = "loading..." + limiter + "%";
        } else {
          loadedPercentStr = "loading..." + loadedPercent.toFixed() + "%";
        }
      }
      if (!fake) {
        window.document.getElementById(
          "id-progress2"
        )!.innerHTML = loadedPercentStr;
      }
    };
    //获取model.json
    axios
      .get("./data/model.json")
      .then(function (response) {
        Game.modelData = response.data;
      })
      .catch(function (error) {
        console.log("load error: " + error);
      });
    //获取反射json
    axios
      .get("./data/reflection.json")
      .then(function (response) {
        Game.reflectionData = response.data;
      })
      .catch(function (error) {
        console.log("load error: " + error);
      });
    //获取拼图json
    axios
      .get("./data/picdata.json")
      .then(function (response) {
        Game.picData = response.data;
      })
      .catch(function (error) {
        console.log("load error: " + error);
      });
    // 获取表格数据
    axios
      .get("./data/assemble.json")
      .then(function (response) {
        that._data = response.data;
        if (!that._data["exhibits"]) {
          Game._isAssemble = false;
        }
        Exhibits.assembleData = that._data;

        //大厅的加载
        if (that._data["lobby"]) {
          //修改博物馆网页名称
          if (that._data["lobby"][0].museumName) {
            document.title = that._data["lobby"][0].museumName;
          }
          let sceneFile: string = that._data["lobby"][0].sceneFile;
          let lobbyName: string = that._data["lobby"][0].fileName;
          //加载projectID
          VeryNettyPara.ProjectID = that._data["lobby"][0].projectID;
          // TODO: 加载大厅scene.babylon场景文件，当前为默认
          BABYLON.SceneLoader.Append(sceneFile,lobbyName,that._scene,function (scene) {
              // 场景变量设置
              scene.ambientColor = BABYLON.Color3.White();
              scene.gravity = new BABYLON.Vector3(0, -9.81, 0);
              scene.collisionsEnabled = true;

              //大厅对接门1号标记
              Game._ports = [];
              if (that._scene.getMeshByName(that._data["lobby"][0].door2)) {
                var Port1 = that._scene.getMeshByName(
                  that._data["lobby"][0].door2
                );
                Game._ports.push(Port1);
              }

              var port2 = that._scene.getMeshByName(that._data['lobby'][0].door1);
              if(port2){
                Game._ports2.push(port2);
              }

              //login强制判断
              if (that._data["lobby"][0].forceLogin === false) {
                (that._scene.activeCamera as BABYLON.UniversalCamera).speed = 10;
                that._scene.activeCamera.inputs.attached.mouse.attachControl(that._canvas);
              }
              // 加载背景音乐和解说词
              if (that._data["lobby"][0].bgMusic !== "") {
                let bg = new BABYLON.Sound(
                  "bgMusic" + that._data["lobby"][0].index,
                  that._data["lobby"][0].bgMusic,
                  that._scene,
                  null,
                  { loop: true, autoplay: false }
                );
                AudioControl._bgMusicList[that._data["lobby"][0].index] = bg;
              }
              if (that._data["lobby"][0].descant !== "") {
                let des = new BABYLON.Sound(
                  "descant" + that._data["lobby"][0].index,
                  that._data["lobby"][0].descant,
                  that._scene,
                  null,
                  { loop: false, autoplay: false }
                );
                AudioControl._descantList[that._data["lobby"][0].index] = des;
              }
              if (that._scene.getMeshByName("透明门2"))
                AudioControl._bgMusicDoors[
                  that._data["lobby"][0].index
                ] = that._scene.getMeshByName("透明门2");

              //删除大厅透明门
              if (that._scene.getMeshByName("透明门1")) {
                that._scene.getMeshByName("透明门1").dispose();
              }
              if (that._scene.getMeshByName("透明门2")) {
                that._scene.getMeshByName("透明门2").dispose();
              }
              if (that._scene.getMeshByName("men_001")) {
                that._scene.getMeshByName("men_001").dispose();
              }
              // if (that._scene.getMeshByName("men_002")) {
              //   that._scene.getMeshByName("men_002").dispose();
              // }
              //camera's position and rotation
              if (that._data['lobby'][0].position && that._data['lobby'][0].rotation) {
                Game.initPos = new BABYLON.Vector3(that._data['lobby'][0].position[0], that._data['lobby'][0].position[1], that._data['lobby'][0].position[2]);
                Game.initRot = new BABYLON.Vector3(that._data['lobby'][0].rotation[0], that._data['lobby'][0].rotation[1], that._data['lobby'][0].rotation[2]);
                (that._scene.activeCamera as BABYLON.UniversalCamera).position = Game.initPos;
                (that._scene.activeCamera as BABYLON.UniversalCamera).rotation = Game.initRot;
              }
              //设定地面初始位置
              let aa = that._scene.getMeshByName("A").getAbsolutePosition();
              let bb = that._scene.getMeshByName("reflection_01").getAbsolutePosition().clone().y;
              if (aa && bb) {
                that._scene.getMeshByName("A").setAbsolutePosition(new BABYLON.Vector3(aa.x, aa.y - bb, aa.z));
                that._scene.updateTransformMatrix(true);
              }

              //整体展厅数据加载
              if (that._data["exhibits"]) {
                that._exhibits = [];
                for (
                  let i: number = 0;
                  i < that._data["exhibits"].length;
                  i++
                ) {
                  let para: ExhibitsData = {
                    index: that._data["exhibits"][i].index,
                    sceneFile: that._data["exhibits"][i].sceneFile,
                    fileName: that._data["exhibits"][i].fileName,
                    door1: that._data["exhibits"][i].door1,
                    door2: that._data["exhibits"][i].door2,
                    bgMusic: that._data["exhibits"][i].bgMusic,
                    descant: that._data["exhibits"][i].descant,
                  };
                  that._exhibits.push(para);
                }

                //整体展厅拼接
                Question._doors = [];
                Question._locks = [];
                that.exhibitLoad(0);
              }
              //if ptp
              if(that._data["lobby"][0].PTP){
                //ptp
                (that._scene.activeCamera as BABYLON.UniversalCamera).keysUp = [];
                (that._scene.activeCamera as BABYLON.UniversalCamera).keysDown = [];
                (that._scene.activeCamera as BABYLON.UniversalCamera).keysLeft = [];
                (that._scene.activeCamera as BABYLON.UniversalCamera).keysRight = [];
                (that._scene.activeCamera as BABYLON.UniversalCamera).applyGravity = false;
                (that._scene.activeCamera as BABYLON.UniversalCamera).checkCollisions = false;
                SocketManager.isPTP = true;
              }
              SocketManager.Instance.Connect("121.43.136.90", 3331);
              that._museum = new Museum(that._engine,scene,that._canvas,that);

              // 加载过度动画关
            },
            progressFunc,
            (scene: BABYLON.Scene, message: string, exception: any) => {
              console.error(message);
              console.error(exception);
            }
          );
        }
      })
      .catch(function (error) {
        console.log("load error: " + error);
      });

    return this;
  }

  //整体展厅拼接
  public exhibitLoad(i: number): void {
    let that = this;
    var assetsManager = new BABYLON.AssetsManager(that._scene);
    assetsManager.useDefaultLoadingScreen = false;
    var meshTask = assetsManager.addMeshTask("","",that._exhibits[i].sceneFile,that._exhibits[i].fileName);
    meshTask.onSuccess = function (task) {
      task.loadedMeshes.forEach((value) => {
        value.isPickable = true;
        value.checkCollisions = true;
        //修改展厅mesh名称
        value.name = that._exhibits[i].index + value.name;
      });
      //旋转标准展厅
      var Port2 = that._scene.getMeshByName(that._exhibits[i].index + that._exhibits[i].door1);
      var port22 = that._scene.getMeshByName(that._exhibits[i].index + that._exhibits[i].door2);
      if (port22) {
        Game._ports2.push(port22);
      }
      let parentName = Port2.parent.name;

      that.dot = Math.round(BABYLON.Vector3.Dot(Game._ports[0].right, Port2.right));
      var angle = Math.acos(that.dot / Math.round(Port2.right.length() * Game._ports[0].right.length()));
      let direction = BABYLON.Vector3.Cross(Port2.right, Game._ports[0].right);
      if (Math.round(direction.y) < 0) {
        that._scene.getMeshByName(parentName).rotate(BABYLON.Axis.Y, angle, BABYLON.Space.LOCAL);
        console.log("标准展厅" +that._exhibits[i].index +"旋转的角度：" + (angle * 180) / Math.PI);
      } else if (Math.round(direction.y) >= 0) {
        that._scene.getMeshByName(parentName).rotate(BABYLON.Axis.Y, angle + Math.PI, BABYLON.Space.LOCAL);
        console.log("标准展厅" +that._exhibits[i].index +"旋转的角度：" +(angle * 180 + Math.PI) / Math.PI);
      }
      let parentPos = that._scene.getMeshByName(parentName).getAbsolutePosition().clone();
      Game._ports.push(Port2);
      //移动拼接
      var xDif =Game._ports[1].getAbsolutePosition().clone().x -Game._ports[0].getAbsolutePosition().clone().x;
      var yDif =Game._ports[1].getAbsolutePosition().clone().y -Game._ports[0].getAbsolutePosition().clone().y;
      var zDif =Game._ports[1].getAbsolutePosition().clone().z -Game._ports[0].getAbsolutePosition().clone().z;
      var posX = parentPos.x;
      var posY = parentPos.y;
      var posZ = parentPos.z;
      var newPos = that._scene.getMeshByName(parentName).setAbsolutePosition(new BABYLON.Vector3(posX - xDif, posY - yDif, posZ - zDif));
      //更换拼接的门
      Game._ports = [];
      let nextDoor = that._scene.getMeshByName(
        that._exhibits[i].index + that._exhibits[i].door2
      );
      Game._ports.push(nextDoor);

      //删除多余的门和锁
      if (that._scene.getMeshByName(that._exhibits[i].index + "men_00" + that._exhibits[i].door1[4])) {
        that._scene.getMeshByName(that._exhibits[i].index + "men_00" + that._exhibits[i].door1[4]).dispose();
      }
      if (that._scene.getMeshByName(that._exhibits[i].index + "suo-0" + that._exhibits[i].door1[4])) {
        that._scene.getMeshByName(that._exhibits[i].index + "suo-0" + that._exhibits[i].door1[4]).dispose();
      }

      //取消碰撞体透明门
      if (that._scene.getMeshByName(that._exhibits[i].index + "透明门1")) {
        that._scene.getMeshByName(that._exhibits[i].index + "透明门1").checkCollisions = false;
      }
      if (that._scene.getMeshByName(that._exhibits[i].index + "透明门2")) {
        that._scene.getMeshByName(that._exhibits[i].index + "透明门2").checkCollisions = false;
      }
      //生成门和锁的list，用来点击问答题
      if (that._scene.getMeshByName(that._exhibits[i].index + "men_00" + that._exhibits[i].door2[4])) {
        if (Exhibits.assembleData["lobby"][0].question === false) {
          that._scene.getMeshByName(that._exhibits[i].index + "men_00" + that._exhibits[i].door2[4] ).dispose();
          that._scene.getMeshByName(that._exhibits[i].index + "suo-0" + that._exhibits[i].door2[4]).dispose();
        } else {
          var doorPlane1 = that._scene.getMeshByName(that._exhibits[i].index + "men_00" + that._exhibits[i].door2[4]);
          doorPlane1!.material!.backFaceCulling = false;
          doorPlane1!.visibility = 0.55;
          var lock1 = that._scene.getMeshByName(
            that._exhibits[i].index + "suo_00" + that._exhibits[i].door2[4]
          );

          Question._doors.push(doorPlane1!);
          Question._locks.push(lock1);
        }
      }

      //背景音乐和解说词添加
      if (that._exhibits[i].bgMusic !== "") {
        let bg = new BABYLON.Sound(
          "bgMusic" + that._exhibits[i].index,
          that._exhibits[i].bgMusic,
          that._scene,
          null,
          { loop: true, autoplay: false }
        );
        AudioControl._bgMusicList[that._exhibits[i].index] = bg;
      }
      if (that._exhibits[i].descant !== "") {
        let des = new BABYLON.Sound(
          "descant" + that._exhibits[i].index,
          that._exhibits[i].descant,
          that._scene,
          null,
          { loop: false, autoplay: false }
        );
        AudioControl._descantList[that._exhibits[i].index] = des;
      }
      if (that._scene.getMeshByName(that._exhibits[i].index + "透明门1"))
        AudioControl._bgMusicDoors[
          that._exhibits[i].index
        ] = that._scene.getMeshByName(that._exhibits[i].index + "透明门1");
    };
    meshTask.onError = function (task, message, exception) {
      console.log(message, exception);
    };
    assetsManager.onTaskSuccessObservable.add(function (task) {
      if (i + 1 < that._exhibits.length) {
        that.exhibitLoad(i + 1);
      }
      if (i + 1 == that._exhibits.length) {
        Question._doorNumbers = Question._doors.length;
        Question.singleScore = Math.round(100 / Question._doorNumbers);
        GlobalControl.audio.initTrigger();
        Game.diyMeshList = {
          reflection: [] as BABYLON.AbstractMesh[],
          video: [] as BABYLON.AbstractMesh[],
          model: [] as BABYLON.AbstractMesh[],
          hua: [] as BABYLON.AbstractMesh[],
          title: [] as BABYLON.AbstractMesh[],
          texture: [] as BABYLON.AbstractMesh[],
        };
        that._scene.meshes.forEach((value) => {
          if (value.name.indexOf("reflection") !== -1) {
            Game.diyMeshList["reflection"].push(value);
          } else if (value.name.indexOf("视频") !== -1) {
            Game.diyMeshList["video"].push(value);
          } else if (value.name.indexOf("m_") !== -1) {
            Game.diyMeshList["model"].push(value);
          } else if (value.name.indexOf("hua_") !== -1) {
            Game.diyMeshList["hua"].push(value);
          } else if (value.name.indexOf("title") !== -1) {
            Game.diyMeshList["title"].push(value);
          } else if (value.name.indexOf("t_") !== -1) {
            Game.diyMeshList["texture"].push(value);
          } else {
            return;
          }
        });

        if (JSON.stringify(Game.picData) == "{}") {
          Game.diyMeshList["hua"].map((it) => {
            let prefix = /.*(?=_)/g.exec(it.name)[0];
            let suffix = +/(?<=_).*/g.exec(it.name)[0];
            if (!Game.picData[prefix]) {
              Game.picData[prefix] = [];
            }
            Game.picData[prefix][suffix - 1] = {
              name: it.name,
              url: "./pic/pic.jpg",
              title: "第" + suffix + "幅",
              index: suffix,
            };
          });
          // console.log("我是picdata");
          // console.log(Game.picData);
        }
        //model
        //加载外部模型

        if (Game.modelData) {
          for (var key in Game.modelData) {
            GlobalControl.exhibits.modelLoad(
              key,
              Game.modelData[key].File,
              Game.modelData[key].fileName,
              Game.modelData[key].scale,
              Game.modelData[key].rotation,
              Game.modelData[key].x,
              Game.modelData[key].y,
              Game.modelData[key].z
            );
          }
        }
        //反射
        let _data: any;
        axios
          .get("./assemble/A/exhibitbase.json")
          .then((res) => {
            _data = res.data;
            Game.fontData = _data["definedTitle"];
          })
          .then(() => {
            if (JSON.stringify(Game.reflectionData) == "{}") {
              // console.log(_data);
              let exhibitsArray = Exhibits.assembleData.exhibits.map((it) => {
                return it.fileName.substr(0, 1) + "-ground";
              });
              exhibitsArray = ["A-ground", ...exhibitsArray];
              exhibitsArray = Array.from(new Set(exhibitsArray));
              // console.log(exhibitsArray);
              Game.reflectionData = {};
              for (let key of exhibitsArray) {
                Game.reflectionData[key] = {};
                Game.reflectionData[key]["des"] =
                  _data["reflection"][key]["des"];
                Game.reflectionData[key]["isGround"] =
                  _data["reflection"][key]["isGround"];
                Game.reflectionData[key]["open"] =
                  _data["reflection"][key]["open"];
                Game.reflectionData[key]["level"] =
                  _data["reflection"][key]["level"];
                Game.reflectionData[key]["visibility"] =
                  _data["reflection"][key]["visibility"];
              }
              // console.log(Game.reflectionData);
              for (var key in Game.reflectionData) {
                Game.reflectionFunc(
                  key,
                  Game.reflectionData[key].open,
                  Game.reflectionData[key].level,
                  Game.reflectionData[key].visibility,
                  Game.reflectionData[key].isGround,
                  that._scene
                );
              }
            } else {
              for (var key in Game.reflectionData) {
                Game.reflectionFunc(
                  key,
                  Game.reflectionData[key].open,
                  Game.reflectionData[key].level,
                  Game.reflectionData[key].visibility,
                  Game.reflectionData[key].isGround,
                  that._scene
                );
              }
            }
          });
        //平面地图导航
        if(Exhibits.assembleData["lobby"][0].teleportMap ==true){
          $(".map-btn").show();
        } else $(".map-btn").hide();
        //获取个人账号json，拿到拼接style和step
        axios
          .get("https://"+Game.bucket+".oss-cn-hangzhou.aliyuncs.com/museumeditor/data/"
            + Exhibits.assembleData["lobby"][0].creatAccount + "projects.json" + "?" + Date.now())
          .then((res) => {
            res.data.filter((it) => {
              if (it.id == VeryNettyPara.ProjectID) {
                console.log(it)
                Game.step = it.step;
                Game.style = it.style;
                if (Game.style == "kongzifeng") {
                  Game.diyStyleName = "kongzifengdiy";
                } else Game.diyStyleName = "diy"
              }
            });
          })
          //拿到diy.json，获取每个展馆的拼接参数以及url
          .then(() => {
            return axios.get("https://"+Game.bucket+".oss-cn-hangzhou.aliyuncs.com/museumeditor/data/"+Game.diyStyleName+".json")
          })
          .then((res)=>{
            Game.diyData = res.data;
            axios.get(
              "https://"+Game.bucket+".oss-cn-hangzhou.aliyuncs.com/museumeditor/data/exhibits.json"
            ).then((res) => {
              let allData = res.data;
              allData[Game.style].map((it) => {
                Game.diyData[it.name].url = it.thumbnail;
              });

              //展馆拼接信息例如P/D/Rec等组成的Array
              //assemble
              Game.picCanvas = window.document.getElementById("tepCanvas");
              Game.ctx = Game.picCanvas.getContext("2d");
              Game.picCanvas.width = Game.width;
              Game.picCanvas.height = Game.height;
              Game.ctx.fillStyle = "#0B0B0B";
              Game.ctx.fillRect(0, 0, this.width, this.height);
              Game.ctx.save();

              Game.lobby("A", 1);
              Game.exhibitsAssemble();

              
              var gameScene = that._scene;
              (Game.picCanvas as HTMLCanvasElement).addEventListener("click",(e)=>{
                var x = e.pageX - Game.picCanvas.getBoundingClientRect().left;
                var y = e.pageY - Game.picCanvas.getBoundingClientRect().top;
                //点击触发
                Game.stepArray.forEach((element)=>{
                  const pos = new BABYLON.Vector3(Exhibits.assembleData['lobby'][0].position[0], Exhibits.assembleData['lobby'][0].position[1], Exhibits.assembleData['lobby'][0].position[2]);
                  const rot = new BABYLON.Vector3(Exhibits.assembleData['lobby'][0].rotation[0], Exhibits.assembleData['lobby'][0].rotation[1], Exhibits.assembleData['lobby'][0].rotation[2]);
                  let minX = Math.min.apply(Math,[Game.rangeArray[element][0][0],Game.rangeArray[element][1][0]]);
                  let maxX = Math.max.apply(Math,[Game.rangeArray[element][0][0],Game.rangeArray[element][1][0]]);
                  let minY = Math.min.apply(Math,[Game.rangeArray[element][0][1],Game.rangeArray[element][1][1]]);
                  let maxY = Math.max.apply(Math,[Game.rangeArray[element][0][1],Game.rangeArray[element][1][1]]);
                  if(x >= minX && x<= maxX && y>=minY && y<=maxY){
                    Game.teleport(pos,rot,element,gameScene,Game.rangeArray[element][2][0],Game.rangeArray[element][2][1]);
                  }
                })
              })
            });
          })
      }
    });
    let observor = that._scene.onReadyObservable.addOnce(() => {
      Game._finishLoaded = true;
      Game._isAssemble = false;
      window.document.getElementById("id-progress2")!.innerHTML =
        "loading...100%";
      setTimeout(() => {
        CustomLoadingScreen.loadingScreenDiv!.style.display = "none";
        window.document.getElementById("menu").style!.display = "block";
        window.document.getElementById("bottom-btn").style!.display = "block";

        //判断是否拼接成loop
        if (!Game.isLoop(Game._ports2[0], Game._ports2[Game._ports2.length - 1])) {
          let door1 = that._scene.getMeshByName('men_002');
          if (door1) {
            door1.visibility = 1
          }
          let port = Game._ports2[Game._ports2.length - 1];
          let doorName = port.name[0]+"men_00"+port.name[port.name.length-1];
          let door2 = that._scene.getMeshByName(doorName);
          if (door2) {
            door2.visibility = 1
          }
        } else {
          let door3 = that._scene.getMeshByName('men_002');
          if (door3) {
            door3.dispose();
          }
        }

        if(SocketManager.isPTP){
          window.document.getElementById("oldMessage").style!.display = "block";
          window.document.getElementById("messagePar").style!.display = "block";
        }
      }, 1000);
      that._scene.onReadyObservable.remove(observor);
    });
    assetsManager.load();
  }

  public static isLoop(port1: BABYLON.AbstractMesh, port2: BABYLON.AbstractMesh): boolean {
    var xDif = port1.getAbsolutePosition().clone().x - port2.getAbsolutePosition().clone().x;
    var zDif = port1.getAbsolutePosition().clone().z - port2.getAbsolutePosition().clone().z;

    var dis = Math.pow((Math.pow(xDif, 2) + Math.pow(zDif, 2)), 1 / 2);
    if (Math.abs(dis) > 10) {
      return false
    } else return true

  }

  public static teleport(pos:BABYLON.Vector3,rot:BABYLON.Vector3,element: string, scene: BABYLON.Scene, door1: number, door2: number) {
    if (element == "A") {
      (scene.activeCamera as BABYLON.UniversalCamera).position = pos;
      (scene.activeCamera as BABYLON.UniversalCamera).rotation = rot;
    } else {
      let aa = scene.getMeshByName(element + "-D_" + door1);
      (scene.activeCamera as BABYLON.UniversalCamera).position = new BABYLON.Vector3(aa.absolutePosition.x, 160.8, aa.absolutePosition.z);
      (scene.activeCamera as BABYLON.UniversalCamera).setTarget(scene.getMeshByName(element + "-D_" + door2).absolutePosition);
    }
    $("#tepCanvas").hide(150);
    $("#bg").hide();
    GlobalControl.exhibits.removeallbg.call(GlobalControl.exhibits.removeallbg);
  }

  public static getEventPosition(ev){
    var x, y;
    if (ev.layerX || ev.layerX == 0) {
      x = ev.layerX;
      y = ev.layerY;
    } else if (ev.offsetX || ev.offsetX == 0) {
      x = ev.offsetX;
      y = ev.offsetY;
    }
    return {x: x, y: y};
  }

  public static exhibitsAssemble() {
    Game.exhibits = [];
    Game.step.forEach((element) => {
      if (element[1] == 1) {
        Game.exhibits.push([
          "./assemble/" + element[0] + "/",
          element[0] + ".babylon",
          element[0] + "-D_1",
          element[0] + "-D_2",
          element[0],
          element[0] + Game.step.indexOf(element),
        ]);
      } else
        Game.exhibits.push([
          "./assemble/" + element[0] + "/",
          element[0] + ".babylon",
          element[0] + "-D_2",
          element[0] + "-D_1",
          element[0],
          element[0] + Game.step.indexOf(element),
        ]);
    });
    return Game.exhibits;
  }

  public static lobby(exhibit: string, door: number) {
    let img = new Image();
    let path:string[] = Game.diyData[exhibit].url.split(/\//g);
    Game.diyData[exhibit].url="https://"+Game.bucket+".oss-cn-hangzhou.aliyuncs.com/museumeditor/data/exhibitsimg/"+Game.style+"/"+path[path.length-1];
    img.src = Game.diyData[exhibit].url;
    let temp0 =
      door == 1 ? Game.diyData[exhibit].D1 : Game.diyData[exhibit].D2;
    Game.ports = [];
    Game.ports.push(temp0);
    var _centerPosition = [Game.width / 2, Game.height *3/ 4];

    //固定大厅A的位置为canvas中心，这个可以在diy.json中的A.P1修改
    let AP1 = [
      _centerPosition[0] + Game.diyData["A"].P1[0],
      _centerPosition[1] + Game.diyData["A"].P1[1],
    ];
    Game.postions = [];
    Game.postions.push(AP1);
    let firstPoint = [_centerPosition[0]-Game.diyData[exhibit].Rec[0] / 2,_centerPosition[1]- Game.diyData[exhibit].Rec[1] / 2];
    let lastPoint = [_centerPosition[0]+Game.diyData[exhibit].Rec[0] / 2,_centerPosition[1]+ Game.diyData[exhibit].Rec[1] / 2];
    let index = "A";
    Game.stepArray.push(index);
    Game.rangeArray[index] = [firstPoint,lastPoint,[2,1]];

    img.onload = () => {
      Game.ctx.drawImage(
        img,
        _centerPosition[0] - img.width / 2,
        _centerPosition[1] - img.height / 2,
        img.width,
        img.height
      );
      Game.ctx.restore();
      if (Game.step.length >= 1) {
        Game.assemble(Game.step[0][0], Game.step[0][1], 0);
      }
    };
  }

  public static assemble(exhibit: string, door: number, i: number) {
    //exhibit为展厅的名字，string，例如“A”或“B”；door是展厅拼接的门，门1或者门2，number，例如 1或2
    let img1 = new Image();
    let path:string[] = Game.diyData[exhibit].url.split(/\//g);
    Game.diyData[exhibit].url="https://"+Game.bucket+".oss-cn-hangzhou.aliyuncs.com/museumeditor/data/exhibitsimg/"+Game.style+"/"+path[path.length-1];
    img1.src = Game.diyData[exhibit].url;
    //Rec
    let Rec = Game.diyData[exhibit].Rec

    let Port2 =
      door == 1 ? Game.diyData[exhibit].D1 : Game.diyData[exhibit].D2;
    let Port1 = Game.ports[0];
    // console.log("要拼接展厅门的向量： "+ Port2,"上个展厅门的向量： "+Port1)

    let dot = Math.round(Port2[0] * Port1[0] + Port2[1] * Port1[1]);
    let angle = Math.acos(dot);
    let direction = Port2[0] * Port1[1] - Port2[1] * Port1[0];
    if (Math.round(direction) < 0) {
      Game.ctx.save();
      Game.ctx.rotate(angle);
      // console.log("旋转的角度：" + (angle * 180) / Math.PI);
    } else if (Math.round(direction) >= 0) {
      Game.ctx.save();
      angle = angle + Math.PI;
      Game.ctx.rotate(angle);
      // console.log("旋转的角度：" + (angle * 180) / Math.PI);
    }

    let position1 = Game.postions[0];
    let position2 =
      door == 1 ? Game.diyData[exhibit].P1 : Game.diyData[exhibit].P2;
    Game.x1 = Game.afterSpain(position1, -angle)[0] - position2[0];
    Game.y1 = Game.afterSpain(position1, -angle)[1] - position2[1];
    // console.log("要拼接展厅门的坐标： "+ position2,"上个展厅门的坐标： "+position1)
    // console.log(this.x1, this.y1)

    Game.degreeList = [];
    Game.degreeList.push(angle);
    Game.ports = [];
    let temp =
      door == 1 ? Game.diyData[exhibit].D2 : Game.diyData[exhibit].D1;
    Game.ports.push(Game.afterSpain(temp, Game.degreeList[0]));

    Game.postions = [];
    let temp1 =
      door == 1 ? Game.diyData[exhibit].P2 : Game.diyData[exhibit].P1;
    let temp2 = [temp1[0] + Game.x1, temp1[1] + Game.y1];
    Game.postions.push(Game.afterSpain(temp2, Game.degreeList[0]));
    // console.log("拼接后剩下门的坐标: "+this.postions[0])
    let firstPoint = Game.afterSpain([Game.x1, Game.y1], Game.degreeList[0]);
    let lastPoint = Game.afterSpain([Rec[0] + Game.x1, Rec[1] + Game.y1], Game.degreeList[0]);
    let index = (i+1)+exhibit;
    Game.stepArray.push(index);
    if(door ==1){
      Game.rangeArray[index] = [firstPoint,lastPoint,[1,2]];
    } else Game.rangeArray[index] = [firstPoint,lastPoint,[2,1]];

    img1.onload = () => {
      Game.ctx.translate(Math.round(Game.x1), Math.round(Game.y1));
      Game.ctx.drawImage(img1, 0, 0, img1.width, img1.height, 0, 0, img1.width, img1.height);
      Game.ctx.restore();
      if (Game.isCancel) {
        if (i + 1 < Game.step.length) {
          Game.assemble(Game.step[i + 1][0], Game.step[i + 1][1], i + 1);
        }
      }
    };
    //TO DO
    //根据拼接的展厅，修改assemble.json中的信息
    return [exhibit, door];
  }

  public static afterSpain(pos: any, angle: number) {
    return [
      Math.round(pos[0] * Math.cos(angle) - pos[1] * Math.sin(angle)),
      Math.round(pos[0] * Math.sin(angle) + pos[1] * Math.cos(angle)),
    ];
  }

  public static reflectionFunc(
    materialName: string,
    open: boolean,
    level: number,
    visibility: number,
    isGround: boolean,
    scene: BABYLON.Scene
  ) {
    //统计所有反射面片
    let _List: BABYLON.AbstractMesh[] = [];
    Game.diyMeshList["reflection"].forEach((value) => {
      if (value.material.name.indexOf(materialName) !== -1) {
        _List.push(value);
      } else return;
    });
    if (_List) {
      _List.forEach((key) => {
        var material = scene.getMaterialByName(materialName);
        if ((<BABYLON.StandardMaterial>material).reflectionTexture) {
          (<BABYLON.StandardMaterial>material).reflectionTexture.level = 0;
          key.visibility = 1;
        }

        if (open) {
          if (isGround) {
            let mMaterial = new BABYLON.MirrorTexture(
              "mirror",
              1024,
              scene,
              true
            );
            (<BABYLON.StandardMaterial>material).reflectionTexture = mMaterial;
            mMaterial.mirrorPlane = new BABYLON.Plane(0, -1.0, 0, 5.86);
            mMaterial.renderList = scene.meshes;
            mMaterial.level = level;
            mMaterial.adaptiveBlurKernel = 32;
            key.material = material;
            key.visibility = visibility;
          } else {
            var probe = new BABYLON.ReflectionProbe(
              "satelliteProbe" + key.name,
              512,
              scene
            );
            for (var index = 0; index < scene.meshes.length; index++) {
              probe.renderList.push(scene.meshes[index]);
            }
            (<BABYLON.StandardMaterial>material).reflectionTexture =
              probe.cubeTexture;
            (<BABYLON.StandardMaterial>(
              material
            )).reflectionFresnelParameters = new BABYLON.FresnelParameters();
            (<BABYLON.StandardMaterial>(
              material
            )).reflectionFresnelParameters.bias = 0.02;
            (<BABYLON.StandardMaterial>(
              material
            )).reflectionTexture.level = level;

            key.material = material;
            key.visibility = visibility;
            probe.attachToMesh(key);
          }
        }
      });
    }
  }

  public static messagePanel(mesh: any, planeName:string,btnName:string,height: number, width: number, angle: number, scene: BABYLON.Scene): [BABYLON.GUI.Button,BABYLON.GUI.TextBlock,BABYLON.TransformNode] {
    let that = this;
    let meshAdvancedTexture1: BABYLON.GUI.AdvancedDynamicTexture;
    let _List: BABYLON.AbstractMesh;
    let Btn:BABYLON.GUI.Button;
    let btnPlane:BABYLON.Mesh;
    let bthParent:BABYLON.TransformNode;
    _List = mesh;
    if (_List) {
      //set parent
      let btnExhibit: BABYLON.AbstractMesh = _List;
      bthParent = new BABYLON.TransformNode('messageParent-' + btnExhibit.name, scene);
      bthParent.setParent(btnExhibit);
      bthParent.position = BABYLON.Vector3.Zero();
      bthParent.rotation = BABYLON.Vector3.Zero();
      // bthParent.setParent(null);
      bthParent.scaling = new BABYLON.Vector3(1, 1, 1);
      let btnParentObj: GameObject = new GameObject('parent', null, bthParent);

      //set texture
      btnPlane = BABYLON.MeshBuilder.CreatePlane(planeName, { height: height, width: width }, scene);
      let btnObj = new GameObject('btnPlane', btnPlane);
      btnObj.transform.parent = btnParentObj.transform;
      btnObj.transform.localPosition = new BABYLON.Vector3(0, 30, 0)
      btnObj.transform.localEulerAngles = new BABYLON.Vector3(angle, 0, 0);
      meshAdvancedTexture1 = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(btnPlane);

      // let commentRect2 = new BABYLON.GUI.Container('comment_rect');
      // commentRect2.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
      // commentRect2.top = "-150px";
      // commentRect2.background = '#FFE4E100';
      // commentRect2.color = '#FFE4E100';
      // commentRect2.width = "100%";
      // commentRect2.height = 490 + "px";
      // meshAdvancedTexture1.addControl(commentRect2);

      // 评论
      let commentContainer = new BABYLON.GUI.Rectangle('comment-body-container');
      commentContainer.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
      commentContainer.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
      commentContainer.top ="-350px";
      commentContainer.left = "0px";
      commentContainer.adaptWidthToChildren = true;
      commentContainer.height = "70px";
      commentContainer.alpha = 0.85;
      commentContainer.background = "#FFFFFF";
      commentContainer.cornerRadius = 15;
      commentContainer.thickness = 0;
      meshAdvancedTexture1.addControl(commentContainer);

      //评论内容
      Game.commentbody = new BABYLON.GUI.TextBlock('comment-body');
      Game.commentbody.fontSize = 35;
      Game.commentbody.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
      Game.commentbody.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
      Game.commentbody.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
      Game.commentbody.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
      Game.commentbody.text = "";
      Game.commentbody.color = "#2A2A2A";
      Game.commentbody.top = "0px";
      Game.commentbody.left = "0px";
      Game.commentbody.height = "100px";
      Game.commentbody.resizeToFit = true;
      Game.commentbody.textWrapping = false;
      Game.commentbody.lineSpacing = "10px";
      commentContainer.addControl(Game.commentbody);

      //creat button
      Btn = BABYLON.GUI.Button.CreateSimpleButton("", btnName);
      Btn.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
      Btn.thickness = 0;
      Btn.left = "0px";
      Btn.top = "-240px";
      Btn.width = "160px";
      Btn.height = "80px";
      Btn.fontSize = "30px";
      Btn.color = "white";
      Btn.background = "#0091FF65";
      Btn.cornerRadius = 15;
      meshAdvancedTexture1.addControl(Btn);
    }
    return [Btn,Game.commentbody,bthParent];
  }
  /**
   * 启动渲染循环；
   */
  public animate(): Game {
    let w = new Worker("webwork.js");
    let fun = function (events: MessageEvent) {
      MonoBehaviourMessageCenter.Instance.update();
    };
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) {
        w.onmessage = null;
      } else {
        w.onmessage = fun;
      }
    });
    this._engine.runRenderLoop(() => {
      if (this._canvas.width !== this._canvas.clientWidth) {
        this._engine.resize();
      }

      if (this._scene) {
        this._scene.render();
      }

      this.updateFpsPos();
      MonoBehaviourMessageCenter.Instance.update();
    });
    return this;
  }

  /**
   * 属性编辑器UI界面控制；
   */
  public toggleDebug(): Game {
    if (this._engine) {
      // Always showing the debug layer, because you can close it by itself
      var scene = this._engine.scenes[0];
      if (scene.debugLayer.isVisible()) {
        scene.debugLayer.hide();
      } else {
        // 此处修改了babylon.d.ts文件
        scene.debugLayer.show({ embedMode: true });
      }
    }
    return this;
  }

  /**
   * 更新fps显示及显示位置
   */
  updateFpsPos(): void {
    if (this._fps) {
      this._fps.style.right =
        document.body.clientWidth - this._canvas.clientWidth + 20 + "px";
      this._fps.innerHTML = this._engine.getFps().toFixed() + " fps";
    }
  }
}

export interface ExhibitsData {
  index: string;
  sceneFile: string;
  fileName: string;
  door1: string;
  door2: string;
  bgMusic: string;
  descant: string;
}
