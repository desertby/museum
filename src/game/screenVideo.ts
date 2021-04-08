import { GlobalControl } from "./globalControl";
import { UIMain } from "./uiMain";
import { GameObject } from "../babylon";
import { AudioControl } from "./audioControl";

export class ScreenVideo {
  public _scene: BABYLON.Scene;

  private _success: boolean = false;
  public _data: any = null;

  private _videoDic: { [key: string]: BABYLON.VideoTexture } = {};

  private _lobbyVideoLoaded: boolean = false;
  private _lobbyVideoName: string = "";

  private meshAdvancedTexture3!: BABYLON.GUI.AdvancedDynamicTexture;
  public screenName: string;
  private _editVideoParent: BABYLON.TransformNode[] = [];

  public constructor(scene: BABYLON.Scene) {
    this._scene = scene;

    this.loadData();

    let that = this;

    this._scene.onPointerObservable.add((pInfo) => {
      if (
        !that._lobbyVideoLoaded &&
        pInfo.type === BABYLON.PointerEventTypes.POINTERDOWN &&
        pInfo.event.button === 0
      ) {
        // TODO......
        // let videoTex = new BABYLON.VideoTexture('video-lobby-tex', 'video/' + that._lobbyVideoName, that._scene, true, false, BABYLON.Texture.TRILINEAR_SAMPLINGMODE, { autoPlay: true, autoUpdateTexture: true, loop: true });
        // var videoMat = new BABYLON.StandardMaterial('video-lobby-mat', that._scene);
        // videoMat.emissiveColor = BABYLON.Color3.White();
        // videoMat.backFaceCulling = false;
        // videoMat.diffuseTexture = videoTex;
        // let key: string = UIMain.lobbyScreen.name;

        // UIMain.lobbyScreen!.material = videoMat;
        // GlobalControl.lobbyScreenVideoTex = videoTex;
        // that._videoDic[key] = videoTex;
        GlobalControl.PauseAudio(false);
        GlobalControl.screenVideoOn = false;
        if (AudioControl._descantList[0]) {
          GlobalControl.audio.playExhibit(0);
        }
        that._lobbyVideoLoaded = true;
      }
      if (
        pInfo.type === BABYLON.PointerEventTypes.POINTERDOWN &&
        pInfo.event.button === 0
      ) {
        if (pInfo.pickInfo && pInfo.pickInfo.hit) {
          let pickedMesh = pInfo.pickInfo.pickedMesh!;
          if (this._videoDic[pickedMesh.name]) {
            if (this._videoDic[pickedMesh.name].video.paused) {
              that.stop();
              this._videoDic[pickedMesh.name].video.play();
              GlobalControl.PauseAudio(true);
              GlobalControl.PauseExhibitsVideo();
              GlobalControl.screenVideoOn = true;
            } else {
              this._videoDic[pickedMesh.name].video.pause();
              GlobalControl.PauseAudio(false);
              GlobalControl.screenVideoOn = false;
              if (AudioControl._descantList[0]) {
                GlobalControl.audio.playExhibit(0);
              }
            }
          } else {
            if (this._success && this._data[pickedMesh.name]) {
              that.stop();
              let videoTex = new BABYLON.VideoTexture(
                "video-tex-" + pickedMesh.name,
                "./video/" + this._data[pickedMesh.name].video,
                scene,
                true,
                false,
                BABYLON.Texture.TRILINEAR_SAMPLINGMODE,
                { autoPlay: true, autoUpdateTexture: true, loop: false }
              );
              videoTex.coordinatesIndex = 0;
              // videoTex.vScale = -1;
              let videoMat = new BABYLON.StandardMaterial(
                "video-mat-" + pickedMesh.name,
                scene
              );
              videoMat.emissiveColor = BABYLON.Color3.White();
              videoMat.diffuseTexture = videoTex;
              videoMat.backFaceCulling = false;

              let key: string = pickedMesh.name;

              pickedMesh.material = videoMat;
              that._videoDic[pickedMesh.name] = videoTex;
              GlobalControl.PauseAudio(true);
              GlobalControl.PauseExhibitsVideo();
              GlobalControl.screenVideoOn = true;
            }
          }
        }
      }
    });
  }

  public add(name: string, tex: BABYLON.VideoTexture): void {
    this._videoDic[name] = tex;
  }
  public loadVideo(pickedMesh: BABYLON.AbstractMesh) {
    pickedMesh.material.getActiveTextures()[0].dispose();
    let url1 = "./video/" + this._data[pickedMesh.name].video;
    let url2 =
      "./video/" +
      this._data[pickedMesh.name].video +
      "?" +
      ((Math.random() * 10000) >> 0);
    axios.get(url1);
    let videoTex = new BABYLON.VideoTexture(
      "video-tex-" + pickedMesh.name + ((Math.random() * 10000) >> 0),
      url2,
      this._scene,
      true,
      false,
      BABYLON.Texture.TRILINEAR_SAMPLINGMODE,
      { autoPlay: true, autoUpdateTexture: true, loop: false }
    );
    videoTex.coordinatesIndex = 0;
    let videoMat = new BABYLON.StandardMaterial(
      "video-mat-" + pickedMesh.name + ((Math.random() * 10000) >> 0),
      this._scene
    );
    videoMat.emissiveColor = BABYLON.Color3.White();
    videoMat.diffuseTexture = videoTex;
    videoMat.backFaceCulling = false;

    let key: string = pickedMesh.name;

    pickedMesh.material = videoMat;
    this._videoDic[pickedMesh.name] = videoTex;
    GlobalControl.PauseAudio(true);
    GlobalControl.PauseExhibitsVideo();
    GlobalControl.screenVideoOn = true;
    console.log("isRun");
  }
  private loadData(): void {
    let that = this;
    // 获取表格数据
    axios
      .get("./data/screen-video.json")
      .then(function (response) {
        that._data = response.data;
        that._success = true;
        that.lobbyVideoInit();
      })
      .catch(function (error) {
        console.log("load error: " + error);
      });
  }
  
  public editVideoButton(callback): void {
    let that = this;
    if (this._data) {
      for (var key in this._data) {
        //set parent
        let btnExhibit: BABYLON.AbstractMesh = this._scene.getMeshByName(key);
        let bthParent: BABYLON.TransformNode = new BABYLON.TransformNode(
          "btnParent-" + key,
          this._scene
        );
        bthParent.setParent(btnExhibit);
        bthParent.position = BABYLON.Vector3.Zero();
        bthParent.rotation = BABYLON.Vector3.Zero();
        bthParent.setParent(null);
        GlobalControl.screenVideo._editVideoParent.push(bthParent);
        bthParent.scaling = new BABYLON.Vector3(1, 1, 1);
        let btnParentObj: GameObject = new GameObject(
          "parent",
          null,
          bthParent
        );

        //set texture
        let btnPlane = BABYLON.MeshBuilder.CreatePlane(
          "button-plane",
          { height: 30, width: 30 },
          this._scene
        );
        let btnObj = new GameObject("btnPlane", btnPlane);
        btnObj.transform.parent = btnParentObj.transform;
        btnObj.transform.localPosition = new BABYLON.Vector3(0, 0.5, 0.5);
        btnObj.transform.localEulerAngles = new BABYLON.Vector3(90, 0, 0);
        this.meshAdvancedTexture3 = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(
          btnPlane
        );

        //creat button
        let videoBtn = BABYLON.GUI.Button.CreateImageOnlyButton(
          "video",
          "images/exhibits/edit.png"
        );
        videoBtn.left = "0px";
        videoBtn.top = "0px";
        videoBtn.width = "100%";
        videoBtn.height = "100%";
        videoBtn.color = "#FFFFFF00";
        videoBtn.background = "#FFFFFF00";
        videoBtn.children[0].color = "#696969";
        videoBtn.children[0].fontSize = 100;
        videoBtn.thickness = 0;
        videoBtn.onPointerClickObservable.add((info) => {
          //TO DO
          callback(btnExhibit.name);
        });
        videoBtn.onPointerEnterObservable.add((info) => {
          $("#renderCanvas").addClass("mouse-enter");
        });
        videoBtn.onPointerOutObservable.add((info) => {
          $("#renderCanvas").removeClass("mouse-enter");
        });
        this.meshAdvancedTexture3.addControl(videoBtn);
      }
    }
  }

  //视频编辑按钮销毁
  public hideVideoBtn(): void {
    if (GlobalControl.screenVideo._editVideoParent.length >= 1) {
      for (
        let i = 0;
        i < GlobalControl.screenVideo._editVideoParent.length;
        i++
      ) {
        GlobalControl.screenVideo._editVideoParent[i]
          .getChildMeshes()
          .forEach((mesh) => {
            mesh.material!.dispose();
          });
        GlobalControl.screenVideo._editVideoParent[i].dispose();
      }
    }
  }

  private lobbyVideoInit(): void {
    Object.keys(this._data).forEach((key) => {
      if (this._data[key].lobby !== undefined && this._data[key].lobby) {
        //console.log('大厅画：' + key);
        UIMain.lobbyScreen = this._scene.getMeshByName(key)!;
        this._lobbyVideoName = this._data[key].video;
        return;
      }
    });
  }

  public stop(): void {
    let that = this;
    Object.keys(this._videoDic).forEach(function (key) {
      // console.warn(key);
      // console.warn(that._videoDic[key].video);
      if (that._videoDic[key] && that._videoDic[key].video) {
        that._videoDic[key].video.pause();
      }
    });
    GlobalControl.screenVideoOn = false;
  }
  public mute(isMuted: boolean): void {
    let that = this;
    Object.keys(this._videoDic).forEach(function (key) {
      // console.warn(key);
      // console.warn(that._videoDic[key].video);
      if (that._videoDic[key] && that._videoDic[key].video) {
        that._videoDic[key].video.muted = isMuted;
      }
    });
  }
}
